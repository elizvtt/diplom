<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\Task;
use App\Enums\TaskReminder;
use App\Enums\TaskStatus;

use App\Notifications\SimpleNotification;

use Illuminate\Support\Facades\Log;

class SendTaskReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Перевіряє дедлайни завдань та надсилає користувачам сповіщення за розкладом';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = now()->startOfMinute();

        // 1. Беремо типи нагадувань без 'none'
        $reminderTypes = [
            TaskReminder::OneHour->value => 60, // година
            TaskReminder::OneDay->value => 1440, // 24 години
            TaskReminder::TwoDays->value => 2880, // 48 годин
            TaskReminder::OneWeek->value => 10080, // тиждень
        ];

        foreach ($reminderTypes as $type => $minutes) {
            // Рахуємо час дедлайну як поточний час + хвилини зміщення
            $targetDeadline = $now->copy()->addMinutes($minutes);

            // Шукаємо завдання
            $tasks = Task::where('reminder', $type)
                ->where('status', '!=', 'completed') // Не нагадуємо про вже виконані
                ->whereBetween('date_end', [
                    $targetDeadline->copy()->second(0),
                    $targetDeadline->copy()->second(59)
                ])
                ->where('is_active', 1)
                ->with('project')
                ->get();

            foreach ($tasks as $task) {
                // Оскільки у завдання може бути багато виконавців
                $assignedUsers = $task->users; 

                // Якщо виконавців немає, надсилаємо автору завдання
                if ($assignedUsers->isEmpty())
                    $assignedUsers = collect([$task->creator]);

                foreach ($assignedUsers as $user) {
                    if (!$user) continue;

                    try {
                        $user->notify(
                            new SimpleNotification([
                                'event' => 'task_reminder',
                                'title' => 'Нагадування про дедлайн',
                                'message' => "Термін виконання завдання «{$task->title}» у проєкті «{$task->project->title}» добігає кінця: " . $task->date_end->format('d.m.Y H:i'),
                                'project_id' => $task->project_id,
                                'task_id' => $task->id,
                                'author_id' => $task->creator_id,
                                'url' => url('/projects/' . $task->project->uuid . '/tasks/' . $task->id),
                            ])
                        );

                        Log::info("Нагадування надіслано користувачу", [
                            'task_id' => $task->id,
                            'user_id' => $user->id
                        ]);

                    } catch (\Exception $e) {
                        Log::error("Помилка відправки нагадування", [
                            'task_id' => $task->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
        }

        return Command::SUCCESS;
    }
}
