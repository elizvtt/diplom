<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Models\TaskAssignee;
use App\Models\Attachment;
use App\Models\Project;
use App\Models\RiskAssessment;

use App\Enums\TaskStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskReminder;
use App\Enums\TaskAssigneeStatus;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use App\Notifications\SimpleNotification;
use App\Enums\NotificationEvent;


class TaskController extends Controller
{
    /**
     * СТворення завдання
     */
    public function createTask(Request $request)
    {
        // Валідація даних
        $validated = $request->validate([
            'project_id' => ['required', $this->projectAccessRule()],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'parent_task_id' => ['nullable', 'exists:tasks,id'],
            'date_start' => ['nullable', 'date'],
            'date_end' => ['nullable', 'date', 'after_or_equal:date_start'], // Має бути пізніше дати початку
            'status' => ['required', Rule::enum(TaskStatus::class)],
            'priority' => ['required', Rule::enum(TaskPriority::class)],
            'reminder' => ['nullable', Rule::enum(TaskReminder::class)],
            'progress' => ['required', 'integer', 'min:0', 'max:100'],
            
            // Перевіряємо, що assignees - це масив, і кожен ID реально існує в таблиці users
            'assignees' => ['nullable', 'array'],
            'assignees.*' => ['exists:users,id'],

            // проверка файлов
            'files.*' => ['file','max:10240', 'mimes:pdf,docx,jpg,jpeg,png'],
        ], [
            'title.required' => 'Введіть назву завдання',
            'title.max' => 'Надто довга назва завдання',
            'date_end.after_or_equal' => 'Дата кінця не може бути раніше дати початку',
            'status.required' => 'Оберіть статус завдання',
            'priority.required' => 'Встановіть пріоритетність',
            'progress.min' => 'Мінімальний прогресс дорівнює 0',
            'progress.max' => 'Максимальний прогресс дорівнює 100',
            'assignees.*.exists' => 'Обраний виконавець не знайдений у системі',
            'files.*.mimes' => 'Дозволені лише PDF, DOCX, JPG та PNG файли.',
            'files.*.max' => 'Максимальний розмір файлу — 10 MB.',
        ]);

        try {
            // Створення самого завдання
            $task = Task::create([
                'project_id' => $validated['project_id'],
                'creator_id' => Auth::id(),
                'title' => $validated['title'],
                'description' => $validated['description'] ? ['text' => $validated['description']] : null,
                'parent_task_id' => $validated['parent_task_id'] ?? null,
                'date_start' => $validated['date_start'],
                'date_end' => $validated['date_end'],
                'status' => $validated['status'],
                'priority' => $validated['priority'],
                'reminder' => $validated['reminder'],
                'progress' => $validated['progress'],
                'is_active' => 1,
            ]);
    
            $project = Project::find($task->project_id);
            $users = $project->members;
    
            foreach ($users as $user) {
                // чтобы автор не получал уведомление самому себе
                if ($user->id === auth()->id()) continue;
                $user->notify(
                    new SimpleNotification([
                        'event' => NotificationEvent::TaskCreated->value,
                        'title' => 'Нове завдання у проєкті',
                        'message' => 'Створено задачу «' . $task->title . '» у проєкті «' . $project->title . '»',
                        'project_id' => $task->project_id,
                        'task_id' => $task->id,
                        'author_id' => auth()->id(),
                        'url' => url('/projects/' . $project->uuid) . '?task_id=' . $task->id,
                    ])
                );
            }
    
            // додавання виконавців
            if (!empty($validated['assignees'])) {
                foreach ($validated['assignees'] as $userId) {
                    TaskAssignee::create([
                        'task_id' => $task->id,
                        'user_id' => $userId,
                        'status'  => TaskAssigneeStatus::Assigned,
                        'progress' => 0
                    ]);
    
                    $user = User::find($userId);
                    $user->notify(
                        new SimpleNotification([
                            'event' => NotificationEvent::TaskAssigned->value,
                            'title' => 'Нове завдання',
                            'message' => 'Вас призначено на задачу «' . $task->title . '» у проєкті «' . $project->title . '»',
                            'project_id' => $task->project_id,
                            'task_id' => $task->id,
                            'author_id' => auth()->id(),
                            'url' => url('/projects/' . $project->uuid) . '?task_id=' . $task->id,
                        ])
                    );
                }
            }
    
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
    
                    $path = $file->store('attachments', 'public');
    
                    Attachment::create([
                        'task_id' => $task->id,
                        'user_id' => Auth::id(),
                        'filename' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }
    
            Log::info("Створено нове завдання", [
                'project_id' => $task->project_id,
                'project_title' => $project->title,
                'task_id' => $task->id,
                'task_title' => $task->title,
                'status' => $task->status,
                'priority' => $task->priority,
                'assignees' => $assigneesLog,
                'attached_files_count' => $filesCount
            ]);

            // Повернення відповіді
            return redirect()->back()->with('success', 'Завдання успішно створено!');

        } catch (\Exception $e) {
            Log::error("Помилка під час створення завдання", [
                'project_id' => $validated['project_id'] ?? 'unknown',
                'task_title' => $validated['title'] ?? 'unknown',
                'error_message' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Не вдалося створити завдання через внутрішню помилку.');
        }
    }
    
    /**
     * * проверка пользователя
     * задания могут создавать только учасники проэкта
     */
    private function projectAccessRule()
    {
        return Rule::exists('projects', 'id')->where(function ($query) {
            $userId = auth()->id();
            $query->where(function ($q) use ($userId) {
                $q->where('owner_id', $userId)
                ->orWhereExists(function ($subQuery) use ($userId) {
                    $subQuery->select(\DB::raw(1))
                        ->from('project_members')
                        ->whereColumn('project_id', 'projects.id')
                        ->where('user_id', $userId)
                        ->where('is_active', 1);
                });
            });
        });
    }

    /**
     * Оновлення статусу завдання (todo, inprogress, done)
     */
    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'id' => ['required', 'exists:tasks,id'], // Перевіряємо, чи є таке ID в базі
            'status' => ['required', Rule::enum(TaskStatus::class)],
        ]);

        try {
            $task = Task::findOrFail($validated['id']);
            $project = Project::findOrFail($task->project_id);

            // перевірка прав доступу
            $currentUserId = auth()->id();
        
            $isProjectOwner = ($project->owner_id === $currentUserId); // Чи є користувач власником проєкту
            // Чи призначений користувач на це завдання
            $isAssignee = TaskAssignee::where('task_id', $task->id)
                ->where('user_id', $currentUserId)
                ->exists();

            if (!$isProjectOwner && !$isAssignee) return redirect()->back()->with('error', 'Оновлювати статус завдання може тільки виконавець або власник проєкту');
        
            $oldStatus = $task->status; // Зберігаємо старий статус для порівняння в логах

            $task->update(['status' => $validated['status']]); // Оновлюємо статус

            Log::info("Змінено статус завдання", [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'old_status' => $oldStatus,
                'new_status' => $task->status,
                'project_id' => $project->id,
                'changed_by_owner' => $isProjectOwner
            ]);

            if ($validated['status'] === TaskStatus::Done->value) {
                RiskAssessment::updateOrCreate(
                    ['task_id' => $task->id],
                    ['actual_completion_date' => now()]
                );

                $project = Project::find($task->project_id);
                $users = $project->members;
    
                foreach ($users as $user) {
                    if ($user->id === auth()->id()) continue;
    
                    $user->notify(
                        new SimpleNotification([
                            'event' => NotificationEvent::TaskCompleted->value,
                            'title' => 'Завдання завершено',
                            'message' => 'Задачу «' . $task->title . '» завершено',
                            'project_id' => $task->project_id,
                            'task_id' => $task->id,
                            'author_id' => auth()->id(),
                            'url' => url('/projects/' . $project->uuid),
                        ])
                    );
                }
            } else {
                // Якщо завдання повернули з Done назад у роботу, очищаємо фактичну дату завершення
                RiskAssessment::where('task_id', $task->id)->update([
                    'actual_completion_date' => null
                ]);
            }
            return back()->with('success', 'Статус успішно оновлено');

        } catch (\Exception $e) {
            Log::error("Помилка оновлення статусу завдання", [
                'task_id' => $validated['id'] ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            return back()->with('error', 'Помилка при оновленні статусу завдання');
        }
    }

    /**
     * Оновлення завдання
     */
    public function updateTask(Request $request, Task $task)
    {
        // Валідація вхідних даних 
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date_start' => ['nullable', 'date'],
            'date_end' => ['nullable', 'date', 'after_or_equal:date_start'],
            // Якщо статуси та пріоритети приходять з фронту:
            'status' => ['sometimes', Rule::enum(TaskStatus::class)],
            'priority' => ['sometimes', Rule::enum(TaskPriority::class)],
            'progress' => ['sometimes', 'integer', 'min:0', 'max:100'],
            
            'assignees' => ['nullable', 'array'],
            'assignees.*' => ['exists:users,id'],
        ], [
            'title.required' => 'Введіть назву завдання',
            'title.max' => 'Надто довга назва завдання',
            'date_end.after_or_equal' => 'Дата кінця не може бути раніше дати початку',
            'progress.min' => 'Мінімальний прогрес дорівнює 0',
            'progress.max' => 'Максимальний прогрес дорівнює 100',
            'assignees.*.exists' => 'Обраний виконавець не знайдений у системі',
        ]);

        try {
            // Оновлення основних полів завдання
            $task->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ? ['text' => $validated['description']] : null,
                'date_start' => $validated['date_start'],
                'date_end' => $validated['date_end'],
                // Використовуємо $request->has(), щоб оновлювати ці поля, тільки якщо вони передані
                'priority' => $request->has('priority') ? $validated['priority'] : $task->priority,
                'progress' => $request->has('progress') ? $validated['progress'] : $task->progress,
            ]);
    
