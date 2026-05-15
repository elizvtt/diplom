<?php

namespace App\Enums;

enum TeamRole: string
{
    case Owner = 'owner';
    case Editor = 'editor';
    case Spectator = 'spectator';

    /**
     * Перевод
     */
    public function label(): string
    {
        return match($this) {
            self::Owner => 'Власник',
            self::Editor => 'Учасник',
            self::Spectator => 'Читач',
        };
    }
}