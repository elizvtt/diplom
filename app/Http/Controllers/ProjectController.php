<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use App\Enums\TaskStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskReminder;

class ProjectController extends Controller
{
    /**
     * создание проэкта
     */
    public function createProject(Request $request)
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
                // GenerateAiTasks::dispatch($project);
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
        // Дістаємо проєкти, де власник — поточний авторизований користувач
        $projects = Project::where('owner_id', $userId)
            ->where('is_active', 1)
            ->withCount([
                'tasks as tasks_total' => function ($query) { // Рахуємо загальну кількість активних завдань
                    $query->where('is_active', 1);
                },
                'tasks as tasks_completed' => function ($query) { // Рахуємо кількість завершених активних завдань
                    $query->where('is_active', 1)->where('status', 'done');
                }
            ])
            ->orderBy('created_at', 'desc') // За замовчуванням сортуємо від нових до старих
            ->get()
            ->map(function ($project) use ($userId) {
                $project->is_owner = $project->owner_id === $userId;
                return $project;
            });
        
        debug($projects);
        

        // Повертаємо React-компонент 'ProjectsList' і передаємо туди масив проєктів
        return Inertia::render('ProjectsList', [
            'projects' => $projects
        ]);
    }

    /**
     * Відображення сторінки конкретного проєкту
     */
    public function show(Project $project)
    {
        if ($project->owner_id !== auth()->id()) abort(403, 'У вас немає доступу до цього проєкту.');

        // завантажуємо зв'язки та лічильники
        $project->loadCount([
            'tasks as tasks_total' => fn($q) => $q->where('is_active', 1),
            'tasks as tasks_completed' => fn($q) => $q->where('is_active', 1)->where('status', 'done'),
        // ])->load(['owner', 'members', 'tasks.assignees', 'tasks.attachments', 'tasks.comments']);
        ])->load(['owner', 'members', 'tasks.assignees', 'tasks.attachments', 'tasks.comments.user']);

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

        return Inertia::render('ProjectView', [
            'project' => $project,
            'teamMembers' => $teamMembers,

            // Передаємо словники статусів та пріоритетів
            'statuses' => collect(TaskStatus::cases())->map(fn($s) => [
                'id' => $s->value,
                'label' => str($s->name)->headline(), // Робить з "InProgress" -> "In Progress"
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