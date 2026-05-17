<?php

namespace App\Listeners;

use App\Enums\NotificationEvent;
use App\Events\GradeUpdated;
use App\Notifications\SimpleNotification;

use Illuminate\Contracts\Queue\ShouldQueue;

class SendGradeChangedNotification implements ShouldQueue
{

    /**
     * Handle the event.
     */
    public function handle(GradeUpdated $event): void
    {
        $event->student->notify(new SimpleNotification([
            'event' => NotificationEvent::GradeChanged->value,
            'title' => "Оцінку оновлено",
            'message' => "Вам виставлено оцінку за проєкт",
            'project_id' => $event->project->id,
            'author_id' => $event->grader->id,
            'url' => url('/projects/' . $event->project->uuid)
        ]));
    }
}
