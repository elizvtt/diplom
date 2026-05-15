<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;


class Project extends Model
{
    use HasFactory;

    /**
     * Атрибуты, которые могут быть присвоены массово
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'title',
        'description',
        'owner_id',
        'is_active',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($project) {
            // Перевіряємо, чи немає вже uuid, і генеруємо новий
            if (empty($project->uuid)) {
                $project->uuid = (string) Str::uuid();
            }
        });
    }

    // Вказуємо, що для URL використовується uuid
    public function getRouteKeyName()
    {
        return 'uuid';
    }

    /**
     * Получить владельца этого проекта.
     * @return BelongsTo<User, $this>
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * получаем учасников команды
     */
    public function members()
    {    
        return $this->belongsToMany(User::class, 'project_members', 'project_id', 'user_id')
                    ->withPivot('role')
                    ->wherePivot('is_active', 1);
    }

    /**
     * Отримати всі завдання цього проєкту
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Получить все приглашения для этого проекта.
     */
    public function invitations()
    {
        return $this->hasMany(Invitation::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

}
