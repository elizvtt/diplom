import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateTaskModal from '@/Components/Project/CreateTaskModal';

import { 
    Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
    DialogContent, DialogTitle, FormControl, Grid,
    IconButton, InputLabel, MenuItem, Paper,
    Select, Tab, Tabs, TextField, Typography,
} from '@mui/material';

import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';

// колонки канбан доски
const KANBAN_COLUMNS = [
    { id: 'todo', title: 'To do', color: '#f48fb1' },
    { id: 'in_progress', title: 'In progress', color: '#ffb74d' },
    { id: 'completed', title: 'Completed', color: '#81c784' },
];

// Кольори для бейджів пріоритету
const priorityColors = {
    low: 'success',
    medium: 'warning',
    high: 'error'
};

export default function ProjectView({ project }) {
    const [currentTab, setCurrentTab] = useState(0);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); // Стейт для модального вікна

    const [tasks, setTasks] = useState([
        { id: 't1', title: 'Спроєктувати БД', description: 'Створити ER-діаграму для диплому', status: 'todo', priority: 'high' },
        { id: 't2', title: 'Налаштувати Laravel', description: 'Підключити Inertia та React', status: 'in_progress', priority: 'medium' },
        { id: 't3', title: 'Зверстати Header', description: 'Додати лого та меню', status: 'completed', priority: 'low' },
        { id: 't4', title: 'Зробити Drag and Drop', description: 'Реалізувати HTML5 API', status: 'todo', priority: 'medium' },
    ]);

    const handleTabChange = (event, newValue) => setCurrentTab(newValue);
    const handleOpenModal = () => setIsTaskModalOpen(true); // Відкриття модалки

    // Закриття модалки (з блокуванням кліку по фону)
    const handleCloseModal = (event, reason) => {
        // Якщо причина закриття - клік по сірому фону, ігноруємо
        if (reason === 'backdropClick') return;
        setIsTaskModalOpen(false);
    };

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
                {KANBAN_COLUMNS.map((column) => (
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
            />

        </AuthenticatedLayout>
    );
}