<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Models\TaskAssignee;
use App\Models\Attachment;
use App\Models\Project;

use App\Enums\TaskStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskReminder;
use App\Enums\TaskAssigneeStatus;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

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

        // Повернення відповіді з повідомленням для Snackbar
        return redirect()->back()->with('success', 'Завдання успішно створено!');
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
     * Оновлення статусу(бєклог, туду, инпрогрес и тд.)
     */
    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'id' => ['required', 'exists:tasks,id'], // Перевіряємо, чи є таке ID в базі
            'status' => ['required', Rule::enum(TaskStatus::class)],
        ]);

        // Знаходимо модель по ID з запиту
        $task = Task::findOrFail($validated['id']);
        
        $task->update(['status' => $validated['status']]);

        if ($validated['status'] === TaskStatus::Done->value) {
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
        }
        // return back()->with('success', 'Статус оновлено');
        return back();
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


        // Повернення відповіді
        return redirect()->back()->with('success', 'Завдання успішно оновлено!');
    }

    /**
     * ВИдалення завадння
     */
    public function deleteTask(Task $task)
    {
        // Перевіряємо, чи поточний користувач є автором завдання
        if ($task->creator_id !== auth()->id()) {
            abort(403, 'У вас немає прав для видалення чужого завдання');
        }

        $task->update(['is_active' => 0]);

        return redirect()->back()->with('success', 'Завдання успішно видалено.');
    }
}