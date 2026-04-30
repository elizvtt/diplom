<?php

namespace App\Enums;

enum NotificationEvent: string
{
    case TaskAssigned = 'task_assigned'; // Назначена задача
    case TaskCompleted = 'task_completed'; // Задача выполнена
    case GradeChanged = 'grade_changed'; // Изменена оценка
    case NewComment = 'new_comment'; // Новый комментарий
    case DeadlineRisk = 'deadline_risk'; // Риск срыва сроков
}