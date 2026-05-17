<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\Task;
use App\Enums\TaskReminder;
use App\Events\TaskReminderTriggered;

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

        // Беремо типи нагадувань
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
                ->with(['project', 'users', 'creator'])
                ->get();

            foreach ($tasks as $task) {
                event(new TaskReminderTriggered($task));
            }
        }
        $this->info('Перевірку дедлайнів успішно завершено');
        return Command::SUCCESS;
    }
}
