<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{

    // Показує сторінку
    public function edit(Request $request)
    {
        $user = $request->user();
        
        return Inertia::render('Profile', [
            'auth' => [
                'user' => $request->user(),
            ],
            // Отримуємо 2 рядки (database та mail)
            'notificationSettingsList' => $request->user()->notificationSettings()->get(),
        ]);
    }


    // Зберігає зміни
    public function update(Request $request)
    {
        $user = $request->user();

        // валидация
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email_notification' => 'boolean',
            'avatar' => 'nullable|image|max:2048',
            'delete_avatar' => 'nullable|boolean',
            'settings' => 'array',
            'settings.*.id' => 'required|exists:notification_settings,id',
            'settings.*.is_enabled' => 'boolean',
        ]);


        if ($request->input('delete_avatar') == true) { // Видалення аватарки

            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
                $user->avatar_path = null;
            }
        } else if ($request->hasFile('avatar')) { // Оновлення аватарки
            // Видаляємо стару аватарку, якщо є
            if ($user->avatar_path) Storage::disk('public')->delete($user->avatar_path);

            $file = $request->file('avatar'); // Отримуємо сам файл
            $binaryId = decbin($user->id); // Перетворюємо ID користувача в бінарний код
            $extension = $file->getClientOriginalExtension(); // Отримуємо оригінальне розширення файлу (jpg, png тощо)
            
            $fileName = 'img_user_' . $binaryId . '.' . $extension; // Формуємо нове ім'я файлу

            // Зберігаємо нову аватарку
            $path = $file->storeAs('avatars', $fileName, 'public');
            $user->avatar_path = $path;
        }

        debug($validated);

        // Оновлення таблиці users
        $user->full_name = $validated['full_name'];
        $user->email_notification = $validated['email_notification'] ? 1 : 0;
        $user->save();

        // Оновлення таблиці notification_settings (якщо прийшли налаштування)
        if (isset($validated['settings'])) {
            foreach ($validated['settings'] as $settingData) {
                if (array_key_exists('is_enabled', $settingData)) {
                    $user->notificationSettings()->where('id', $settingData['id'])->update([
                        'is_enabled' => $settingData['is_enabled'] ? 1 : 0
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Профіль оновлено!');
    }

}
