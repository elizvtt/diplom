import React, { useState } from 'react';
import TaskCard from '@/Components/Tasks/TaskCard';
import { statusColors } from '@/utils/constants';
import { Box, Paper, Typography } from '@mui/material';

export default function KanbanBoard({ tasks, statuses, priorities, reminders, onDragStart, onDragOver, onDrop }) {

    const [openedSubtasks, setOpenedSubtasks] = useState({});

    const toggleSubtasks = (taskId) => {
        setOpenedSubtasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    // Формуємо колонки на основі статусів з бекенду
    const kanbanColumns = statuses.map(s => ({
        id: s.id,
        title: s.label,
        color: statusColors[s.id] || '#ccc'
    }));

    console.log('tasks: ', tasks);
    

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
                '&::-webkit-scrollbar': { height: '8px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' },
            }}
        >
            {kanbanColumns.map((column) => (
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
                    <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                        {column.title}
                    </Typography>

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
                                    task={task}
                                    priorities={priorities}
                                    openedSubtasks={openedSubtasks}
                                    toggleSubtasks={toggleSubtasks}
                                    onDragStart={onDragStart}
                                    onDrop={onDrop}
                                    // onTaskComplete={onTaskComplete}
                                />
                        ))}
                    </Box>
                </Paper>
            ))}
        </Box>
    );
}