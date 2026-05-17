<?php

namespace App\Listeners;

use App\Models\Invitation;
use App\Enums\InvitationStatus;
use Illuminate\Auth\Events\Registered;

/**
 * Обробник події реєстрації користувача
 * Відповідає за автоматичне приєднання нового користувача до проєкту, якщо він перейшов за посиланням-запрошенням перед реєстрацією
 */
class HandlePendingInvitation
{
    /**
     * Обробляє подію реєстрації
     * @param Registered $event Подія успішної реєстрації
     */
    public function handle(Registered $event): void
    {
        // Перевіряємо, чи зберігся у сесії токен запрошення
        if (!session()->has('pending_invitation_token')) return;

        $token = session('pending_invitation_token');

        // Шукаємо в базі запрошення, яке відповідає токену та email щойно зареєстрованого користувача
        $invitation = Invitation::where('token', $token)
            ->where('email', $event->user->email)
            ->where('status', InvitationStatus::Pending->value)
            ->first();

        if (!$invitation) return;

        // Добавляем в проект
        // $invitation->project->members()->attach($event->user->id);
        $invitation->project->members()->syncWithoutDetaching([
            $event->user->id => ['is_active' => 1]
        ]);

        // Меняем статус
        $invitation->update(['status' => InvitationStatus::Accepted->value]);

        session()->forget('pending_invitation_token');
    }
}