<?php

namespace App\Events;

use App\Models\Grade;
use App\Models\Project;
use App\Models\User;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GradeUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Grade $grade,
        public Project $project,
        public User $student, // Кому поставили оцінку
        public User $grader // Хто поставив оцінку
    ) {}

}
