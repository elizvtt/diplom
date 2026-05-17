<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Grade;
use App\Models\User;

use App\Events\GradeUpdated;
use App\Enums\TaskStatus;

class GradeService
{
    /**
     * Отримання статистики студентів та їх оціно
     */
    public function getGradesData(Project $project): array
    {
        // Завантажуємо ВСЕ одразу одним запитом, включаючи оцінки
        $project->load(['members', 'tasks.assignees', 'grades']);

        $allTasksDone = $project->tasks->every(fn ($task) => $task->status === TaskStatus::Done->value);

        $students = $project->members->map(function ($member) use ($project) {
            $tasks = $project->tasks->filter(fn ($task) => $task->assignees->contains($member->id));
            $doneTasks = $tasks->where('status', TaskStatus::Done->value);
            
            // Шукаємо оцінку в уже завантаженій колекції (без звернення до БД!)
            $grade = $project->grades->where('user_id', $member->id)->first();

            return [
                'id' => $member->id,
                'name' => $member->full_name,
                'tasks_total' => $tasks->count(),
                'tasks_done' => $doneTasks->count(),
                'task_history' => $doneTasks->values(),
                'score' => $grade?->score,
                'comment' => $grade?->comment,
            ];
        });

        return [
            'students' => $students,
            'allTasksDone' => $allTasksDone,
        ];
    }

    /**
     * Збереження оцінок та виклик подій
     */
    public function saveGrades(Project $project, array $gradesData, User $grader): void
    {
        foreach ($gradesData as $item) {
            $grade = Grade::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'user_id' => $item['user_id'],
                ],
                [
                    'rated_by_id' => $grader->id,
                    'score' => $item['score'],
                    'comment' => $item['comment'],
                ]
            );

            // Знаходимо студента та викликаємо подію (нотифікація піде у фон)
            $student = User::find($item['user_id']);
            if ($student) event(new GradeUpdated($grade, $project, $student, $grader));
        }

        $project->update(['grading_completed' => true]);
    }

    /**
     * Перевірка чи всі задачі завершено
     */
    public function areAllTasksDone(Project $project): bool
    {
        return $project->tasks()->where('status', '!=', TaskStatus::Done->value)->doesntExist();
    }

}