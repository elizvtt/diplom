<?php

namespace App\Listeners;

use App\Events\TaskCreated;

use App\Enums\NotificationEvent;
use App\Notifications\SimpleNotification;

use Illuminate\Contracts\Queue\ShouldQueue;

class SendTaskCreatedNotification implements ShouldQueue
{
    /**
     * Handle the event
     */
    public function handle(TaskCreated $event): void
    {
        $task = $event->task;
        $project = $event->project;
        $creator = $event->creator;

        foreach ($project->members as $user) {
            // Щоб автор не отримував сповіщення про власну дію
            if ($user->id === $creator->id) continue;
        }

        $member->notify(new SimpleNotification([
            'event' => $event->value,
            'title' => "Нове завдання у проєкті",
            'message' => "Створено задачу «{$task->title}» у проєкті «{$project->title}»",
            'project_id' => $task->project_id,
            'task_id' => $task->id,
            'author_id' => $actor->id,
            'url' => url('/projects/' . $project->uuid) . '?task_id=' . $task->id,
        ]));
    }
}
