<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// основні маршрути
Route::get('/', function () {

    if (Auth::check()) return Inertia::render('ProjectList'); 

    return Inertia::render('Auth', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);

})->name('login');

// маршрути для авторизованых пользователей
Route::middleware('auth')->group(function () {
    
    // Маршрути профілю
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    
});

require __DIR__.'/auth.php';
