<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Exception;

class ProjectService
{
    public function __construct(
        private GeminiService $geminiService,
        private TaskGenerationService $taskGenerationService
    ) {}

    /**
     * Створення нового проєкту та запуск AI-генерації(якщо обрано)
     * @param array $data дані запиту
     * @param User $user Користувач, що створює проєкт
     * @return Project
     * @throws Exception
     */
    public function createProject(array $data, User $user): Project
    {
        $project = Project::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'owner_id' => $user->id,
            'is_active' => 1,
        ]);

        Log::info("Проєкт створено успішно", [
            'project_id' => $project->id,
            'ai_generation_requested' => !empty($data['generate_ai_tasks']),
        ]);

        // Якщо користувач запросив генерацію завдань через AI
        if (!empty($data['generate_ai_tasks'])) 
            $this->handleAiGeneration($project, $user);

        return $project;
    }

    /**
     * Оновлення проєкту 
     * @param Project $project Модель проєкту
     * @param array $data Валідовані дані
     * @param User $user Користувач, що редагує
     * @return bool
     */
    public function updateProject(Project $project, array $data, User $user): bool
    {
        $updated = $project->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
        ]);

        Log::info("Проєкт успішно оновлено", [
            'project_id' => $project->id,
            'user_id' => $user->id,
        ]);

        return $updated;
    }

    /**
     * Видалення проєкту
     *
     * @param Project $project Модель проєкту
     * @param User $user Користувач, що видаляє
     * @return bool
     */
    public function deleteProject(Project $project, User $user): bool
    {
        $deleted = $project->update(['is_active' => 0]);

        Log::info("Проєкт успішно видалено", [
            'project_id' => $project->id,
            'user_id'    => $user->id,
        ]);

        return $deleted;
    }

    /**
     * Отримання списку всіх активних проєктів користувача зі статистикою
     * @param User $user
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserProjects(User $user)
    {
        return Project::where('is_active', 1)
            ->where(function ($query) use ($user) {
                $query->where('owner_id', $user->id)
                      ->orWhereHas('members', function ($q) use ($user) {
                          $q->where('user_id', $user->id);
                      });
            })
            ->withCount([
                'tasks as tasks_total' => fn($q) => $q->where('is_active', 1),
                'tasks as tasks_completed' => fn($q) => $q->where('is_active', 1)->where('status', 'done'),
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($project) use ($user) {
                $project->is_owner = $project->owner_id === $user->id;
                return $project;
            });
    }

    /**
     * Отримання детальної інформації проєкту з підзадачами, вкладеннями та коментарями
     * @param Project $project
     * @return Project
     */
    public function loadProjectDetails(Project $project): Project
    {
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
                          'subtasks.assignees',
                          'subtasks.attachments',
                          'subtasks.comments.user',
                          'subtasks.parent'
                      ]);
            }
        ]);

        return $project;
    }

    /**
     * Обробка генерації завдань через AI з урахуванням лімітів
     */
    private function handleAiGeneration(Project $project, User $user): void
    {
        Log::info("ШІ-генерація увімкнена для проєкту ID: {$project->id}");
        
        $dailyKey = 'ai-daily:' . $user->id;
        $minuteKey = 'ai-minute:' . $user->id;

        // максимум 5 генераций, не чаще одногоо раза в минуту
        if (RateLimiter::tooManyAttempts($dailyKey, 5))
            throw new Exception('Ви перевищили денний ліміт AI-генерацій');

        RateLimiter::hit($dailyKey, 86400);

        if (RateLimiter::tooManyAttempts($minuteKey, 1)) {
            $seconds = RateLimiter::availableIn($minuteKey);
            throw new Exception("Занадто багато запитів. Спробуйте через {$seconds} сек");
        }
        RateLimiter::hit($minuteKey, 60);

        $generatedTasks = $this->geminiService->generateTasks(
            $project->title,
            $project->description
        );

        $this->taskGenerationService->createTasks(
            $project,
            $generatedTasks,
            $user
        );
    }
}