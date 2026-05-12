<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\Project;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskReminder;

use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        $start = fake()->dateTimeBetween('-1 month', '+1 week');

        return [
            'project_id' => Project::inRandomOrder()->first()?->id
                ?? Project::factory(),

            'title' => fake()->sentence(4),

            'description' => json_encode([
                'text' => fake()->realText(200)
            ]),

            'status' => fake()->randomElement(
                array_column(TaskStatus::cases(), 'value')
            ),

            'priority' => fake()->randomElement(
                array_column(TaskPriority::cases(), 'value')
            ),

            'progress' => fake()->numberBetween(0, 100),

            'date_start' => $start,

            'date_end' => fake()->dateTimeBetween(
                $start,
                '+2 months'
            ),

            'reminder' => fake()->optional()->randomElement(
                array_column(TaskReminder::cases(), 'value')
            ),

            // Берем случайного пользователя из базы в качестве создателя
            'creator_id' => \App\Models\User::inRandomOrder()->first()->id, 
            
            // (Кстати, если у вас нет project_id в фабрике, его тоже нужно добавить)
            'project_id' => \App\Models\Project::inRandomOrder()->first()->id,

            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}