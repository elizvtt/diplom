import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';

import { getLogsLevelColor } from '@/utils/constants';

import dayjs from 'dayjs';
import 'dayjs/locale/uk';

import { Paper, Box, Typography, Chip, Popover, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';

import HistoryIcon from '@mui/icons-material/History';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

export default function AdminLogs({ logs, selectedDate }) {
    // Встановлюємо дату з бекенду або сьогоднішню за замовчуванням
    const [date, setDate] = useState(dayjs(selectedDate || new Date()));

    // Стейт для спливаючого вікна
    const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
    const isCalendarOpen = Boolean(calendarAnchorEl);

    // Стейт для фільтрації по рівню логу
    const [filterLevel, setFilterLevel] = useState('ALL');

    // Відкриття та закриття календаря
    const handleOpenCalendar = (event) => setCalendarAnchorEl(event.currentTarget);
    const handleCloseCalendar = () => setCalendarAnchorEl(null);

    // Обробка вибору нової дати
    const handleDateChange = (newValue) => {
        setDate(newValue);
        handleCloseCalendar(); // Ховаємо календар

        const formattedDate = dayjs(newValue).format('YYYY-MM-DD');
        
        // Відправляємо запит
        router.post('/admin/logs', { log_date: formattedDate }, {
            preserveState: true,
            preserveScroll: true,
            only: ['logs', 'selectedDate'],
        });
    };

    // Фільтруємо логи на фронтенді
    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        if (filterLevel === 'ALL') return logs;
        if (filterLevel === 'ERROR') return logs.filter(log => ['ERROR', 'CRITICAL', 'EMERGENCY'].includes(log.level));
        return logs.filter(log => log.level === filterLevel);
    }, [logs, filterLevel]);
    console.log('filteredLogs: ', filteredLogs);

    return (
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                        Журнал активності
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 3 }}>
                    {/* Кнопки фільтрації логів */}
                    <ToggleButtonGroup
                        color="primary"
                        value={filterLevel}
                        exclusive
                        onChange={(e, newLevel) => { if(newLevel) setFilterLevel(newLevel) }}
                        size="small"
                    >
                        <ToggleButton value="ALL" sx={{ color: 'text.main' }}>Всі</ToggleButton>
                        <ToggleButton value="INFO" title='Інфо' sx={{ color: 'secondary.main' }}>
                            <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                        </ToggleButton>
                        <ToggleButton value="WARNING" title='Попередження' sx={{ color: '#ff7d13' }}>
                            <WarningAmberOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                        </ToggleButton>
                        <ToggleButton value="ERROR" title='Помилки' sx={{ color: '#ff0000' }}>
                            <ErrorOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Button 
                        variant="outlined" 
                        color="inherit" 
                        onClick={handleOpenCalendar}
                        startIcon={<CalendarMonthIcon color="primary" />}
                        sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#e6e6e6' }}
                    >
                        {dayjs(date).format('DD.MM.YY')}
                    </Button>
                </Box>
                <Popover
                    open={isCalendarOpen}
                    anchorEl={calendarAnchorEl}
                    onClose={handleCloseCalendar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    sx={{ mt: 1 }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
                        <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            value={date}
                            onChange={handleDateChange}
                            disableFuture
                            slotProps={{
                                actionBar: {
                                    actions: ['today'],
                                    sx: { '& .MuiButton-root':{ color: 'secondary.main'}}
                                }
                            }}
                        />
                    </LocalizationProvider>
                </Popover>
            </Box>
            {/* LOGS list */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredLogs.length > 0 ? filteredLogs.map((log, index) => {
                    const style = getLogsLevelColor(log.level);
                    return (
                        <Paper
                            key={index}
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                borderLeft: `4px solid ${style.border}`,
                                bgcolor: log.level === 'ERROR' ? '#fffafa' : 'transparent',
                                transition: '0.2s',
                                '&:hover': { bgcolor: style.bg }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography fontWeight="bold">
                                    {log.action}
                                </Typography>
                                <Chip 
                                    label={log.created_at} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ fontSize: '0.75rem' }}
                                />
                            </Box>

                            <Typography variant="body2" sx={{ mb: 1 }}>
                                {log.description}
                            </Typography>

                            {log.details && (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    {Object.entries(log.details).map(([key, value]) => (
                                        <Chip 
                                            key={key}
                                            label={`${key}: ${value}`} 
                                            size="small" 
                                            sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#e3f2fd' }} 
                                        />
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    );
                }) : (
                    <Typography color="text.secondary" textAlign="center" py={4}>
                        Записів за {dayjs(date).format('DD.MM.YY')} немає
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}