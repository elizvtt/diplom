<?php

/*
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Страница со всеми уведомлениями (если у вас есть отдельная страница)
     */
    public function index()
    {
        $notifications = auth()->user()->notifications()->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications
        ]);
    }

    /**
     * Пометить одно уведомление как прочитанное
     */
    public function markAsRead($id)
    {
        $notification = auth()->user()->notifications()->find($id);
        
        if ($notification) {
            $notification->markAsRead();
        }

        // Возвращаемся обратно (Inertia обновит данные на странице без перезагрузки)
        return back(); 
    }

    /**
     * Пометить ВСЕ уведомления как прочитанные
     */
    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();

        return back();
    }
    
    /**
     * Очистить историю (удалить всё)
     */
    public function destroyAll()
    {
        auth()->user()->notifications()->delete();

        return back();
    }
}
*/