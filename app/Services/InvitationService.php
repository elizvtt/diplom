<?php

namespace App\Services;

use App\Models\Invitation;
use App\Models\Project;
use App\Models\User;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

use App\Enums\InvitationStatus;

use App\Events\ProjectInvitationSent;

class InvitationService
{
    /**
     * @param string $email
     * @param Project $project
     * @param User $inviter 
     */
    public function invite(string $email, Project $project, User $inviter): void
    {
        // Нельзя пригласить себя
        if ($email === $inviter->email)
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
            'invited_by_id' => $inviter->id,
            'email' => $email,
            'token' => Str::random(64),
            'status' => InvitationStatus::Pending->value,
            'expires_at' => now()->addDays(7),
        ]);

        Log::info('Запрошення успішно створено', [
            'invitation_id' => $invitation->id,
            'email' => $email,
        ]);

        event(new ProjectInvitationSent($invitation, $inviter));
    }

    /**
     * Відкликання надісланого запрошення
     * @param Invitation $invitation Модель запрошення
     * @param User $actor Користувач, який відкликає
     * @return void
     */
    public function revoke(Invitation $invitation, User $actor): void
    {
        $invitation->update(['status' => InvitationStatus::Revoked->value]);

        // Використовуємо Eloquent-модель
        DatabaseNotification::where('data->invitation_id', $invitation->id)->delete();

        Log::info("Запрошення успішно відкликано", [
            'invitation_id' => $invitation->id,
            'project_id' => $invitation->project_id,
            'email' => $invitation->email,
            'revoked_by' => $actor->id
        ]);
    }

    /**
     * Прийняття запрошення авторизованим користувачем     *
     * @param Invitation $invitation Модель запрошення
     * @param User $user Авторизований користувач
     * @return void
     */
    public function accept(Invitation $invitation, User $user): void
    {
        // Додаємо користувача до команди проєкту
        $invitation->project->members()->attach($user->id);
        
        // Оновлюємо статус запрошення
        $invitation->update(['status' => InvitationStatus::Accepted]);

        Log::info("Користувач успішно прийняв запрошення", [
            'invitation_id' => $invitation->id,
            'project_id' => $invitation->project_id,
            'user_id' => $user->id
        ]);
    }

}