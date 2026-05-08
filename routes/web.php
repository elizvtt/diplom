<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ОСНОВНА СТОРІНКА
Route::get('/', function () {
    if (Auth::check()) {
        return app(ProjectController::class)->listAllUserProjects();
    }

    return Inertia::render('Auth', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);

})->name('home');

// МАРШРУТ-ПЕРЕНАПРАВЛЕННЯ
Route::get('/login', function () {
    return redirect('/');
})->name('login');

// МАРШРУТИ АВТОРИЗАЦІЇ
Route::middleware('guest')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});


// ЗАХИЩЕНІ МАРШРУТИ (Тільки для авторизованих)
Route::middleware('auth')->group(function () {

    // Вихід
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    
    // профіль
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // проєкти
    Route::post('/add/project', [ProjectController::class, 'createProject'])->name('projects.store');

    // Додаємо маршрут для перегляду конкретного проєкту
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    
    // создание задания
    Route::post('/add/task', [TaskController::class, 'createTask'])->name('task.store');
    // обновоения статуса
    Route::post('/tasks/update-status', [TaskController::class, 'updateStatus']);

    
});
