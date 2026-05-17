<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectPolicy
{
    use HandlesAuthorization;

    /**
     * Перевірка прав на перегляд проєкту (власник або учасник команди)
     */
    public function view(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id || $project->members->contains($user->id);
    }

    /**
     * Перевірка прав на оновлення проєкту (лише власник)
     */
    public function update(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }

    /**
     * Перевірка прав на видалення проєкту (лише власник)
     */
    public function delete(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }

    /**
     * Чи може користувач оцінювати проєкт
     */
    public function grade(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id || $user->role === 'teacher';
    }
}