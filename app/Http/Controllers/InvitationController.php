<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\User;
use App\Models\Project;

use App\Enums\InvitationStatus;
use App\Services\InvitationService;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InvitationController extends Controller
{
    public function __construct(
        private InvitationService $invitationService
    ) {}

    /**
     * Відправити запит на приєднання до проєкту.
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
                inviter: $request->user()
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

    /**
     * Пошук користувача за email (for send invite)
     * @param Request $request Вхідний запит
     * @param Project $project Модель проєкту
     * @return \Illuminate\Http\JsonResponse
     */
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
     * @param Invitation $invitation Модель запрошення
     * @return \Illuminate\Http\RedirectResponse
     */
    public function revoke(Invitation $invitation)
    {
        try {
            // Скасувати може або автор запрошення, або власник проєкту
            $this->authorize('revoke', $invitation);

            // Видалення та зміна статусів через сервіс
            $this->invitationService->revoke($invitation, request()->user());
            
            return redirect()->back()->with('success', 'Запрошення скасовано');
        } catch (\Exception $e) {
            Log::error("Помилка під час відкликання запрошення", [
                'invitation_id' => $invitation->id,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Не вдалося скасувати запрошення через внутрішню помилку.');
        }
    }

    /**
     * Прийняття запрошення користувачем 
     * @param string $token Унікальний токен запрошення
     * @return \Illuminate\Http\RedirectResponse
     */
    public function accept(string $token)
    {
        // Пошук активного запрошення за токеном
        $invitation = Invitation::where('token', $token)
            ->where('status', InvitationStatus::Pending)
            ->firstOrFail();

        // Если пользователь НЕ авторизован відправляємо на реєстрацію
        if (!auth()->check()) {
            session(['pending_invitation_token' => $token]);
            return redirect()->route('register')->with('info', 'Для прийняття запрошення спочатку зареєструйтеся');
        }

        $user = auth()->user();

        // Проверяем email
        if ($user->email !== $invitation->email) {
            Log::warning("Спроба активації запрошення з чужого акаунту", [
                'invitation_id' => $invitation->id,
                'invitation_expected_email' => $invitation->email,
                'authenticated_user_email' => $user->email,
                'user_id' => $user->id,
                'ip' => request()->ip()
            ]);

            return redirect('/')->with('error', 'Помилка доступу. Це запрошення було надіслано на іншу електронну адресу');
        }

        try {
            // Приєднання до команди через сервіс
            $this->invitationService->accept($invitation, $user);

            return redirect('/projects/' . $invitation->project->uuid)->with('success', 'Ви успішно приєдналися до проєкту!');

        } catch (\Exception $e) {
            Log::error("Помилка під час прийняття запрошення", [
                'invitation_id' => $invitation->id,
                'error' => $e->getMessage()
            ]);

            return redirect('/')->with('error', 'Сталася системна помилка під час приєднання до проєкту');
        }
    }

    /**
     * Відхилення запрошення 
     * @param string $token Унікальний токен запрошення
     * @return \Illuminate\View\View
     */
    public function decline(string $token)
    {
        // Знаходимо запрошення
        $invitation = Invitation::where('token', $token)
            ->where('status', InvitationStatus::Pending)
            ->firstOrFail();

        $invitation->update(['status' => InvitationStatus::Declined]);

        return view('invitation-declined');
    }

    /**
     * Приєднання до проєкту через публічне посилання
     * @param Request $request Вхідний запит
     * @param string $projectParam UUID проєкту
     * @return \Illuminate\Http\RedirectResponse
     */
    public function join(Request $request, $projectParam)
    {
        // перевіряємо валідність підпису посилання
        if (! $request->hasValidSignature())
            return redirect('/')->with('error', 'Посилання недійсне або його термін дії закінчився');

        // Якщо не авторизований користувач - зберігаємо URL і відправляємо на реєстрацію
        if (!auth()->check()) {
            // Зберігаємо ПОВНИЙ поточний URL разом із підписом (?signature=...) у сесію
            session(['pending_public_invite_url' => $request->fullUrl()]);
            return redirect()->route('register')->with('info', 'Для приєднання до команди проєкту спочатку зареєструйтеся або увійдіть у свій акаунт');
        }

        $user = $request->user();
        $project = Project::where('uuid', $projectParam)->firstOrFail();

        if ($project->members()->where('user_id', $user->id)->exists() || $project->owner_id === $user->id) 
            return redirect('/projects/' . $project->uuid)->with('info', 'Ви вже є учасником цього проєкту');

        try {
            $project->members()->attach($user->id, ['role' => 'member']);

            Log::info("Користувач приєднався через публічне посилання", [
                'project_id' => $project->id,
                'user_id' => $user->id
            ]);

            return redirect('/projects/' . $project->uuid)->with('success', 'Вітаємо в команді проєкту!');

        } catch (\Exception $e) {
            Log::error("Не вдалося приєднатися до проєкту", [
                'project_id' => $project->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return redirect('/')->with('error', 'Не вдалося приєднатися до проєкту');
        }
    }
}