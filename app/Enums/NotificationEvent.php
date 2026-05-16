<?php

namespace App\Enums;

enum NotificationEvent: string
{
    case TaskAssigned = 'task_assigned'; // Назначена задача
    case TaskCompleted = 'task_completed'; // Задача выполнена
    case TaskCreated = 'task_created'; // создание задания в проэкте
    case TaskReminder = 'task_reminder'; // нагадування
    case GradeChanged = 'grade_changed'; // Изменена оценка
    case NewComment = 'new_comment'; // Новый комментарий
    case DeadlineRisk = 'deadline_risk'; // Риск срыва сроков
    case ProjectInvite = 'project_invite'; // приглашение в проэкт
    
    // додано навчальні матеріали до завданн.
    

    public function isMandatory(): bool
    {
        return in_array($this, self::mandatory(), true);
    }

    public static function mandatory(): array
    {
        return [
            self::ProjectInvite,
        ];
    }
}

// use App\Notifications\SimpleNotification;
// use App\Enums\NotificationEvent;
