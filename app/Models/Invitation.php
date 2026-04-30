<?php

namespace App\Models;

use App\Enums\InvitationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'invited_by_id',
        'email',
        'token',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => InvitationStatus::class,
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Проект, в который приглашают
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Пользователь, который создал приглашение
     */
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by_id');
    }

    /**
     * проверка, можно ли использовать этот инвайт
     */
    public function isValid(): bool
    {
        return $this->status === InvitationStatus::Pending && $this->expires_at->isFuture();
    }

    /**
     * автоматически генерируем случайный токен при создании
     */
    protected static function booted()
    {
        static::creating(function (Invitation $invitation) {
            // Если токен почему-то не передали, генерируем безопасную случайную строку 64 символа
            if (!$invitation->token) 
                $invitation->token = Str::random(64);
            
        });
    }
}