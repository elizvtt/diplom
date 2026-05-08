import React, { useState } from 'react';
import TaskListItem from '@/Components/Tasks/TaskListItem';
import { statusColors } from '@/utils/constants';

import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function ListView({ tasks, statuses, priorities, onDrop }) {
    const [collapsedGroups, setCollapsedGroups] = useState({});

    const toggleGroup = (statusId) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [statusId]: !prev[statusId]
        }));
    };

    return (
        <TableContainer 
            component={Paper} 
            elevation={0} 
            variant="outlined" 
            sx={{ 
                maxHeight: '65vh', 
                borderRadius: 2, 
                '&::-webkit-scrollbar': { width: '8px', height: '8px' }, 
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' } 
            }}
        >
            <Table stickyHeader size="medium">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ bgcolor: '#f8fafc', width: '50px' }}></TableCell>
                        <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold' }}>Назва завдання</TableCell>
                        <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', width: '150px' }}>Пріоритет</TableCell>
                        <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', width: '150px' }}>Виконавці</TableCell>
                        <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', width: '150px' }}>Прогрес</TableCell>
                        <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', width: '150px' }}>Дедлайн</TableCell>
                        <TableCell sx={{ bgcolor: '#f8fafc', width: '60px' }}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    
                    {/* Групуємо завдання по статусах */}
                    {statuses.map(status => {
                        const statusTasks = tasks.filter(t => t.status === status.id);
                        
                        // Якщо в цьому статусі немає завдань, не виводимо заголовок групи
                        if (statusTasks.length === 0) return null;

                        const isCollapsed = collapsedGroups[status.id];

                        return (
                            <React.Fragment key={status.id}>
                                {/* Рядок-розділювач для статусу */}
                                <TableRow
                                    onClick={() => toggleGroup(status.id)}
                                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#e2e8f0' }, transition: '0.2s' }}
                                >
                                    <TableCell colSpan={7} sx={{ bgcolor: '#f1f5f9', py: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconButton size="small" sx={{ p: 0.5 }}>
                                                {isCollapsed ? <KeyboardArrowRightIcon fontSize="small"/> : <KeyboardArrowDownIcon fontSize="small" />}
                                            </IconButton>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: statusColors[status.id] || '#94a3b8' }} />
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {status.label}
                                            </Typography>
                                            <Chip label={statusTasks.length} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                        </Box>
                                    </TableCell>
                                </TableRow>

                                {/* Виводимо завдання цього статусу через новий компонент */}
                                {!isCollapsed && statusTasks.map(task => (
                                    <TaskListItem 
                                        task={task} 
                                        priorities={priorities}
                                        statuses={statuses}
                                        onStatusChange={onDrop} 
                                    />
                                ))}
                            </React.Fragment>
                        );
                    })}

                </TableBody>
            </Table>
        </TableContainer>
    );
}