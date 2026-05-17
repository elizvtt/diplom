<?php

namespace App\Listeners;

use App\Enums\NotificationEvent;
use App\Events\TaskDeadlineRiskDetected;
use App\Notifications\SimpleNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendDeadlineRiskNotification implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(TaskDeadlineRiskDetected $event): void
    {
        $task = $event->task;
        $riskLevel = $event->riskLevel;
        $project = $task->project;

        // Перевіряємо наявність виконавців, якщо порожньо - відправляємо автору
        $notifyUsers = $task->assignees->isNotEmpty() ? $task->assignees : collect([$task->creator]);

        foreach ($notifyUsers as $user) {
            if (!$user) continue;

            try {
                $user->notify(new SimpleNotification([
                    'event' => NotificationEvent::DeadlineRisk->value,
                    'title' => 'Ризик зриву дедлайну',
                    'message' => "Увага! Завдання «{$task->title}» у проєкті «{$project->title}» має {$riskLevel->label()} ризик прострочення",
                    'task_id' => $task->id,
                    'project_id' => $project->id,
                    'url' => url('/projects/' . $project->uuid),
                ]));
            } catch (\Exception $e) {
                Log::error("Помилка надсилання сповіщення: " . $e->getMessage());
            }
        }
    }
}
