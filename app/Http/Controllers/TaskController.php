<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Enums\TaskStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskReminder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function createTask(Request $request)
    {
        // Валідація даних
        $validated = $request->validate([
            'project_id' => ['required', $this->projectAccessRule()],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'], // TipTap відправляє HTML-рядок
            'date_start' => ['nullable', 'date'],
            'date_end' => ['nullable', 'date', 'after_or_equal:date_start'], // Має бути пізніше дати початку
            'status' => ['required', Rule::enum(TaskStatus::class)],
            'priority' => ['required', Rule::enum(TaskPriority::class)],
            'reminder' => ['nullable', Rule::enum(TaskReminder::class)],
            'progress' => ['required', 'integer', 'min:0', 'max:100'],
            
            // Перевіряємо, що assignees - це масив, і кожен ID реально існує в таблиці users
            'assignees' => ['nullable', 'array'],
            'assignees.*' => ['exists:users,id'],
        ], [
            'title.required' => 'Введіть назву завдання',
            'title.max' => 'Надто довга назва завдання',
            'date_end.after_or_equal' => 'Дата кінця не може бути раніше дати початку',
            'status.required' => 'Оберіть статус завдання',
            'priority.required' => 'Встановіть пріоритетність',
            'progress.min' => 'Мінімальний прогресс дорівнює 0',
            'progress.max' => 'Максимальний прогресс дорівнює 100',
            'assignees.*.exists' => 'Обраний виконавець не знайдений у системі',
        ]);

        debug($validated);

        // Створення самого завдання
        $task = Task::create([
            'project_id' => $validated['project_id'],
            'creator_id' => Auth::id(),
            'title' => $validated['title'],
            'description' => $validated['description'],
            'date_start' => $validated['date_start'],
            'date_end' => $validated['date_end'],
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'reminder' => $validated['reminder'],
            'progress' => $validated['progress'],
            'is_active' => 1,
        ]);

        // Додавання виконавців
        if (!empty($validated['assignees'])) {
            // Метод sync автоматично додасть потрібні записи у проміжну таблицю
            $task->assignees()->sync($validated['assignees']);
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
}