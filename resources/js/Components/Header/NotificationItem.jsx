import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import dayjs from 'dayjs';

import { Box, Typography, Tooltip, IconButton, Button } from '@mui/material';

import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';


export default function NotificationItem({ notifications, isFiltered, closeModal }) {
    // console.log('notifications: ', notifications);
    const [items, setItems] = useState(notifications);

    useEffect(() => {
        setItems(notifications);
    }, [notifications]);

    const handleMarkAsRead = (e, notificationId) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation(); // Зупиняємо клік, щоб не було переходу
        }
        
        const current = items.find(n => n.id === notificationId);
        if (current?.read) return;

        setItems(prev => prev.map(item => item.id === notificationId ? {...item, read: true} : item)); // Локальне оновлення

        router.post(`/notifications/${notificationId}/read`, {}, { preserveScroll: true }); // Відправка на бекенд
    };

    // Функція переходу за посиланням
    const handleNavigate = (e, notification) => {
        e.stopPropagation();
        
        // Якщо ще не прочитано - відмічаємо
        if (!notification.read) handleMarkAsRead(null, notification.id);

        if (notification.data.url) {
            if (closeModal) closeModal();
            router.visit(notification.data.url);
        }
    };

    // Обробка прийняття запрошення
    const handleAcceptInvite = (e, notification) => {
        e.stopPropagation();
        
        // Якщо ще не прочитано - відмічаємо
        if (!notification.read) handleMarkAsRead(null, notification.id);

        router.post(`/invitation/${notification.data.token}/accept`, {}, {
            preserveScroll: true,
            onSuccess: () => { if (closeModal) closeModal(); }
        });
    };

    // Обробка відхилення запрошення
    const handleDeclineInvite = (e, notification) => {
        e.stopPropagation();
        
        // Якщо ще не прочитано - відмічаємо
        if (!notification.read) handleMarkAsRead(null, notification.id);
        
        router.post(`/invitations/${notification.data.token}/decline`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.length === 0 ? (
                <Typography textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
                    {isFiltered 
                        ? 'Нічого не знайдено за фільтрами' 
                        : 'Сповіщень поки немає'
                    }
                </Typography>
            ) : (
                items.map((notification) => {
                    console.log('notification: ', notification.data.event);
                    const isInvite = notification.data.event === 'project_invite';
                    const isClickable = notification.data.url && !(isInvite && notification.read);
                 
                    return (
                        <Box 
                            key={notification.id}
                            onClick={(e) => isClickable ? handleNavigate(e, notification) : null}
                            sx={{ 
                                p: 2, 
                                borderRadius: 2,
                                bgcolor: notification.read ? '#f4f4f4' : '#ffff',
                                border: notification.read ? '1px solid #e0e0e0' : '1px solid #8a2db1', // Рамка
                                cursor: isClickable ? 'pointer' : 'default',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    boxShadow: notification.read ? 'none' : '0 4px 15px rgba(138, 45, 177, 0.15)',
                                    '& .nav-button': { opacity: 1, transform: 'translateX(0)' }
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ pr: 6 }}> {/* Відступ під праві кнопки */}
                                    <Typography variant="subtitle1" sx={{ fontWeight: notification.read ? '500' : '700', color: notification.read ? 'text.secondary' : 'text.primary' }}>
                                        {notification.data.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {notification.data.message}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '60px' }}>
                                    <Typography color="text.secondary" sx={{ fontSize: '11px', fontWeight: 500 }}>
                                        {dayjs(notification.date).format('DD.MM')} {notification.time}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* КНопки взаимодействия в зависимости от типа сообщения */}
                            {isInvite ? (
                                // INVITE
                                !notification.read && (
                                    <Box sx={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="success"
                                            startIcon={<CheckIcon />}
                                            onClick={(e) => handleAcceptInvite(e, notification)}
                                            sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '12px', py: 0.2 }}
                                        >
                                            Прийняти
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            startIcon={<CloseIcon />}
                                            onClick={(e) => handleDeclineInvite(e, notification)}
                                            sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '12px', py: 0.2 }}
                                        >
                                            Відхилити
                                        </Button>
                                    </Box>
                                )

                            ) : (
                                // smiple notif
                                <Box sx={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', gap: 1 }}>
                                    {/* КНОПКА "Перейти"*/}
                                    {notification.data.url && (
                                        <Tooltip title="Перейти">
                                            <IconButton 
                                                className="nav-button"
                                                size="small"
                                                onClick={(e) => handleNavigate(e, notification)}
                                                sx={{ 
                                                    opacity: { xs: 1, sm: 0 },
                                                    transform: { xs: 'none', sm: 'translateX(10px)' },
                                                    transition: 'all 0.2s',
                                                    bgcolor: '#f1f5f9',
                                                    '&:hover': { bgcolor: '#e2e8f0', color: 'primary.main' }
                                                }}
                                            >
                                                <OpenInNewIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    {/* КНОПКА "ВІДМІТИТИ ЯК ПРОЧИТАНЕ" */}
                                    {!notification.read && (
                                        <Tooltip title="Позначити прочитаним">
                                            <IconButton 
                                                size="small"
                                                onClick={(e) => handleMarkAsRead(e, notification.id)}
                                                sx={{ 
                                                    bgcolor: 'rgba(138, 45, 177, 0.1)',
                                                    color: '#8a2db1',
                                                    '&:hover': { bgcolor: 'rgba(138, 45, 177, 0.2)' }
                                                }}
                                            >
                                                <MarkEmailReadIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            )}

                            
                        </Box>
                    );
                })
            )}
        </Box>

    );
}