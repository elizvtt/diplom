<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Project;
use App\Models\User;
use App\Notifications\GradeChangedNotification;

use App\Enums\TaskStatus;

use Illuminate\Http\Request;

use Inertia\Inertia;

class GradeController extends Controller
{
    public function showGrades(Project $project)
    {
        $this->canGrade($project);

        $project->load([
            'members',
            'tasks.assignees'
        ]);

        $allTasksDone = $project->tasks
            ->every(fn ($task) => $task->status === TaskStatus::Done->value);

        $students = $project->members->map(function ($member) use ($project) {

            $tasks = $project->tasks
                ->filter(fn ($task) =>
                    $task->assignees->contains($member->id)
                );
            
            $doneTasks = $tasks
                ->where('status', TaskStatus::Done->value);

            $grade = Grade::where('project_id', $project->id)
                ->where('user_id', $member->id)
                ->first();

            return [
                'id' => $member->id,
                'name' => $member->full_name,

                'tasks_total' => $tasks->count(),
                'tasks_done' => $doneTasks->count(),

                'task_history' => $doneTasks->values(),

                'score' => $grade?->score,
                'comment' => $grade?->comment,
            ];
        });

        return Inertia::render('Grades', [
            'project' => $project,
            'students' => $students,
            'allTasksDone' => $allTasksDone,
        ]);
    }

    
    public function saveGrades(Request $request, Project $project)
    {
        $this->canGrade($project);

        $allTasksDone = $project->tasks
            ->every(fn ($task) => $task->status === 'done');

        if (!$allTasksDone) {
            return back()->withErrors([
                'grades' => 'Не всі завдання завершені'
            ]);
        }

        $validated = $request->validate([
            'grades' => ['required', 'array'],
            'grades.*.user_id' => ['required'],
            'grades.*.score' => ['required', 'numeric', 'min:0', 'max:100'],
            'grades.*.comment' => ['nullable', 'string'],
        ]);

        foreach ($validated['grades'] as $item) {

            $grade = Grade::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'user_id' => $item['user_id'],
                ],
                [
                    'rated_by_id' => auth()->id(),
                    'score' => $item['score'],
                    'comment' => $item['comment'],
                ]
            );
            $user = User::find($item['user_id']);

            $user->notify(
                new GradeChangedNotification(
                    project: $project,
                    score: $item['score'],
                    comment: $item['comment']
                )
            );
        }

        $project->update([
            'grading_completed' => true
        ]);

        return back();
    }

    private function canGrade(Project $project): void
    {
        if (
            $project->owner_id !== auth()->id()
            && auth()->user()->role !== 'teacher'
        ) {
            abort(403);
        }
    }
}