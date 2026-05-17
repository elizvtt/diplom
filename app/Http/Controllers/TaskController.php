<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Services\TaskService;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Enums\TaskStatus;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Access\AuthorizationException;


class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService
    ){}

    /**
     * Створення нового завдання у проєкті
     * @param StoreTaskRequest $request 
     * @return RedirectResponse
     */
    public function createTask(StoreTaskRequest $request)
    {
        try {
            // Отримання моделі проєкту
            $project = Project::findOrFail($request->validated('project_id'));
            
            // Check authorization (користувач має бути власником або учасником)
            $this->authorize('create', [Task::class, $project]);

            // Передача валідованих даних у сервіс для створення
            $this->taskService->createTask(
                $request->validated(), 
                $request->file('files'), 
                $request->user()
            );
            // Повернення відповіді
            return redirect()->back()->with('success', 'Завдання успішно створено!');

        } catch (\Exception $e) {
            Log::error("Помилка під час створення завдання", ['error_message' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Не вдалося створити завдання через внутрішню помилку.');
        }
    }
    
    /**
     * Оновлення статусу завдання (todo, inprogress, done и тд.)
     *
     * @param Request $request Вхідний HTTP-запит
     * @return RedirectResponse Відповідь з перенаправленням
     */
    public function updateStatus(Request $request)
    {
        // Валідація вхідних даних
        $validated = $request->validate([
            'id' => ['required', 'exists:tasks,id'], // Перевіряємо, чи є таке ID в базі
            'status' => ['required', Rule::enum(TaskStatus::class)], // Перевіряємо статус через Enum
        ]);

        try {
            // Отримання моделі завдання
            $task = Task::findOrFail($validated['id']);
            
            // Перевірка прав доступу
            $this->authorize('updateStatus', $task); // Дозволено лише власнику проєкту або безпосередньому виконавцю

            // Делегування бізнес-логіки сервісу
            $this->taskService->updateStatus(
                $task, 
                $validated['status'], 
                $request->user()
            );

            // Повернення успішної відповіді
            return back()->with('success', 'Статус успішно оновлено');

        } catch (AuthorizationException $e) {
            // Обробка ситуації, коли у користувача немає прав на зміну статусу
            return back()->with('error', 'Оновлювати статус завдання може тільки виконавець або власник проєкту');

        } catch (\Exception $e) {
            Log::error("Помилка оновлення статусу завдання", [
                'task_id' => $validated['id'] ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            return back()->with('error', 'Помилка при оновленні статусу завдання');
        }
    }

    /**
     * Редагування основних параметрів завдання
     * @param UpdateTaskRequest $request 
     * @param Task $task Модель завдання для оновлення
     * @return RedirectResponse
     */
    public function UpdateTaskRequest(Request $request, Task $task)
    {
        try {
            // Оновлення завдання через сервіс
            $this->taskService->updateTask(
                $task, 
                $request->validated(), 
                $request->user()
            );
            
            return redirect()->back()->with('success', 'Завдання успішно оновлено!');
        } catch (\Exception $e) {
            Log::error("Помилка під час редагування завдання", [
                'task_id' => $task->id,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Помилка під час збереження');
        }
    }

    /**
     * ВИдалення завадння
     * @param Task $task Модель завдання для видалення
     * @return RedirectResponse
     */
    public function deleteTask(Task $task)
    {
        try {
            // Перевіряємо права на видалення
            $this->authorize('delete', $task);
            // Видалення через сервіс
            $this->taskService->deleteTask($task, request()->user());
    
            return redirect()->back()->with('success', 'Завдання успішно видалено.');
    
            } catch (\Exception $e) {
            Log::error("Помилка видалення завдання", [
                'task_id' => $task->id,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Не вдалося видалити завдання.');
        }
    }
}