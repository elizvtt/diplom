<?php

namespace App\Http\Controllers;

use App\Models\Project;

use App\Services\GradeService;

use Illuminate\Http\Request;
use Inertia\Inertia;

class GradeController extends Controller
{
    public function __construct(
        private GradeService $gradeService
    ) {}
    
    /**
     * Виведення всіх оцінок учасників проєкту
     */
    public function showGrades(Project $project)
    {
        $this->authorize('grade', $project);
        
        $data = $this->gradeService->getGradesData($project);

        return Inertia::render('Grades', [
            'project' => $project,
            'students' => $data['students'],
            'allTasksDone' => $data['allTasksDone'],
        ]);
    }

    /**
     * Збереження оцінок
     */
    public function saveGrades(Request $request, Project $project)
    {
        $this->authorize('grade', $project);

        // Перевіряємо статус задач 
        if (!$this->gradeService->areAllTasksDone($project)) 
            return back()->withErrors(['grades' => 'Не всі завдання завершені']);
        
        $validated = $request->validate([
            'grades' => ['required', 'array'],
            'grades.*.user_id' => ['required'],
            'grades.*.score' => ['required', 'numeric', 'min:0', 'max:100'],
            'grades.*.comment' => ['nullable', 'string'],
        ]);

        $this->gradeService->saveGrades($project, $validated['grades'], $request->user());

        return back();
    }

}
