<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case Database = 'database'; // Колокольчик на сайте
    case Mail = 'mail'; // Письмо на Email
}