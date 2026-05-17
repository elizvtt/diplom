<?php

namespace App\Models;

use App\Enums\TeamRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Team extends Model
{
    use HasFactory;

    /**
     * Атрибуты, которые могут быть присвоены массово
     * @var list<string>
     */
    protected $fillable = [
        'project_id',
        'user_id',
        'role',
        'is_active',
    ];

    /**
     * Правила преобразования типов
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => TeamRole::class,
        ];
    }
    
    /**
     * Получить проект, к которому привязан этот участник
     * @return BelongsTo<Project, $this>
     */
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    /**
     * Получить пользователя, который является участником команды
     * @return BelongsTo<User, $this>
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }


}
