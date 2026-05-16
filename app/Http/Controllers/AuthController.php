<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Invitation;
use App\Models\Project;

use App\Enums\InvitationStatus;
use App\Enums\UserRole;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Str;
use Illuminate\Support\Facades\RateLimiter;

use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * регистрация
     */
    public function register(Request $request)
    {
        // Валидация данных на бэкенде
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'], 
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', Rule::enum(UserRole::class)], // Проверяем, что роль только из разрешенного списка
        ], [
            'email.unique' => 'Користувач з такою поштою вже існує.', // Кастомные сообщения об ошибках
            'full_name.max' => 'Задовгі ім`я та прізвище',
            'password.min' => 'Пароль має містити не менше 6 символів.',
        ]);

        try {
            // Создание пользователя в БД
            $user = User::create([
                'full_name' => $validated['full_name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => $validated['role'], 
                'is_active' => 1,
            ]);
    
            // Сразу авторизуем пользователя
            Auth::login($user);

            Log::info("Зареєстровано нового користувача", [
                'email' => $user->email,
                'role' => $user->role,
                'full_name' => $user->full_name,
            ]);

            if ($redirect = $this->handlePendingInvites()) return $redirect;
    
            // редирект на главную
            return redirect('/')->with('success', 'Реєстрація успішна! Вітаємо на Edutive');
            
        } catch (\Exception $e) {
            Log::error("Помилка під час реєстрації користувача", [
                'error' => $e->getMessage(),
                'email' => $validated['email'] ?? 'unknown'
            ]);
            return redirect()->back()->with('error', 'Сталася помилка при реєстрації.');
        }
    }

    /**
     * вход
     */
    public function login(Request $request)
    {
        // Простая валидация
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Створюємо унікальний ключ
        $throttleKey = Str::transliterate(Str::lower($credentials['email']).'|'.$request->ip());

        // ПЕРЕВІРКА - Чи не перевищено ліміт в 5 спроб
        if (RateLimiter::tooManyAttempts($throttleKey, $maxAttempts = 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            Log::error("БЛОКУВАННЯ: Перевищено ліміт спроб входу в систему", [
                'email' => $credentials['email'],
                'ip' => $request->ip(),
                'block_duration' => $seconds
            ]);

            throw ValidationException::withMessages([
                'email' => "Забагато невдалих спроб входу. Спробуйте знову через {$seconds} секунд.",
            ]);
        }

        // Auth::attempt сама найдет юзера по email и сверит хеш пароля
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();  // Защита от атаки фиксации сессии

            RateLimiter::clear($throttleKey);

            Log::info("Успішний вхід в систему", [
                'user_id' => Auth::id(),
                'email' => Auth::user()->email,
                'role' => Auth::user()->role
            ]);

            if ($redirect = $this->handlePendingInvites()) return $redirect;

            return redirect()->intended('/')->with('success', 'З поверненням!'); // Редирект на главную
        }

        // Невдала спроба
        RateLimiter::hit($throttleKey, $decaySeconds = 60);
        $retriesLeft = RateLimiter::retriesLeft($throttleKey, 5);

        Log::warning("Невдала спроба входу в систему", [
            'email' => $credentials['email'],
            'ip' => $request->ip()
        ]);

        // Если пароль не подошел - выбрасываем ошибку валидации.
        throw ValidationException::withMessages(['email' => 'Невірний логін або пароль',]);
    }

    /**
     * Выход из системы
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Перенаправляє користувача на сторінку авторизації Google
     */
    public function googleRedirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Обробляє відповідь від Google після авторизації
     */
    public function googleCallback()
    {
        $throttleKey = 'google-callback|' . $request->ip();

        // максимум 10 запитів на хвилину на цей роут з одного IP
        if (RateLimiter::tooManyAttempts($throttleKey, 10)) {
            Log::error("БЛОКУВАННЯ: Флуд на маршрут Google Callback", ['ip' => $request->ip()]);
            return redirect('/')->with('error', 'Забагато запитів. Спробуйте пізніше');
        }

        RateLimiter::hit($throttleKey, 60);

        try {
            $googleUser = Socialite::driver('google')->user();            
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Створюємо нового юзера, якщо його ще немає
                $user = User::create([
                    'full_name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => bcrypt(Str::random(24)), // Випадковий пароль
                    'role' => UserRole::Student->value, 
                    'is_active' => 1,
                ]);
            }

            Auth::login($user);
            RateLimiter::clear($throttleKey); // Скидаємо ліміт флуду при успіху

            Log::info("Вхід через Google", [
                'user_id' => $user->id,
                'email' => $user->email,
                'is_new_user' => $isNewUser,
                'google_id' => $googleUser->getId()
            ]);

            return redirect()->intended('/')->with('success', 'З поверненням!');

        } catch (\Exception $e) {
            
            Log::error("Помилка авторизації через Google", [
                'error_message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect('/')->with('error', 'Сталася помилка при авторизації через Google.');
        }
    }

    /**
     * Перевіряє наявність відкладених запитів на приєднання до проєктів після авторизації.
     * Повертає об'єкт редіректу, або null, якщо відкладених запитів немає.
     */
    private function handlePendingInvites(): ?\Illuminate\Http\RedirectResponse
    {
        // запрошення через пошту
        if (session()->has('pending_invitation_token')) {
            $token = session()->pull('pending_invitation_token');
            
            $invitation = Invitation::where('token', $token)
                ->where('status', InvitationStatus::Pending->value)
                ->first();

            if ($invitation && auth()->user()->email === $invitation->email) {
                try {
                    // додаємо юзера до проєкту, оскільки він щойно успішно увійшов/зареєструвався
                    $invitation->project->members()->attach(auth()->id(), ['role' => 'student']);
                    $invitation->update(['status' => InvitationStatus::Accepted->value]);
                    
                    Log::info("Відкладене запрошення успішно активовано після авторизації", ['user_id' => auth()->id()]);

                    return redirect('/projects/' . $invitation->project->uuid)->with('success', 'Вітаємо! Ви успішно зареєструвалися та приєдналися до проєкту');
                } catch (\Exception $e) {
                    Log::error("Помилка активації відкладеного інвайту", ['error' => $e->getMessage()]);
                }
            } else {
                return redirect('/')->with('error', 'Запрошення не знайдено або воно було надіслане на інший Email');
            }
        }

        // запрошення за посиланням 
        if (session()->has('pending_public_invite_url')) {
            $url = session()->pull('pending_public_invite_url');
            
            Log::info("Редирект на відкладене публічне посилання приєднання", ['user_id' => auth()->id()]);
            return redirect()->to($url);
        }

        // Якщо ніяких інвайтів у сесії не було
        return null;
    }

}