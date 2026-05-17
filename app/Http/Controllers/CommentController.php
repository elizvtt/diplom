<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Task;

use App\Events\CommentAdded;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function addComment(Request $request)
    {
        // Валідація
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'text' => 'required|string|max:2000',
        ]);

        // Створення запису
        $comment = Comment::create([
            'task_id' => $validated['task_id'],
            'user_id' => Auth::id(), // ID поточного користувача
            'text' => $validated['text'],
        ]);

        $task = Task::with(['project', 'assignees'])->find($validated['task_id']);
        $author = $request->user();
        
        event(new CommentAdded($comment, $task, $author));

        // Повернення назад
        return back()->with('success', 'Коментар додано');
    }

    public function deleteComment(Comment $comment)
    {
        // Перевірка, чи це автор коментаря видаляє його
        if ($comment->user_id !== Auth::id()) return redirect()->back()->with('error', 'Ви не маєте прав на видалення цього коментаря');

        $comment->update(['is_active' => 0]);
        
        return back()->with('success', 'Коментар видалено');
    }
}