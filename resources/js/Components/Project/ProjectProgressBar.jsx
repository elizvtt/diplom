import React from 'react';

import { Box, LinearProgress, Typography } from '@mui/material';

// відображення прогресу
export default function ProjectProgressBar ({ completed, total }) {
    // Рахуємо відсоток
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <Box sx={{ mt: 'auto', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    Виконано: {completed || 0}/{total || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    {percent}%
                </Typography>
            </Box>
            <LinearProgress 
                variant="determinate" 
                value={percent} 
                color={percent === 100 ? 'success' : 'primary'} 
                sx={{ height: 6, borderRadius: 3, backgroundColor: percent === 0 ? '#e0e0e0' : undefined }} 
            />
        </Box>
    );
};