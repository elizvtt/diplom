<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\User;
use App\Models\Project;

use App\Services\InvitationService;

use App\Enums\InvitationStatus;

use Illuminate\Http\Request;

class InvitationController extends Controller
{
    /**
     * Відправити запит на приєднання до проєкту.
     * 
     * @param Request $request
     * @param Project $project
     * @param InvitationService $service
     */
    public function invite(Request $request, Project $project, InvitationService $service)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        try {
            $service->invite(
                email: $validated['email'],
                project: $project,
                inviterId: auth()->id()
            );

            return back()->with('success', 'Запрошення успішно надіслано');

        } catch (\Exception $e) {

            return match ($e->getMessage()) {
                'self_invite' => back()->with('error', 'Ви не можете запросити самі себе'),
                'already_member' => back()->with('error', 'Користувач вже в проєкті'),
                'already_invited' => back()->with('error', 'Запрошення вже надіслано'),
                default => back()->with('error', 'Помилка при створенні запрошення'),
            };
        }
    }

    public function searchUser(Request $request, Project $project)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)
            ->select('id', 'full_name', 'email', 'avatar_path')
            ->first();

        if (!$user) return response()->json(['found' => false]);

        return response()->json([
            'found' => true,
            'user' => $user,
        ]);
    }

    /**
     * Відкликати надіслане запрошення
     */
    public function revoke(Invitation $invitation)
    {
        // Скасувати може або автор запрошення, або власник проєкту
        if ($invitation->project->owner_id !== auth()->id() && $invitation->invited_by_id !== auth()->id()) {
            abort(403, 'У вас немає прав для скасування запрошення');
        }
        $invitation->update(['status' => InvitationStatus::Revoked->value]);
        return redirect()->back()->with('success', 'Запрошення скасовано');
    }
}