            if ($request->has('assignees')) {
                // Отримуємо ID поточних виконавців з БД
                $currentAssigneeIds = TaskAssignee::where('task_id', $task->id)->pluck('user_id')->toArray();
                $newAssigneeIds = $validated['assignees'] ?? [];
    
                // Визначаємо, кого треба додати, а кого видалити
                $toAdd = array_diff($newAssigneeIds, $currentAssigneeIds);
                $toRemove = array_diff($currentAssigneeIds, $newAssigneeIds);
    
                // Видаляємо тих, кого зняли з завдання
                if (!empty($toRemove)) {
                    $removedEmails = User::whereIn('id', $toRemove)->pluck('email')->toArray();

                    TaskAssignee::where('task_id', $task->id)
                        ->whereIn('user_id', $toRemove)
                        ->delete();
                }
    
                // Додаємо лише нових
                foreach ($toAdd as $userId) {
                    TaskAssignee::create([
                        'task_id' => $task->id,
                        'user_id' => $userId,
                        'status'  => TaskAssigneeStatus::Assigned,
                        'progress' => 0
                    ]);
                    
                    $user = User::find($userId);
                    $project = Project::find($task->project_id);
                    
                    if ($user) {
                        $addedEmails[] = $user->email; // Для логу

                        if ($user->id === auth()->id()) continue;
    
                        $user->notify(
                        new SimpleNotification([
                            'event' => NotificationEvent::TaskAssigned->value,
                            'title' => 'Нове завдання',
                            'message' => 'Вас призначено на задачу «' . $task->title . '» у проєкті «' . $project->title . '»',
                            'project_id' => $task->project_id,
                            'task_id' => $task->id,
                            'author_id' => auth()->id(),
                            'url' => url('/projects/' . $project->uuid) . '?task_id=' . $task->id,
                        ]));
                    }
                }            
            }
            Log::info("Оновлено параметри завдання", [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'project_id' => $task->project_id,
                'added_assignees' => $addedEmails,
                'removed_assignees' => $removedEmails,
                'current_progress' => $task->progress
            ]);
    
            return redirect()->back()->with('success', 'Завдання успішно оновлено!');
        } catch (\Exception $e) {
            Log::error("Помилка під час редагування завдання", [
                'task_id' => $task->id,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Помилка під час збереження');
        }
    }

    /**
     * ВИдалення завадння
     */
    public function deleteTask(Task $task)
    {
        // Перевіряємо, чи поточний користувач є автором завдання
        if ($task->creator_id !== auth()->id()) {
            redirect()->back()->with('error', 'У вас немає прав для видалення чужого завдання');
        }

        try {
            $task->update(['is_active' => 0]);
    
            Log::info("Завдання успішно видалено", [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'project_id' => $task->project_id,
                'deleted_by' => auth()->id()
            ]);
    
            return redirect()->back()->with('success', 'Завдання успішно видалено.');
        } catch (\Exception $e) {
            Log::error("Помилка видалення завдання", [
                'task_id' => $task->id,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Не вдалося видалити завдання.');
        }
    }
}