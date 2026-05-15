<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;

use App\Enums\InvitationStatus;
use App\Enums\TeamRole;

use Inertia\Inertia;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;

use Illuminate\Validation\Rule;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    /**
     * Відображення сторінки проєкту
     * Примає модель проєкту і повертає відповідь для рендерингу сторінки команди
     * @param  \App\Models\Project  $project
     * @return \Inertia\Response
     */
    public function showTeam(Project $project)
    {
        // Завантажуємо власника та учасників (members)
        $project->load(['owner', 'members']);

        // Отримуємо запрошення для цього проєкту
        $invitations = $project->invitations()
            ->where('status', '!=', InvitationStatus::Accepted->value)
            ->orderBy('created_at', 'desc')
            ->get();

        // Створюємо посилання, яке використовує UUID, але захищене підписом
        $inviteLink = URL::signedRoute('projects.invitations.join', [
            'project' => $project->uuid
        ]);

        $teamRoles = collect(TeamRole::cases())
            ->filter(fn (TeamRole $role) => $role !== TeamRole::Owner) // Виключаємо Owner
            ->map(fn (TeamRole $role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ])
            ->values()
            ->toArray();

        return Inertia::render('Team', [
            'project' => $project,
            'inviteLink' => $inviteLink,
            'invitations' => $invitations,
            'teamRoles' => $teamRoles,
        ]);
    }

    public function revokeInvitation(Invitation $invitation)
    {
        // Перевірка прав (тільки автор запрошення або власник проєкту може скасувати)
        if ($invitation->project->owner_id !== auth()->id() && $invitation->invited_by_id !== auth()->id()) {
            abort(403, 'У вас немає прав для скасування запрошення');
        }
        $invitation->update(['status' => InvitationStatus::Revoked->value]);

        return redirect()->back()->with('success', 'Запрошення скасовано.');
    }

    /**
     * Обробка запиту на приєднання користувача до проєкту за посиланням
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function joinProject(Request $request, Project $project)
    {
        // Перевіряємо, чи користувач вже є в команді або чи він власник
        $isMember = $project->members()->where('user_id', Auth::id())->exists();
        $isOwner = $project->owner_id === Auth::id();

        if ($isMember || $isOwner) {
            return redirect()->route('projects.show', $project->uuid)
                ->with('info', 'Ви вже є учасником цього проєкту.');
        }

        // Створюємо запис у таблиці Team (project_members)
        Team::create([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            'role' => TeamRole::MEMBER,
            'is_active' => true,
        ]);

        // Логуємо подію
        // Log::info("Користувач приєднався до проєкту через посилання", [
        //     'project_id' => $project->id,
        //     'user_id'    => Auth::id()
        // ]);

        return redirect()->route('projects.show', $project->uuid)
            ->with('success', "Ласкаво просимо до команди проєкту {$project->title}!");
    }

    /**
     * Зміна ролі учасників
     */
    public function updateRole(Request $request, Project $project, User $user)
    {
        // тільки власник може змінювати ролі
        if ($project->owner_id !== auth()->id()) {abort(403, 'Тільки власник проєкту може змінювати ролі');}

        // роль має бути зі списку дозволених в Enum
        $validated = $request->validate(['role' => ['required', Rule::in(array_column(TeamRole::cases(), 'value'))],]);

        // Оновлення запису в таблиці
        $project->members()->updateExistingPivot($user->id, ['role' => $validated['role']]);

        return back()->with('success', 'Роль учасника успішно змінено');
    }

    /**
     * Видалення учасника з проєкту
     */
    public function deleteMembers()
    {
        // тільки власник може видаляти
        if ($project->owner_id !== auth()->id()) {abort(403, 'Тільки власник проєкту може видаляти учасників');}

        // Ставимо is_active = 0 у проміжній таблиці
        $project->members()->updateExistingPivot($user->id, ['is_active' => 0]);

        return back()->with('success', 'Учасника видалено з команди.');
    }
}