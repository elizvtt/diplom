import React, { useState } from 'react';
import { priorityColors, statusColors } from '@/utils/constants';
import {
    Box, Table, TableBody, TableCell, TableRow,
    IconButton, Typography, Avatar, AvatarGroup,
    Tooltip, Chip, Collapse, LinearProgress,
    Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';

import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CircleIcon from '@mui/icons-material/Circle';


export default function TaskListItem({ task, statuses, priorities, onStatusChange }) {
    const [subtasksOpen, setSubtasksOpen] = useState(false);
    const priority = priorities.find(p => p.id === task.priority);

    // Стейт для меню статусів
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    // Відкриття меню
    const handleMenuClick = (event) => {
        event.stopPropagation(); // Щоб рядок не реагував на клік
        setAnchorEl(event.currentTarget);
    };

    // Закриття меню
    const handleMenuClose = (event) => {
        event?.stopPropagation();
        setAnchorEl(null);
    };

    // Вибір нового статусу
    const handleStatusSelect = (event, newStatusId) => {
        event.stopPropagation();
        onStatusChange(null, newStatusId, task.id); // Відправляємо запит на сервер
        handleMenuClose(); // Закриваємо меню
    };

    return (
        <React.Fragment>
            <TableRow hover sx={{ cursor: 'pointer', '&:hover .task-options': { opacity: 1 }, '& > *': { borderBottom: 'unset' } }} >
                {/* '& > *' - Прибираємо лінію, якщо є підзадачі */}
                {/* Кнопка Статусу завдання  */}
                <TableCell padding="checkbox" sx={{ pl: 2 }}>
                    <Tooltip title="Змінити статус">
                        <IconButton
                            size="small"
                            onClick={handleMenuClick}
                            sx={{ color: task.status === 'done' ? 'success.main' : 'action.disabled' }}
                        >
                            {task.status === 'done' ? <CheckCircleIcon /> : <CheckCircleOutlineOutlinedIcon />}
                        </IconButton>
                    </Tooltip>

                    {/* меню статусів */}
                    <Menu
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleMenuClose}
                        onClick={(e) => e.stopPropagation()} // Забороняємо кліку пробиватися до рядка
                        PaperProps={{
                            elevation: 3,
                            sx: { minWidth: 150, borderRadius: 2, mt: 0.5 }
                        }}
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
                    <IconButton className="task-options" size="small" sx={{ opacity: 0, transition: '0.2s' }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </TableCell>
            </TableRow>

            {/* РЯДОК ДЛЯ ПІДЗАДАЧ (Collapse) */}
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