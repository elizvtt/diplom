import React from 'react';
import DOMPurify from 'dompurify';
import { priorityColors } from '@/utils/constants';
import {
    Box, Card, CardContent, Typography, IconButton,
    Tooltip, Avatar, AvatarGroup, Collapse, Divider
} from '@mui/material';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FlagIcon from '@mui/icons-material/Flag';

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

// const priorityColors = {
//     low: '#1a8638',
//     medium: '#ff7300',
//     high: '#ff0000',
//     critical: 'hsl(0, 90%, 19%)',
// };

export default function TaskCard({ task, priorities, openedSubtasks, toggleSubtasks, onDragStart, onDrop }) {
    const isOpen = openedSubtasks[task.id];

    const priorityConfig = priorityColors[task.priority];
    const reminderDate = getReminderDate(task);

    const priority = priorities.find(p => p.id === task.priority);

    return (
        <Card
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            sx={{
                cursor: 'pointer',
                transition: '0.2s',
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: 'secondary.main',
                    '& .task-options': { opacity: 1 }
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

                    <IconButton
                        className="task-options"
                        size="small"
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            bgcolor: 'rgba(255,255,255,0.8)'
                        }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
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
                                <CalendarMonthIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption">
                                    {new Date(task.date_start).toLocaleDateString('uk-UA', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
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
                    </Box>
                </Box>

                {/* SUBTASKS */}
                {task.subtasks_count > 0 && (
                    <>
                        <Divider sx={{ my: 1 }} />

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                color: 'secondary.main'
                            }}
                            onClick={() => toggleSubtasks(task.id)}
                        >
                            {openedSubtasks[task.id]
                                ? <KeyboardArrowUpIcon fontSize="small" />
                                : <KeyboardArrowDownIcon fontSize="small" />
                            }

                            <Typography variant="caption" fontWeight="bold">
                                {openedSubtasks[task.id]
                                    ? 'Сховати'
                                    : `Підзавдання (${task.subtasks_count})`
                                }
                            </Typography>
                        </Box>

                        <Collapse in={openedSubtasks[task.id]}>
                            <Box sx={{ mt: 1 }}>
                                {task.subtasks?.map(sub => (
                                    <Box
                                        key={sub.id}
                                        sx={{
                                            p: 0.5,
                                            pl: 1,
                                            display: 'flex',
                                            gap: 1,
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <CheckCircleOutlineOutlinedIcon
                                            sx={{
                                                fontSize: 14,
                                                color: sub.status === 'done'
                                                    ? 'success.main'
                                                    : 'disabled'
                                            }}
                                        />
                                        <Typography variant="caption">
                                            {sub.title}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Collapse>
                    </>
                )}
            </CardContent>
        </Card>
    );
}