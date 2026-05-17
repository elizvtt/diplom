<?php

namespace App\Listeners;

use App\Events\TaskCompleted;

use App\Enums\NotificationEvent;
use App\Enums\TaskStatus;
use App\Notifications\SimpleNotification;

use Illuminate\Contracts\Queue\ShouldQueue;

class SendTaskCompletedNotification implements ShouldQueue
{

    /**
     * Handle the event.
     */
    public function handle(TaskCompleted $event): void
    {
        // Відправляємо сповіщення ТІЛЬКИ якщо новій статус = Done
        if ($event->newStatus !== TaskStatus::Done->value) return; 

        $task = $event->task;
        $actor = $event->actor;
        $project = $task->project;

        foreach ($project->members as $user) {
            if ($user->id === $actor->id) continue;

            $user->notify(new SimpleNotification([
                'event'=> NotificationEvent::TaskCompleted->value,
                'title'=> 'Завдання завершено',
                'message'=> "Задачу «{$task->title}» завершено",
                'project_id'=> $task->project_id,
                'task_id'=> $task->id,
                'author_id'=> $actor->id,
                'url'=> url('/projects/' . $project->uuid),
            ]));
        }
        
    }
}
