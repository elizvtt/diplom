import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

import { Grid, Paper, Typography, Box } from '@mui/material';

import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';

import AssignmentIcon from '@mui/icons-material/Assignment';
import BugReportIcon from '@mui/icons-material/BugReport';

export default function AdminAnalytics({ stats }) {
    console.log('stats: ', stats);
    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}
            >
                <Box 
                    sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', // Створює 3 колонки однакової ширини
                        gap: 2, // Відступи між картками
                        width: '70%'
                    }}
                >
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <PeopleIcon color="secondary" />
                            <Typography color="text.secondary">Користувачі</Typography>
                        </Box>
                        <Typography variant="h3" fontWeight="bold">{stats.users.total}</Typography>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <FolderIcon color="secondary" />
                            <Typography color="text.secondary">Проєкти</Typography>
                        </Box>
                        <Typography variant="h3" fontWeight="bold">{stats.projects.active}</Typography>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <AssignmentIcon color="secondary" />
                            <Typography color="text.secondary">Завдання</Typography>
                        </Box>
                        <Typography variant="h3" fontWeight="bold">{stats.tasks.total}</Typography>
                    </Paper>

                    {/* РЯД 2 */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography color="text.secondary" sx={{ mb: 1 }}>Активність сьогодні</Typography>
                        <Typography variant="h3" fontWeight="bold">
                            {stats.users.new_today}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            нових користувачів
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <BugReportIcon color="secondary" />
                            <Typography color="text.secondary">Проблеми</Typography>
                        </Box>
                        <Typography variant="h3" fontWeight="bold" color="error.main">
                            {stats.tasks.overdue}
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography color="text.secondary">Стан системи</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h3" fontWeight="bold" color="secondary">OK</Typography>
                        </Box>
                    </Paper>
                </Box>

            </Box>
        </>
    );
}
