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
            
            $table->string('status')->default(TaskStatus::Backlog->value);
            $table->string('priority')->default(TaskPriority::Medium->value);
            
            $table->dateTime('date_start')->nullable();
            $table->dateTime('date_end')->nullable();

            $table->foreignId('creator_id')->constrained('users');
            $table->tinyInteger('progress')->default(0);
            $table->string('reminder')->nullable();

            $table->dateTime('completed_at')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users');
            
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
