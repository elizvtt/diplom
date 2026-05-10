import React from 'react';

import AppHeader from '@/Components/AppHeader';
import FlashSnackbar from '@/Components/FlashSnackbar';

import { Box, CssBaseline, Toolbar } from '@mui/material';

export default function AuthenticatedLayout({ header, children }) {
    return (
        <Box sx={{ display: 'flex'}}>
            <CssBaseline /> {/* Скидає стандартні відступи браузера */}

            {/* Рендеримо шапку ТІЛЬКИ якщо header не дорівнює null */}
            {header !== null && ( <AppHeader /> )}

            {/* ОСНОВНИЙ КОНТЕНТ */}
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}
            >
                {header !== null && <Toolbar />} {/* Пустий блок, щоб контент не ховався під шапкою */}
                {children}
                <FlashSnackbar />
            </Box>

        </Box>
    );
}
