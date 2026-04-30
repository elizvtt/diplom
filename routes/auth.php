<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;


Route::middleware('guest')->group(function () {
    
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

Route::middleware('auth')->group(function () {

    // Route::put('password', [::class, 'update'])->name('password.update');

    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
});
