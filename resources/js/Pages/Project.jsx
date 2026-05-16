import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import CreateTaskModal from '@/Components/Tasks/CreateTaskModal';
import TaskView from '@/Components/Tasks/TaskView';

import KanbanBoard from '@/Components/Project/KanbanBoard';
import ListView from '@/Components/Project/ListView';
import CalendarView from '@/Components/Project/CalendarView';
import useLocalStorage from '@/hooks/useLocalStorage';

import { Box, Typography, Button, Tabs, Tab, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ProjectView({ project, teamMembers, statuses, priorities, reminders }) {

    const [backUrl, setBackUrl] = useState('/'); // Стейт для зберігання шляху повернення

    // Використовуємо хук для зберігання ВСІХ вкладок проектів
    const [allTabs, setAllTabs] = useLocalStorage('activeProjectTabs', {});

    // Визначаємо поточну вкладку для цього конкретного проекту
    const currentTab = allTabs[project.uuid] || 'kanban';
   
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); // Стейт для модального вікна
    const [tasks, setTasks] = useState(project.tasks || []);
    const { flash } = usePage().props; // Отримуємо flash повідомлення

    // Стейтів у ProjectView для деталей завдання
    const [selectedTask, setSelectedTask] = useState(null); // Яке завдання відкрите
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Окремий стейт для деталей

    // ID батьківського завдання (ДЛЯ ПІДЗАДАЧ)
    const [parentTaskIdForNew, setParentTaskIdForNew] = useState(null);

    // Слідкуємо за змінами в project.tasks, які приходять від сервера
    useEffect(() => {
        setTasks(project.tasks);
    }, [project.tasks]); // Як тільки пропси оновляться, стейт синхронізується

    useEffect(() => {
        // Читаємо GET-параметри з поточного URL
        const params = new URLSearchParams(window.location.search);
        const taskIdFromUrl = params.get('task_id');

        // Якщо в URL є task_id і завдання вже завантажені
        if (taskIdFromUrl && tasks.length > 0) {
            // Спочатку шукаємо серед головних завдань
            let taskToOpen = tasks.find(t => t.id === parseInt(taskIdFromUrl));

            // Якщо не знайшли, шукаємо серед підзадач
            if (!taskToOpen) {
                for (const task of tasks) {
                    if (task.subtasks && task.subtasks.length > 0) {
                        const foundSub = task.subtasks.find(s => s.id === parseInt(taskIdFromUrl));
                        if (foundSub) {
                            taskToOpen = foundSub;
                            break;
                        }
                    }
                }
            }

            // Якщо завдання знайдено - відкриваємо його
            if (taskToOpen) {
                console.log("Відкриття завдання з URL:", taskToOpen.id);
                setSelectedTask(taskToOpen);
                setIsDetailsModalOpen(true);

                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [tasks]);

    const handleTabChange = (event, newValue) => {
        setAllTabs({
            ...allTabs,
            [project.uuid]: newValue
        });
    };
    
    // МОДАЛЬНЕ ВІКНО СТВОРЕННЯ
    const handleOpenCreateModal = (parentId = null) => {
        setParentTaskIdForNew(parentId); // Зберігаємо ID батька
        setIsTaskModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsTaskModalOpen(false);
        setParentTaskIdForNew(null); // Очищаємо стейт після закриття
    };

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
        router.post('/tasks/status/update', {
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
        console.log("Родитель получил задачу для отображения:", task.id);
        setSelectedTask(task);
        setIsDetailsModalOpen(true);
    };

    // Функція для миттєвого видалення завдання з локального стейту
    const handleDeleteTask = (taskId) => {
        // Прибираємо завдання з масиву
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        
        // Якщо видалене завдання було відкрите у модалці - закриваємо її
        if (selectedTask && selectedTask.id === taskId) {
            setIsDetailsModalOpen(false);
            setSelectedTask(null);
        }
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
                    <Box sx={{ display: 'flex' }}>
                        <IconButton
                            title='Повернутися'
                            component={Link}
                            href={backUrl}
                            sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1, width: '40px', height: '40px' }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4" fontWeight="bold">
                            {project.title}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            title='Оцінювання внеску студентів'
                            startIcon={<AssignmentTurnedInIcon />}
                            component={Link}
                            href={`/projects/${project.uuid}/grades`}
                            sx={{ color: '#f7a4e6'}}
                        >
                            Оцінювання
                        </Button>
                        <Button
                            variant="outlined"
                            color='secondary'
                            startIcon={<GroupIcon />}
                            component={Link}
                            href={`/projects/${project.uuid}/team`}
                        >
                            Команда
                        </Button>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenCreateModal(null)}>
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
                        onDeleteTask={handleDeleteTask}
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
                        onDeleteTask={handleDeleteTask}
                    />
                )}

                {currentTab === 'calendar' && (
                    <CalendarView 
                        tasks={tasks}
                        statuses={statuses}
                        priorities={priorities}
                        reminders={reminders}
                        onTaskClick={handleTaskClick}
                        onDeleteTask={handleDeleteTask}
                    />
                )}
            </Box>
            

            {/* МОДАЛКА СТВОРЕННЯ НОВОГО ЗАВДАННЯ АБО ПІДЗАДАЧІ */}
            <CreateTaskModal 
                open={isTaskModalOpen} 
                onClose={handleCloseCreateModal}
                parentTaskId={parentTaskIdForNew}
                project={project}
                teamMembers={teamMembers}
                statuses={statuses}
                priorities={priorities}
                reminders={reminders}
            />

            <TaskView
                task={selectedTask}
                project={project}
                teamMembers={teamMembers} 
                reminders={reminders}    
                priorities={priorities}
                statuses={statuses}
                open={isDetailsModalOpen} 
                onClose={() => setIsDetailsModalOpen(false)} 
                onStatusChange={handleDrop}
                onAddSubtask={() => handleOpenCreateModal(selectedTask?.id)} // ЗМІНЕНО: прокидаємо функцію відкриття підзадачі
            />

        </AuthenticatedLayout>
    );
}