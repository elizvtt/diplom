import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MemberRow from '@/Components/Team/MemberRow';

import {
    Container, Typography, Box, Paper,
    TextField, Button, IconButton, Tooltip,
    Snackbar, Alert, Avatar, Chip
} from '@mui/material';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Pending
import TimerOffIcon from '@mui/icons-material/TimerOff'; // Expired
import BlockIcon from '@mui/icons-material/Block'; // Revoked
import CancelIcon from '@mui/icons-material/Cancel'; // Кнопка відміни

const getStatusChip = (status) => {
    switch (status) {
        case 'pending':
            return <Chip icon={<AccessTimeIcon sx={{ fontSize: '16px !important' }}/>} label="Очікує" size="small" color="warning" variant="outlined" sx={{ fontWeight: 'bold' }} />;
        case 'expired':
            return <Chip icon={<TimerOffIcon sx={{ fontSize: '16px !important' }}/>} label="Прострочено" size="small" color="default" variant="outlined" sx={{ fontWeight: 'bold' }} />;
        case 'revoked':
            return <Chip icon={<BlockIcon sx={{ fontSize: '16px !important' }}/>} label="Відкликано" size="small" color="error" variant="outlined" sx={{ fontWeight: 'bold' }} />;
        default:
            return null;
    }
};

export default function Team({ project, inviteLink, invitations, teamRoles = [] }) {
    const { auth } = usePage().props;

    const [searchEmail, setSearchEmail] = useState(''); // стейт для email
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

    // Функція скасування запрошення
    const handleRevoke = (inviteId) => {
        if (window.confirm('Ви впевнені, що хочете відкликати це запрошення?')) {
            router.post(`/invitations/${inviteId}/revoke`, {
                preserveScroll: true,
            });
        }
    };

    // Функція зміни ролі
    const handleRoleChange = (userId, newRole) => {
        router.post(`/projects/${project.uuid}/team/${userId}/update`, {
            role: newRole
        }, {
            preserveScroll: true,
        });
    };

    // Функція видалення учасника
    const handleRemoveMember = (userId) => {
        if (window.confirm('Ви впевнені, що хочете видалити цього учасника з команди?')) {
            router.post(`/projects/${project.uuid}/team/${userId}/delete`, {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout header={null}>
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

                    {/* ПОТОЧНІ УЧАСНИКИ */}
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Поточні учасники ({project.members.length + 1})
                    </Typography>
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
                                isOwner={member.id === project.owner_id}
                                currentUserIsOwner={project.owner_id === auth.user.id}
                                teamRoles={teamRoles}
                                onRoleChange={handleRoleChange}
                                onRemove={handleRemoveMember}
                            />
                        ))}
                    </Box>

                    {/* ЗАПРОШЕННЯ */}
                    {invitations && invitations.length > 0 && (
                        <>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                Надіслані запрошення ({invitations.length})
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                                {invitations.map((invite) => (
                                    <Box 
                                        key={invite.id} 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            p: 2, 
                                            border: '1px solid #e2e8f0', 
                                            borderRadius: 3,
                                            bgcolor: invite.status === 'revoked' ? '#fff5f5' : '#fafafa', // Злегка червоний фон для відкликаних
                                            opacity: invite.status === 'pending' ? 1 : 0.7 // Робимо неактивні трохи прозорішими
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#e0e0e0', width: 36, height: 36 }}>
                                                <EmailOutlinedIcon sx={{ color: '#757575', fontSize: 20 }} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold" sx={{ textDecoration: invite.status === 'revoked' ? 'line-through' : 'none' }}>
                                                    {invite.email}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Надіслано: {new Date(invite.created_at).toLocaleDateString('uk-UA')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {/* Відмальовуємо бейдж статусу */}
                                            {getStatusChip(invite.status)}
                                            
                                            {/* Кнопка "Відкликати" доступна ТІЛЬКИ для статусу pending */}
                                            {invite.status === 'pending' && (
                                                <Tooltip title="Відкликати запрошення">
                                                    <IconButton 
                                                        size="small" 
                                                        color="error" 
                                                        onClick={() => handleRevoke(invite.id)}
                                                    >
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    )}


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
                                {inviteLink}
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
                                navigator.clipboard.writeText(inviteLink)
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