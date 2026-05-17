<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Services\ProjectService;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}

    /**
     * Обробляє запит на головну сторінку ("/")
     */
    public function index(Request $request)
    {
        // Якщо користувач АВТОРИЗОВАНИЙ: делегуємо роботу ProjectController
        $user = $request->user();
        if ($user) {
            $projects = $this->projectService->getUserProjects($request->user());

            return Inertia::render('ProjectsList', ['projects' => $projects]);
        }

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