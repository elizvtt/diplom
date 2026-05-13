import React, { useState } from 'react';
import { Head } from '@inertiajs/react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import ProjectCard from '@/Components/Project/ProjectCard';
import ProjectListItem from '@/Components/Project/ProjectListItem';
import CreateProjectModal from '@/Components/Project/CreateProjectModal';
import ProjectToolbar from '@/Components/Project/ProjectToolbar';

import useLocalStorage from '@/hooks/useLocalStorage';
import useProcessedProjects from '@/hooks/useProcessedProjects';

import { Box, Grid, Paper } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

export default function ProjectsList({ projects }) {
    // console.log('[ProjectsList] projects: ', projects);

    // Стейт для всех настроек
    const [settings, setSettings] = useLocalStorage('project_list', {
        view: 'module',
        sortBy: 'newest',
        filterStatus: 'all',
        filterRole: 'all'
    });

    const { view, sortBy, filterStatus, filterRole } = settings; // деструктуризация

    const processedProjects = useProcessedProjects(
        projects,
        sortBy,
        filterStatus,
        filterRole
    );

    // модальное окно для создания проєкта
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Стейти для відкриття випадаючих меню
    const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
    const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
    

    // ^ Handlers
    // Обробники фільтрів та відображення
    const setView = (newView) => setSettings(prev => ({ ...prev, view: newView }));
    
    const setSortBy = (newSort) => 
        setSettings(prev => ({ ...prev, sortBy: newSort }));
    
    const setFilterStatus = (newStatus) => 
        setSettings(prev => ({ ...prev, filterStatus: newStatus }));

    const setFilterRole = (newRole) => 
        setSettings(prev => ({ ...prev, filterRole: newRole }));
    
    const handleChange = (event, nextView) => { if (nextView !== null) setView(nextView); };
    
    // Функція очищення всіх фільтрів
    const handleClearAll = () => {
        setSettings({
            view: 'module',
            sortBy: 'newest',
            filterStatus: 'all',
            filterRole: 'all'
        });
    };

    // обработчики ui    
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = (event, reason) => {
        if (reason && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
        setIsModalOpen(false);
    };
    
    return (
        <AuthenticatedLayout>
            <Head title="Проєкти" />

            {/* Header */}
            <ProjectToolbar
                view={view}
                sortBy={sortBy}
                filterStatus={filterStatus}
                filterRole={filterRole}

                setView={setView}
                setSortBy={setSortBy}
                setFilterStatus={setFilterStatus}
                setFilterRole={setFilterRole}

                handleChange={handleChange}
                handleClearAll={handleClearAll}
                handleOpenModal={handleOpenModal}

                filterMenuAnchor={filterMenuAnchor}
                setFilterMenuAnchor={setFilterMenuAnchor}

                sortMenuAnchor={sortMenuAnchor}
                setSortMenuAnchor={setSortMenuAnchor}
            />

                
            {/* ПРОЭКТЫ */}
            <Box>
                {processedProjects.length === 0 ? (
                    // EMPTY state
                    <Paper
                        sx={{ 
                        p: 8, 
                            textAlign: 'center', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            bgcolor: 'rgba(0,0,0,0.02)',
                            borderRadius: 4,
                            border: '2px dashed #e0e0e0'
                        }}
                        elevation={0}
                    >
                        <FolderOpenIcon sx={{ fontSize: 80, color: '#bdbdbd', mb: 2 }} />
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Ви поки не маєте проєктів
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Створіть свій перший проєкт, щоб почати роботу з командою або відстежувати власні завдання.
                        </Typography>
                        <Button 
                            variant="contained" 
                            size="large" 
                            startIcon={<AddIcon />}
                            onClick={handleOpenModal}
                        >
                            Створити проєкт
                        </Button>
                    </Paper>
                ) : (
                    <Box>
                        {view === 'module' ? (
                            <Grid container spacing={3}>
                                {processedProjects.map((project) => (
                                    <Grid item key={project.id} xs={12} sm={6} md={4}>
                                    <ProjectCard project={project} />
                                    </Grid>
                                ))}
                            </Grid>

                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {processedProjects.map((project) => (
                                    <ProjectListItem 
                                        key={project.id}
                                        project={project}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

            {/* МОДУЛЬНЕ ВІКНО СТВОРЕННЯ ПРОЄКТУ */}
            <CreateProjectModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={(message, severity = 'success') => {
                    setSnackbar({
                        open: true,
                        message,
                        severity
                    });
                }}
            />

        </AuthenticatedLayout>
    );
}
