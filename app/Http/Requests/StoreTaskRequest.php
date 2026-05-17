<?php

namespace App\Http\Requests;

use App\Enums\TaskStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskReminder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize()
    {
        return true; 
    }

    public function rules()
    {
        return [
            'project_id' => ['required', 'exists:projects,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'parent_task_id' => ['nullable', 'exists:tasks,id'],
            'date_start' => ['nullable', 'date'],
            'date_end' => ['nullable', 'date', 'after_or_equal:date_start'],
            'status' => ['required', Rule::enum(TaskStatus::class)],
            'priority' => ['required', Rule::enum(TaskPriority::class)],
            'reminder' => ['nullable', Rule::enum(TaskReminder::class)],
            'progress' => ['required', 'integer', 'min:0', 'max:100'],
            'assignees' => ['nullable', 'array'],
            'assignees.*' => ['exists:users,id'],
            'files.*' => ['file', 'max:10240', 'mimes:pdf,docx,jpg,jpeg,png'],
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'Введіть назву завдання',
            'title.max' => 'Надто довга назва завдання',
            'date_end.after_or_equal' => 'Дата кінця не може бути раніше дати початку',
            'status.required' => 'Оберіть статус завдання',
            'priority.required' => 'Встановіть пріоритетність',
            'progress.min' => 'Мінімальний прогресс дорівнює 0',
            'progress.max' => 'Максимальний прогресс дорівнює 100',
            'assignees.*.exists'  => 'Обраний виконавець не знайдений у системі',
            'files.*.mimes'  => 'Дозволені лише PDF, DOCX, JPG та PNG файли.',
            'files.*.max'  => 'Максимальний розмір файлу - 10 MB.',
        ];
    }
}