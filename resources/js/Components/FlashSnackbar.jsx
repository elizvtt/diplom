import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Snackbar, Alert } from '@mui/material';

export default function FlashSnackbar() {
    const { flash } = usePage().props; // Отримуємо flash-повідомлення з Laravel
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');

    useEffect(() => {
        // Отримуємо повідомлення
        const msg = flash?.success || flash?.error;
        
        // якщо повідомлення порожнє, нічого не робимо
        if (!msg || msg.trim() === '') return; 

        // Якщо текст є, налаштовуємо та відкриваємо
        const severity = flash?.success ? 'success' : 'error';
        setMessage(msg);
        setSeverity(severity);
        setOpen(true);

    }, [flash]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    return (
        <Snackbar 
            open={open} 
            autoHideDuration={6000} 
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
}