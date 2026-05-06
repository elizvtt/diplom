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
     * Виконавці цього завдання
     */
    public function assignees()
    {
        // Вказуємо назву проміжної таблиці
        return $this->belongsToMany(TaskAssignee::class, 'task_id');
    }

}
