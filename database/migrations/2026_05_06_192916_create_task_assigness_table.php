<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\TaskAssigneeStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_assigness', function (Blueprint $table) {
            $table->id();

            // Зв'язок із завданням та користувачем
            $table->foreignId('task_id')->constrained('tasks');
            $table->foreignId('user_id')->constrained('users');

            $table->string('status')->default(TaskAssigneeStatus::Assigned->value); // Статус виконавця

            $table->dateTime('completed_at')->nullable(); // Дата завершення
            
            $table->integer('progress')->default(0); // прогресс виконання
                                    
            $table->dateTime('created_at');
            $table->dateTime('updated_at');
        
            // Унікальність, щоб не призначити одного юзера двічі
            $table->unique(['task_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_assigness');
    }
};
