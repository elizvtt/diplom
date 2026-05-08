import React from 'react';
import ProjectProgressBar from '@/Components/Project/ProjectProgressBar';


import {
    Box, Card, CardActionArea, CardContent,
    Link, Typography, Tooltip, Chip, 
} from '@mui/material';

import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';


export default function ProjectCard({ project }) {
    return (
        <Card
            sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 6,
                }
            }}
        >
            {/* CardActionArea делает карточку кликабельной ссылкой */}
            <CardActionArea 
                component={Link}
                href={`/projects/${project.uuid}`}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', height: '100%' }}
            >
                <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Box>
                        {/* СТАТУС ПРОЭКТА */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                            <Chip 
                                label={project.is_active ? 'Активний' : 'В архіві'} 
                                color={project.is_active ? 'success' : 'default'} 
                                size="small" 
                                variant="outlined"
                            />
                        </Box>

                        {/* НАЗВАНИЕ И ОПИСАНИЕ */}
                        <Typography variant="h6" component="div" gutterBottom>
                            {project.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {project.description || "Опис відсутній"}
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 'auto', width: '100%', pt: 2 }}>
                        {/* РОЛЬ ПОЛЬЗОВАТЕЛЯ */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 1 }}>
                            {project.is_owner ? (
                                <Tooltip title="Ви власник цього проєкту">
                                    <ManageAccountsIcon fontSize="medium" color="action" />
                                </Tooltip>
                            ) : (
                                <Tooltip title="Ви учасник цього проєкту">
                                    <PeopleAltIcon fontSize="medium" color="action" />
                                </Tooltip>
                            )}
                        </Box>

                        {/* ПРОГРЕСС БАР */}
                        <Box sx={{ width: '100%' }}>
                            <ProjectProgressBar
                                completed={project.tasks_completed}
                                total={project.tasks_total}
                            />
                        </Box>
                    </Box>

                </CardContent>
            </CardActionArea>
        </Card>

    )
}