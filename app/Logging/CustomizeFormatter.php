<?php

namespace App\Logging;

use App\Logging\LogContextProcessor;

class CustomizeFormatter
{
    public function __invoke($logger)
    {
        foreach ($logger->getHandlers() as $handler) {
            // Додаємо наш процесор до кожного обробника логів
            $handler->pushProcessor(new LogContextProcessor());
        }
    }
}