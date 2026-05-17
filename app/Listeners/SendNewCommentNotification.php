<?php

namespace App\Listeners;

use App\Events\CommentAdded;

use App\Enums\NotificationEvent;
use App\Notifications\SimpleNotification;

use Illuminate\Contracts\Queue\ShouldQueue;

class SendNewCommentNotification implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(CommentAdded $event): void
    {
        $task = $event->task;
        $author = $event->author;
        $project = $task->project;

        foreach ($task->assignees as $user) {
            if ($user->id === $author->id) continue; // щоб автор не отримував повідомлення

            $user->notify(new SimpleNotification([
                'event' => NotificationEvent::NewComment->value,
                'title' => "Новий коментар",
                'message' => "Новий коментар до задачі «{$task->title}»",
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'author_id' => $author->id,
                'url' => url('/projects/' . $project->uuid) . '?task_id=' . $task->id, 
            ]));
        }
    }
}
