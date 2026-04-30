<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    /**
     * Атрибуты, которые могут быть присвоены массово
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'description',
        'owner_id',
        'is_active',
    ];

    /**
     * Правила преобразования типов
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // 'is_active' => 'boolean', // Автоматично перетворює 0/1 з бази на true/false
        //     'password' => 'hashed',
        ];
    }

    /**
     * Получить владельца этого проекта.
     * @return BelongsTo<User, $this>
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
