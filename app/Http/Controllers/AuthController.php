<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * регистрация
     */
    public function register(Request $request)
    {
        // Валидация данных на бэкенде
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'], 
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'in:student,teacher'], // Проверяем, что роль только из разрешенного списка
        ], [
            'email.unique' => 'Користувач з такою поштою вже існує.', // Кастомные сообщения об ошибках
        ]);

        // Создание пользователя в БД
        $user = User::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'], 
            'is_active' => 1,
        ]);

        // Сразу авторизуем пользователя
        Auth::login($user);

        // Inertia сделает плавный редирект на главную
        return redirect('/');
    }

    /**
     * вход
     */
    public function login(Request $request)
    {
        // Простая валидация формата
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Auth::attempt сама найдет юзера по email и сверит хеш пароля
        if (Auth::attempt($credentials)) {
            // Защита от атаки фиксации сессии
            $request->session()->regenerate(); 

            // Редирект на главную (или туда, куда юзер пытался зайти до логина)
            return redirect()->intended('/');
        }

        // 3. Если пароль не подошел - выбрасываем ошибку валидации.
        // Inertia поймает её и положит в errors.email в вашем React-коде!
        throw ValidationException::withMessages([
            'email' => 'Невірний логін або пароль.',
        ]);
    }

    /**
     * Выход из системы
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}