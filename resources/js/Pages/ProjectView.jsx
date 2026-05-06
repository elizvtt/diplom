import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateTaskModal from '@/Components/Project/CreateTaskModal';

import { 
    Box, Button, Card, CardContent, Chip,
    Paper, Tab, Tabs, Typography, Snackbar, Alert,
} from '@mui/material';

import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';

// const KANBAN_COLUMNS = [
//     { id: 'todo', title: 'To do', color: '#f48fb1' },
//     { id: 'in_progress', title: 'In progress', color: '#ffb74d' },
//     { id: 'completed', title: 'Completed', color: '#81c784' },
// ];

// // Кольори для бейджів пріоритету
// const priorityColors = {
//     low: 'success',
//     medium: 'warning',
//     high: 'error'
// };

// Словник кольорів
const statusColors = {
    backlog: '#94a3b8',
    todo: '#f48fb1',
    in_progress: '#ffb74d',
    review: '#4fc3f7',
    done: '#81c784'
};


export default function ProjectView({ project, teamMembers, statuses, priorities, reminders }) {
    const kanbanColumns = statuses.map(s => ({
        id: s.id,
        title: s.label,
        color: statusColors[s.id] || '#ccc'
    }));

    const [currentTab, setCurrentTab] = useState(0);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); // Стейт для модального вікна

    const [tasks, setTasks] = useState(project.tasks || []);
    const { flash } = usePage().props; // Отримуємо flash повідомлення

    // Слідкуємо за змінами в project.tasks, які приходять від сервера
    useEffect(() => {
        setTasks(project.tasks);
    }, [project.tasks]); // Як тільки пропси оновляться, стейт синхронізується

    useEffect(() => {
        const msg = flash?.success || flash?.error;
        const severity = flash?.success ? 'success' : 'error';

        if (msg) {
            setSnackbar({
                open: true,
                message: msg,
                severity: severity
            });
        }
    }, [flash]); // Спрацює кожного разу, коли з бекенду прийде flash

    // Стейт для керування Снекбаром
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' // 'success', 'error', 'warning', 'info'
    });

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return; // Не закриваємо, якщо просто клікнули десь на фоні
        setSnackbar({ ...snackbar, open: false });
    };

    const handleTabChange = (event, newValue) => setCurrentTab(newValue);
    const handleOpenModal = () => setIsTaskModalOpen(true); // Відкриття модалки

    // Коли починаємо тягнути картку, запам'ятовуємо її ID
    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    // Дозволяємо кидати елементи в цю зону (обов'язково для HTML5 D&D)
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Коли відпускаємо картку над колонкою
    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        const draggedTaskId = e.dataTransfer.getData('taskId');

        // Оновлюємо статус завдання в стейті
        setTasks((prevTasks) => 
            prevTasks.map((task) => 
                task.id === draggedTaskId ? { ...task, status: newStatus } : task
            )
        );

        // TODO: У майбутньому тут буде axios.patch() для збереження нового статусу в БД
        // axios.patch(`/tasks/${draggedTaskId}/status`, { status: newStatus });
    };


    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Project
                </h2>
            }
        >
            <Box sx={{ p: 3, pb: 0 }}>
                <Head title={project.title} />

                {/* Хедер сторінки */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        {project.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" color='secondary' startIcon={<GroupIcon />}>
                            Команда
                        </Button>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
                            Завдання
                        </Button>
                    </Box>
                </Box>

                {/* Вкладки */}
                <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="Active" />
                    <Tab label="Tab 2" />
                    <Tab label="Tab 3" />
                </Tabs>                   
            </Box>

            {/* Канбан доска   */}
            <Box
                sx={{
                    maxWidth: '92vw',
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
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                        sx={{
                            p: 2,
                            width: '350px',
                            minWidth: '350px',
                            flexShrink: 0,
                            borderTop: `4px solid ${column.color}`,
                            backgroundColor: '#f8fafc',
                        }}
                    >
                        <Typography variant="h6" align="center" gutterBottom fontWeight="bold" color="text.secondary">
                            {column.title}
                        </Typography>
                        
                        {/* котейнер для карточек */}
                        <Box 
                            sx={{ 
                                flexGrow: 1, 
                                overflowY: 'auto', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: 2,
                                height: '90%',
                                p: 1,

                                '&::-webkit-scrollbar': { width: '4px' },
                                '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: '4px' },
                            }}
                        >
                            {tasks
                                .filter(task => task.status === column.id)
                                .map(task => (
                                    <Card 
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        sx={{ 
                                            cursor: 'grab', 
                                            '&:active': { cursor: 'grabbing' },
                                            boxShadow: 1,
                                            '&:hover': { boxShadow: 3 },
                                            borderRadius: 2,
                                            flexShrink: 0 
                                        }}
                                    >
                                        <CardContent sx={{ pb: '16px !important' }}>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                                {task.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {task.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Chip 
                                                    label={task.priority.toUpperCase()} 
                                                    size="small" 
                                                    color={priorityColors[task.priority]} 
                                                    variant="outlined"
                                                    sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                        </Box>
                    </Paper>
                ))}
            </Box>

            <CreateTaskModal 
                open={isTaskModalOpen} 
                onClose={() => setIsTaskModalOpen(false)} 
                project={project}
                teamMembers={teamMembers}
                statuses={statuses}
                priorities={priorities}
                reminders={reminders}
            />

            
            {/* Спливаюче повідомлення */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={snackbar.severity === 'warning' ? 7000 : 4000} // Попередження висить трохи довше
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </AuthenticatedLayout>
    );
}