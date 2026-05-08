<?php

namespace App\Logging;

use Illuminate\Support\Facades\Auth;
use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;

class LogContextProcessor implements ProcessorInterface
{
    public function __invoke(LogRecord $record): LogRecord
    {
        // Додаємо дані про користувача, якщо він авторизований
        $user = Auth::user();
        
        $record->extra['user'] = $user ? [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role->value ?? $user->role,
        ] : 'guest';

        // Аналог WebProcessor: додаємо URL та IP
        $record->extra['web'] = [
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'ip' => request()->ip(),
        ];

        return $record;
    }
}