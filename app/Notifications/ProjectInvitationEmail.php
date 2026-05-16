<?php

namespace App\Notifications;

use App\Models\Invitation;
use App\Models\Project;
use App\Models\User;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\HtmlString;

class ProjectInvitationEmail extends Notification
{
    use Queueable;

    public function __construct(
        public Invitation $invitation,
        public Project $project,
        public User $inviter
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $acceptUrl = route('invitation.accept', $this->invitation->token);
        $declineUrl = route('invitation.decline', $this->invitation->token);
        $expiresAt = ($this->invitation->expires_at)->format('d.m.y H:m');

        return (new MailMessage)
            ->subject('Запрошення до проєкту')
            ->greeting('Вітаємо!')
            ->line("Користувач {$this->inviter->full_name} запросив Вас до проєкту «{$this->project->title}». Щоб приєднатися натисність на кнопку нижче")
            ->action('Прийняти запрошення', $acceptUrl)
            ->line(new HtmlString(
                '<br><a href="' . $declineUrl . '" style="color:#e3342f;">Відхилити запрошення</a>'
            ))
            ->line("Запрошення дійсне до {$expiresAt}")
            ->salutation(new HtmlString('З повагою, Команда Edutive'));
    }
}