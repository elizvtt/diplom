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





        // $email = $validated['email'];
        // debug($email);

        // // не можна запросити самого себе
        // if ($email === auth()->user()->email) {
        //     return back()->withErrors(['email' => 'Ви не можете запросити самі себе.']);
        // }

        // // чи не є юзер вже учасником
        // if ($project->members()->where('email', $email)->exists()) {
        //     return back()->withErrors(['email' => 'Цей користувач вже є учасником проєкту.']);
        // }

        // // чи немає вже активного запиту
        // $existingInvite = Invitation::where('project_id', $project->id)
        //     ->where('email', $email)
        //     ->where('status', InvitationStatus::Pending->value)
        //     ->first();

        // // уже запрошений
        // if ($existingInvite) {
        //     return back()->withErrors(['email' => 'Запит для цього email вже надіслано.']);
        // }

        // // Створення запису в таблиці invitations
        // $invitation = Invitation::create([
        //     'project_id'    => $project->id,
        //     'invited_by_id' => auth()->id(),
        //     'email'         => $email,
        //     'token'         => Str::random(64),
        //     'status'        => InvitationStatus::Pending->value,
        //     'expires_at'    => now()->addDays(7),
        //     'created_at'    => now(),
        //     'updated_at'    => now(),
        // ]);

        // Log::info('Запрошення створено', [
        //     'invitation_id' => $invitation->id,
        //     'email' => $email,
        //     'project_id' => $project->id,
        // ]);

        // // ищем зарегистрированного пользователя
        // $recipient = User::where('email', $email)->first();
        
        // // ЛОКАЛЬНО
        // if ($recipient) {
        //     try {
        //          $recipient->notify(new SimpleNotification(
        //             type: NotificationEvent::ProjectInvite->value,
        //             title: 'Запрошення в проєкт',
        //             message: "Вас запросили до проєкту: {$project->name}",
        //             targetId: $project->id
        //         ));

        //         Log::info('Локальне повідомлення відправлено', [
        //             'user_id' => $recipient->id,
        //             'event' => NotificationEvent::ProjectInvite->value,
        //         ]);
        //         return back()->with('success', "Запрошення успішно надіслано");

        //     } catch (Throwable $e) {
        //         Log::error('Помилка відправлення локального повідомлення', [
        //             'user_id' => $recipient->id,
        //             'error' => $e->getMessage(),
        //         ]);
        //         return back()->withErrors(['email' => 'Сталася помилка при створенні запрошення']);
        //     }
        // }
    // }   
    

}
        // if ($recipient) {
        //     /**
        //      * КОРИСТУВАЧ ЗАРЕЄСТРОВАНИЙ
        //      * Відправляємо через систему сповіщень Laravel.
        //      * Всередині ProjectInviteNotification ми перевіримо $recipient->email_notification
        //      */
        //     // $recipient->notify(new ProjectInviteNotification($invitation));
        // } else {
        //     /**
        //      * КОРИСТУВАЧ НЕ ЗАРЕЄСТРОВАНИЙ
        //      * Відправляємо тільки прямий Email через Mailgun
        //      */
        //     Mail::to($email)->send(new ProjectInviteMail($invitation));
        // }

        // return back()->with('success', "Запрошення успішно надіслано на адресу $email");
//     public function __construct(
//         protected TeamService $teamService
//     ) {}

//     /**
//      * Клик по ссылке из письма (GET)
//      */
//     public function show($token)
//     {
//         $invitation = Invitation::where('token', $token)->firstOrFail();

//         if (!$invitation->isValid()) {
//             return redirect('/')->with('error', 'Запрошення недійсне або термін його дії минув.');
//         }

//         // Якщо користувач НЕ авторизований (пункт 3 вашого ТЗ)
//         if (!auth()->check()) {
//             // Зберігаємо токен у сесію
//             session(['invite_token' => $token]);
            
//             // Перенаправляємо на сторінку логіну/реєстрації
//             // В React ви можете зчитати цей параметр і показати повідомлення: "Увійдіть, щоб прийняти запрошення"
//             return redirect()->route('login')->with('info', 'Будь ласка, увійдіть або зареєструйтесь, щоб приєднатися до проєкту.');
//         }

//         // Якщо авторизований - одразу підтверджуємо
//         return $this->processAcceptance($invitation, auth()->user());
//     }

//     /**
//      * Цей метод можна викликати після успішної реєстрації або логіну, 
//      * якщо в сесії є invite_token
//      */
//     public function processPendingInvitation()
//     {
//         $token = session('invite_token');
//         if (!$token) {
//             return redirect('/dashboard');
//         }

//         $invitation = Invitation::where('token', $token)->first();
        
//         // Видаляємо токен з сесії, щоб не спрацьовувало повторно
//         session()->forget('invite_token');

//         if ($invitation && $invitation->isValid()) {
//             return $this->processAcceptance($invitation, auth()->user());
//         }

//         return redirect('/dashboard')->with('error', 'Запрошення більше не дійсне.');
//     }

//     /**
//      * Внутрішній метод для прийняття та редіректу
//      */
//     protected function processAcceptance(Invitation $invitation, $user)
//     {
//         try {
//             $this->teamService->acceptInvitation($invitation, $user);
//             return redirect()->route('projects.show', $invitation->project_id)
//                              ->with('success', 'Ви успішно приєдналися до проєкту!');
//         } catch (\Exception $e) {
//             return redirect('/dashboard')->with('error', $e->getMessage());
//         }
//     }
// }