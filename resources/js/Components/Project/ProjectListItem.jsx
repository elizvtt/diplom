import React, { useState, useMemo, useEffect } from 'react';
import ProjectProgressBar from '@/Components/Project/ProjectProgressBar';

import {
    Box, Card, CardActionArea, Link, Typography, Chip, 
} from '@mui/material';

import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

export default function ProjectListItem({ project }) {
    return (
        <Card 
            key={project.id}
            sx={{ 
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 4 }
            }}
        >
            <CardActionArea 
                component={Link} 
                href={`/projects/${project.uuid}`}
                // вміст горизонтальним на ПК, і вертикальним на мобільних
                sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    p: 2, 
                    gap: 3,
                    alignItems: { xs: 'flex-start', sm: 'center' } 
                }}
            >
                {/* Статус, Назва, Опис */}
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                            {project.title}
                        </Typography>
                        <Chip 
                            label={project.is_active ? 'Активний' : 'В архіві'} 
                            color={project.is_active ? 'success' : 'default'} 
                            size="small" 
                            variant="outlined"
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {project.description?.html || "Опис відсутній"}
                    </Typography>
                </Box>

                {/* Роль */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '120px' }}>
                    {project.is_owner ? (
                        <ManageAccountsIcon fontSize="medium" color="action" />
                    ) : (
                        <PeopleAltIcon fontSize="medium" color="action" />
                    )}
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        {project.is_owner ? 'Власник' : 'Учасник'}
                    </Typography>
                </Box>

                {/* Прогрес */}
                <Box sx={{ width: { xs: '100%', sm: '200px' } }}>
                    <ProjectProgressBar
                        completed={project.tasks_completed}
                        total={project.tasks_total}
                    />
                </Box>

            </CardActionArea>
        </Card>
    )
}
