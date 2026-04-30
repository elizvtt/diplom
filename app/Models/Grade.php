<?php

namespace App\Models;

// use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory; //, LogsActivity; // автоматическое логирование изменений

    protected $fillable = [
        'project_id',
        'user_id',
        'rated_by_id',
        'score',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            // Автоматически преобразуем строку из базы в дробное число (float)
            'score' => 'float',
        ];
    }

    /**
     * Проект, за который поставлена оценка
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Студент, который получил оценку
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Преподаватель, который поставил оценку
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rated_by_id');
    }
}