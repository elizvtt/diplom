<?php

namespace App\Models;

use App\Enums\NotificationEvent;
use App\Enums\NotificationChannel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'events',
        'channel',
    ];

    protected function casts(): array
    {
        return [
            'events' => 'array',
            'channel' => NotificationChannel::class,
        ];
    }

    /**
     * @return BelongsTo<User,$this>
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}