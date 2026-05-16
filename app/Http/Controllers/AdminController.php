<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    /**
     * Відображення головної сторінки адмін-панелі
     */
    public function index(Request $request)
    {
        Gate::authorize('admin-access'); // Додаткова перевірка через Gate

        // Перевіряємо сесію
        if (!session()->has('admin_access_verified_at')) {
            return redirect()->route('dashboard')->with('error', 'Будь ласка, підтвердіть пароль.');
        }

        $selectedDate = $request->input('log_date', now()->format('Y-m-d'));

        // Збираємо статистику
        $stats = [
            'users' => [
                'total' => User::count(),
                'active' => User::where('is_active', 1)->count(),
                'new_today' => User::whereDate('created_at', today())->count(),
            ],

            'projects' => [
                'active' => Project::where('is_active', 1)->count(),
                'inactive' => Project::where('is_active', 0)->count(),
            ],

            'tasks' => [
                'total' => Task::where('is_active', 1)->count(),
                'completed' => Task::where('status', 'done')->count(),
                'overdue' => Task::whereDate('date_end', '<', now())
                    ->where('status', '!=', 'done')
                    ->count(),
            ],
        ];


        // Отримуємо список усіх користувачів для таблиці
        $users = User::select('id', 'full_name', 'role', 'is_active', 'email')
            ->orderBy('id', 'asc')
            ->get();

        $projects = Project::with('owner:id,full_name')
            ->select('id', 'title', 'is_active', 'owner_id')
            ->withCount([
                'tasks as tasks_total' => function ($query) {
                    $query->where('is_active', 1);
                },
            ])
            ->orderBy('id', 'asc')
            ->get();

        $today = now()->format('Y-m-d');

        return Inertia::render('AdminPanel', [
            'stats' => $stats,
            'users' => $users,
            'projects' => $projects,
            'logs' => $this->getLogs($today),
            'selectedDate' => $today,
        ]);
    }

    /**
     * Окремий POST запит для зміни дати логів
     */
    public function fetchLogs(Request $request)
    {
        Gate::authorize('admin-access');

        // Беремо прийшовши з POST запиту дату
        $selectedDate = $request->input('log_date', now()->format('Y-m-d'));

        return Inertia::render('AdminPanel', [
            'logs' => $this->getLogs($selectedDate),
            'selectedDate' => $selectedDate,
        ]);
    }

    /**
     * Парсинг логів за конкретну дату
     */
    public function getLogs($date)
    {
        $logPath = storage_path("logs/laravel-{$date}.log"); // Формуємо ім'я файлу на основі дати

        if (!file_exists($logPath)) return []; // Якщо файлу не існує, повертаємо порожній масив

        $fileContent = file_get_contents($logPath);
        
        // Регулярний вираз для парсингу рядка (враховує дату, рівень, повідомлення, контекст та extra)
        $pattern = '/\[(?P<date>.*)\] (?P<env>\w+)\.(?P<level>\w+): (?P<message>.*) (?P<context>\{.*\}) (?P<extra>\{.*\})/';
        
        preg_match_all($pattern, $fileContent, $matches, PREG_SET_ORDER);

        $parsedLogs = array_map(function ($match) {
            $context = json_decode($match['context'], true);
            $extra = json_decode($match['extra'], true);

            return [
                'level' => strtoupper($match['level']),
                'action' => $match['message'],
                'description' => "user: " . ($extra['user']['email'] ?? 'undefined') . " (" . ($extra['user']['role'] ?? 'n/a') . ")",
                'ip' => $extra['web']['ip'] ?? '127.0.0.1',
                'created_at' => \Carbon\Carbon::parse($match['date'])->format('H:i:s'), // Тільки час, бо дата у назві вкладок
                'details' => $context, 
            ];
        }, array_reverse($matches));

        return array_slice($parsedLogs, 0, 50);
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
                'user_id' => auth()->id(),
                'email' => auth()->user()?->email,
                'block_duration_seconds' => $seconds
            ]);

            throw ValidationException::withMessages([
                'password' => "Забагато невдалих спроб. Доступ заблоковано на {$seconds} секунд.",
            ]);
        
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
                'user_id' => auth()->id(),
                'email' => auth()->user()?->email,
                'attempts_left' => $attemptsLeft
            ]);
    
            // Прокидаємо помилку валідації далі на фронтенд
            throw ValidationException::withMessages(['password' => "Невірний пароль адміністратора. Залишилось спроб: {$attemptsLeft}"]);
        }
    
        // Успішний вхід
        RateLimiter::clear($throttleKey);

        // записуємо мітку в сесію
        session(['admin_access_verified_at' => now()]);

        // переходимо на сторінку адмінки
        return redirect()->route('admin.index')->with('success', 'Доступ підтверджено');

    }


}