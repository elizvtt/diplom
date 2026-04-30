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
        'event',
        'channel',
        'is_enabled',
    ];

    protected function casts(): array
    {
        return [
            'event' => NotificationEvent::class,
            'channel' => NotificationChannel::class,
            // 'is_enabled' => 'boolean',
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