<!-- use App\Models\Project;
use Inertia\Inertia;

public function index()
{
    // Отримуємо проєкти поточного користувача
    $projects = Project::where('owner_id', auth()->id())->get()->map(function ($project) {
        return [
            'id' => $project->id,
            'title' => $project->title,
            'short_description' => Str::limit($project->description, 100),
            'is_active' => (bool) $project->is_active,
            
            // ДИНАМІЧНІ ПОЛЯ ДЛЯ ФРОНТЕНДУ:
            
            // 1. Перевіряємо, чи є поточний користувач власником
            'is_owner' => $project->owner_id === auth()->id(), 
            
            // 2. Рахуємо завдання (припускаємо, що у вас буде відношення tasks())
            // 'tasks_total' => $project->tasks()->count(),
            // 'tasks_completed' => $project->tasks()->where('status', 'completed')->count(),
            
            // Тимчасово, поки немає таблиці завдань, повертаємо нулі
            'tasks_total' => 0, 
            'tasks_completed' => 0,
        ];
    });

    return Inertia::render('Dashboard', [
        'projects' => $projects
    ]);
} -->