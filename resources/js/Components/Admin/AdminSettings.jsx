import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

import { Paper, Typography, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export default function AdminSettings({  }) {
    return (
        <>
            <Paper sx={{ p: 3, borderRadius: 3 }}>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <SettingsIcon />
                    <Typography variant="h6" fontWeight="bold">
                        Системні налаштування
                    </Typography>
                </Box>

                <Typography color="text.secondary">
                    Тут можна буде додати:
                </Typography>

                <Box component="ul" sx={{ mt: 2 }}>
                    <li>Email налаштування</li>
                    <li>Ліміти проєктів</li>
                    <li>Backup системи</li>
                    <li>Очищення логів</li>
                    <li>Управління ролями</li>
                </Box>
            </Paper>
        </>
    );
}