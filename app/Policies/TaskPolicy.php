<?php
namespace App\Policies;

use App\Models\User;
use App\Models\Task;
use App\Models\Project;
use App\Models\TaskAssignee;
use Illuminate\Auth\Access\HandlesAuthorization;

class TaskPolicy
{
    use HandlesAuthorization;

    // Checks if user is owner or member of the project
    public function create(User $user, Project $project)
    {
        if ($project->owner_id === $user->id) return true;

        return $project->members()
            ->where('user_id', $user->id)
            ->where('project_members.is_active', 1)
            ->exists();
    }

    public function updateStatus(User $user, Task $task)
    {
        $project = $task->project;
        $isProjectOwner = $project->owner_id === $user->id;
        $isAssignee = TaskAssignee::where('task_id', $task->id)->where('user_id', $user->id)->exists();

        return $isProjectOwner || $isAssignee;
    }

    public function delete(User $user, Task $task)
    {
        return $task->creator_id === $user->id;
    }
}