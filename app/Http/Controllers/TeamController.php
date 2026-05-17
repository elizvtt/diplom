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

        // Створюємо захищене підписом посилання
        $inviteLink = URL::signedRoute('projects.invitations.join', [
            'project' => $project->uuid
        ]);

        // Формуємо список ролей для фронтенду
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

    /**
     * Зміна ролі учасників
     */
    public function updateRole(Request $request, Project $project, User $user)
    {
        try {
            // тільки власник може змінювати ролі
            $this->authorize('update', $project);
    
            // роль має бути зі списку дозволених в Enum
            $validated = $request->validate([
                'role' => ['required', Rule::in(array_column(TeamRole::cases(), 'value'))],
            ]);

            // Оновлення запису в таблиці
            $project->members()->updateExistingPivot($user->id, ['role' => $validated['role']]);
    
            return back()->with('success', 'Роль учасника успішно змінено');

        } catch (\Exception $e) {
            Log::error("Помилка зміни ролі учасника проєкту", [
                'project_id' => $project->id,
                'user_id' => $user->id,
                'error_message' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Виникла помилка при зміненні ролі учасника');
        }

    }

    /**
     * Видалення учасника з проєкту
     */
    public function removeMember(Project $project, User $user)
    {
        try {
            // тільки власник може видаляти
            $this->authorize('delete', $project);
            
            $project->members()->updateExistingPivot($user->id, ['is_active' => 0]);
    
            Log::info("Користувача видалено з команди проєкту", [
                'project_id' => $project->id,
                'user_id' => $user->id,
            ]);
            return back()->with('success', 'Учасника видалено з команди');
            
        } catch (\Exception $e) {
            Log::error("Помилка при видаленні учасника з команди", [
                'project_id' => $project->id,
                'user_id' => $user->id,
                'error_message' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Виникла технічна помилка при видаленні учасника з команди');
        }
    }
}