<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Teacher = 'teacher';
    case Student = 'student';

    /**
     * Перевод
     */
    public function label(): string
    {
        return match($this) {
            // self::Admin => 'Адміністратор',
            self::Teacher => 'Викладач',
            self::Student => 'Студент',
        };
    }
}