<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Спрацьовує після того, як юзер був збережений у базу
     */
    public function created(User $user): void
    {
        $user->createDefaultNotificationSettings();
    }
}