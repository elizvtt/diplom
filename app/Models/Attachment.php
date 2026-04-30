<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;

    /**
     * Атрибуты, которые могут быть присвоены массово
     * @var list<string>
     */
    protected $fillable = [
        'task_id',
        'user_id',
        'filename',
        'file_path',
        'file_type',
        'file_size',
        'is_active',
    ];

    /**
     * Правила преобразования типов
     * @return array<string, string>
     */
    protected function casts()
    {
        return [
          
        ];
    }

    /**
     * заадние в котором материалы
     * @return BelongsTo<Task, $this>
     */
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    /**
     * пользователь, который прикрепил коментарий
     * @return BelongsTo<User, $this>
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return string
     */
    public function getFormattedSizeAttribute()
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024; $i++) $bytes /= 1024;
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
