<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

use App\Services\AdminService;

class AdminController extends Controller
{
    public function __construct(
        private AdminService $adminService
    ) {}

    /**
     * Відображення головної сторінки адмін-панелі
     */
    public function index(Request $request)
    {
        Gate::authorize('admin-access'); // Додаткова перевірка через Gate

        // Перевіряємо сесію
        if (!session()->has('admin_access_verified_at')) 
            return redirect()->route('dashboard')->with('error', 'Будь ласка, підтвердіть пароль.');        

        $selectedDate = $request->input('log_date', now()->format('Y-m-d'));

        // Збираємо всі необхідні дані через сервіс
        return Inertia::render('AdminPanel', [
            'stats' => $this->adminService->getStatistics(),
            'users' => $this->adminService->getUsersList(),
            'projects' => $this->adminService->getProjectsList(),
            'logs' => $this->adminService->getParsedLogs($selectedDate),
            'selectedDate' => $selectedDate,
        ]);
    }

    /**
     * запит для зміни дати логів
     */
    public function fetchLogs(Request $request)
    {
        Gate::authorize('admin-access');

        $selectedDate = $request->input('log_date', now()->format('Y-m-d'));

        return Inertia::render('AdminPanel', [
            'logs' => $this->adminService->getParsedLogs($selectedDate),
            'selectedDate' => $selectedDate,
        ]);
    }


    /**
     * Перевірка пароля адміністратора перед входом
     */
    public function verifyPassword(Request $request)
    {
        // Створюємо унікальний ключ для лімітера на основі дії та IP-адреси
        $throttleKey = 'verify-admin-password:' . $request->ip();

        // перевірка на 3 спроби
        if (RateLimiter::tooManyAttempts($throttleKey, $perMinute = 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            Log::error("БЛОКУВАННЯ: Перевищено ліміт спроб входу до панелі адміністратора", [
                'ip' => $request->ip(),
                'user_id' => auth()-user()?->id,
                'email' => auth()->user()?->email,
                'block_duration_seconds' => $seconds
            ]);

            throw ValidationException::withMessages(['password' => "Забагато невдалих спроб. Доступ заблоковано на {$seconds} секунд",]);
        }

        // ВАЛІДАЦІЯ ПАРОЛЯ
        // current_password автоматично перевіряє, чи збігається введений пароль із паролем поточного юзера в БД
        $validator = Validator::make($request->all(), [
            'password' => ['required', 'current_password'],
        ], [
            'password.current_password' => 'Невірний пароль адміністратора',
            'password.required' => 'Введіть пароль для підтвердження',
        ]);
    
        if ($validator->fails()) {
            // Фіксуємо невдалу спробу і збільшуємо лічильник на 1
            RateLimiter::hit($throttleKey, $decaySeconds = 300); 
    
            // КІЛЬКІСТЬ ЗАЛИШКОВИХ СПРОБ
            $attemptsLeft = RateLimiter::retriesLeft($throttleKey, 3);
    
            Log::warning("Невдала спроба підтвердження пароля адміністратора", [
                'ip' => $request->ip(),
                'user_id' => auth()->user()?->id,
                'email' => auth()->user()?->email,
                'attempts_left' => $attemptsLeft
            ]);
    
            // Прокидаємо помилку валідації далі на фронтенд
            throw ValidationException::withMessages(['password' => "Невірний пароль адміністратора. Залишилось спроб: {$attemptsLeft}"]);
        }
    
        // Успішний вхід
        RateLimiter::clear($throttleKey);
        session(['admin_access_verified_at' => now()]); // записуємо мітку в сесію

        // переходимо на сторінку адмінки
        return redirect()->route('admin.index')->with('success', 'Доступ підтверджено');
    }


}