<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Enums\UserRole;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Атрибуты, которые могут быть присвоены массово
     * @var list<string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'password',
        'email_notification',
        'role',
        'is_active',
        'avatar_path',
    ];

    /**
     * Атрибуты, которые следует скрыть для сериализации.
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Получите атрибуты, которые следует преобразовать.
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            // 'is_active' => 'boolean',
            // 'email_notification' => 'boolean',
            'role' => UserRole::class,
        ];
    }


    /**
     * Получить все проекты пользователя
     * @return HasMany<Project,$this>
     */
    public function projects()
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    /**
     * Загрузка модели и регистрация событий.
     * @return void
     */
    protected static function booted()
    {
        // Событие срабатывает каждый раз ПОСЛЕ сохранения изменений пользователя
        static::updated(function (User $user) {
            
            // Проверяем: изменилось ли поле is_active И равно ли оно теперь 0?
            if ($user->wasChanged('is_active') && $user->is_active == 0) {
                
                // Находим все проекты этого пользователя и выключаем их
                $user->projects()->update(['is_active' => 0]);
            }
        });
    }

}
