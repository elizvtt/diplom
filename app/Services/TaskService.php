<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Models\Project;
use App\Models\TaskAssignee;
use App\Models\Attachment;
use App\Models\RiskAssessment;
use App\Enums\TaskStatus;
use App\Enums\TaskAssigneeStatus;
use App\Enums\NotificationEvent;
use App\Notifications\SimpleNotification;
use Illuminate\Support\Facades\Log;

use App\Events\TaskCreated;
use App\Events\TaskAssigned;
use App\Events\TaskStatusChanged;

class TaskService
{
    public function createTask(array $data, ?array $files, User $creator): Task
    {
        $task = Task::create([
            'project_id' => $data['project_id'],
            'creator_id' => $creator->id,
            'title' => $data['title'],
            'description' => $data['description'] ? ['text' => $data['description']] : null,
            'parent_task_id' => $data['parent_task_id'] ?? null,
            'date_start' => $data['date_start'],
            'date_end' => $data['date_end'],
            'status' => $data['status'],
            'priority' => $data['priority'],
            'reminder' => $data['reminder'],
            'progress' => $data['progress'],
            'is_active' => 1,
        ]);

        $project = Project::find($task->project_id);
        // Сповіщаємо систему про створення завдання
        event(new TaskCreated($task, $project, $creator));
        // $this->notifyProjectMembers($project, $task, $creator, NotificationEvent::TaskCreated);
        // Додаємо виконавців
        $this->syncAssignees($task, $data['assignees'] ?? [], $creator);
        // Завантажуємо файли
        if (!empty($files)) $this->uploadFiles($task, $files, $creator);

        Log::info("Створено нове завдання", [
            'project_id' => $task->project_id,
            'task_id'    => $task->id,
            'creator_id' => $creator->id
        ]);

        return $task;
    }

    public function updateStatus(Task $task, string $newStatus, User $user): void
    {
        $oldStatus = $task->status;
        $task->update(['status' => $newStatus]);

        // Сповіщаємо систему про зміну статусу
        event(new TaskCompleted($task, $oldStatus, $newStatus, $user));

        Log::info("Змінено статус завдання", [
            'task_id' => $task->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);

        if ($newStatus === TaskStatus::Done->value) {
            RiskAssessment::updateOrCreate(
                ['task_id' => $task->id],
                ['actual_completion_date' => now()]
            );
        } else {
            RiskAssessment::where('task_id', $task->id)->update(['actual_completion_date' => null]);
        }
    }

    public function updateTask(Task $task, array $data, User $updater): void
    {
        $task->update([
            'title' => $data['title'],
            'description' => $data['description'] ? ['text' => $data['description']] : null,
            'date_start' => $data['date_start'],
            'date_end' => $data['date_end'],
            'priority' => $data['priority'] ?? $task->priority,
            'progress' => $data['progress'] ?? $task->progress,
        ]);

        if (array_key_exists('assignees', $data)) 
            $this->syncAssignees($task, $data['assignees'] ?? [], $updater);

        Log::info("Оновлено параметри завдання", ['task_id' => $task->id]);
    }

    public function deleteTask(Task $task, User $deleter): void
    {
        $task->update(['is_active' => 0]);

        Log::info("Завдання успішно видалено", [
            'task_id'    => $task->id,
            'deleted_by' => $deleter->id
        ]);
    }

    private function syncAssignees(Task $task, array $newAssigneeIds, User $actor): void
    {
        $currentAssigneeIds = TaskAssignee::where('task_id', $task->id)->pluck('user_id')->toArray();
        $toAdd = array_diff($newAssigneeIds, $currentAssigneeIds);
        $toRemove = array_diff($currentAssigneeIds, $newAssigneeIds);

        if (!empty($toRemove)) 
            TaskAssignee::where('task_id', $task->id)->whereIn('user_id', $toRemove)->delete();

        foreach ($toAdd as $userId) {
            TaskAssignee::create([
                'task_id'  => $task->id,
                'user_id'  => $userId,
                'status'   => TaskAssigneeStatus::Assigned,
                'progress' => 0
            ]);

            $assignedUser = User::find($userId);

            // сповіщення для новоого виконавця
            if ($assignedUser) event(new TaskAssigned($task, $assignedUser, $actor));
        }
    }

    private function uploadFiles(Task $task, array $files, User $uploader): void
    {
        foreach ($files as $file) {
            $path = $file->store('attachments', 'public');
            Attachment::create([
                'task_id' => $task->id,
                'user_id' => $uploader->id,
                'filename' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }
    }
}