<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SimpleNotification extends Notification
{
    use Queueable;

    // В конструктор передаем всё, что хотим
    public function __construct(
        public string $type, 
        public string $title, 
        public string $message,
        public ?int $targetId = null
    ) {}

    public function via(object $notifiable): array
    {
        $channels = [];

        // Проверяем: хочет ли пользователь получать это в базу (колокольчик)?
        if ($notifiable->prefersNotification($this->type, 'database')) {
            $channels[] = 'database';
        }

        // Проверяем: хочет ли пользователь получать это на Email?
        // if ($notifiable->prefersNotification($this->type, 'mail')) {
        //     $channels[] = 'mail';
        // }

        return $channels;
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'target_id' => $this->targetId,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->title)
            ->line($this->message)
            ->action('Переглянути', url('/invite/' . $this->targetId)) // Тут targetId може бути токеном або ID
            ->line('Дякуємо, що користуєтесь нашим сервісом!');
    }
}

/*

пример коментария:
// Событие 1: Изменили оценку
$user->notify(new SimpleNotification(
    type: 'grade_changed',
    title: 'Оценка обновлена',
    message: 'Преподаватель поставил вам 5.',
    targetId: $task->id
));

// Событие 2: Новый комментарий
$user->notify(new SimpleNotification(
    type: 'new_comment',
    title: 'Новый комментарий',
    message: 'Иван ответил на ваше сообщение.',
    targetId: $comment->id
));
*/