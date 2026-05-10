import React from 'react';
import dayjs from 'dayjs';

import { Box, Typography } from '@mui/material'; // Импорты MUI компонентов

export default function NotificationItem({ notifications, isFiltered }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifications.length === 0 ? (
                <Typography textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
                    {isFiltered 
                        ? 'Нічого не знайдено за фільтрами' 
                        : 'Сповіщень поки немає'
                    }
                </Typography>
            ) : (
                notifications.map((notification) => (
                    <Box 
                        key={notification.id} 
                        sx={{ 
                            p: 2, 
                            bgcolor: notification.read ? '#f4f4f4' : '#ffff',
                            borderRadius: 2,    // Скругленные углы карточки
                            border: notification.read ? '1px solid #e0e0e0' : '1px solid #8a2db1', // Рамка
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {notification.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {dayjs(notification.date).format('DD.MM')} {notification.time}
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {notification.text}
                        </Typography>
                    </Box>
                ))
            )}
        </Box>                

    );
}