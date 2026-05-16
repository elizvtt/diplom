<?php

namespace App\Services;

use App\Models\User;
use App\Models\Project;
use App\Models\Invitation;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

use App\Enums\InvitationStatus;
use App\Enums\NotificationEvent;

use App\Notifications\SimpleNotification;
use App\Notifications\ProjectInvitationEmail;
class InvitationService
{
    public function invite(string $email, Project $project, int $inviterId): void
    {
        // Нельзя пригласить себя
        if ($email === auth()->user()->email)
            throw new \Exception('self_invite');

        // Уже участник проекта
        if ($project->members()->where('email', $email)->exists())
            throw new \Exception('already_member');

        // Уже есть активный invite
        $existingInvite = Invitation::where('project_id', $project->id)
            ->where('email', $email)
            ->where('status', InvitationStatus::Pending->value)
            ->first();

        if ($existingInvite) 
            throw new \Exception('already_invited');

        // Создаем приглашение
        $invitation = Invitation::create([
            'project_id'=> $project->id,
            'invited_by_id' => $inviterId,
            'email' => $email,
            'token' => Str::random(64),
            'status' => InvitationStatus::Pending->value,
            'expires_at' => now()->addDays(7),
        ]);

        Log::info('Запрошення успішно створено', [
            'invitation_id' => $invitation->id,
            'email' => $email,
        ]);

        // Ищем зарегистрированного пользователя
        $user = User::where('email', $email)->first();

        // & ЛОКАЛЬНОЕ УВЕДОМЛЕНИЕ
        if ($user) {
            try {
                $user->notify(
                    new SimpleNotification([
                        'event' => NotificationEvent::ProjectInvite->value,
                        'message' => 'Коритсувач ' . auth()->user()->full_name . ' запросив вас у проєкт «' . $project->title . '»',
                        'title' => 'Запрошення у проєкт',
                        'project_id' => $project->id,
                        'author_id' => auth()->id(),
                        'url' => url('/projects/' . $project->uuid),
                        'token' => $invitation->token,
                    ])
                );

                Log::info('Локальне повідомлення відправлено', ['user_id' => $user->id]);

            } catch (\Exception $e) {
                Log::error('Помилка відправлення локального повідомлення', ['error' => $e->getMessage()]);
            }
        }

        // & EMAIL УВЕДОМЛЕНИЕ
        try {
            Notification::route('mail', $email)
                ->notify(
                    new ProjectInvitationEmail(
                        invitation: $invitation,
                        project: $project,
                        inviter: auth()->user()
                    )
                );

            Log::info('Email-запрошення відправлено', ['email' => $email]);

        } catch (\Exception $e) {
            Log::error('Помилка відправлення email-запрошення', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
        }
    }
}