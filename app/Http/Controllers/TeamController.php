<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Inertia\Inertia;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;

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

        // Створюємо посилання, яке використовує UUID, але захищене підписом
        $inviteLink = URL::signedRoute('projects.invitations.join', [
            'project' => $project->uuid
        ]);

        return Inertia::render('Team', [
            'project' => $project,
            'invite_link' => $inviteLink
        ]);
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
}