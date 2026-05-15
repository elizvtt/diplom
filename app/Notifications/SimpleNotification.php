<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SimpleNotification extends Notification
{
    use Queueable;

    public function __construct(
        public array $data
    ) {}

    public function via(object $notifiable): array
    {
        $channels = [];
        
        // Отримуємо назву події (наприклад 'grade_changed')
        $eventName = $this->data['event'] ?? null;

        if (!$eventName) {
            // Якщо подію не передали, відправляємо тільки в БД за замовчуванням
            return ['database']; 
        }

        // Отримуємо налаштування юзера (relation notificationSettings)
        $settings = $notifiable->notificationSettings;

        // 1. Перевірка для бази даних (сповіщення на сайті)
        $dbSettings = $settings->where('channel', 'database')->first();
        if ($dbSettings && isset($dbSettings->events[$eventName]) && $dbSettings->events[$eventName] === true) {
            $channels[] = 'database';
        }

        // // Перевірка для Email (пошта)
        // // Спочатку перевіряємо глобальний перемикач $notifiable->email_notification
        // if ($notifiable->email_notification) {
        //     $mailSettings = $settings->where('channel', 'mail')->first();
        //     if ($mailSettings && isset($mailSettings->events[$eventName]) && $mailSettings->events[$eventName] === true) {
        //         $channels[] = 'mail';
        //     }
        // }

        return $channels;
    }
    
    /**
     * Дані для збереження в базу даних
     */
    public function toDatabase($notifiable)
    {
        return [
            'event' => $this->data['event'],
            'title' => $this->data['title'],
            'message' => $this->data['message'],
            'project_id' => $this->data['project_id'] ?? null,
            'author_id' => $this->data['author_id'] ?? null,
            'url' => $this->data['url'] ?? null,
        ];
    }

    /**
     * Дані для відправки на пошту
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject($this->data['title'])
            ->line($this->data['message'])
            ->action('Переглянути проєкт', url('/projects/' . ($this->data['project_id'] ?? '')));
}
}