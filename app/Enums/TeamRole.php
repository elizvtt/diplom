<?php

namespace App\Enums;

enum TeamRole: string
{
    case Owner = 'owner';
    case Member = 'member';

    /**
     * Перевод
     */
    public function label(): string
    {
        return match($this) {
            self::Owner => 'Власник',
            self::Member => 'Учасник',
        };
    }
}