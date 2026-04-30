<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    // Отключаем поле updated_at, так как логи не редактируются
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'details',
    ];

    protected function casts(): array
    {
        return [
            'details' => 'array', // JSON в масив
        ];
    }

    /**
     * Кто совершил действие
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Полиморфная связь: с какой сущностью это произошло (Задача, Проект и т.д.)
     */
    public function entity(): MorphTo
    {
        return $this->morphTo();
    }
}