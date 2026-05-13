import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import dayjs from 'dayjs';

import { Box, Typography } from '@mui/material'; // Импорты MUI компонентов

export default function NotificationItem({ notifications, isFiltered }) {
    console.log('notifications: ', notifications);
    const [items, setItems] = useState(notifications);

    useEffect(() => {
        setItems(notifications);
    }, [notifications]);

    const handleRead = (notificationId) => {
        // Якщо вже прочитано — нічого не робимо
        const current = items.find(n => n.id === notificationId);
        if (current?.read_at) return;

        setItems(prev =>
            prev.map(item =>
                item.id === notificationId ? {...item, read_at: new Date().toISOString()} : item
            )
        );

        router.post(`/notifications/${notificationId}/read`, {}, {
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
                items.map((notification) => (
                    <Box 
                        key={notification.id} 
                        onClick={() => handleRead(notification.id)}
                        sx={{ 
                            p: 2, 
                            bgcolor: notification.read ? '#f4f4f4' : '#ffff',
                            borderRadius: 2,    // Скругленные углы карточки
                            border: notification.read ? '1px solid #e0e0e0' : '1px solid #8a2db1', // Рамка
                            cursor: 'pointer',
                            transition: '0.2s',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
                                {notification.data.title}
                            </Typography>
                            <Typography color="text.secondary" sx={{ fontSize: '12px' }}>
                                {dayjs(notification.date).format('DD.MM')} {notification.time}
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {notification.data.message}
                        </Typography>
                    </Box>
                ))
            )}
        </Box>                

    );
}