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

    // /**
    //  * Правила преобразования типов
    //  * @return array<string, string>
    //  */
    // protected function casts(): array
    // {
    //     return [
    //         'description' => 'array',
    //     ];
    // }
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
        return $this->belongsToMany(User::class, 'project_members', 'project_id', 'user_id');
    }

    /**
     * Отримати всі завдання цього проєкту
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    // Вказуємо, що для URL використовується uuid
    public function getRouteKeyName()
    {
        return 'uuid';
    }
}
