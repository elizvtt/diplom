<?php

namespace App\Enums;

enum TaskReminder: string
{
    case None = 'none';
    case OneHour = '1_hour';
    case OneDay = '1_day';
    case TwoDays = '2_days';
    case OneWeek = '1_week';
    
    public function label(): string
    {
        return match($this) {
            self::None => 'Без нагадувань',
            self::OneHour => 'За 1 годину',
            self::OneDay => 'За 1 день',
            self::TwoDays => 'За 2 дні',
            self::OneWeek => 'За 1 тиждень',
        };
    }
}