import React from 'react';
import { usePage } from '@inertiajs/react';
import dayjs from 'dayjs';

import { Box, Typography, IconButton, Avatar, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


export default function TaskCommentItem({ comment, onDelete }) {
    const { auth } = usePage().props;

    return (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
            {/* Аватарка в один ряд з текстом */}
            <Avatar 
                sx={{ 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.8rem', 
                    bgcolor: 'secondary.main',
                    flexShrink: 0 // Щоб аватарка не стискалася
                }}
                src={comment.user?.avatar_path ? `/storage/${comment.user.avatar_path}` : null}
            >
                {comment.user?.full_name?.charAt(0)}
            </Avatar>

            {/* Бульбашка коментаря */}
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 1.5,
                    bgcolor: '#f1f5f9', 
                    borderRadius: '0 12px 12px 12px',
                    maxWidth: '95%',
                    width: '90%',
                    position: 'relative',
                    '&:hover .delete-comment-btn': { opacity: 1 },
                }}
            >
                {/* Ім'я та дата під верхнім краєм всередині Paper */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'secondary.main', fontSize: '0.7rem' }}>
                        {comment.user?.full_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                        {dayjs(comment.created_at).format('DD.MM.YY HH:mm')}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 0.5 }}>
                    {/* Текст коментаря */}
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', whiteSpace: 'pre-line', color: 'text.primary', width: '100%' }}>
                        {comment.text}
                    </Typography>
                    {comment.user_id === auth.user.id && (
                        <IconButton
                            className="delete-comment-btn"
                            size="small"
                            onClick={() => onDelete(comment.id)}
                            sx={{ 
                                p: 0, 
                                opacity: 0,
                                transition: '0.2s',
                                color: 'error.light'
                            }}
                        >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    )}
                </Box>
            </Paper>
        </Box>

    );
}
