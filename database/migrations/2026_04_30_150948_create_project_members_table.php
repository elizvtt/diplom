<?php

use App\Enums\TeamRole;
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
        Schema::create('project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects');
            $table->foreignId('user_id')->constrained('users');

            $table->enum('role', array_column(TeamRole::cases(), 'value'))->default(TeamRole::Spectator->value);
            // $table->enum('role', ['owner', 'editor', 'spectator'])->default('spectator');
            $table->tinyInteger('is_active')->default(1);

            $table->dateTime('joined_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_members');
    }
};
