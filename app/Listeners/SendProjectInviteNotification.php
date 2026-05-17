<?php

namespace App\Listeners;

use App\Models\User;
use App\Enums\NotificationEvent;

use App\Notifications\SimpleNotification;
use App\Notifications\ProjectInvitationEmail;

use App\Events\ProjectInvitationSent;
use Illuminate\Contracts\Queue\ShouldQueue;

use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class SendProjectInviteNotification implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(ProjectInvitationSent $event): void
    {
        $invitation = $event->invitation;
        $inviter = $event->inviter;
        $project = $invitation->project;
        $email = $invitation->email;

        // Ищем зарегистрированного пользователя
        $user = User::where('email', $email)->first();

        // & ЛОКАЛЬНОЕ УВЕДОМЛЕНИЕ
        if ($user) {
            try {
                $user->notify(new SimpleNotification([
                    'event' => NotificationEvent::ProjectInvite->value,
                    'message' => "Користувач {$inviter->full_name} запросив вас у проєкт «{$project->title}»",
                    'title' => "Запрошення у проєкт",
                    'project_id' => $project->id,
                    'author_id' => $inviter->id,
                    'url' => url('/projects/' . $project->uuid),
                    'token' => $invitation->token,
                ]));
                Log::info('Локальне повідомлення відправлено', ['user_id' => $user->id]);

            } catch (\Exception $e) {
                Log::error('Помилка відправлення локального повідомлення', ['error' => $e->getMessage()]);
            }
        }

        // & EMAIL УВЕДОМЛЕНИЕ
        try {
            Notification::route('mail', $email)
                ->notify(new ProjectInvitationEmail(
                    invitation: $invitation,
                    project: $project,
                    inviter: auth()->user()
                ));

            Log::info('Email-запрошення відправлено', ['email' => $email]);

        } catch (\Exception $e) {
            Log::error('Помилка відправлення email-запрошення', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
        }
    }
}
