import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MemberRow from '@/Components/Team/MemberRow';

import {
    Container, Typography, Box, Paper,
    TextField, Button, IconButton, Tooltip,
    Snackbar, Alert
} from '@mui/material';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

export default function Team({ project, invite_link }) {
    // Створюємо стейт для email
    const [searchEmail, setSearchEmail] = useState('');
    
    const [foundUser, setFoundUser] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [anchorEl, setAnchorEl] = useState(null); // Для прив'язки списку до інпуту
    const [copySnackbarOpen, setCopySnackbarOpen] = useState(false); // Додай цей стейт угорі

    // Функція для перевірки, чи є введений текст
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchEmail);
    const isSearchDisabled = !isEmailValid;

    const handleSearch = async () => {
        setAnchorEl(event.currentTarget); // Запам'ятовуємо інпут як ціль для випадання
        setSearchLoading(true);
        try {
            const response = await fetch(
                route('projects.invitations.search', project.uuid),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document
                            .querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ email: searchEmail }),
                }
            );
    
            const data = await response.json();
    
            setFoundUser(data.found ? data.user : null);

        } finally {
            setSearchLoading(false);
        }
    };

    const handleInvite = async () => {
        router.post(route('projects.invitations.store', project.uuid), {
            email: foundUser.email,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setFoundUser(null);
                setSearchEmail('');
            },
            onError: (errors) => {
                console.error(errors);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Команда - ${project.title}`} />

                <Box
                    sx={{ 
                        width: '100%',
                        maxWidth: { xs: '100%', sm: '700px', md: '900px',},
                        mx: 'auto',
                        px: { xs: 1, sm: 2, md: 3},
                        py: 4
                    }}
                >

                {/* Заголовок з кнопкою назад */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <IconButton component={Link} href={route('projects.show', project.uuid)}>
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold">
                        Команда проєкту "{project.title}"
                    </Typography>
                </Box>

                <Paper sx={{ p: 4, borderRadius: 4, bgcolor: '#fdfcfe' }}>
                    {/* Пошук */}
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Пошук користувачів за email
                    </Typography>

                    <Box sx={{ position: 'relative', mb: 4 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField 
                                fullWidth 
                                size="small" 
                                placeholder="email@example.com"
                                value={searchEmail}
                                color='secondary'
                                onChange={(e) => {
                                    setSearchEmail(e.target.value);
                                    if (foundUser) setFoundUser(null); // Ховаємо список, якщо почали писати заново
                                }}
                                sx={{ borderRadius: 2 }}
                            />
                            <Tooltip title={isSearchDisabled ? 'Для пошуку введіть пошту користувача' : ''}>
                                <span>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        disabled={isSearchDisabled || searchLoading}
                                        onClick={handleSearch}
                                        sx={{ borderRadius: 2, px: 4, whiteSpace: 'nowrap' }}
                                    >
                                        Знайти
                                    </Button>
                                </span>
                            </Tooltip>
                        </Box>

                        {/* Випадаючий список результатів */}
                        {(foundUser || (searchEmail && !foundUser && !searchLoading && anchorEl)) && (
                            <Paper
                                elevation={3}
                                sx={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    mt: '3px',
                                    zIndex: 10,
                                    width: '100%',
                                    overflow: 'hidden',
                                    border: '1px solid #ddd'
                                }}
                            >
                                {foundUser ? (
                                    <Box 
                                        sx={{ 
                                            p: 2, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            '&:hover': { bgcolor: '#f0f0f0' } 
                                        }}
                                    >
                                        <Box sx={{ display: 'flex',flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{foundUser.full_name}</Typography>
                                            <Typography variant="caption">{foundUser.email}</Typography>
                                        </Box>
                                        <Button 
                                            size="small" 
                                            variant="contained"
                                            startIcon={<EmailOutlinedIcon />}
                                            onClick={handleInvite}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Запросити
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Користувача з такою поштою не знайдено
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        )}
                    </Box>

                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Поточні учасники ({project.members.length + 1})
                    </Typography>

                    {/* Список учасників */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                        {/* Власник (завжди перший) */}
                        <MemberRow 
                            user={project.owner}
                            isOwner={true} 
                        />
                        
                        {/* Учасники */}
                        {project.members.map((member) => (
                            <MemberRow 
                                key={member.id} 
                                user={member}
                            />
                        ))}
                    </Box>

                    {/* Посилання-запрошення */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2, 
                        bgcolor: '#f3e5f5', 
                        borderRadius: 3,
                        gap: 2,
                        minWidth: 0,
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            minWidth: 0,
                        }}>
                            <LinkIcon fontSize="small" color="action" sx={{ flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ flexShrink: 0, fontWeight: 'medium' }}>
                                Посилання-запрошення:
                            </Typography>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: 'text.secondary',
                                    minWidth: 0,
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {invite_link}
                            </Typography>
                        </Box>

                        <Button 
                            startIcon={<ContentCopyIcon />} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                                borderRadius: 2, 
                                borderColor: '#ccc', 
                                color: '#333',
                                flexShrink: 0
                            }}
                            onClick={() => {
                                navigator.clipboard.writeText(invite_link)
                                setCopySnackbarOpen(true);
                            }}
                        >
                            Копіювати
                        </Button>
                        <Snackbar
                            open={copySnackbarOpen}
                            autoHideDuration={2000}
                            onClose={() => setCopySnackbarOpen(false)}
                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        >
                            <Alert onClose={() => setCopySnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                                Посилання скопійовано у буфер обміну!
                            </Alert>
                        </Snackbar>
                    </Box>
                </Paper>

            </Box>
        </AuthenticatedLayout>
    );
}