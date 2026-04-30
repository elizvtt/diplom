<?php

use App\Enums\NotificationEvent;
use App\Enums\NotificationChannel;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            
            // Используем значения из Enum
            $table->enum('event', array_column(NotificationEvent::cases(), 'value'));
            $table->enum('channel', array_column(NotificationChannel::cases(), 'value'));
            
            $table->tinyInteger('is_enabled')->default(1); // По умолчанию всё включено

            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();

            // Защита: У одного пользователя может быть только одна 
            // настройка для конкретного события и канала!
            $table->unique(['user_id', 'event', 'channel']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }
};
