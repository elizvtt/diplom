<?php

namespace App\Http\Controllers;

use App\Models\Comment;
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