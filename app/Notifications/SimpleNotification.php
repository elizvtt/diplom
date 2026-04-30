<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SimpleNotification extends Notification
{
    use Queueable;

    // В конструктор передаем всё, что хотим
    public function __construct(
        public string $type, 
        public string $title, 
        public string $message,
        public ?int $targetId = null // ID задачи или проекта для ссылки
    ) {}

    public function via(object $notifiable): array
    {
        $channels = [];

        // Проверяем: хочет ли пользователь получать это в базу (колокольчик)?
        if ($notifiable->prefersNotification($this->type, 'database')) {
            $channels[] = 'database';
        }

        // Проверяем: хочет ли пользователь получать это на Email?
        if ($notifiable->prefersNotification($this->type, 'mail')) {
            $channels[] = 'mail';
        }

        return $channels;
        // return ['database'];
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