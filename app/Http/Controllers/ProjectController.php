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
            'description' => ['nullable', 'string', 'max:2000'],
            'generate_ai_tasks' => ['nullable', 'boolean'],
        ], [
            'title.required' => 'Введіть назву проєкту',
            'title.max' => 'Надто довга назва проєкту',
            'description.max'  => 'Опис проєкту занадто довгий',
        ]);

        debug($validated);

        // Створення проєкту в БД
        $project = Project::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ? ['html' => $validated['description']] : null,
            'owner_id' => auth()->id(),
            'is_active' => 1,
        ]);
        
        if ($request->boolean('generate_ai_tasks')) {
            // ТУТ МАЄ БУТИ ВИКЛИК ЧЕРГИ (Job). 
            // ШІ генерує відповідь довго (10-20 сек). Якщо робити це синхронно, 
            // браузер користувача зависне. 
            // GenerateAiTasks::dispatch($project);

            // Поки що просто запишемо в лог, щоб бачити, що прапорець працює
            Log::info("ШІ-генерація увімкнена для проєкту ID: {$project->id}");
        }

        return redirect()->back()->with('success', 'Проєкт успішно створено!');
    }

    /**
     * Відображення списку всіх проєктів користувача
     */
    public function listAllUserProjects()
    {
        $userId = auth()->id();
        // Дістаємо проєкти, де власник — поточний авторизований користувач
        $projects = Project::where('owner_id', $userId)
            ->orderBy('created_at', 'desc') // За замовчуванням сортуємо від нових до старих
            ->get()
            ->map(fn ($project) => $this->projectFormatterForFront($project, $userId));
        
        debug($projects);
        

        // Повертаємо React-компонент 'ProjectsList' і передаємо туди масив проєктів
        return Inertia::render('ProjectsList', [
            'projects' => $projects
        ]);
    }

    /**
     * Форматує об'єкт проєкту для зручного використання на фронтенді
     */
    private function projectFormatterForFront(Project $project, int $userId) : Project
    {
        $project->is_owner = $project->owner_id === $userId;
        
        // Тимчасові заглушки для прогрес-бару
        // $project->tasks_total = 0;
        // $project->tasks_completed = 0;

        return $project;

    }

    /**
     * Відображення сторінки конкретного проєкту
     */
    public function show(Project $project)
    {
        if ($project->owner_id !== auth()->id()) abort(403, 'У вас немає доступу до цього проєкту.');

        $project->load(['owner', 'members', 'tasks']);

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