<?php
namespace Database\Factories;

use App\Enums\UserRole; // Переконайся, що шлях до Enum правильний
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'), // Пароль для всіх: password
            'email_notification' => 1,
            // Вибираємо випадкову роль зі списку доступних в Enum
            'role' => fake()->randomElement(array_column(UserRole::cases(), 'value')),
            'is_active' => 1,
            'avatar_path' => null,
            'created_at' => now(),
            'updated_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }
}