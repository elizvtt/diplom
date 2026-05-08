import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import CreateTaskModal from '@/Components/Tasks/CreateTaskModal';
import KanbanBoard from '@/Components/Project/KanbanBoard';
import ListView from '@/Components/Project/ListView';
import CalendarView from '@/Components/Project/CalendarView';

import useLocalStorage from '@/hooks/useLocalStorage';

import { 
    Box, Button, Tab, Tabs, Typography, Snackbar, Alert,
} from '@mui/material';

import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';

import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';


export default function ProjectView({ project, teamMembers, statuses, priorities, reminders }) {

    // Використовуємо хук для зберігання ВСІХ вкладок проектів
    const [allTabs, setAllTabs] = useLocalStorage('activeProjectTabs', {});

    // Визначаємо поточну вкладку для цього конкретного проекту
    const currentTab = allTabs[project.uuid] || 'kanban';
   
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
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return; // Не закриваємо, якщо просто клікнули десь на фоні
        setSnackbar({ ...snackbar, open: false });
    };

    const handleTabChange = (event, newValue) => {
        setAllTabs({
            ...allTabs,
            [project.uuid]: newValue
        });
    };
    
    const handleOpenModal = () => setIsTaskModalOpen(true); // Відкриття модалки

    // Коли починаємо тягнути картку, запам'ятовуємо її ID
    const handleDragStart = (e, taskId) => e.dataTransfer.setData('taskId', taskId);

    // Дозволяємо кидати елементи в цю зону
    const handleDragOver = (e) => e.preventDefault();

    // Коли відпускаємо картку над колонкою
    const handleDrop = (e, newStatus, manualId = null) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        // Якщо прийшов manualId (від кнопки), беремо його, інакше з DragEvent
        const taskId = manualId || e.dataTransfer.getData('taskId');

        setTasks(prev => prev.map(t => t.id == taskId ? { ...t, status: newStatus } : t));

        // Запит до БД
        router.post('/tasks/update-status', {
            id: taskId,
            status: newStatus
        }, {
            preserveScroll: true,
            onSuccess: () => console.log('Успішно оновлено в БД'),
            onError: (errors) => {
                console.error('Помилка валідації:', errors);
                router.reload();
            }
        });
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
                    <Tab 
                        icon={<ViewKanbanIcon />} 
                        iconPosition="start" 
                        label="Kanban" 
                        value="kanban" 
                    />
                    <Tab 
                        icon={<ListAltIcon />} 
                        iconPosition="start" 
                        label="List" 
                        value="list" 
                    />
                    <Tab 
                        icon={<CalendarMonthIcon />} 
                        iconPosition="start" 
                        label="Calendar" 
                        value="calendar" 
                    />
                </Tabs>         
            </Box>
            {/* Перемикач контенту */}
            <Box sx={{ mt: 2 }}>
                {currentTab === 'kanban' && (
                    <KanbanBoard 
                        tasks={tasks}
                        statuses={statuses}
                        priorities={priorities}
                        reminders={reminders}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                )}

                {currentTab === 'list' && (
                    <ListView
                        tasks={tasks}
                        statuses={statuses}
                        priorities={priorities}
                        reminders={reminders}
                        onDrop={handleDrop}
                    />
                )}

                {currentTab === 'calendar' && (
                    <CalendarView 
                        tasks={tasks}
                        statuses={statuses}
                        priorities={priorities}
                        reminders={reminders}
                        // onDrop={handleDrop}
                    />
                )}
            </Box>
            

            {/* МОДАЛКА СОЗДАНИЯ НОВОГО ЗАДАНИЯ */}
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