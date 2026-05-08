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
    protected $hidden = ['password'];

    protected $appends = ['avatar_url'];

    /**
     * Получите атрибуты, которые следует преобразовать.
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
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

                // Можно так же деактивировать все его задачи
                // $user->tasks()->update(['is_active' => 0]);
                
                // И исключить из всех команд
                // ProjectMember::where('user_id', $user->id)->update(['is_active' => 0]);
            }
        });
    }

    public function getAvatarUrlAttribute()
    {
        return $this->avatar_path
            ? asset('storage/' . $this->avatar_path)
            : null;
    }

    // /**
    //  * Связь с таблицей настроек уведомлений
    //  */
    // public function notificationSettings()
    // {
    //     return $this->hasMany(NotificationSetting::class);
    // }

    // /**
    //  * Этот метод Laravel автоматически вызывает ПЕРЕД отправкой уведомления,
    //  * если вы используете почту (mail). 
    //  * Для базы данных мы сделаем свою проверку.
    //  */
    // public function prefersNotification(string $event, string $channel): bool
    // {
    //     // Ищем настройку пользователя
    //     $setting = $this->notificationSettings()
    //         ->where('event', $event)
    //         ->where('channel', $channel)
    //         ->first();

    //     // Если настройки нет — по умолчанию отправляем (true)
    //     // Если настройка есть — возвращаем её статус (is_enabled)
    //     return $setting ? $setting->is_enabled : true;
    // }

}
