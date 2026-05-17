<?php

namespace App\Listeners;

use App\Events\TaskAssigned;

use App\Enums\NotificationEvent;
use App\Notifications\SimpleNotification;

use Illuminate\Contracts\Queue\ShouldQueue;

class SendTaskAssignedNotification implements ShouldQueue
{
    /**
     * Handle the event
     */
    public function handle(TaskAssigned $event): void
    {
        $task = $event->task;
        $assignee = $event->assignee;
        $assignor = $event->assignor;
        $project = $task->project;

        if ($assignee->id !== $assignor->id) {
            $assignee->notify(new SimpleNotification([
                'event' => NotificationEvent::TaskAssigned->value,
                'title' => 'Прзначенння завдання',
                'message' => "Вас призначено на задачу «{$task->title}» у проєкті «{$project->title}»",
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'author_id' => $actor->id,
                'url' => url('/projects/' . $task->project->uuid) . '?task_id=' . $task->id,
            ]));
        }
    }
}
