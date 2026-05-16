<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\User;
use App\Models\Project;

use App\Services\InvitationService;

use App\Enums\InvitationStatus;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
            return redirect()->back()->with('error', 'У вас немає прав для скасування запрошення');
        }
        try {
            $invitation->update(['status' => InvitationStatus::Revoked->value]);

            \DB::table('notifications')
                ->where('data->invitation_id', $invitation->id)
                ->delete();

            Log::info("Запрошення успішно відкликано", [
                'invitation_id' => $invitation->id,
                'project_id' => $invitation->project_id,
                'email' => $invitation->email,
                'revoked_by' => auth()->id()
            ]);

            return redirect()->back()->with('success', 'Запрошення скасовано');
        } catch (\Exception $e) {
            Log::error("Помилка під час відкликання запрошення", [
                'invitation_id' => $invitation->id,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Не вдалося скасувати запрошення через внутрішню помилку.');
        }
    }

    public function accept(string $token)
    {
        $invitation = Invitation::where('token', $token)
            ->where('status', InvitationStatus::Pending)
            ->firstOrFail();

        // Если пользователь НЕ авторизован
        if (!auth()->check()) {
            session(['pending_invitation_token' => $token]);

            return redirect()->route('register')->with('info', 'Для прийняття запрошення спочатку зареєструйтеся');
        }

        // Проверяем email
        if (auth()->user()->email !== $invitation->email) {
            Log::warning("Спроба активації запрошення з чужого акаунту", [
                'invitation_id' => $invitation->id,
                'invitation_expected_email' => $invitation->email,
                'authenticated_user_email' => auth()->user()->email,
                'user_id' => auth()->id(),
                'ip' => request()->ip()
            ]);

            return redirect('/')->with('error', 'Помилка доступу. Це запрошення було надіслано на іншу електронну адресу');
        }

        try {
            // Додаємо користувача до команди проєкту
            $invitation->project->members()->attach(auth()->id());
            // Оновлюємо статус запрошення
            $invitation->update(['status' => InvitationStatus::Accepted]);

            // Успішне приєднання
            Log::info("Користувач успішно прийняв запрошення", [
                'invitation_id' => $invitation->id,
                'project_id' => $invitation->project_id,
                'user_id' => auth()->id()
            ]);
            
            return redirect('/projects/' . $invitation->project->uuid)->with('success', 'Ви успішно приєдналися до проєкту!');

        } catch (\Exception $e) {
            Log::error("Помилка під час прийняття запрошення", [
                'invitation_id' => $invitation->id,
                'error' => $e->getMessage()
            ]);

            return redirect('/')->with('error', 'Сталася системна помилка під час приєднання до проєкту');
        }
    }

    public function decline(string $token)
    {
        $invitation = Invitation::where('token', $token)
            ->where('status', InvitationStatus::Pending)
            ->firstOrFail();

        $invitation->update([
            'status' => InvitationStatus::Declined
        ]);

        return view('invitation-declined');
    }

    /**
     * Приєднання до проєкту через публічне посилання
     */
    public function join(Request $request, $projectParam)
    {
        // перевіряємо валідність підпису посилання
        if (! $request->hasValidSignature())
            return redirect('/')->with('error', 'Посилання недійсне або його термін дії закінчився');

        // Якщо не авторизований користувач
        if (!auth()->check()) {
            // Зберігаємо ПОВНИЙ поточний URL разом із підписом (?signature=...) у сесію
            session(['pending_public_invite_url' => $request->fullUrl()]);

            return redirect()->route('register')->with('info', 'Для приєднання до команди проєкту спочатку зареєструйтеся або увійдіть у свій акаунт');
        }

        $project = Project::where('uuid', $projectParam)->firstOrFail();

        if ($project->members()->where('user_id', auth()->id())->exists() || $project->owner_id === auth()->id()) 
            return redirect('/projects/' . $project->uuid)->with('info', 'Ви вже є учасником цього проєкту');

        try {
            $project->members()->attach(auth()->id(), ['role' => 'student']);

            Log::info("Користувач приєднався через публічне посилання", [
                'project_id' => $project->id,
                'user_id' => auth()->id()
            ]);

            return redirect('/projects/' . $project->uuid)->with('success', 'Вітаємо в команді проєкту!');

        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Не вдалося приєднатися до проєкту');
        }
    }
}