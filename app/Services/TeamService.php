<?php

// namespace App\Services;

// use App\Models\Invitation;
// use App\Models\Project;
// use App\Models\ProjectMember;
// use App\Models\User;
// use App\Enums\InvitationStatus;
// use Illuminate\Support\Str;
// use Illuminate\Support\Facades\Mail;
// // use App\Mail\ProjectInvitationMail; // Ваш класс для писем

// class TeamService
// {
//     /**
//      * Создание запрошения с проверкой на спам
//      */
//     public function invite(Project $project, User $inviter, string $email): Invitation
//     {
//         // 1. Захист: Заборона запрошувати самого себе
//         if ($inviter->email === $email) {
//             throw new \Exception('Ви не можете запросити самого себе.');
//         }

//         // 2. Захист: Ліміт домену (якщо потрібно)
//         // $allowedDomains = ['kpi.ua', 'university.edu'];
//         // $domain = substr(strrchr($email, "@"), 1);
//         // if (!in_array($domain, $allowedDomains)) {
//         //     throw new \Exception('Можна запрошувати лише з дозволених доменів.');
//         // }

//         // 3. Захист: Перевірка на вже існуюче запрошення
//         $existingInvitation = Invitation::where('project_id', $project->id)
//             ->where('email', $email)
//             ->whereIn('status', [InvitationStatus::Pending, InvitationStatus::Accepted])
//             ->first();

//         if ($existingInvitation) {
//             throw new \Exception('Цей користувач вже запрошений або є учасником.');
//         }

//         // 4. Захист: Обмеження на 10 активних запрошень на проєкт (Rate Limiting)
//         $pendingCount = Invitation::where('project_id', $project->id)
//             ->where('status', InvitationStatus::Pending)
//             ->count();

//         if ($pendingCount >= 10) {
//             throw new \Exception('Перевищено ліміт активних запрошень (макс. 10). Дочекайтеся відповіді.');
//         }

//         // СТВОРЕННЯ ЗАПРОШЕННЯ
//         $invitation = Invitation::create([
//             'project_id' => $project->id,
//             'invited_by_id' => $inviter->id,
//             'email' => $email,
//             'token' => Str::random(64),
//             'expires_at' => now()->addDays(7),
//         ]);

//         // Відправка (тут можна додати логіку: якщо користувач є в БД, слати notification, інакше - email)
//         $existingUser = User::where('email', $email)->first();
//         if ($existingUser) {
//             // $existingUser->notify(new \App\Notifications\ProjectInviteNotification($invitation));
//         } else {
//             // Mail::to($email)->send(new ProjectInvitationMail($invitation));
//         }

//         return $invitation;
//     }

//     /**
//      * Прийняття запрошення (пункт 4 з вашого ТЗ)
//      */
//     public function acceptInvitation(Invitation $invitation, User $user): void
//     {
//         if (!$invitation->isValid()) {
//             throw new \Exception('Запрошення недійсне або прострочене.');
//         }

//         // Оновлюємо статус
//         $invitation->update(['status' => InvitationStatus::Accepted]);

//         // Додаємо або оновлюємо учасника
//         // updateOrCreate ідеально підходить під вашу логіку:
//         // Якщо запису немає - створить. Якщо є (навіть is_active=0) - оновить.
//         ProjectMember::updateOrCreate(
//             [
//                 'project_id' => $invitation->project_id,
//                 'user_id' => $user->id,
//             ],
//             [
//                 'is_active' => 1,
//                 // Роль встановлюємо лише якщо це новий запис, щоб не перезаписати існуючу
//                 // 'role' => TeamRole::Spectator->value // якщо використовуєте Enum
//             ]
//         );

//         // Сповіщення власнику
//         // $invitation->inviter->notify(new \App\Notifications\InvitationAcceptedNotification($user, $invitation->project));
//     }
// }