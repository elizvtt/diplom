<?php

namespace App\Models;

use App\Enums\TaskStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskReminder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * Атрибуты, которые могут быть присвоены массово
     * @var list<string>
     */
    protected $fillable = [
        'parent_task_id',
        'project_id',
        'title',
        'description',
        'status',
        'priority',
        'date_start',
        'date_end',
        'creator_id',
        'progress',
        'reminder',
        'is_active',
    ];

    /**
     * Правила преобразования типов
     * @return array<string,string>
     */
    protected function casts(): array
    {
        return [
            'description' => 'array',
            'status' => TaskStatus::class,
            'priority' => TaskPriority::class,
            'reminder' => TaskReminder::class,
        ];
    }

    /**
     * Проєкт в котором это задание
     * @return BelongsTo<Project,$this>
     */
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    /**
     * создатель задания
     * @return BelongsTo<User,$this>
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Дані виконавців
     */
    public function assigneesData()
    {
        // Одне завдання має багато записів у таблиці task_assignees
        return $this->hasMany(TaskAssignee::class, 'task_id');
    }

    /**
     * Користувачі-виконавці
     */
    public function assignees()
    {
        // Якщо ти хочеш отримувати відразу об'єкти User
        return $this->belongsToMany(User::class, 'task_assignees', 'task_id', 'user_id')
                    ->withPivot('status', 'progress', 'completed_at'); 
    }

    /**
     * Прикрепленные файлы
     */
    public function attachments()
    {
        return $this->hasMany(Attachment::class)->where('is_active', 1);
    }
    
    /**
     * Прикрепленные файлы
     */
    public function comments()
    {
        return $this->hasMany(Comment::class)->where('is_active', 1);
    }

    public function subtasks()
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }
    
    public function parent()
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function riskAssessments()
    {
        return $this->hasMany(RiskAssessment::class);
    }
}
