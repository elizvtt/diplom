<?php

namespace App\Services;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;

class AdminService
{
    /**
     * Збирає загальну статистику для дашборду.
     */
    public function getStatistics(): array
    {
        return [
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
    }

    /**
     * Повертає список користувачів для таблиці
     */
    public function getUsersList()
    {
        return User::select('id', 'full_name', 'role', 'is_active', 'email')
            ->orderBy('id', 'asc')
            ->get();
    }

    /**
     * Повертає список проєктів разом із кількістю завдань
     */
    public function getProjectsList()
    {
        return Project::with('owner:id,full_name')
            ->select('id', 'title', 'is_active', 'owner_id')
            ->withCount([
                'tasks as tasks_total' => fn($query) => $query->where('is_active', 1),
            ])
            ->orderBy('id', 'asc')
            ->get();
    }

    /**
     * Читає та парсить файл логів за вказану дату
     */
    public function getParsedLogs(string $date): array
    {
        $logPath = storage_path("logs/laravel-{$date}.log");

        if (!file_exists($logPath)) return [];

        $fileContent = file_get_contents($logPath);
        
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
                'created_at' => Carbon::parse($match['date'])->format('H:i:s'),
                'details' => $context, 
            ];
        }, array_reverse($matches));

        return array_slice($parsedLogs, 0, 50);
    }
}