import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { statusColors, priorityColors } from '@/utils/constants';

import { 
    TableRow, TableCell, IconButton, Tooltip, Menu, MenuItem, 
    ListItemIcon, ListItemText, Box, Typography, Chip, AvatarGroup, 
    Avatar, LinearProgress, Collapse, Table, TableBody 
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


export default function TaskListItem({ task, statuses, priorities, onStatusChange, onClick, onDeleteTask }) {
    const [subtasksOpen, setSubtasksOpen] = useState(false);
    const priority = priorities.find(p => p.id === task.priority);

    // Стейт для ГОЛОВНОГО меню
    const [optionsAnchor, setOptionsAnchor] = useState(null);
    
    // Стейт для МЕНЮ СТАТУСІВ
    const [statusAnchor, setStatusAnchor] = useState(null);

    // --- ОБРОБНИКИ МЕНЮ РЕДАГУВАННЯ/ВИДАЛЕННЯ
    const handleOptionsOpen = (e) => {
        e.stopPropagation();
        setOptionsAnchor(e.currentTarget);
    };

    const handleOptionsClose = (e) => {
        if (e) e.stopPropagation();
        setOptionsAnchor(null);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        handleOptionsClose();
        if (onClick) onClick(); 
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        handleOptionsClose();
        
        if (window.confirm('Ви впевнені, що хочете видалити це завдання?')) {
            router.post(`/tasks/${task.id}/delete`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    if (onDeleteTask) onDeleteTask(task.id);
                }
            });
        }
    };

    // --- ОБРОБНИКИ ДЛЯ СТАТУСУ (Зліва) ---
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
        <React.Fragment>
            <TableRow hover onClick={onClick} sx={{ cursor: 'pointer', '&:hover .task-options': { opacity: 1 }, '& > *': { borderBottom: 'unset' } }} >
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {task.subtasks_count > 0 && (
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSubtasksOpen(!subtasksOpen); }} sx={{ p: 0.5 }}>
                                {subtasksOpen ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                            </IconButton>
                        )}
                        <Typography variant="body2" fontWeight={task.status === 'done' ? 'normal' : '600'} 
                            sx={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'text.secondary' : 'text.primary' }}>
                            {task.title}
                        </Typography>

                        {/* Іконка нагадування біля назви */}
                        {task.reminder && task.status !== 'done' && (
                            <Tooltip title="Встановлено нагадування">
                                <NotificationsActiveIcon sx={{ fontSize: 16, color: '#ff00b7' }} />
                            </Tooltip>
                        )}

                        {task.subtasks_count > 0 && (
                            <Chip size="small" label={`${task.subtasks_count} підзадач`} sx={{ height: 16, fontSize: '0.65rem' }} />
                        )}
                    </Box>
                </TableCell>

                {/* 3. Пріоритет */}
                <TableCell>
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
                <TableCell>
                    <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.7rem' }, justifyContent: 'flex-end' }}>
                        {task.assignees?.map(user => (
                            <Tooltip key={user.id} title={user.full_name || user.name}>
                                <Avatar src={user.avatar_url}>{user.full_name?.charAt(0) || user.name?.charAt(0)}</Avatar>
                            </Tooltip>
                        ))}
                    </AvatarGroup>
                </TableCell>
                
                {/* 5. прогрес */}
                <TableCell>
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
                <TableCell>
                    <Typography variant="body2" color={task.status === 'done' ? 'success.main' : 'text.secondary'} sx={{ fontSize: '0.8rem' }}>
                        {task.status === 'done' && task.completed_at
                            ? `Виконано ${new Date(task.completed_at).toLocaleDateString('uk-UA')}`
                            : task.date_end ? new Date(task.date_end).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }) : '—'
                        }
                    </Typography>
                </TableCell>

                {/* 7. Опції */}
                <TableCell align="right" sx={{ pr: 2 }}>
                    <IconButton
                        className="task-options"
                        size="small"
                        onClick={handleOptionsOpen}
                        sx={{ opacity: 0, transition: '0.2s' }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu 
                        anchorEl={optionsAnchor}
                        open={Boolean(optionsAnchor)}
                        onClose={handleOptionsClose}
                        onClick={(e) => e.stopPropagation()} // Блокуємо кліки всередині меню
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            elevation: 3,
                            sx: { minWidth: 150, borderRadius: 2, mt: 0.5 }
                        }}
                    >
                        <MenuItem onClick={handleEdit}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Редагувати</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText>Видалити</ListItemText>
                        </MenuItem>
                    </Menu>
                </TableCell>
            </TableRow>

            {/* РЯДОК ДЛЯ ПІДЗАДАЧ */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0, border: 'none' }} colSpan={7}>
                    <Collapse in={subtasksOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, ml: 6 }}>
                            <Table size="small">
                                <TableBody>
                                    {task.subtasks?.map((sub) => (
                                        <TableRow key={sub.id} hover>
                                            <TableCell sx={{ border: 'none', width: '40px' }}>
                                                <SubdirectoryArrowRightIcon sx={{ color: 'action.disabled', fontSize: 16 }} />
                                            </TableCell>
                                            <TableCell sx={{ border: 'none' }}>
                                                <Typography variant="caption">{sub.title}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ border: 'none' }} align="right">
                                                <Chip size="small" label={sub.status} sx={{ height: 18, fontSize: '0.6rem' }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}