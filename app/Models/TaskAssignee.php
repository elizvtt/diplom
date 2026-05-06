<?php

namespace App\Models;

use App\Enums\TaskAssigneeStatus;
use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskAssignee extends Model
{
    use HasFactory;

    /**
     * Атрибуты, которые могут быть присвоены массово
     * @var list<string>
     */
    protected $fillable = [
        'task_id',
        'user_id',
        'status',
        'completed_at',
        'progress',
    ];

    /**
     * Правила преобразования типов
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => TaskAssigneeStatus::class,
            'completed_at' => 'datetime',
        ];
    }

    /**
     * Автоматический пересчет статуса основной задачи при сохранении
     */
    protected static function booted()
    {
        static::saved(function (TaskAssignee $assignee) {
            $assignee->refreshTaskStatus();
        });
    }

    /**
     * @return void
     */
    public function refreshTaskStatus()
    {
        $task = $this->task;
        $allAssignees = $task->assigneesData; // Получаем всех исполнителей этой задачи

        $statuses = $allAssignees->pluck('status');

        // Если есть хотя бы один InProgress -> задача InProgress
        if ($statuses->contains(TaskAssigneeStatus::InProgress)) {
            $task->update(['status' => TaskStatus::InProgress]);
            return;
        }

        // Если ВСЕ исполнители имеют статус Completed -> задача Done
        $isAllDone = $statuses->every(fn($status) => $status === TaskAssigneeStatus::Completed);
        
        if ($isAllDone && $statuses->isNotEmpty()) {
            $task->update(['status' => TaskStatus::Done]);
        }
    }

    /**
     * Проєкт в котором это задание
     * @return BelongsTo<Task, $this>
     */
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    /**
     * создатель задания
     * @return BelongsTo<User, $this>
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
