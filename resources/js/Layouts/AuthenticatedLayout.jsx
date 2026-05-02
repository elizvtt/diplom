import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';

// Импорты MUI компонентов
import {
    AppBar, Box, Badge, CssBaseline, IconButton, Toolbar, Typography,
    Avatar, Menu, MenuItem, Divider, ListItemIcon,
    Dialog, DialogTitle, DialogContent, Chip,
    Popover
} from '@mui/material';

// Импорты иконок
import MenuIcon from '@mui/icons-material/Menu';
import Logout from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // Иконка календаря


export default function AuthenticatedLayout({ header, children }) {
    const auth = usePage().props.auth; // Получаем данные юзера из Inertia
    // console.log('auth: ', auth.user.avatar_path);

    // Стейт для прев'ю аватарки
    const [avatarPreview, setAvatarPreview] = useState(auth.user.avatar_path ? `/storage/${auth.user.avatar_path}` : null);
    

    // Стейт для модального окна (открыто/закрыто)
    const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

    // Стейты для фильтров
    const [statusFilter, setStatusFilter] = useState('unread'); // 'all', 'unread', 'read'
    
    // Стейт для выбранной даты
    const [selectedDate, setSelectedDate] = useState(null);
    const [calendarAnchorEl, setCalendarAnchorEl] = useState(null); // Стейт для привязки Popover к иконке
    const isCalendarOpen = Boolean(calendarAnchorEl);

    // Фейковые данные (добавил поля title и group для фильтрации)
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Нове завдання', text: 'Текст або опис повідомлення...', read: false, time: '10:30', date: '2026-04-16' },
        { id: 2, title: 'Дедлайн завдання', text: 'Текст або опис повідомлення...', read: true, time: '15:00', date: '2026-04-18' },
        { id: 3, title: 'Нова оцінка', text: 'Ви отримали 5 за тест з математики.', read: false, time: '09:00', date: '2026-04-19' },
        { id: 4, title: 'Нова оцінка 2', text: 'Ви отримали 5 за тест з математики.', read: false, time: '09:00', date: '2026-05-01' },
        { id: 5, title: 'Нова оцінка 3', text: 'Ви отримали 5 за тест з математики.', read: false, time: '12:00', date: '2026-04-28' },
        { id: 6, title: 'Нова оцінка 4', text: 'Ви отримали 5 за тест з математики.', read: false, time: '10:00', date: '2026-04-30' },
    ]);

    // считаем новые уведомления для отображения на иконке
    const newNotificationsCount = notifications.filter(n => !n.read).length;

    // Логика фильтрации
    const filteredNotifications = notifications.filter(n => {
        if (statusFilter === 'unread' && n.read) return false;
        if (statusFilter === 'read' && !n.read) return false;
        
        // Оставляем только те сповещения, дата которых совпадает с выбранной
        if (selectedDate && n.date !== selectedDate) return false;
        
        return true;
    });

    // Функції модалки (відкриття/закриття)
    const handleOpenNotif = () => setIsNotifModalOpen(true);
    const handleCloseNotif = () => setIsNotifModalOpen(false);

    // Функции календаря
    const handleOpenCalendar = (event) => setCalendarAnchorEl(event.currentTarget);
    const handleCloseCalendar = () => setCalendarAnchorEl(null);
    const handleClearDate = () => setSelectedDate(null);

    // Стейт для выпадающего меню пользователя
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Функции открытия/закрытия меню профиля
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    // віход из аккаунта
    const handleLogout = () => router.post(route('logout'));


    return (
        <Box sx={{ display: 'flex'}}>
            <CssBaseline /> {/* Скидає стандартні відступи браузера */}

            {/* Рендеримо шапку ТІЛЬКИ якщо header не дорівнює null */}
            {header !== null && (
                // HEADER
                <AppBar
                    position="fixed" 
                    color="primary"
                    sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} // Щоб шапка була поверх бокового меню
                >
                    <Toolbar>
                        {/* открітие бокового окна */}
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        
                        {/* SITE NAME */}
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Edutive
                        </Typography>  
                        
                        {/* УВЕДОМЛЕНИЯ и АВАТАРКА */}
                        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', color: '#475c4b' }}>
                            {/* УВЕДОМЛЕНИЯ  */}
                            <IconButton size="large" color="inherit" onClick={handleOpenNotif}>
                                <Badge badgeContent={newNotificationsCount} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                            
                            {/* АВАТАРКА */}
                            <IconButton
                                onClick={handleClick}
                                size="small"
                                sx={{ ml: 1 }}
                                aria-controls={open ? 'account-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                            >
                                {/* Аватарка с первой буквой имени */}
                                <Avatar src={avatarPreview} sx={{ width: 38, height: 38, bgcolor: '#c5f9cf', color: '#475c4b', fontWeight: 700 }}>
                                    {!avatarPreview && auth.user.full_name ? auth.user.full_name.charAt(0).toUpperCase() : ''}
                                </Avatar>
                            </IconButton>

                            {/* МОДАЛЬНОЕ ОКНО (DIALOG) */}
                            <Dialog 
                                open={isNotifModalOpen} 
                                onClose={handleCloseNotif} 
                                maxWidth="sm" // Ширина окна (sm = ~600px)
                                fullWidth
                                PaperProps={{ sx: { borderRadius: 3 } }} // Скругляем углы самой модалки
                            >
                                {/* ШАПКА МОДАЛКИ*/}
                                <DialogTitle sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', pb: 1 }}>
                                    <Typography variant="h5" fontWeight="bold">
                                        Сповіщення
                                    </Typography>
                                    <IconButton 
                                        onClick={handleCloseNotif} 
                                        sx={{ position: 'absolute', right: 12, top: 12 }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </DialogTitle>

                                {/* КОНТЕНТ (Фильтры и список) */}
                                <DialogContent dividers sx={{ p: 3, height: 600 }}>
                                    
                                    {/* ПАНЕЛЬ ФИЛЬТРОВ */}
                                    <Box sx={{ mb: 3 }}>
                                        {/* Первая строка: Статусы + Иконка календаря */}
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip 
                                                    label="Всі" 
                                                    color={statusFilter === 'all' ? 'primary' : 'default'} 
                                                    onClick={() => setStatusFilter('all')} 
                                                />
                                                <Chip 
                                                    label="Непрочитані" 
                                                    color={statusFilter === 'unread' ? 'primary' : 'default'} 
                                                    onClick={() => setStatusFilter('unread')} 
                                                />
                                                <Chip 
                                                    label="Прочитані" 
                                                    color={statusFilter === 'read' ? 'primary' : 'default'} 
                                                    onClick={() => setStatusFilter('read')} 
                                                />
                                            </Box>

                                            <Box>
                                                {/* Иконка календаря */}
                                                <IconButton 
                                                    onClick={handleOpenCalendar} 
                                                    color={selectedDate ? "secondary" : "primary"} 
                                                    sx={{ ml: 1 }}
                                                >
                                                    <CalendarMonthIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        
                                        {/* Выбранные фильтры (Появляется только если дата выбрана) */}
                                        {selectedDate && (
                                            <Box sx={{ display: 'flex', mt: 2 }}>
                                                <Chip 
                                                    label={`${selectedDate.format('DD.MM.YY')}`} 
                                                    variant="outlined" 
                                                    color="secondary" 
                                                    size="small" 
                                                    onDelete={handleClearDate} // Крестик, который сбросит фильтр
                                                />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* СПЛИВАЮЧЕ ВІКНО З MUI КАЛЕНДАРЕМ */}
                                    <Popover
                                        open={isCalendarOpen}
                                        anchorEl={calendarAnchorEl}
                                        onClose={handleCloseCalendar}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                    >
                                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
                                            <StaticDatePicker
                                                displayStaticWrapperAs="desktop"
                                                value={selectedDate}
                                                onChange={(newValue) => {
                                                    setSelectedDate(newValue);
                                                    handleCloseCalendar(); // Календар сховається одразу після вибору дати
                                                }}
                                                slotProps={{
                                                    actionBar: {
                                                        actions: ['today'], // Кнопка "Сьогодні"
                                                        sx: { '& .MuiButton-root':{ color: 'secondary.main'}}
                                                    }
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Popover>

                                    {/* СПИСОК КАРТОЧЕК УВЕДОМЛЕНИЙ */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {filteredNotifications.length === 0 ? (
                                            <Typography textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
                                                За обраними фільтрами сповіщень немає.
                                            </Typography>
                                        ) : (
                                            filteredNotifications.map((notif) => (
                                                <Box 
                                                    key={notif.id} 
                                                    sx={{ 
                                                        p: 2, 
                                                        bgcolor: notif.read ? '#f4f4f4' : '#ffff',
                                                        borderRadius: 2,    // Скругленные углы карточки
                                                        border: notif.read ? '1px solid #e0e0e0' : '1px solid #8a2db1', // Рамка
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {notif.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {dayjs(notif.date).format('DD.MM')} {notif.time}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {notif.text}
                                                    </Typography>
                                                </Box>
                                            ))
                                        )}
                                    </Box>

                                </DialogContent>
                            </Dialog>

                        </Box>

                        {/* меню при нажатии на аватарку */}
                        <Menu 
                            anchorEl={anchorEl}
                            id="account-menu"
                            open={open}
                            onClose={handleClose}
                            onClick={handleClose}
                            slotProps={{
                                paper: {
                                    elevation: 0,
                                    sx: {
                                        overflow: 'visible',
                                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                        mt: 1.5,
                                        '& .MuiAvatar-root': {
                                            width: 32,
                                            height: 32,
                                            ml: -0.5,
                                            mr: 1,
                                        },
                                        '&::before': {
                                            content: '""',
                                            display: 'block',
                                            position: 'absolute',
                                            top: 0,
                                            right: 14,
                                            width: 10,
                                            height: 10,
                                            bgcolor: 'background.paper',
                                            transform: 'translateY(-50%) rotate(45deg)',
                                            zIndex: 0,
                                        },
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem
                                component={Link}
                                href='/profile'
                                onClick={handleClose}
                            >
                                <Avatar /> Мій профіль
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main'}}>
                                <ListItemIcon>
                                    <Logout fontSize="small" color="error" />
                                </ListItemIcon>
                                Вийти
                            </MenuItem>
                        </Menu>
                        
                    </Toolbar>
                </AppBar>
            )}

            {/* 3. ОСНОВНИЙ КОНТЕНТ */}
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}
            >
                {header !== null && <Toolbar />} {/* Пустий блок, щоб контент не ховався під шапкою */}
                {children} 
            </Box>

        </Box>
    );
}
