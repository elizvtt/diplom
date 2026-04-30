<?php

namespace App\Enums;

enum TaskAssigneeStatus: string
{
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Skipped = 'skipped';
}