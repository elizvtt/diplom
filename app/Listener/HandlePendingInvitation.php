<?php

namespace App\Listeners;

use App\Models\Invitation;
use App\Enums\InvitationStatus;
use Illuminate\Auth\Events\Registered;

class HandlePendingInvitation
{
    public function handle(Registered $event): void
    {
        if (!session()->has('pending_invitation_token')) {
            return;
        }

        $token = session('pending_invitation_token');

        $invitation = Invitation::where('token', $token)
            ->where('email', $event->user->email)
            ->where('status', InvitationStatus::Pending->value)
            ->first();

        if (!$invitation) {
            return;
        }

        // Добавляем в проект
        $invitation->project->members()->attach($event->user->id);

        // Меняем статус
        $invitation->update([
            'status' => InvitationStatus::Accepted->value
        ]);

        session()->forget('pending_invitation_token');
    }
}