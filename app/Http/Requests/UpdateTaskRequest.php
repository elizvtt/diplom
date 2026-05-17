<?php
namespace App\Http\Requests;

use App\Enums\TaskStatus;
use App\Enums\TaskPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date_start'  => ['nullable', 'date'],
            'date_end'    => ['nullable', 'date', 'after_or_equal:date_start'],
            'status'      => ['sometimes', Rule::enum(TaskStatus::class)],
            'priority'    => ['sometimes', Rule::enum(TaskPriority::class)],
            'progress'    => ['sometimes', 'integer', 'min:0', 'max:100'],
            'assignees'   => ['nullable', 'array'],
            'assignees.*' => ['exists:users,id'],
        ];
    }
    
    public function messages()
    {
        return [
            'title.required'            => 'Введіть назву завдання',
            'title.max'                 => 'Надто довга назва завдання',
            'date_end.after_or_equal'   => 'Дата кінця не може бути раніше дати початку',
            'progress.min'              => 'Мінімальний прогресс дорівнює 0',
            'progress.max'              => 'Максимальний прогресс дорівнює 100',
            'assignees.*.exists'        => 'Обраний виконавець не знайдений у системі',
        ];
    }

}