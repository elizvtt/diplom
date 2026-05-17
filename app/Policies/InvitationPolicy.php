<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Invitation;
use Illuminate\Auth\Access\HandlesAuthorization;

class InvitationPolicy
{
    use HandlesAuthorization;

    /**
     * Скасувати може або автор запрошення, або власник проєкту
     * @param User $user Поточний авторизований користувач
     * @param Invitation $invitation Модель запрошення
     * @return bool
     */
    public function revoke(User $user, Invitation $invitation): bool
    {
        return $invitation->project->owner_id === $user->id || $invitation->invited_by_id === $user->id;
    }
}