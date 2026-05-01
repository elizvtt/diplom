<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// основні маршрути
Route::get('/', function () {

    if (Auth::check()) {
        return Inertia::render('ProjectList'); // ! изменить на MAIN
    }

    return Inertia::render('Auth', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);

})->name('login');


require __DIR__.'/auth.php';
