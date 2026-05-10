<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use App\Enums\TeamRole;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory()->create([
        //     'id' => 1,
        //     'full_name' => 'Єлизавета Палазова',
        //     'email' => 'likzaa332@gmail.com',
        //     'role' => UserRole::Admin,
        // ]);

        // Створюємо 10 проєктів
        $projects = Project::factory(10)->create();

        // Для кожного проєкту додаємо 2-4 рандомних учасників (крім власника і ID 1)
        $projects->each(function ($project) {
            $potentialMembers = User::where('id', '!=', 1)
                ->where('id', '!=', $project->owner_id)
                ->inRandomOrder()
                ->limit(rand(2, 4))
                ->get();

            foreach ($potentialMembers as $user) {
                // Використовуємо зв'язок members() з моделі Project
                $project->members()->attach($user->id, [
                    'role' => fake()->randomElement(array_column(TeamRole::cases(), 'value')),
                    'is_active' => 1,
                    'joined_at' => now(),
                ]);
            }
        });
    }
}
