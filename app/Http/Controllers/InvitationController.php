<?php

// namespace App\Http\Controllers;

// use App\Models\Invitation;
// use App\Services\TeamService;
// use Illuminate\Http\Request;

// class InvitationController extends Controller
// {
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