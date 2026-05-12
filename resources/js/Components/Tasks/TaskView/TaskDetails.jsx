import React, { useEffect, useState  } from 'react';
import { router } from '@inertiajs/react';
import TipTapEditor from '@/Components/Editors/TipTapEditor';
import DOMPurify from 'dompurify';
import dayjs from 'dayjs';
import 'dayjs/locale/uk'; 
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { 
    Box, Typography, IconButton, Avatar, InputLabel,
    AvatarGroup, Tooltip, LinearProgress, Autocomplete,
    Button, Stack, TextField, Select, MenuItem, FormControl,
    Slider, CircularProgress,
} from '@mui/material';

import FlagIcon from '@mui/icons-material/Flag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';

import { priorityColors } from '@/utils/constants';

export default function TaskDetails({ task, project, priorities, teamMembers, reminders, data, setData, editingField, setEditingField, handleSave, processing, onAddSubtask }) {
    
    // console.log('data: ', data);

    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);

    // Стейт для швидкого вводу підзадачі
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape' && !processing) setEditingField(null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [processing]);


    // Функція для завершення редагування та збереження
    const applySave = () => {
        handleSave();
    };
    
    const getAvailableReminders = () => {
        // Якщо дата кінця не обрана, дозволяємо тільки "Немає"
        if (!data.date_end) return reminders.filter(r => r.id === 'none');

        const now = dayjs(); // Поточний час
        const deadline = dayjs(data.date_end);
        const diffInHours = deadline.diff(now, 'hour');

        return reminders.filter(rem => {
            if (rem.id === 'none') return true;
            // Логіка обмежень
            switch (rem.id) {
                case '1_hour':  return diffInHours >= 1;
                case '1_day':   return diffInHours >= 24;
                case '2_days':  return diffInHours >= 48;
                case '1_week':  return diffInHours >= 168;
                default: return true;
            }
        });
    };
    const availableReminders = getAvailableReminders();

    const handleCreateSubtask = () => {
        if (!newSubtaskTitle.trim()) return;

        setIsAddingSubtask(true);
        
        // Відправляємо на ваш стандартний роут створення завдання
        router.post('/add/task', {
            title: newSubtaskTitle,
            project_id: project.id,
            parent_task_id: task.id,
            status: 'backlog',
            progress: 0,
            priority: task.priority // Успадковуємо від батька
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewSubtaskTitle(''); // Очищаємо інпут
                setIsAddingSubtask(false);
            },
            onError: () => setIsAddingSubtask(false)
        });
    };

    return (
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>            
            {/* ОПИС */}
            <Box>
                {editingField === 'description' ? (
                    <Box>
                        <Box sx={{ pointerEvents: processing ? 'none' : 'auto', opacity: processing ? 0.7 : 1 }}>
                            <TipTapEditor
                                value={data.description}
                                onChange={(html) => setData('description', html)}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Button onClick={applySave} variant="contained" size="small" disabled={processing} startIcon={processing ? <CircularProgress size={16} /> : null}>
                                {processing ? 'Збереження...' : 'Зберегти'}
                            </Button>
                            <Button onClick={() => setEditingField(null)} variant="text" size="small" disabled={processing}>
                                Скасувати
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        onClick={() => !processing && setEditingField('description')}
                        sx={{
                            cursor: processing ? 'default' : 'pointer',
                            p: 1,
                            borderRadius: 1,
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.primary',
                                '& p, & ol, & ul': { margin: 0 },
                                lineHeight: 1.6
                            }}
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(data.description || 'Опис відсутній. Натисніть, щоб додати...')
                            }}
                        />
                    </Box>
                )}
            </Box>

            {/* ХАРАКТЕРИСТИКИ */}
            <Stack spacing={2.5} sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#f9c5ef20', color: '#000' }}>
                
                {/* ВИКОНАВЦІ */}
                <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                    <Typography variant="body2" sx={{ width: 140, flexShrink: 0, fontWeight: 500 }}>Виконавці:</Typography>
                    
                    <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                        {editingField === 'assignees' ? (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Autocomplete
                                    multiple
                                    disabled={processing}
                                    options={teamMembers || []}
                                    value={data.assignees || []}
                                    onChange={(e, value) => setData('assignees', value)}
                                    getOptionLabel={(option) => option.name || option.full_name || ''}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    sx={{ width: '100%' }}
                                    renderInput={(params) => <TextField {...params} size="small" autoFocus placeholder="Оберіть..." />}
                                />
                                <IconButton size="small" color="primary" onClick={applySave} disabled={processing}>
                                    {processing ? <CircularProgress size={16} /> : <CheckIcon />}
                                </IconButton>
                            </Box>
                        ) : (
                            <Box 
                                onClick={() => !processing && setEditingField('assignees')}
                                sx={{ cursor: processing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', height: '100%' }}
                            >
                                {data.assignees?.length > 0 ? (
                                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.8rem' } }}>
                                        {data.assignees.map((u) => (
                                            <Tooltip key={u.id} title={u.name || u.full_name}>
                                                <Avatar src={u?.avatar_path ? `/storage/${u.avatar_path}` : null}>{u?.full_name?.charAt(0)}</Avatar>
                                            </Tooltip>
                                        ))}
                                    </AvatarGroup>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Не призначено</Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* ПРІОРИТЕТ */}
                <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                    <Typography variant="body2" sx={{ width: 140, flexShrink: 0, fontWeight: 500 }}>Пріоритет:</Typography>
                    
                    <Box sx={{ flexGrow: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FlagIcon sx={{ color: priorityColors[data.priority], fontSize: 18 }} />
                        {editingField === 'priority' ? (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
                                <FormControl size="small" fullWidth disabled={processing}>
                                    <Select
                                        value={data.priority || ''}
                                        onChange={(e) => setData('priority', e.target.value)}
                                        autoFocus
                                    >
                                        {priorities.map((p) => (
                                            <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <IconButton size="small" color="primary" onClick={applySave} disabled={processing}>
                                    {processing ? <CircularProgress size={16} /> : <CheckIcon />}
                                </IconButton>
                            </Box>
                        ) : (
                            <Box onClick={() => !processing && setEditingField('priority')} sx={{ cursor: processing ? 'default' : 'pointer', flexGrow: 1 }}>
                                <Typography variant="body2">{priorities.find(p => p.id === data.priority)?.label || 'Немає'}</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* ТЕРМІНИ */}
                <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                    <Typography variant="body2" sx={{ width: 140, flexShrink: 0, fontWeight: 500 }}>Терміни:</Typography>
                    
                    <Box sx={{ flexGrow: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthIcon sx={{ fontSize: 18, color: 'action.active' }} />
                        {editingField === 'dates' ? (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            bgcolor: '#fff',
                                            borderRadius: 1,
                                            opacity: processing ? 0.6 : 1,
                                            pointerEvents: processing ? 'none' : 'auto'
                                        }}
                                    >
                                        {/* Дата початку */}
                                        <DateTimePicker
                                            format="DD.MM.YY HH:mm"
                                            ampm={false}
                                            value={dayjs(data.date_start)}
                                            onChange={(newValue) => setData('date_start', newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : null)}
                                            open={openStart}
                                            onClose={() => setOpenStart(false)}
                                            disabled={processing}
                                            slotProps={{ 
                                                textField: {
                                                    onClick: () => !processing && setOpenStart(true),
                                                    size: 'small',
                                                    sx: { 
                                                        width: '112px',
                                                        '& .MuiPickersInputBase-root': {
                                                            fontSize: '0.85rem',
                                                            padding: '0 8px',
                                                        },
                                                        '& .MuiInputAdornment-root': { display: 'none' }
                                                    }
                                                },
                                                actionBar: {
                                                    actions: ['today'],
                                                    sx: { '& .MuiButton-root':{ color: 'secondary.main'}}
                                                }
                                            }}
                                        />
                                        
                                        {/* Розділювач */}
                                        <Typography color="text.secondary" sx={{ fontWeight: 'bold' }}>-</Typography>
                                        
                                        {/* Дата кінця */}
                                        <DateTimePicker
                                            format="DD.MM.YY HH:mm"
                                            ampm={false}
                                            value={dayjs(data.date_end)}
                                            onChange={(newValue) => setData('date_end', newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : null)}
                                            open={openEnd}
                                            onClose={() => setOpenEnd(false)}
                                            disabled={processing}
                                            slotProps={{ 
                                                textField: { 
                                                    onClick: () => !processing && setOpenEnd(true),
                                                    size: 'small', 
                                                    placeholder: 'Кінець',
                                                    sx: {
                                                        width: '112px',
                                                        '& .MuiPickersInputBase-root': {
                                                            fontSize: '0.85rem',
                                                            padding: '0 8px',
                                                        },
                                                        '& .MuiInputAdornment-root': { display: 'none' }
                                                    }
                                                },
                                                actionBar: {
                                                    actions: ['today'],
                                                    sx: { '& .MuiButton-root':{ color: 'secondary.main'}}
                                                }
                                            }}
                                        />
                                    </Box>
                                </LocalizationProvider>
                                
                                {/* Кнопка збереження */}
                                <IconButton size="small" color="primary" onClick={applySave} disabled={processing}>
                                    {processing ? <CircularProgress size={16} /> : <CheckIcon />}
                                </IconButton>
                            </Box>
                        ) : (
                            <Box onClick={() => !processing && setEditingField('dates')} sx={{ cursor: processing ? 'default' : 'pointer', flexGrow: 1 }}>
                                <Typography variant="body2">
                                    {dayjs(data.date_start).format('DD.MM.YY HH:mm')} - 
                                    {dayjs(data.date_end).format('DD.MM.YY HH:mm')}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* НАГАДУВАННЯ */}
                <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                    <Typography
                        variant="body2"
                        sx={{ width: 140, flexShrink: 0, fontWeight: 500 }}
                    >
                        Нагадування:
                    </Typography>

                    {editingField === 'reminder' ? (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%', px: 1 }}>
                            <Tooltip title={!data.date_end ? 'Спочатку встановіть дату завершення' : ''}>
                                <FormControl
                                    size="small"
                                    color="secondary"
                                    sx={{ width: '100%' }}
                                    disabled={!data.date_end || processing}
                                >
                                    <InputLabel id="notif-select-label">Нагадування</InputLabel>

                                    <Select
                                        labelId="notif-select-label"
                                        label="Нагадування"
                                        value={data.reminder || 'none'}
                                        onChange={(e) => {
                                            setData('reminder', e.target.value);
                                            handleSave();
                                        }}
                                    >
                                        {availableReminders.map((rem) => (
                                            <MenuItem key={rem.id} value={rem.id}>
                                                {rem.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Tooltip>
                            <IconButton size="small" color="primary" onClick={applySave} disabled={processing}>
                                {processing ? <CircularProgress size={16} /> : <CheckIcon />}
                            </IconButton>
                        </Box>
                    ) : (
                        <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                            onClick={() => !processing && setEditingField('reminder')}
                        >
                            <NotificationsActiveIcon
                                sx={{
                                    fontSize: 18,
                                    color: data.reminder ? '#ff00b7' : 'action.disabled'
                                }}
                            />
                            <Typography variant="body2">
                                {data.reminder || 'Вимкнено'}
                            </Typography>
                        </Box>
                    )}
                </Box>


                {/* ПРОГРЕС */}
                <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                    <Typography variant="body2" sx={{ width: 140, flexShrink: 0, fontWeight: 500 }}>Прогрес:</Typography>
                    
                    <Box sx={{ flexGrow: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 2 }}>
                        {editingField === 'progress' ? (
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%', px: 1 }}>
                                <Slider 
                                    value={data.progress || 0} 
                                    onChange={(e, val) => setData('progress', val)} 
                                    valueLabelDisplay="auto"
                                    color="secondary"
                                    disabled={processing}
                                />
                                <IconButton size="small" color="primary" onClick={applySave} disabled={processing}>
                                    {processing ? <CircularProgress size={16} /> : <CheckIcon />}
                                </IconButton>
                            </Box>
                        ) : (
                            <Box onClick={() => !processing && setEditingField('progress')} sx={{ cursor: 'pointer', flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={data.progress || 0}
                                    color="secondary"
                                    sx={{ flexGrow: 1, height: 6, borderRadius: 5 }}
                                />
                                <Typography variant="caption" fontWeight="bold">{data.progress || 0}%</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Stack>

            {/* БЛОК ПІДЗАДАЧ */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                    Підзадачі ({task.subtasks?.length || 0})
                </Typography>

                {/* Вивід існуючих підзадач */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    {task.subtasks?.map(sub => (
                        <Box key={sub.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, border: '1px solid #eee', borderRadius: 2 }}>
                            {/* Якщо потрібно, тут можна додати іконку або чекбокс статусу */}
                            <Typography sx={{ textDecoration: sub.status === 'done' ? 'line-through' : 'none' }}>
                                {sub.title}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* КНОПКА ВІДКРИТТЯ МОДАЛКИ СТВОРЕННЯ */}
                <Button 
                    variant="outlined" 
                    color="secondary" 
                    startIcon={<AddIcon />} 
                    onClick={onAddSubtask}
                    sx={{ borderRadius: 2 }}
                >
                    Додати підзадачу
                </Button>
            </Box>

        </Box>
    );
}