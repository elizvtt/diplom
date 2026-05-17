<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Inertia\Inertia;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Access\AuthorizationException;

use App\Enums\TaskStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskReminder;

use App\Services\ProjectService;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ){}

    /**
     * создание нового проекта
     */
    public function createProject(StoreProjectRequest $request)
    {
        try {
            $this->projectService->createProject(
                $request->validated(), 
                $request->user()
            );

            return redirect()->back()->with('success', 'Проєкт успішно створено!');
        
        } catch (\Exception $e) {
    
            Log::error("Помилка при створенні проєкту", [
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'input_data' => $request->except(['password', '_token']), // Записуємо що вводив юзер, але без секретів
            ]);

            // Якщо це помилка лімітів AI, показуємо її, інакше стандартне повідомлення
            $message = $e->getMessage() ?: 'Виникла технічна помилка при створенні проєкту';
            return redirect()->back()->with('error', $message);
        }
    }

    /**
     * Відображення списку всіх активних проєктів поточного користувача
     * @param Request $request
     * @return \Inertia\Response
     */
    public function listAllUserProjects(Request $request)
    {
        $projects = $this->projectService->getUserProjects($request->user());

        return Inertia::render('ProjectsList', [
            'projects' => $projects
        ]);
    }

    /**
     * Відображення сторінки конкретного проєкту
     * @param Project $project Модель проєкту
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Project $project)
    {
        try {
            // Перевірка прав (власник або учасник команди)
            $this->authorize('view', $project);

            // Завантаження пов'язаних даних через сервіс
            $loadedProject = $this->projectService->loadProjectDetails($project);

            // Формування єдиного списку команди проєкту (власник + учасники)
            $teamMembers = collect([$loadedProject->owner])
                ->merge($loadedProject->members)
                ->unique('id')
                ->values()
                ->map(fn($user) => [
                    'id' => $user->id,
                    'name' => $user->full_name,
                ]);

            // Повернення даних на фронт
            return Inertia::render('Project', [
                'project' => $loadedProject,
                'teamMembers' => $teamMembers,
                'statuses' => collect(TaskStatus::cases())->map(fn($s) => [
                    'id' => $s->value,
                    'label' => str($s->name)->headline(),
                ]),
                'priorities' => collect(TaskPriority::cases())->map(fn($p) => [
                    'id' => $p->value,
                    'label' => $p->label(),
                ]),
                'reminders' => collect(TaskReminder::cases())->map(fn($r) => [
                    'id' => $r->value,
                    'label' => $r->label(),
                ]),
            ]);

        } catch (AuthorizationException $e) {
            return redirect()->back()->with('error', 'У вас немає доступу до цього проєкту');
        }
    }

    /**
     * Редагування назви та опису проєкту.
     * @param UpdateProjectRequest $request 
     * @param Project $project Модель проєкту
     * @return \Illuminate\Http\RedirectResponse
     */
    public function editProject(UpdateProjectRequest $request, Project $project)
    {
        try {
            // лише власник can delete
            $this->authorize('update', $project);

            // Оновлення через сервіс
            $this->projectService->updateProject(
                $project, 
                $request->validated(), 
                $request->user()
            );

            return redirect()->back()->with('success', 'Проєкт успішно оновлено');

        } catch (AuthorizationException $e) {
            return redirect()->back()->with('error', 'У вас немає прав для редагування цього проєкту');

        } catch (\Exception $e) {
            Log::error("Помилка при оновленні проєкту", [
                'project_id'    => $project->id,
                'error_message' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Виникла технічна помилка при оновленні проєкту');
        }
    }

    /**
     * Видалення проєкту
     * @param Project $project Модель проєкту
     * @return \Illuminate\Http\RedirectResponse
     */
    public function deleteProject(Project $project)
    {
        try {
            // Перевірка прав
            $this->authorize('delete', $project);

            // Видалення через сервіс
            $this->projectService->deleteProject($project, request()->user());

            return redirect()->back()->with('success', 'Проєкт успішно видалено');

        } catch (\Exception $e) {
            Log::error("Помилка при видаленні проєкту", [
                'project_id' => $project->id,
                'error_message' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Виникла технічна помилка при видаленні проєкту');
        }
    }
    
}
