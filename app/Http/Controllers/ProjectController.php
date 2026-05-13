<?php

namespace App\Http\Controllers;

use App\Models\Project;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

use App\Enums\TaskStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskReminder;

use App\Services\GeminiService;
use App\Services\TaskGenerationService;

class ProjectController extends Controller
{
    /**
     * создание проэкта
     */
    public function createProject(Request $request, GeminiService $geminiService, TaskGenerationService $taskGenerationService)
    {
        // Валидация данных
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'generate_ai_tasks' => ['nullable', 'boolean'],
        ], [
            'title.required' => 'Введіть назву проєкту',
            'title.max' => 'Надто довга назва проєкту',
            'description.max'  => 'Опис проєкту занадто довгий',
        ]);

        try {
            $project = Project::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'owner_id' => auth()->id(),
                'is_active' => 1,
            ]);

            // Успішний лог
            Log::info("Проєкт створено успішно", [
                'project_id' => $project->id,
                'ai_generation_requested' => $request->boolean('generate_ai_tasks'),
            ]);
            
            if ($request->boolean('generate_ai_tasks')) {
                Log::info("ШІ-генерація увімкнена для проєкту ID: {$project->id}");
                // LIMIT: максимум 5 генераций в день
                $dailyKey = 'ai-daily:' . auth()->id();
                Log::info("dailyKey : {$dailyKey }");

                if (RateLimiter::tooManyAttempts($dailyKey, 5)) {

                    return redirect()->back()->with(
                        'error',
                        'Ви перевищили денний ліміт AI-генерацій'
                    );
                }

                RateLimiter::hit($dailyKey, 86400);

                // LIMIT: не чаще 1 раза в минуту
                $minuteKey = 'ai-minute:' . auth()->id();
                Log::info("minuteKey : {$minuteKey}");

                if (RateLimiter::tooManyAttempts($minuteKey, 1)) {

                    $seconds = RateLimiter::availableIn($minuteKey);

                    return redirect()->back()->with(
                        'error',
                        "Спробуйте через {$seconds} сек."
                    );
                }

                RateLimiter::hit($minuteKey, 60);
                    
                $generatedTasks = $geminiService->generateTasks(
                    $project->title,
                    $project->description
                );

                $taskGenerationService->createTasks(
                    $project,
                    $generatedTasks
                );

            }

            return redirect()->back()->with('success', 'Проєкт успішно створено!');

        } catch (\Exception $e) {
    
            Log::error("Помилка при створенні проєкту", [
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'input_data' => $request->except(['password', '_token']), // Записуємо що вводив юзер, але без секретів
            ]);

            // Повертаємо користувача назад із повідомленням про помилку
            return redirect()->back()->with('error', 'Виникла технічна помилка при створенні проєкту');
        }
    }

    /**
     * Відображення списку всіх проєктів користувача
     */
    public function listAllUserProjects()
    {
        $userId = auth()->id();

        $projects = Project::where('is_active', 1)
            ->where(function ($query) use ($userId) {
                $query->where('owner_id', $userId) // Владелец проекта
                // ИЛИ участник команды
                ->orWhereHas('members', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                });
            })
            ->withCount([
                'tasks as tasks_total' => function ($query) {
                    $query->where('is_active', 1);
                },
                'tasks as tasks_completed' => function ($query) {
                    $query->where('is_active', 1)->where('status', 'done');
                }
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($project) use ($userId) {
                $project->is_owner = $project->owner_id === $userId;
                return $project;
            });

        return Inertia::render('ProjectsList', [
            'projects' => $projects
        ]);
    }

    /**
     * Відображення сторінки конкретного проєкту
     */
    public function show(Project $project)
    {
        if ($project->owner_id !== auth()->id() && !$project->members->contains(auth()->id())) {
            abort(403, 'У вас немає доступу до цього проєкту');
        }

        // завантажуємо лічильники
        $project->loadCount([
            'tasks as tasks_total' => fn($q) => $q->where('is_active', 1),
            'tasks as tasks_completed' => fn($q) => $q->where('is_active', 1)->where('status', 'done'),
        ]);

        $project->load([
            'owner',
            'members',
            'tasks' => function ($query) {
                $query->where('is_active', 1)
                    ->whereNull('parent_task_id')
                    ->with([
                        'assignees', 
                        'attachments', 
                        'comments.user',
                        'subtasks.assignees', // Завантажуємо підзадачі та їх виконавців
                        'subtasks.attachments',
                        'subtasks.comments.user',
                        'subtasks.parent' // Щоб підзадача "знала" свого батька
                    ]);
                }
        ]);

        $teamMembers = collect([$project->owner])
            ->merge($project->members)
            ->unique('id')
            ->values() // Переиндексируем массив
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->full_name,
                ];
            });

        return Inertia::render('Project', [
            'project' => $project,
            'teamMembers' => $teamMembers,

            // Передаємо словники статусів та пріоритетів
            'statuses' => collect(TaskStatus::cases())->map(fn($s) => [
                'id' => $s->value,
                'label' => str($s->name)->headline(),
            ]),
            'priorities' => collect(TaskPriority::cases())->map(fn($p) => [
                'id' => $p->value,
                'label' => $p->label(),
            ]),
            'reminders' => collect(TaskReminder::cases())->map(fn($r) => [
                'id' => $r->value,
                'label' => $r->label(), // переведенный текст
            ]),
        ]);
    }

}


// "Система управления обучением"
// "Веб-приложение для преподавателей и студентов"

// Learning Management System
// Web Application for Teachers and Students