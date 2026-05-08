import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { 
    IconButton, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, Button, Box, Typography 
} from '@mui/material';

import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function AdminMenu({ user }) {
    if (user.role !== 'admin') return null;

    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const [fieldType, setFieldType] = useState('text');

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/verify-password', {
            onSuccess: () => {
                handleClose();
                // Inertia автоматично редиректне нас на /admin згідно з логікою контролера
            },
            onError: () => setData('password', ''),
        });
    };

    return (
        <>
            <IconButton size="large" color="inherit" onClick={handleOpen}>
                <ManageAccountsIcon />
            </IconButton>

            <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <form onSubmit={handleSubmit}>
                    <DialogTitle sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <LockOutlinedIcon color="primary" sx={{ fontSize: 40 }} />
                            <Typography variant="h6" fontWeight="bold">Підтвердження доступу</Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                            Для входу в панель адміністратора, будь ласка, підтвердіть свій пароль.
                        </Typography>
                        <TextField
                            autoFocus
                            label="Ваш пароль"
                            type="password"
                            fullWidth
                            color="secondary"
                            variant="outlined"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                            autoComplete="new-password" // Забороняє браузеру підставляти збережений пароль
                            onPaste={(e) => e.preventDefault()} // Вимикає вставку
                            onCopy={(e) => e.preventDefault()}  // Вимикає копіювання
                            onContextMenu={(e) => e.preventDefault()} // Вимикає праве меню
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleClose} color="inherit">Скасувати</Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={processing}
                        >
                            Увійти
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}