<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),

                // Передаем 5 последних непрочитанных уведомлений на КАЖДУЮ страницу
                // 'unread_notifications' => $request->user() ? $request->user()->unreadNotifications()->take(5)->get() : [],
                // Передаем общее количество для красной точки
                // 'unread_count' => $request->user() ? $request->user()->unreadNotifications()->count() : 0,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                // 'warning' => fn () => $request->session()->get('warning'),
                // 'info' => fn () => $request->session()->get('info'),
            ]
        ];
    }
}
