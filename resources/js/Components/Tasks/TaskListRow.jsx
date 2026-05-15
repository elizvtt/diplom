import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { statusColors, priorityColors } from '@/utils/constants';
import ActionMenu from '@/Components/ActionMenu';

import { 
    TableRow, TableCell, IconButton, Tooltip, Menu, MenuItem, 
    ListItemIcon, ListItemText, Box, Typography, Chip, AvatarGroup, 
    Avatar, LinearProgress,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FlagIcon from '@mui/icons-material/Flag';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import CircleIcon from '@mui/icons-material/Circle';


export const TaskListRow = ({ task, level = 0,priorities, statuses, onStatusChange, onClick, onDeleteTask, isExpandable, isExpanded, onToggleExpand }) => {
    console.log('task: ', task);
    const priority = priorities.find(p => p.id === task.priority);
    // Стейт для МЕНЮ СТАТУСІВ
    const [statusAnchor, setStatusAnchor] = useState(null);

    // МЕНЮ РЕДАГУВАННЯ/ВИДАЛЕННЯ
    const handleEdit = (e) => {
        if (onClick) onClick(); 
    };

    const handleDelete = (e) => {
        if (window.confirm('Ви впевнені, що хочете видалити це завдання?')) {
            router.post(`/tasks/${task.id}/delete`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    if (onDeleteTask) onDeleteTask(task.id);
                }
            });
        }
    };

    // ОБРОБНИКИ ДЛЯ СТАТУСУ
    const handleStatusMenuOpen = (e) => {
        e.stopPropagation();
        setStatusAnchor(e.currentTarget); // Прив'язуємо меню до лівої іконки
    };

    const handleStatusMenuClose = (e) => {
        if (e) e.stopPropagation();
        setStatusAnchor(null);
    };

    const handleStatusSelect = (e, newStatusId) => {
        e.stopPropagation();
        onStatusChange(null, newStatusId, task.id);
        handleStatusMenuClose(); 
    };

    return (

        <TableRow hover 
            onClick={(e) => {
                e.stopPropagation();
                onClick(task);
            }}
            sx={{ 
                cursor: 'pointer',
                '&:hover .action-menu-trigger': { opacity: 1 },
                '& > *': { borderBottom: 'unset' } 
            }}
        >
            {/* '& > *' - Прибираємо лінію, якщо є підзадачі */}
            {/* Кнопка Статусу завдання  */}
            <TableCell padding="checkbox" sx={{ pl: 2 }}>
                <Tooltip title="Змінити статус">
                    <IconButton
                        size="small"
                        onClick={handleStatusMenuOpen}
                        sx={{ color: task.status === 'done' ? 'success.main' : 'action.disabled' }}
                    >
                        {task.status === 'done' ? <CheckCircleIcon /> : <CheckCircleOutlineOutlinedIcon />}
                    </IconButton>
                </Tooltip>

                {/* меню статусів */}
                <Menu
                    anchorEl={statusAnchor}
                    open={Boolean(statusAnchor)}
                    onClose={handleStatusMenuClose}
                    onClick={(e) => e.stopPropagation()} // Забороняємо кліку пробиватися до рядка
                    transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                    PaperProps={{ elevation: 3, sx: { minWidth: 150, borderRadius: 2, mt: 0.5 }}}
                >
                    {statuses.map((status) => (
                        <MenuItem 
                            key={status.id} 
                            selected={task.status === status.id}
                            onClick={(e) => handleStatusSelect(e, status.id)}
                            sx={{ py: 1 }}
                        >
                            <ListItemIcon sx={{ minWidth: 28 }}>
                                <CircleIcon sx={{ fontSize: 14, color: statusColors[status.id] || '#ccc' }} />
                            </ListItemIcon>
                            <ListItemText 
                                primary={status.label} 
                                primaryTypographyProps={{ variant: 'body2', fontWeight: task.status === status.id ? 'bold' : 'normal' }}
                            />
                        </MenuItem>
                    ))}
                </Menu>
            </TableCell>

            {/* 2. Назва, розгортання підзадач та нагадування */}
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                   
                    {level > 0 && <SubdirectoryArrowRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
                    
                    {isExpandable && (
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}>
                            {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                        </IconButton>
                    )}
                    
                    <Typography variant="body2" fontWeight={level === 0 ? 600 : 400} sx={{
                        textDecoration: task.status === 'done' ? 'line-through' : 'none',
                        color: task.status === 'done' ? 'text.secondary' : 'text.primary'
                    }}>
                        {task.title}
                    </Typography>

                    {task.subtasks?.length > 0 && (
                        <Chip label={task.subtasks.length} size="small" sx={{ height: 20, fontSize: '0.7rem' }} title="Кількість підзавдань"/>
                    )}

                    {/* Іконка нагадування */}
                    {task.reminder && task.status !== 'done' && (
                        <Tooltip title="Встановлено нагадування">
                            <NotificationsActiveIcon sx={{ fontSize: 16, color: '#ff00b7', ml: 1 }} />
                        </Tooltip>
                    )}

                </Box>
            </TableCell>

            {/* 3. Пріоритет */}
            <TableCell sx={{ width: '155px' }}>
                {priority && (
                    <Tooltip title={priority.label}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FlagIcon sx={{ fontSize: 16, color: priorityColors[task.priority] }} />
                            <Typography variant="caption" color="text.secondary">{priority.label}</Typography>
                        </Box>
                    </Tooltip>
                )}
            </TableCell>

            {/* 4. Виконавці */}
            <TableCell sx={{ width: '150px' }}>
                {task.assignees && task.assignees.length > 0 ? (
                    <AvatarGroup 
                        max={3} 
                        sx={{ 
                            '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.7rem' }, 
                            justifyContent: 'flex-end' 
                        }}
                    >
                        {task.assignees.map(user => (
                            <Tooltip key={user.id} title={user.full_name || user.name}>
                                <Avatar src={user.avatar_url}>
                                    {user.full_name?.charAt(0)}
                                </Avatar>
                            </Tooltip>
                        ))}
                    </AvatarGroup>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Typography variant="caption" color="text.disabled"></Typography>
                    </Box>
                )}
            </TableCell>
            
            {/* 5. прогрес */}
            <TableCell sx={{ width: '150px'}}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={task.progress} 
                            color={task.progress === 100 ? "success" : "primary"}
                            sx={{ height: 6, borderRadius: 3 }}
                        />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                        <Typography variant="caption" color="text.secondary">{`${task.progress}%`}</Typography>
                    </Box>
                </Box>
            </TableCell>

            {/* 6. Дедлайн / Дата */}
            <TableCell sx={{ width: '130px'}}>
                <Typography variant="body2" color={task.status === 'done' ? 'success.main' : 'text.secondary'} sx={{ fontSize: '0.8rem' }}>
                    {task.status === 'done' && task.completed_at
                        ? `Виконано ${new Date(task.completed_at).toLocaleDateString('uk-UA')}`
                        : task.date_end ? new Date(task.date_end).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }) : '—'
                    }
                </Typography>
            </TableCell>

            {/* 7. Опції */}
            <TableCell align="right" sx={{ width: '50px' }}>
                <ActionMenu
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </TableCell>
        </TableRow>
    );
};