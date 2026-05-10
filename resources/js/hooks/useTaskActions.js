import { router } from '@inertiajs/react';

export function useTaskActions(taskId) {

    const sendComment = (text) => {
        return router.post('/add/comment', {
            task_id: taskId,
            text,
        }, { preserveScroll: true });
    };

    const deleteComment = (id) => {
        return router.post(`/delete/comments/${id}`, {}, {
            preserveScroll: true,
        });
    };

    const uploadFiles = (files) => {
        const formData = new FormData();
        formData.append('task_id', taskId);

        files.forEach(file => {
            formData.append('files[]', file);
        });

        return router.post('/add/file', formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const deleteFile = (id) => {
        return router.post(`/delete/files/${id}`, {}, {
            preserveScroll: true,
        });
    };

    const updateTask = (data) => {
        return router.post(`/tasks/${taskId}/update`, data, {
            preserveScroll: true,
        });
    };

    return {
        sendComment,
        deleteComment,
        uploadFiles,
        deleteFile,
        updateTask,
    };
}