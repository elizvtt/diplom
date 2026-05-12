<?php

namespace App\Notifications;

use App\Enums\NotificationEvent;
use App\Models\Project;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class GradeChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Project $project,
        public float $score,
        public ?string $comment = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'event' => NotificationEvent::GradeChanged->value,

            'title' => 'Оцінка за проєкт',

            'message' => 'Вам виставлено оцінку за проєкт "' . $this->project->title . '"',

            'project_id' => $this->project->id,

            'project_title' => $this->project->title,

            'score' => $this->score,

            'comment' => $this->comment,
        ];
    }
}