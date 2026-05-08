import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import AdminAnalytics from '@/Components/Admin/AdminAnalytics';
import AdminUsers from '@/Components/Admin/AdminUsers';
import AdminProjects from '@/Components/Admin/AdminProjects';
import AdminLogs from '@/Components/Admin/AdminLogs';
import AdminSettings from '@/Components/Admin/AdminSettings';

import {
    Container, Grid, Paper, Typography, Box,
    IconButton, Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Button, TextField, Tabs, Tab, Chip, LinearProgress,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';


function TabPanel({ children, value, index }) {
    return value === index && (
        <Box sx={{ mt: 3 }}>
            {children}
        </Box>
    );
}

export default function AdminPanel({
    stats,
    users = [],
    projects = [],
    logs = [],
}) {

    const [tab, setTab] = useState('analytics');

    return (
        <AuthenticatedLayout header={null}>
            <Head title="Адмін-панель" />

            <Container maxWidth="xl" sx={{ py: 4 }}>

                {/* HEADER */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 4,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            component={Link}
                            href="/"
                            sx={{ border: '1px solid #ccc' }}
                        >
                            <ArrowBackIcon />
                        </IconButton>

                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                Admin Panel
                            </Typography>
                        </Box>
                    </Box>

                    <Chip icon={<AdminPanelSettingsIcon />} label="Administrator" color="secondary"/>

                </Box>

                {/* TABS */}
                <Paper sx={{ borderRadius: 1, overflow: 'hidden' }}>
                    <Tabs
                        value={tab}
                        onChange={(e, value) => setTab(value)}
                        variant="fullWidth"
                    >
                        <Tab icon={<QueryStatsIcon />} value="analytics" label="Аналітика" />
                        <Tab icon={<PeopleAltIcon/>} value="users" label="Користувачі" />
                        <Tab icon={<AssignmentIcon/>} value="projects" label="Проєкти" />
                        <Tab icon={<HistoryIcon/>} value="logs" label="Логи" />
                        <Tab icon={<SettingsSuggestIcon/>} value="settings" label="Система" />
                    </Tabs>
                </Paper>

                {/* ANALYTICS */}
                <TabPanel value={tab} index='analytics'>
                    <AdminAnalytics stats={stats}/>
                </TabPanel>

                {/* USERS */}
                <TabPanel value={tab} index="users">
                    <AdminUsers users={users} />
                </TabPanel>

                {/* PROJECTS */}
                <TabPanel value={tab} index="projects">
                    <AdminProjects projects={projects}/>
                </TabPanel>

                {/* LOGS */}
                <TabPanel value={tab} index="logs">
                    <AdminLogs logs={logs} />
                </TabPanel>

                {/* SETTINGS */}
                <TabPanel value={tab} index="settings">
                    <AdminSettings />
                </TabPanel>
                

            </Container>
        </AuthenticatedLayout>
    );
}