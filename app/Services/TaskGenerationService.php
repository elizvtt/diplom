<?php

namespace App\Services;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;

class TaskGenerationService
{
    public function createTasks(Project $project, array $tasks, User $creator): void
    {
        foreach ($tasks as $taskData) {

            Task::create([
                'project_id' => $project->id,
                'creator_id' => $creator->id,
                'title' => $taskData['title'],
                'description' => ['text' => $taskData['description'] ?? ''],
                'priority' => $taskData['priority'] ?? TaskPriority::Medium,
                'status' => TaskStatus::Backlog,
                'progress' => 0,
                'is_active' => 1,
            ]);
        }
    }
}