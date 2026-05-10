<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AttachmentController extends Controller
{
    /**
     * добавление файлов
     */
    public function store(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'files.*' => 'required|file|max:10240',
        ]);

        foreach ($request->file('files') as $file) {

            $path = $file->store('task-files', 'public');

            Attachment::create([
                'task_id' => $request->task_id,
                'user_id' => auth()->id(),
                'filename' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'file_type' => $file->getMimeType(),
                'active' => 1,
            ]);
        }

        return back()->with('success', 'Файл завантажено');
    }

    public function delete(Attachment $attachment)
    {
        $attachment->update(['is_active' => 0]);
        if ($attachment->file_path) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        return back()->with('success', 'Файл видалено');
    }

}