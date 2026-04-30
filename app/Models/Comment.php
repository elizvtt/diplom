<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    /**
     * Атрибуты, которые могут быть присвоены массово
     * @var list<string>
     */
    protected $fillable = [
        'task_id',
        'user_id',
        'text',
        'is_active',
    ];

    /**
     * Правила преобразования типов
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // 'status' => TaskStatus::class,
            // 'priority' => TaskPriority::class,
            // 'deadline' => 'datetime',
        ];
    }

    /**
     * задание, к которому относится коментарий
     * @return BelongsTo<Task, $this>
     */
    public function Task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    /**
     * пользователь который написал коментарий
     * @return BelongsTo<User, $this>
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
