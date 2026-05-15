import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { EVENT_LABELS } from '@/utils/constants';

import { 
    Box, Typography, Button, TextField, Paper, Menu, MenuItem,
    Divider, Switch, FormControlLabel, Avatar, Badge, IconButton,
    FormGroup, Grid
} from '@mui/material';

import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';

export default function Profile({ auth, notificationSettingsList }) {
    if (!auth || !auth.user) return <div>Завантаження...</div>;

    const user = auth.user;
    // console.log('[Profile.jsx] user: ', user);
    console.log('[Profile.jsx] notificationSettingsList: ', notificationSettingsList);

    const fileInputRef = useRef(null);

    // Форма Inertia 
    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: user.full_name || '',
        email: user.email || '',
        avatar: null,
        delete_avatar: false,
        email_notification: Boolean(user.email_notification), 
        settings: notificationSettingsList || [] // Детальні налаштування з таблиці notification_settings
    });

    // Стейт для прев'ю аватарки
    const [avatarPreview, setAvatarPreview] = useState(user.avatar_path ? `/storage/${user.avatar_path}` : null);
    const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
    const [backUrl, setBackUrl] = useState('/'); // Стейт для зберігання шляху повернення
    const [isChangeSaved, setChangeSaved] = useState(false); // стейт для відстеження змін
    // const [snackbarOpen, setSnackbarOpen] = useState(false); // Стейт для Snackbar

    // ^ ефекти
    // логіка навігації
    useEffect(() => {
        const referrer = document.referrer; // При завантаженні сторінки перевіряємо, звідки прийшов юзер
        // Якщо реферер з нашого сайту і це не сама сторінка профілю — зберігаємо його
        if (referrer && referrer.includes(window.location.origin) && !referrer.includes('/profile')) {
            localStorage.setItem('profile_back_url', referrer);
            setBackUrl(referrer);
        } else {
            const savedUrl = localStorage.getItem('profile_back_url');
            if (savedUrl) setBackUrl(savedUrl);
        }
    }, []);

    // відстеження змін
    useEffect(() => {
        // перевірка базових полів
        const basicFieldsChanged = 
            data.full_name !== (user.full_name || '') ||
            data.email !== (user.email || '') ||
            data.email_notification !== Boolean(user.email_notification) ||
            data.avatar !== null ||
            data.delete_avatar === true;

        // Перевірка масиву налаштувань
        const safeOriginalSettings = notificationSettingsList || [];
        const settingsChanged = JSON.stringify(data.settings) !== JSON.stringify(safeOriginalSettings);

        setChangeSaved(basicFieldsChanged || settingsChanged);
    }, [data, user, notificationSettingsList]);

    // Попередження про вихід
    useEffect(() => {
        if (!isChangeSaved) return;

        const unregister = router.on('before', (event) => {
            if (event.detail.visit.method !== 'get') return;

            if (!confirm('У вас є незбережені зміни. Вийти без збереження?')) {
                event.preventDefault();
            }
        });
        return () => unregister();
    }, [isChangeSaved]);

    // ^ Обробники подій (Handlers)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                avatar: file,
                delete_avatar: false
            }));
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Функції для відкриття/закриття меню
    const handleAvatarMenuOpen = (event) => setAvatarMenuAnchor(event.currentTarget);
    const handleAvatarMenuClose = () => setAvatarMenuAnchor(null);

    // видаення аватарки
    const handleDeleteAvatar = () => {
        setAvatarPreview(null);
        setData((prev) => ({
            ...prev,
            avatar: null,
            delete_avatar: true
        }));
        handleAvatarMenuClose();
    };

    // Функція обробки зміни в JSON
    const handleDetailedSettingChange = (settingIndex, eventKey, isChecked) => {
        const newSettings = [...data.settings];
        // Оновлюємо конкретний івент у JSON-об'єкті конкретного каналу
        newSettings[settingIndex].events[eventKey] = isChecked;
        setData('settings', newSettings);
    };

    const handleMasterEmailChange = (checked) => {        
        const updatedSettings = data.settings.map(setting => {
            // Працюємо тільки з каналом пошти
            if (setting.channel === 'mail') {
                const updatedEvents = { ...setting.events };
                
                // Проходимо по всіх ключах і встановлюємо значення 'checked' (true або false)
                Object.keys(updatedEvents).forEach(key => {
                    updatedEvents[key] = checked;
                });
                
                return { ...setting, events: updatedEvents };
            }
            return setting;
        });

        setData({
            ...data,
            email_notification: checked,
            settings: updatedSettings
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post('/profile', {
        preserveScroll: true,
            onSuccess: () => {
                setChangeSaved(false);
            }
        });
    };

    return (
        <AuthenticatedLayout header={null} >
            <Head title="Профіль" />

            <Box sx={{ maxWidth: 800, mx: 'auto', mt: 2, mb: 8, px: 2 }}>

                {/* ВЕРХНЯ ПАНЕЛЬ З КНОПКОЮ НАЗАД */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton 
                        title='Повернутися'
                        component={Link}
                        href={backUrl}
                        sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold">
                        Налаштування профілю
                    </Typography>
                </Box>

                <Paper 
                    sx={{ 
                        p: { xs: 2, md: 4 }, 
                        borderRadius: 3, 
                        boxShadow: isChangeSaved ? '0 0 15px rgba(138, 45, 177, 0.4)' : '0 4px 20px rgba(0,0,0,0.08)',
                        border: isChangeSaved ? '2px solid #8a2db1' : 'none', // Фіолетова рамка при змінах
                        transition: 'all 0.3s ease'
                    }}
                >
                    {/* ПОВІДОМЛЕННЯ ПРО НЕЗБЕРЕЖЕНІ ЗМІНИ */}
                    {isChangeSaved && (
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: '#8a2db1', 
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            * У вас є незбережені зміни
                        </Typography>
                    )}
                    <form onSubmit={submit}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>

                            {/* БЛОК АВАТАРКИ */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
                                
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    badgeContent={
                                        <>
                                            <IconButton 
                                                color="primary"
                                                title='Змінити фото профілю'
                                                sx={{ bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'grey.100' } }}
                                                onClick={handleAvatarMenuOpen}
                                            >
                                                <PhotoCameraIcon fontSize="small" />
                                            </IconButton>

                                            <Menu
                                                anchorEl={avatarMenuAnchor}
                                                open={Boolean(avatarMenuAnchor)}
                                                onClose={handleAvatarMenuClose}
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                            >
                                                <MenuItem onClick={() => { 
                                                    fileInputRef.current.click(); 
                                                    handleAvatarMenuClose(); 
                                                }}>
                                                    <PhotoCameraIcon sx={{ mr: 1, fontSize: 20 }} /> Завантажити фото
                                                </MenuItem>
                                                
                                                {/* Показуємо "Видалити", тільки якщо зараз є якась аватарка */}
                                                {(avatarPreview || user.avatar_path) && (
                                                    <MenuItem onClick={handleDeleteAvatar} sx={{ color: 'error.main' }}>
                                                        <DeleteIcon sx={{ mr: 1, fontSize: 20 }} /> Видалити фото
                                                    </MenuItem>
                                                )}
                                            </Menu>
                                        </>
                                    }
                                >
                                    <Avatar
                                        src={avatarPreview}
                                        sx={{ width: 100, height: 100, fontSize: '2rem', bgcolor: '#c5f9cf', color: '#475c4b' }}
                                    >
                                        {!avatarPreview && data.full_name ? data.full_name.charAt(0).toUpperCase() : ''}
                                    </Avatar>
                                </Badge>
                            </Box>

                            <Box sx={{ width: '60%'}}>
                                {/* ОСНОВНІ ДАНІ */}
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Особиста інформація
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                                    <TextField
                                        label="ПІБ"
                                        variant="outlined" fullWidth
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        error={!!errors.full_name} helperText={errors.full_name}
                                    />
                                    <TextField
                                        label="Email"
                                        type="email" variant="outlined" fullWidth
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={!!errors.email} helperText={errors.email}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* НАЛАШТУВАННЯ ПОВІДОМЛЕНЬ */}
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Налаштування сповіщень
                        </Typography>
                        
                        {/* Глобальний перемикач з таблиці users */}
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={data.email_notification} 
                                        // onChange={(e) => setData('email_notification', e.target.checked)} 
                                        onChange={(e) => handleMasterEmailChange(e.target.checked)} 
                                        color="primary" 
                                    />
                                }
                                label={
                                    <Typography fontWeight="bold">
                                        Дозволити надсилання email-листів
                                    </Typography>
                                }
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                                Якщо вимкнено, ви не отримаєте жодного листа, незалежно від налаштувань нижче.
                            </Typography>
                        </Box>

                        {/* Детальні налаштування з таблиці notification_settings */}
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Детальні сповіщення:
                        </Typography>
                        
                        <Box sx={{ mt: 1, mb: 2 }}>
                            {data.settings.length > 0 ? (
                                <Grid container spacing={4}> {/* Головний контейнер для двох колонок */}
                                    {data.settings.map((channelSetting, sIndex) => (
                                        <Grid item xs={12} md={6} key={channelSetting.id}>
                                            <Box sx={{ 
                                                p: 2, 
                                                border: '1px solid #f0f0f0', 
                                                borderRadius: 3, 
                                                height: '100%', 
                                                bgcolor: channelSetting.channel === 'database' ? '#fdfcfe' : '#ffffff' 
                                            }}>
                                                <Typography 
                                                    variant="subtitle2" 
                                                    sx={{ 
                                                        color: 'secondary.main', 
                                                        mb: 2, 
                                                        textTransform: 'uppercase', 
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1 
                                                    }}
                                                >
                                                    {channelSetting.channel === 'database' ? (
                                                        <>
                                                            <NotificationsIcon sx={{ fontSize: '1.1rem' }} /> 
                                                            Сповіщення в Edutive
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EmailIcon sx={{ fontSize: '1.1rem' }} /> 
                                                            Електронна пошта
                                                        </>
                                                    )}
                                                </Typography>
                                                
                                                <FormGroup>
                                                    {Object.keys(channelSetting.events).map((eventKey) => (
                                                        <FormControlLabel
                                                            key={eventKey}
                                                            sx={{ 
                                                                mb: 0.5,
                                                                '& .MuiTypography-root': { fontSize: '0.875rem' } 
                                                            }}
                                                            control={
                                                                <Switch 
                                                                    disabled={channelSetting.channel === 'mail' && !data.email_notification}
                                                                    checked={channelSetting.events[eventKey]} 
                                                                    onChange={(e) => handleDetailedSettingChange(sIndex, eventKey, e.target.checked)} 
                                                                    size="small"
                                                                />
                                                            }
                                                            label={EVENT_LABELS[eventKey] || eventKey}
                                                        />
                                                    ))}
                                                </FormGroup>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                    Завантаження налаштувань...
                                </Typography>
                            )}
                        </Box>

                        {/* КНОПКА ЗБЕРЕЖЕННЯ */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            {/* кнопка, яка з'являється тільки при змінах */}
                            {isChangeSaved && (
                                <Button 
                                    variant="text" 
                                    color="error" 
                                    onClick={() => {
                                        if (confirm('Скинути всі зміни?')) {
                                            reset(); // Миттєво повертає всі поля data до початкового стану
                                            setAvatarPreview(user.avatar_path ? `/storage/${user.avatar_path}` : null); // Повертає стару картинку
                                        }
                                    }}
                                >
                                    Скасувати
                                </Button>
                            )}

                            <Button type="submit" variant="contained" color='secondary' disabled={processing} startIcon={<SaveIcon />}>
                                {processing ? 'Збереження...' : 'Зберегти зміни'}
                            </Button>
                        </Box>

                    </form>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}