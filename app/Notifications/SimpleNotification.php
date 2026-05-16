<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\HtmlString;

class SimpleNotification extends Notification
{
    use Queueable;

    public function __construct(
        public array $data
    ) {}

    public function via(object $notifiable): array
    {
        $channels = [];
        
        // Отримуємо назву події 
        $eventName = $this->data['event'] ?? null;

        if (!$eventName) return ['database']; // Якщо подію не передали, відправляємо тільки в БД за замовчуванням

        // Отримуємо налаштування юзера
        $settings = $notifiable->notificationSettings;

        // сповіщення на сайті
        $dbSettings = $settings->where('channel', 'database')->first();
        if ($dbSettings && isset($dbSettings->events[$eventName]) && $dbSettings->events[$eventName] === true) {
            $channels[] = 'database';
        }

        // Перевірка для Email
        // Спочатку перевіряємо глобальний перемикач $notifiable->email_notification
        if ($notifiable->email_notification) {
            $mailSettings = $settings->where('channel', 'mail')->first();
            if ($mailSettings && isset($mailSettings->events[$eventName]) && $mailSettings->events[$eventName] === true) {
                $channels[] = 'mail';
            }
        }

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
            'token' => $this->data['token'] ?? null,
        ];
    }


    /**
     * Формируем письмо для отправки
     */
    public function toMail(object $notifiable): MailMessage
    {
        // Извлекаем данные из массива (с фоллбеками на случай отсутствия)
        $title = $this->data['title'] ?? 'Нове сповіщення';
        $message = $this->data['message'] ?? 'У вас є нове сповіщення в системі.';
        $url = $this->data['url'] ?? url('/');

        return (new MailMessage)
            ->subject('Edutive. ' . $title) // Тема письма
            ->greeting('Вітаємо, ' . $notifiable->full_name . '!')
            ->line($message) // Основной текст 
            ->action('Переглянути', $url) // Кнопка со ссылкой
            ->line('Дякуємо, що користуєтесь Edutive!')
            ->line(new HtmlString( // Дрібний текст знизу з гіперпосиланням на профіль
                '<hr style="margin-top: 20px; border: 0; border-top: 1px solid #e2e8f0;">' .
                '<small style="color: #718096; display: block; margin-top: 10px;">' .
                'Якщо ви не бажаєте отримувати сповіщення на пошту, вимкніть цю опцію в <a href="' . route('profile.edit') . '" style="color: #3869d4;">налаштуваннях профілю</a>.' .
                '</small>'
            ))
            ->salutation(new HtmlString('З повагою, Команда Edutive'));
    }
}