<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Task;

use App\Notifications\SimpleNotification;
use App\Enums\NotificationEvent;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function addComment(Request $request)
    {
        debug($request);
        // Валідація
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'text'    => 'required|string|max:2000',
        ]);

        // Створення запису
        Comment::create([
            'task_id' => $validated['task_id'],
            'user_id' => Auth::id(), // ID поточного користувача
            'text'    => $validated['text'],
        ]);

        $task = Task::find($validated['task_id']);
        foreach ($task->assignees as $user) {
            if ($user->id === auth()->id()) continue;
            $user->notify(
                new SimpleNotification([
                    'event' => NotificationEvent::NewComment->value,
                    'title' => 'Новий коментар',
                    'message' => 'Новий коментар до задачі "' . $task->title . '"',
                    'project_id' => $task->project_id,
                    'task_id' => $task->id,
                    'author_id' => auth()->id(),
                ])
            );
        }

        // Повернення назад
        return back()->with('success', 'Коментар додано');
    }

    public function deleteComment(Comment $comment)
    {
        // Перевірка, чи це автор коментаря видаляє його
        if ($comment->user_id !== Auth::id()) abort(403);

        $comment->update(['is_active' => 0]);
        
        return back()->with('success', 'Коментар видалено');
    }
}