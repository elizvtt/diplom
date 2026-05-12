<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use App\Models\Project;

use App\Enums\UserRole;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // АДМИН
        User::factory()->create([
            'full_name' => 'Єлизавета Палазова',
            'email' => 'likzaa332@gmail.com',
            'role' => UserRole::Admin,
        ]);

        // & USERS
        User::factory(20)->create();

        // & PROJECTS
        Project::factory(10)->create();

        // & TASKS
        Task::factory(30)
            ->create()
            ->each(function ($task) {

                $users = User::inRandomOrder()
                    ->take(rand(1, 3))
                    ->pluck('id');

                $task->assignees()->attach($users);
            });
    }
}