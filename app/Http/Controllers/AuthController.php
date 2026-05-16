<?php

namespace App\Http\Controllers;

use App\Models\User;

use App\Enums\UserRole;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

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

        // редирект на главную
        return redirect('/')->with('success', 'Реєстрація успішна! Вітаємо на Edutive');
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

        // Auth::attempt сама найдет юзера по email и сверит хеш пароля
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();  // Защита от атаки фиксации сессии

            return redirect()->intended('/')->with('success', 'З поверненням!'); // Редирект на главную
        }

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

            return redirect()->intended('/')->with('success', 'З поверненням!');

        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Сталася помилка при авторизації через Google.');
        }
    }
}