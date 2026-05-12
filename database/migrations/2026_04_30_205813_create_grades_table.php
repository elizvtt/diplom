<?php

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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('rated_by_id')->constrained('users')->cascadeOnDelete();

            $table->decimal('score', 5, 2); 
            
            $table->string('comment')->nullable(); // Комментарий может быть пустым

            $table->dateTime('created_at');
            $table->dateTime('updated_at');

            $table->unique(['project_id', 'user_id']); // один студент = одна оценка за один проект
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
