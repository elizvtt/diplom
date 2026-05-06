<?php

namespace App\Enums;

enum TaskPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Critical = 'critical';

    public function label(): string
    {
        return match($this) {
            self::Low => 'Низький',
            self::Medium => 'Середній',
            self::High => 'Високий',
            self::Critical => 'Критичний',      
        };
    }
}