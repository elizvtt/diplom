<?php

use App\Enums\TaskStatus;
use App\Enums\TaskPriority;
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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('parent_task_id')->nullable()->constrained('tasks');
            $table->foreignId('project_id')->constrained('projects');
            $table->string('title');
            $table->json('description')->nullable();
            
            $table->enum('status', array_column(TaskStatus::cases(), 'value'))->default(TaskStatus::Todo->value);
            $table->enum('priority', array_column(TaskPriority::cases(), 'value'))->default(TaskPriority::Medium->value);
            
            $table->dateTime('deadline')->nullable();
            $table->foreignId('creator_id')->constrained('users');
            $table->tinyInteger('progress')->default(0);
            $table->tinyInteger('is_active')->default(1);

            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
