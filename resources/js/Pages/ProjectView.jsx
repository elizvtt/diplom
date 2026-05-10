import React, { useState, useEffect } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import CreateTaskModal from '@/Components/Tasks/CreateTaskModal';
import TaskView from '@/Components/Tasks/TaskView';

import KanbanBoard from '@/Components/Project/KanbanBoard';
import ListView from '@/Components/Project/ListView';
import CalendarView from '@/Components/Project/CalendarView';

import useLocalStorage from '@/hooks/useLocalStorage';

import { Box, Button, Tab, Tabs, Typography, Snackbar, Alert } from '@mui/material';

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
   
    // console.log('[ProjectView] project:', project)
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); // Стейт для модального вікна
    const [tasks, setTasks] = useState(project.tasks || []);
    const { flash } = usePage().props; // Отримуємо flash повідомлення

    // Додай до стейтів у ProjectView
    const [selectedTask, setSelectedTask] = useState(null); // Яке завдання відкрите
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Окремий стейт для деталей

    // Слідкуємо за змінами в project.tasks, які приходять від сервера
    useEffect(() => {
        setTasks(project.tasks);
    }, [project.tasks]); // Як тільки пропси оновляться, стейт синхронізується


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

    // Функція для відкриття модалки з даними завдання
    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsDetailsModalOpen(true);
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
                        <Button
                            variant="outlined"
                            color='secondary'
                            startIcon={<GroupIcon />}
                            component={Link}
                            href={`/projects/${project.uuid}/team`}
                        >
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
                        onTaskClick={handleTaskClick}
                    />
                )}

                {currentTab === 'list' && (
                    <ListView
                        tasks={tasks}
                        statuses={statuses}
                        priorities={priorities}
                        reminders={reminders}
                        onDrop={handleDrop}
                        onTaskClick={handleTaskClick}
                    />
                )}

                {currentTab === 'calendar' && (
                    <CalendarView 
                        tasks={tasks}
                        statuses={statuses}
                        priorities={priorities}
                        reminders={reminders}
                        onTaskClick={handleTaskClick}
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

            <TaskView
                // task={selectedTask}
                task={project.tasks.find(t => t.id === selectedTask?.id)}
                project={project}
                teamMembers={teamMembers} 
                reminders={reminders}    
                priorities={priorities}
                statuses={statuses}
                open={isDetailsModalOpen} 
                onClose={() => setIsDetailsModalOpen(false)} 
                onStatusChange={handleDrop}
            />

        </AuthenticatedLayout>
    );
}