<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\GradeController;
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
    Route::post('/tasks/{task}/update', [TaskController::class, 'updateTask']);
    Route::post('/tasks/{task}/delete', [TaskController::class, 'deleteTask']);

    
    // ПРИГЛАШЕНИЯ И КОМАНДА
    Route::get('/projects/{project}/team', [TeamController::class, 'showTeam'])->name('projects.team.show');

    Route::post('/projects/{project}/invitations', [InvitationController::class, 'invite'])->name('projects.invitations.store');
    Route::post('/projects/{project}/invitations/search', [InvitationController::class, 'searchUser'])->name('projects.invitations.search');
    Route::post('/invitations/{invitation}/revoke', [InvitationController::class, 'revoke']);

    Route::get('/projects/{project}/join', [InvitationController::class, 'join'])->name('projects.invitations.join');

    // ОЦЕНКИ
    Route::get('/projects/{project}/grades', [GradeController::class, 'showGrades'])->name('grades.show');
    Route::post('/projects/{project}/grades', [GradeController::class, 'saveGrades'])->name('grades.save');
   
    // & КОММЕНТАРИИ
    Route::post('/add/comment', [CommentController::class, 'addComment'])->name('comments.store');
    Route::post('/delete/comments/{comment}', [CommentController::class, 'deleteComment'])->name('comments.destroy');

    // & ФАЙЛЫ
    Route::post('/add/file', [AttachmentController::class, 'store']);
    Route::post('/delete/files/{attachment}', [AttachmentController::class, 'delete']);

});

// сторінка тільки для адміна
Route::middleware(['auth', 'can:admin-access'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index'])->name('admin.index');
    Route::post('/admin/verify-password', [AdminController::class, 'verifyPassword']);
});
