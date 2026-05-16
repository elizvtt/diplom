import React, { useState } from 'react';

import TaskCard from '@/Components/Tasks/TaskCard';
import { statusColors } from '@/utils/constants';

import { Box, Paper, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function KanbanBoard({ tasks, statuses, priorities, reminders, onDragStart, onDragOver, onDrop, onTaskClick, onDeleteTask }) {

    const [openedSubtasks, setOpenedSubtasks] = useState({});
    const [collapsedColumns, setCollapsedColumns] = useState({}); // стан для згорнутих колонок

    const toggleSubtasks = (taskId) => {
        setOpenedSubtasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    // Перемикач стану згортання колонки
    const toggleColumnCollapse = (columnId) => {
        setCollapsedColumns(prev => ({
            ...prev,
            [columnId]: !prev[columnId]
        }));
    };

    // Формуємо колонки на основі статусів з бекенду
    const kanbanColumns = statuses.map(s => ({
        id: s.id,
        title: s.label,
        color: statusColors[s.id] || '#ccc'
    }));

    // console.log('tasks: ', tasks);

    return (
        <Box
            sx={{
                maxWidth: '94vw',
                width: '100%',
                height: '61vh',
                overflowX: 'auto',
                display: 'flex',
                flexWrap: 'nowrap',
                gap: 2,
                pb: 1,
                alignItems: 'stretch',
                '&::-webkit-scrollbar': { height: '8px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' },
            }}
        >
            {kanbanColumns.map((column) => {
                const isCollapsed = !!collapsedColumns[column.id];
                const columnTasks = tasks.filter(task => task.status === column.id); // Рахуємо кількість задач у цій колонці

                // якщо колонка ЗГОРНУТА
                if (isCollapsed) {
                    return (
                        <Paper
                            key={column.id}
                            variant="outlined"
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, column.id)}
                            sx={{
                                p: 1,
                                width: '50px',
                                minWidth: '50px',
                                flexShrink: 0,
                                borderTop: `4px solid ${column.color}`,
                                backgroundColor: '#f1f5f9', 
                                borderRadius: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                gap: 2,
                                transition: 'all 0.2s ease-in-out',
                            }}
                        >
                            <IconButton 
                                size="small" 
                                onClick={() => toggleColumnCollapse(column.id)}
                                sx={{ color: 'text.secondary' }}
                            >
                                <ChevronRightIcon fontSize="small" />
                            </IconButton>

                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 700,
                                    color: 'text.secondary',
                                    whiteSpace: 'nowrap',
                                    writingMode: 'vertical-lr',
                                    transform: 'rotate(0deg)',
                                    textOrientation: 'mixed',
                                    userSelect: 'none',
                                    mt: 1,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '5px',

                                }}
                            >
                                {column.title} <Chip label={columnTasks.length} variant="outlined" size="small" sx={{ '& .MuiChip-label': { p: 0 } }} />
                            </Typography>
                        </Paper>
                    );
                }
                return (
                    <Paper
                        key={column.id}
                        variant="outlined"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, column.id)}
                        sx={{
                            p: 2,
                            width: '320px',
                            minWidth: '320px',
                            flexShrink: 0,
                            borderTop: `4px solid ${column.color}`,
                            backgroundColor: '#f8fafc',
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', pl: 1 }}>
                                {column.title}
                            </Typography>
                            
                            <Tooltip title="Згорнути колонку">
                                <IconButton 
                                    size="small" 
                                    onClick={() => toggleColumnCollapse(column.id)}
                                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    <ChevronLeftIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        {/* <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                            {column.title}
                        </Typography> */}

                        <Box 
                            sx={{ 
                                flexGrow: 1, 
                                overflowY: 'auto', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: 2,
                                p: 0.5,
                                '&::-webkit-scrollbar': { width: '4px' },
                                '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: '4px' },
                            }}
                        >
                            {tasks
                                .filter(task => task.status === column.id)
                                .map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        priorities={priorities}
                                        openedSubtasks={openedSubtasks}
                                        toggleSubtasks={toggleSubtasks}
                                        onDragStart={onDragStart}
                                        onDrop={onDrop}
                                        onClick={onTaskClick}
                                        onDeleteTask={onDeleteTask}
                                    />
                            ))}
                        </Box>
                    </Paper>
                );
            })}
        </Box>
    );
}