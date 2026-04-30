<?php

namespace App\Models;

use App\Enums\TaskStatus;
use App\Enums\TaskPriority;
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
        'deadline',
        'creator_id',
        'progress',
        'is_active',
    ];

    /**
     * Правила преобразования типов
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => TaskStatus::class,
            'priority' => TaskPriority::class,
            'deadline' => 'datetime',
        ];
    }

    /**
     * Проєкт в котором это задание
     * @return BelongsTo<Project, $this>
     */
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    /**
     * создатель задания
     * @return BelongsTo<User, $this>
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
}
