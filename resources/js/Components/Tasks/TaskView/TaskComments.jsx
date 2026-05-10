import React, { useState } from 'react';
import TaskCommentItem from '@/Components/Tasks/TaskView/TaskCommentItem';
import { useTaskActions } from '@/hooks/useTaskActions';

import { Box, Typography, IconButton, Stack, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function TaskComments({ task }) {
    const { sendComment, deleteComment } = useTaskActions(task.id);

    const [comment, setComment] = useState('');
    const [isSending, setIsSending] = useState(false);


    const handleSend = async () => {
        if (!comment.trim()) return;

        setIsSending(true);

        try {
            await sendComment(comment);
            setComment('');
        } finally {
            setIsSending(false);
        }
    };
    
    const comments = [...(task.comments || [])].reverse();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            
            {/* ПОЛЕ ВВОДУ */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Напишіть коментар..."
                    size="small"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } 
                    }}
                />
                <IconButton 
                    color="secondary" 
                    disabled={!comment.trim() || isSending}
                    onClick={handleSend}
                    sx={{ 
                        bgcolor: '#f9c5ef30', 
                        '&:hover': { bgcolor: '#f9c5ef60' } 
                    }}
                >
                    <SendIcon fontSize="small" color='primary' />
                </IconButton>
            </Box>

            {/* СПИСОК КОМЕНТАРІВ */}
            <Stack spacing={2} sx={{ pr: 0.5 }}>
                 {comments.length > 0 ? (
                    comments.map((c) => (
                        <TaskCommentItem
                            key={c.id}
                            comment={c}
                            onDelete={deleteComment}
                        />
                    ))
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <Typography variant="caption">Ще немає коментарів</Typography>
                    </Box>
                )}
            </Stack>
        </Box>
    )
}
