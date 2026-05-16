<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Enums\UserRole;

class HomeController extends Controller
{
    /**
     * Обробляє запит на головну сторінку ("/")
     */
    public function index(ProjectController $projectController)
    {
        // Якщо користувач АВТОРИЗОВАНИЙ: делегуємо роботу ProjectController
        if (Auth::check()) return $projectController->listAllUserProjects();

        // Якщо користувач ГІСТЬ: формуємо масив ролей для сторінки реєстрації
        $availableRoles = collect(UserRole::cases())
            ->filter(fn (UserRole $role) => $role !== UserRole::Admin)
            ->map(fn (UserRole $role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ])
            ->values()
            ->toArray();

        // Повертаємо React компонент Auth з потрібними даними
        return Inertia::render('Auth', [ 'availableRoles' => $availableRoles ]);
    }
}