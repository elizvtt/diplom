import React, { useState } from 'react';
import { router } from '@inertiajs/react';

import NotificationItem from '@/Components/Header/NotificationItem';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

// Импорты MUI компонентов
import {
    Box, Badge, IconButton, Typography, Button,
    Dialog, DialogTitle, DialogContent, Chip, Popover
} from '@mui/material';

// Импорты иконок
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DoneAllIcon from '@mui/icons-material/DoneAll';

export default function NotificationsMenu({ user, notifications }) {

    const unreadCount = notifications.filter(n => !n.read).length;
    const [isOpen, setIsOpen] = useState(false); // Стейт для модального окна (открыто/закрыто)

    // Стейты для фильтров
    const [statusFilter, setStatusFilter] = useState('unread'); // 'all', 'unread', 'read'
    
    // Стейт для выбранной даты
    const [selectedDate, setSelectedDate] = useState(null);
    const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
    const isCalendarOpen = Boolean(calendarAnchorEl);

    // Логика фильтрации
    const filtered = notifications.filter(n => {
        if (statusFilter === 'unread' && n.read) return false;
        if (statusFilter === 'read' && !n.read) return false;
        if (selectedDate && n.date !== selectedDate.format('YYYY-MM-DD')) return false;
        return true;
    });

    const handleOpenCalendar = (e) => setCalendarAnchorEl(e.currentTarget);
    const handleCloseCalendar = () => setCalendarAnchorEl(null);
    const handleClearDate = () => setSelectedDate(null);

    // Функція "Відмітити всі як прочитані"
    const handleMarkAllAsRead = () => {
        router.post('/notifications/read-all', {}, {
            preserveScroll: true,
            // onSuccess: () => {}
        });
    };

    return (
        <>
            <IconButton size="large" color="inherit" onClick={() => setIsOpen(true)}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            {/* МОДАЛЬНОЕ ОКНО */}
            <Dialog 
                open={isOpen} 
                onClose={() => setIsOpen(false)} 
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {/* ШАПКА МОДАЛКИ*/}
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', pb: 1 }}>
                    <Typography variant="h5" fontWeight="bold">
                        Сповіщення
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {unreadCount > 0 && (
                            <Button 
                                size="small"
                                title='Відмітити всі повідомлення як прочитані'
                                startIcon={<DoneAllIcon />} 
                                onClick={handleMarkAllAsRead}
                                color="text.secondary"
                                sx={{ '&:hover': { color: "secondary.main" } }}
                            >
                                Прочитати всі
                            </Button>
                        )}
                        <IconButton onClick={() => setIsOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
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

                    {/* КАРТОЧКА УВЕДОМЛЕНИЯ */}
                    <NotificationItem 
                        notifications={filtered} 
                        isFiltered={statusFilter !== 'all' || selectedDate} 
                        closeModal={() => setIsOpen(false)}
                    />

                </DialogContent>
            </Dialog>


        </>
    )

}