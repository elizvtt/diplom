<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    /**
     * Визначає, чи має користувач право робити цей запит
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Правила валідації для створення проєкту
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'generate_ai_tasks' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Кастомні повідомлення про помилки
     */
    public function messages(): array
    {
        return [
            'title.required'    => 'Введіть назву проєкту',
            'title.max'         => 'Надто довга назва проєкту',
            'description.max'   => 'Опис проєкту занадто довгий',
        ];
    }
}