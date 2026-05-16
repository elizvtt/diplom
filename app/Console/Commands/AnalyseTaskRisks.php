<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Task;
use App\Models\Project;
use App\Models\RiskAssessment;
use App\Enums\TaskPriority;
use App\Enums\NotificationEvent;
use App\Notifications\SimpleNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AnalyseTaskRisks extends Command
{
    protected $signature = 'tasks:analyze-risks';
    protected $description = 'Аналіз ризиків зриву дедлайнів задач із захистом від дублювання сповіщень';

    public function handle(): void
    {
        // Беремо активні задачі, які ще не завершені
        $tasks = Task::where('is_active', 1)
            ->where('status', '!=', 'done')
            ->with(['assignees', 'project'])
            ->get();

        $now = Carbon::now();

        // Групуємо таски за проєктами
        $projects = $activeTasks->groupBy('project_id');

        foreach ($projects as $projectId => $tasks) {
            $project = Project::find($projectId);
            if (!$project) continue;

            // Рахуємо середню похибку проєкту за минулими завданнями
            $projectErrorHours = $this->calculateProjectErrorHours($projectId);

            foreach ($tasks as $task) {
                // Якщо немає дедлайну або дати початку — пропускаємо
                if (!$task->date_end || !$task->date_start) continue;
    
                $start = Carbon::parse($task->date_start);
                $end = Carbon::parse($task->date_end);
    
                // Якщо задача вже прострочена, фіксуємо її прогрес часу як 100%
                if ($now->greaterThan($end)) {
                    $timeProgress = 100;
                } else {
                    $totalHours = $start->diffInHours($end);
                    if ($totalHours <= 0) continue;
    
                    $passedHours = $start->diffInHours($now);
                    $timeProgress = ($passedHours / $totalHours) * 100;
                }
    
                // Реальний прогресс завдання
                $taskProgress = $task->progress ?? 0;
                $difference = $timeProgress - $taskProgress;
    
                // Визначаємо рівень ризику
                $riskLevel = TaskPriority::Low;
                if ($difference >= 70) {
                    $riskLevel = TaskPriority::Critical;
                } else if ($difference >= 50) {
                    $riskLevel = TaskPriority::High;
                } else if ($difference >= 25) {
                    $riskLevel = TaskPriority::Medium;
                }
    
                // Прогнозована дата завершення
                $predictedCompletionDate = $end->copy();
                if ($riskLevel === TaskPriority::High) $predictedCompletionDate->addDays(3);
                if ($riskLevel === TaskPriority::Critical) $predictedCompletionDate->addDays(7);

                // Додаємо середнє запізнення команди проєкту
                if ($projectErrorHours > 0) {
                    // Якщо команда зазвичай запізнюється, посуваємо дедлайн вперед на цю кількість годин
                    $predictedCompletionDate->addHours(round($projectErrorHours));
                }
    
                // Отримуємо попередній аналіз для цього завдання
                $previousAssessment = RiskAssessment::where('task_id', $task->id)->first();
    
                // Оновлюємо або створюємо запис
                RiskAssessment::updateOrCreate(
                    ['task_id' => $task->id],
                    [
                        'predicted_completion_date' => $predictedCompletionDate,
                        'risk_level' => $riskLevel->value,
                    ]
                );
    
                // Автоматично підвищуємо пріоритет, якщо ризик критичний
                if ($riskLevel === TaskPriority::Critical && $task->priority !== TaskPriority::Critical->value) {
                    $task->update(['priority' => TaskPriority::Critical]);
                }
    
                // НАДСИЛАЄМО СПОВІЩЕННЯ ТІЛЬКИ ЯКЩО РИЗИК СТАВ ВИЩИМ НІЖ БУВ
                $isNewHighRisk = ($riskLevel === TaskPriority::High || $riskLevel === TaskPriority::Critical);
                
                // Якщо раніше аналізу не було, або попередній ризик був меншим за поточний
                $riskIncreased = !$previousAssessment || ($previousAssessment->risk_level !== $riskLevel->value);
    
                if ($isNewHighRisk && $riskIncreased) {
                    $project = $task->project;
                    
                    // Перевіряємо наявність виконавців, якщо порожньо — шлемо автору (creator)
                    $notifyUsers = $task->assignees->isNotEmpty() ? $task->assignees : collect([$task->creator]);
    
                    foreach ($notifyUsers as $user) {
                        if (!$user) continue;
    
                        try {
                            $user->notify(
                                new SimpleNotification([
                                    'event' => NotificationEvent::DeadlineRisk->value,
                                    'title' => 'Ризик зриву дедлайну',
                                    'message' => "Увага! Завдання «{$task->title}» у проєкті «{$project->title}» має {$riskLevel->label()} ризик прострочення.",
                                    'task_id' => $task->id,
                                    'project_id' => $task->project_id,
                                    'url' => url('/projects/' . $project->uuid),
                                ])
                            );
                        } catch (\Exception $e) {
                            Log::error("Помилка надсилання ризик-сповіщення: " . $e->getMessage());
                        }
                    }
                }
            }

        }        
        $this->info('Аналіз ризиків завершено успішно');
    }

    /**
     * Рахує середнє запізнення за вже виконаними завданнями проєкту.
     */
    private function calculateProjectErrorHours(int $projectId): float
    {
        // Отримуємо оцінки ризиків тільки для завершених завдань ЦЬОГО проєкту
        $pastAssessments = RiskAssessment::whereHas('task', function ($query) use ($projectId) {
                $query->where('project_id', $projectId)
                      ->where('status', 'done');
            })
            ->whereNotNull('actual_completion_date')
            ->get();

        // Якщо завершених ще немає, похибка рівна нулю
        if ($pastAssessments->isEmpty()) return 0; 

        $totalDeviationHours = 0;
        $count = 0;

        foreach ($pastAssessments as $assessment) {
            $deadline = Carbon::parse($assessment->actual_completion_date);
            
            $task = Task::find($assessment->task_id);
            if (!$task || !$task->date_end) continue;

            $deadline = Carbon::parse($task->date_end);
            $actual = Carbon::parse($assessment->actual_completion_date);

            // Якщо actual більше ніж дедлайн — це запізнення в годинах (позитивне число)
            // Якщо менше — здали раніше (негативне число)
            $diff = $deadline->diffInHours($actual, false); 

            $totalDeviationHours += $diff;
            $count++;
        }

        return $count > 0 ? ($totalDeviationHours / $count) : 0;
    }
    
}