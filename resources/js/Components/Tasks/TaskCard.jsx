import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { priorityColors } from '@/utils/constants';
import ActionMenu from '@/Components/ActionMenu';

import {
    Box, Card, CardContent, Typography, IconButton,
    Tooltip, Avatar, AvatarGroup, Collapse, 
    ListItemIcon, ListItemText, List, ListItem
} from '@mui/material';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FlagIcon from '@mui/icons-material/Flag';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'; // Іконка підзадачі

const getReminderDate = (task) => {
    if (!task.reminder || !task.date_end) return null;

    const endDate = new Date(task.date_end);

    switch(task.reminder) {
        case '1_hour':
            endDate.setHours(endDate.getHours() - 1);
            break;

        case '1_day':
            endDate.setDate(endDate.getDate() - 1);
            break;

        case '2_days':
            endDate.setDate(endDate.getDate() - 2);
            break;

        case '1_week':
            endDate.setDate(endDate.getDate() - 7);
            break;
    }

    return endDate;
};

export default function TaskCard({ task, priorities, openedSubtasks, toggleSubtasks, onDragStart, onDrop, onClick, onDeleteTask }) {
    const isOpen = openedSubtasks[task.id];

    const priorityConfig = priorityColors[task.priority];
    const reminderDate = getReminderDate(task);

    const priority = priorities.find(p => p.id === task.priority);

    // Обробник "Редагувати"
    const handleEdit = (e) => {
        if (onClick) onClick(task); // Викликаємо функцію відкриття TaskView з батьківського компонента
    };

    // Обробник "Видалити"
    const handleDelete = (e) => {
        if (window.confirm('Ви впевнені, що хочете видалити це завдання?')) {
            // Відправляємо запит на видалення
            router.post(`/tasks/${task.id}/delete`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    if (onDeleteTask) onDeleteTask(task.id);
                }
            });
        }
    };

    return (
        <Card
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            onClick={(e) => {
                e.stopPropagation();
                onClick(task);
            }}
            sx={{
                cursor: 'pointer',
                transition: '0.2s',
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: 'secondary.main',
                    '& .action-menu-trigger': { opacity: 1 }
                },
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                position: 'relative',
                overflow: 'visible'
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 1.5 } }}>
                {/* HEADER */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Позначити як виконане">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDrop(null, 'done', task.id);
                                }}
                                sx={{
                                    color: task.status === 'done'
                                        ? 'success.main'
                                        : 'action.disabled',
                                    ml: -1
                                }}
                            >
                                {task.status === 'done'
                                    ? <CheckCircleIcon />
                                    : <CheckCircleOutlineOutlinedIcon />
                                }
                            </IconButton>
                        </Tooltip>

                        <Typography variant="subtitle2" fontWeight="700">
                            {task.title}
                        </Typography>
                    </Box>

                    <ActionMenu
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </Box>

                {/* DESCRIPTION */}
                {task.description && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(task.description?.text)
                        }}
                    />
                )}

                {/* FOOTER */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* ASSIGNEES */}
                    <AvatarGroup max={3}
                        sx={{
                            '& .MuiAvatar-root': {
                                width: 24,
                                height: 24,
                                fontSize: '0.7rem'
                            }
                        }}
                    >
                        {task.assignees?.map(user => (
                            <Tooltip key={user.id} title={user.full_name}>
                                <Avatar
                                    src={user.avatar_url}
                                    alt={user.full_name}
                                >
                                    {user.full_name.charAt(0)}
                                </Avatar>
                            </Tooltip>
                        ))}
                    </AvatarGroup>

                    <Box sx={{ display: 'flex', gap: 1}}>
                        <Tooltip title={ priority.label }>
                            <FlagIcon sx={{ fontSize: 16, color: priorityConfig }} />
                        </Tooltip>

                        {reminderDate && task.status !== 'done' && (
                            <Tooltip title={`Нагадування: ${reminderDate.toLocaleString('uk-UA')}`}>
                                <NotificationsActiveIcon sx={{ fontSize: 16,  color: '#ff00b7' }} />
                            </Tooltip>
                        )}
                    </Box>

                    {/* DATE */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {task.status === 'done' ? (
                            <Typography variant="caption" color="success.main">
                                Виконав: {task.completed_by_name}
                            </Typography>
                        ) : (
                            <>
                                {/* Перевіряємо, чи немає обох дат */}
                                {!task.date_start && !task.date_end ? (
                                    <Tooltip title="Встановіть дати">
                                        <CalendarMonthIcon sx={{ fontSize: 14 }} />
                                    </Tooltip>
                                ) : (
                                    /* Якщо є хоча б одна дата, виводимо як раніше */
                                    <>
                                        <CalendarMonthIcon sx={{ fontSize: 14 }} />
                                        <Typography variant="caption">
                                            {task.date_start
                                                ? new Date(task.date_start).toLocaleDateString('uk-UA', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })
                                                : ''
                                            }
                                            {' → '}
                                            {task.date_end
                                                ? new Date(task.date_end).toLocaleDateString('uk-UA', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })
                                                : ''
                                            }
                                        </Typography>
                                    </>
                                )}
                            </>
                        )}
                    </Box>
                </Box>

                {/* SUBTASKS */}
                {task.subtasks && task.subtasks.length > 0 && (
                    <Box sx={{ mt: 1.5, borderTop: '1px solid #f0f0f0', pt: 1 }}>
                        <Typography 
                            variant="caption" 
                            color="primary" 
                            onClick={(e) => {
                                e.stopPropagation(); // Зупиняємо клік, щоб не відкрити головну модалку
                                toggleSubtasks(task.id);
                            }}
                            sx={{ 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                fontWeight: 600,
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            {isOpen ? 'Приховати підзадачі' : `${task.subtasks.length} підзадач(і)`}
                        </Typography>

                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ mt: 1 }}>
                                {task.subtasks.map((sub) => (
                                    <ListItem 
                                        key={sub.id} 
                                        button // Робить елемент клікабельним
                                        sx={{ 
                                            pl: 0.5, pr: 0.5, py: 0.5, 
                                            borderRadius: 1, 
                                            mb: 0.5, 
                                            bgcolor: '#f8fafc',
                                            '&:hover': { bgcolor: '#e2e8f0' }
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log("Клик по подзадаче. Объект подзадачи:", sub);
                                            console.log("ID родителя этой подзадачи:", task.id);
                                            onClick(sub);
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 20 }}>
                                            <SubdirectoryArrowRightIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={sub.title} 
                                            primaryTypographyProps={{ 
                                                fontSize: '0.75rem', 
                                                // Якщо статус "done" - закреслюємо
                                                sx: { textDecoration: sub.status === 'done' ? 'line-through' : 'none', color: sub.status === 'done' ? 'text.secondary' : 'text.primary' } 
                                            }} 
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}