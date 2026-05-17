<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Правила валідації при оновленні проєкту
     */
    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'    => 'Введіть назву проєкту',
            'title.max'         => 'Надто довга назва проєкту',
            'description.max'   => 'Опис проєкту занадто довгий',
        ];
    }
}