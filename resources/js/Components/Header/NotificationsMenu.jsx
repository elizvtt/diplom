import React, { useState } from 'react';

import NotificationItem from '@/Components/Header/NotificationItem';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

// Импорты MUI компонентов
import {
    Box, Badge, IconButton, Typography,
    Dialog, DialogTitle, DialogContent, Chip, Popover
} from '@mui/material';

// Импорты иконок
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // Иконка календаря


export default function NotificationsMenu({ user }) {

    const [isOpen, setIsOpen] = useState(false); // Стейт для модального окна (открыто/закрыто)

    // Стейты для фильтров
    const [statusFilter, setStatusFilter] = useState('unread'); // 'all', 'unread', 'read'
    
    // Стейт для выбранной даты
    const [selectedDate, setSelectedDate] = useState(null);
    const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
    const isCalendarOpen = Boolean(calendarAnchorEl);

    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Нове завдання', text: 'Текст або опис повідомлення...', read: false, time: '10:30', date: '2026-04-16' },
        { id: 2, title: 'Дедлайн завдання', text: 'Текст або опис повідомлення...', read: true, time: '15:00', date: '2026-04-18' },
        { id: 3, title: 'Нова оцінка', text: 'Ви отримали 5 за тест з математики.', read: false, time: '09:00', date: '2026-04-19' },
        { id: 4, title: 'Нова оцінка 2', text: 'Ви отримали 5 за тест з математики.', read: false, time: '09:00', date: '2026-05-01' },
        { id: 5, title: 'Нова оцінка 3', text: 'Ви отримали 5 за тест з математики.', read: false, time: '12:00', date: '2026-04-28' },
        { id: 6, title: 'Нова оцінка 4', text: 'Ви отримали 5 за тест з математики.', read: false, time: '10:00', date: '2026-04-30' },
    ]);

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

    return (
        <>
            <IconButton size="large" color="inherit" onClick={() => setIsOpen(true)}>
                <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
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
                <DialogTitle sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', pb: 1 }}>
                    <Typography variant="h5" fontWeight="bold">
                        Сповіщення
                    </Typography>
                    <IconButton 
                        onClick={() => setIsOpen(false)} 
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

                    {/* КАРТОЧКА УВЕДОМЛЕНИЯ */}
                    <NotificationItem notifications={filtered} />

                </DialogContent>
            </Dialog>


        </>
    )

}