<?php

namespace App\Listeners;

use App\Events\TaskReminderTriggered;
use App\Notifications\SimpleNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendTaskReminderNotification implements ShouldQueue
{


    /**
     * Handle the event.
     */
    public function handle(TaskReminderTriggered $event): void
    {
        $task = $event->task;
        $project = $task->project;
     
        // Якщо виконавців немає, надсилаємо автору завдання
        $assignedUsers = $task->users->isNotEmpty() ? $task->users : collect([$task->creator]);
        
        foreach ($assignedUsers as $user) {
            if (!$user) continue;

            try {
                $user->notify(
                    new SimpleNotification([
                        'event' => 'task_reminder',
                        'title' => "Нагадування про дедлайн",
                        'message' => "Термін виконання завдання «{$task->title}» у проєкті «{$project->title}» добігає кінця: " . $task->date_end->format('d.m.Y H:i'),
                        'project_id' => $task->project_id,
                        'task_id' => $task->id,
                        'author_id' => $task->creator_id,
                        'url' => url('/projects/' . $project->uuid) . '?task_id=' . $task->id,
                    ])
                );

                Log::info("Нагадування надіслано користувачу", [
                    'task_id' => $task->id,
                    'user_id' => $user->id
                ]);

            } catch (\Exception $e) {
                Log::error("Помилка відправки нагадування", [
                    'task_id' => $task->id,
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

    }
}
