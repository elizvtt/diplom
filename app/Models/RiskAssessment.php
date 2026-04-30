<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\TaskPriority;

class RiskAssessment extends Model
{
    use HasFactory;

    /**
     * Атрибуты, которые могут быть присвоены массово
     * @var list<string>
     */
    protected $fillable = [
        'task_id',
        'predicted_completion_date',
        'actual_completion_date',
        'risk_level',
    ];

    /**
     * Правила преобразования типов
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'risk_level' => TaskPriority::class,
        ];
    }


    /**
     * @return BelongsTo<Task, $this>
     */
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

}
