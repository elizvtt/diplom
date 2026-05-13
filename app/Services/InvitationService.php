<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Invitation;
use App\Models\User;

use App\Enums\InvitationStatus;
use App\Enums\NotificationEvent;

use App\Notifications\SimpleNotification;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Throwable;

class InvitationService
{
    public function invite(string $email, Project $project, int $inviterId): void
    {
        if ($email === auth()->user()->email)
            throw new \Exception('self_invite');

        if ($project->members()->where('email', $email)->exists())
            throw new \Exception('already_member');


        $existingInvite = Invitation::where('project_id', $project->id)
            ->where('email', $email)
            ->where('status', InvitationStatus::Pending->value)
            ->first();

        if ($existingInvite) {
            throw new \Exception('already_invited');
        }

        $invitation = Invitation::create([
            'project_id'    => $project->id,
            'invited_by_id' => $inviterId,
            'email'         => $email,
            'token'         => Str::random(64),
            'status'        => InvitationStatus::Pending->value,
            'expires_at'    => now()->addDays(7),
        ]);

        Log::info('Запрошення успішно створено', [
            'invitation_id' => $invitation->id,
            'email' => $email,
        ]);

        $user = User::where('email', $email)->first();

        if ($user) {
            try {
                $user->notify(
                    new SimpleNotification([
                        'event' => NotificationEvent::ProjectInvite->value,
                        'title' => 'Запрошення у проєкт',
                        'message' => 'Вас запросили у проєкт "' . $project->title . '"',
                        'project_id' => $project->id,
                        'author_id' => auth()->id(),
                    ])
                );

                Log::info('Локальне повідомлення відправлено', ['user_id' => $recipient->id]);

            } catch (Throwable $e) {
                Log::error('Помилка відправлення локального повідомлення', ['error' => $e->getMessage()]);
            }
        }
    }
}