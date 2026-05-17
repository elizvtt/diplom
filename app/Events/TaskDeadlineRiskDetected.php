<?php

namespace App\Events;

use App\Enums\TaskPriority;
use App\Models\Task;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskDeadlineRiskDetected
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Task $task,
        public TaskPriority $riskLevel
    ) {}
}
