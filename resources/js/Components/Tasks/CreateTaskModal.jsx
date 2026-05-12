import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import TipTapEditor from '@/Components/Editors/TipTapEditor';
import dayjs from 'dayjs';


import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button, TextField, Select, MenuItem,
    IconButton, Slider, ButtonGroup, Menu, Divider,
    FormControl, InputLabel, Tooltip, 
    Autocomplete, Accordion, AccordionDetails, AccordionSummary,
    FormHelperText
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import CloseIcon from '@mui/icons-material/Close';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function CreateTaskModal({ open, onClose, project, teamMembers, statuses, priorities, reminders }) {
    // console.log('teamMembers: ', teamMembers);
    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);
    
    // Стейти для випадаючого меню кнопки створення
    const [anchorEl, setAnchorEl] = useState(null);
    const [createMode, setCreateMode] = useState('create_close'); // 'create_close' або 'create_next'

    const [dragActive, setDragActive] = useState(false);

    // ДАННЫЕ ФОРМЫ
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        title: '',
        description: '',
        assignees: [], 
        date_start: null, 
        date_end: null,
        status: 'backlog',
        priority: 'medium',
        reminder: 'none',
        progress: 0,
        files: [],
    });

    const getAvailableReminders = () => {
        // Якщо дата кінця не обрана, дозволяємо тільки "Немає"
        if (!data.date_end) return reminders.filter(r => r.id === 'none');

        const now = dayjs(); // Поточний час
        const deadline = dayjs(data.date_end);
        const diffInHours = deadline.diff(now, 'hour');

        return reminders.filter(rem => {
            if (rem.id === 'none') return true;

            // Логіка обмежень (в годинах)
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

    const handleSplitButtonClick = (event) => setAnchorEl(event.currentTarget);

    const handleSplitMenuClose = () => setAnchorEl(null);

    const handleSelectCreateMode = (mode) => {
        setCreateMode(mode);
        handleSplitMenuClose();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);

        const droppedFiles = Array.from(e.dataTransfer.files);

        setData('files', [...data.files, ...droppedFiles]);
    };

    useEffect(() => {
        if (!open) reset(); // Очищає всі поля до початкових значень
    }, [open]);

    useEffect(() => {
        if (!data.date_end) setData('reminder', 'none');
    }, [data.date_end]);

    useEffect(() => {
        const isStillValid = availableReminders.some(r => r.id === data.reminder);
        if (!isStillValid) setData('reminder', 'none');
    }, [data.date_end]);

    // Форматируем данные
    // transform((formData) => ({
    //     ...formData,
    //     project_id: project.id,
    //     assignees: formData.assignees.map(u => u.id),
    //     date_start: formData.date_start ? formData.date_start.format('YYYY-MM-DD HH:mm:ss') : null,
    //     date_end: formData.date_end ? formData.date_end.format('YYYY-MM-DD HH:mm:ss') : null,
    //     reminder: formData.reminder !== 'none' ? formData.reminder : null,
    // }));    

    // Головна функція створення завдання
    const handleCreateTask = () => {
        transform((formData) => ({
            ...formData,
            project_id: project.id,
            assignees: formData.assignees.map(u => u.id),
            date_start: formData.date_start ? formData.date_start.format('YYYY-MM-DD HH:mm:ss') : null,
            date_end: formData.date_end ? formData.date_end.format('YYYY-MM-DD HH:mm:ss') : null,
            reminder: formData.reminder !== 'none' ? formData.reminder : null,
        }));

        post('/add/task', {
            preserveScroll: true,
            forceFormData: true,

            onSuccess: () => {
                // закриття або продовження створення
                if (createMode === 'create_close') {
                    onClose(); // Закриваємо модалку
                    reset();   // Очищаємо форму

                } else reset(); // Очищаємо форму
            },

        });
    };


    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') onClose();
            }}
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            {/* ХЕДЕР */}
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="subtitle1" color="black" sx={{ fontWeight: '600' }}>
                        {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        / Нове завдання
                    </Typography>
                </Box>
                
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderTop: 'none', pt: 1 }}>
                <Box>
                    <TextField 
                        label="Назва завдання" 
                        color='secondary'
                        variant="outlined" 
                        size="small" 
                        sx={{ mb: 2 }} 
                        fullWidth 
                        value={data.title} 
                        onChange={(e) => setData('title', e.target.value)}
                        error={!!errors.title}
                        helperText={errors.title}
                    />
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box>
                    {/* ВЛАСТИВОСТІ */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1, letterSpacing: 1, textTransform: 'uppercase' }}>
                            Властивості
                        </Typography>

                        {/* первый ряд */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, gap: 5 }}>
                            {/* Виконавець */}
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '35%', mt: 1 }}>
                                <PersonOutlinedIcon sx={{ fontSize: 28, mr: 1.5, color: '#f58fe1' }} />
                                <Box sx={{ width: '100%'}}>
                                    <Autocomplete
                                        multiple
                                        id="assignees-selector"
                                        size='small'
                                        color='secondary'
                                        options={teamMembers}
                                        value={data.assignees}
                                        onChange={(event, newValue) => setData('assignees', newValue)}
                                        getOptionLabel={(option) => option.name}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                size="small"
                                                label="Виконавець"
                                                color='secondary'
                                                sx={{ bgcolor: '#fff', height: 'min-content' }}
                                                error={!!errors.assignees}
                                                helperText={errors.assignees}
                                            />
                                        )}
                                    />
                                </Box>
                            </Box>

                            {/* Дати */}
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '50%', mt: 1 }}>
                                <CalendarTodayIcon sx={{ fontSize: 28, mr: 1.5, color: '#f58fe1' }} />
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1, // Отступ между инпутами и тире
                                            bgcolor: '#fff' 
                                        }}
                                    >
                                        {/* Дата начала */}
                                        <DateTimePicker
                                            format="DD.MM.YY HH:mm"
                                            label="Дата початку"
                                            ampm={false}
                                            value={data.date_start}
                                            onChange={(newValue) => setData('date_start', newValue)}
                                            open={openStart}
                                            onClose={() => setOpenStart(false)}
                                            slotProps={{ 
                                                textField: {
                                                    onClick: () => setOpenStart(true),
                                                    size: 'small',
                                                    error:!!errors.date_start,
                                                    helperText:errors.date_start,
                                                    sx: { 
                                                        width: '112px',
                                                        '& .MuiPickersInputBase-root': {
                                                            fontSize: '0.85rem',
                                                            padding: '0 8px', // Убираем пустое пространство справа
                                                        },
                                                        '& .MuiInputAdornment-root': {
                                                            display: 'none',
                                                        }
                                                    }
                                                },
                                                actionBar: {
                                                    actions: ['today'], // Кнопка "Сьогодні"
                                                    sx: { '& .MuiButton-root':{ color: 'secondary.main'}}
                                                }
                                            }}
                                        />
                                        
                                        {/* Разделитель */}
                                        <Typography color="text.secondary" sx={{ fontWeight: 'bold' }}>-</Typography>
                                        
                                        {/* Дата конца */}
                                        <DateTimePicker
                                            format="DD.MM.YY HH:mm"
                                            label="Дата кінця"
                                            ampm={false}
                                            value={data.date_end}
                                            onChange={(newValue) => setData('date_end', newValue)}
                                            open={openEnd}
                                            onClose={() => setOpenEnd(false)}
                                            slotProps={{ 
                                                textField: { 
                                                    onClick: () => setOpenEnd(true),
                                                    size: 'small', 
                                                    placeholder: 'Кінець',
                                                    error:!!errors.date_end,
                                                    helperText:errors.date_end,
                                                    sx: {
                                                        width: '117px',
                                                        '& .MuiPickersInputBase-root': {
                                                            fontSize: '0.85rem',
                                                            padding: '0 8px',
                                                        },
                                                        '& .MuiPickersSectionList-root': {
                                                            width: '100%',
                                                            maxWidth: '100%',
                                                        },
                                                        '& .MuiInputAdornment-root': {
                                                            display: 'none',
                                                        }
                                                    }
                                                },
                                                actionBar: {
                                                    actions: ['today'], // Кнопка "Сьогодні"
                                                    sx: { '& .MuiButton-root':{ color: 'secondary.main'}}
                                                }
                                            }}
                                        />
                                    </Box>
                                </LocalizationProvider>

                            </Box>
                        </Box>

                        {/* второй ряд */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5, gap: 5 }}>
                            {/* Статус */}
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '35%', mt: 1 }}>
                                <ViewColumnOutlinedIcon sx={{ fontSize: 24, mr: 1.5, color: '#f58fe1' }} />
                                <FormControl
                                    size="small"
                                    color="secondary"
                                    sx={{ width: '100%' }}
                                    error={!!errors.status}
                                >
                                    <InputLabel id="status-select-label">Статус</InputLabel>
                                    <Select
                                        label="Статус"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        labelId='status-select-label'
                                        size="small"
                                        color="secondary"
                                        sx={{ width: '100%' }}
                                    >
                                        {statuses.map((status) => (
                                            <MenuItem key={status.id} value={status.id}>
                                                {status.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.status}</FormHelperText>
                                </FormControl>
                                
                                
                            </Box>

                            {/* Пріоритетність */}
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '35%', mt: 1 }}>
                                <FlagOutlinedIcon sx={{ fontSize: 24, mr: 1.5, color: '#f58fe1' }} />
                                <FormControl size="small" color="secondary" sx={{ width: '100%' }}>
                                    <InputLabel id="priority-select-label">Пріоритетність</InputLabel>
                                    <Select
                                        label="Пріоритетність"
                                        size="small"
                                        color="secondary"
                                        sx={{ bgcolor: '#fff', width: '110%' }}
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                        error={!!errors.priority}
                                        helperText={errors.priority}
                                    >
                                        {priorities.map((priority) => (
                                            <MenuItem key={priority.id} value={priority.id}>
                                                {priority.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    </Box> {/* /ВЛАСТИВОСТІ */}

                    {/* DESCRIPTION */}
                    <Box>
                        <TipTapEditor 
                            value={data.description} 
                            onChange={(html) => setData('description', html)}
                        />
                    </Box>

                    {/* Додатково */}
                    <Box>
                        <Accordion
                            elevation={0} 
                            sx={{ 
                                mb: 1, 
                                border: '1px solid #e0e0e0', 
                                borderRadius: '8px !important',
                                '&:before': { display: 'none' }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="body2" fontWeight="bold">Додаткові налаштування</Typography>
                            </AccordionSummary>

                            <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                                
                                {/* ПРОГРЕСС И НАПОМИНАНИЯ */}
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>

                                    <Box sx={{ width: '50%'}}>
                                        <Typography variant="body2" color="text.secondary">
                                            Прогрес
                                        </Typography>
                                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Slider 
                                                size="small" 
                                                value={data.progress} 
                                                onChange={(e, val) => setData('progress', val)}
                                                step={10}
                                                min={0}
                                                max={100}
                                                sx={{ color: 'secondary.main'}}
                                            />
                                            <Typography variant="body2" sx={{ minWidth: '40px', textAlign: 'right', fontWeight: 'bold' }}>
                                                {data.progress}%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <NotificationsNoneIcon sx={{ fontSize: 28, mr: 0.3, color: 'secondary.main'}} />
                                        <Tooltip title={!data.date_end ? 'Спочатку встановіть дату завершення' : ''}>
                                            <FormControl size="small" color="secondary" sx={{ width: '100%' }}>
                                                <InputLabel id="notif-select-label">Нагадування</InputLabel>
                                                <Select
                                                    labelId='notif-select-label'
                                                    label='Нагадування'
                                                    size="small"
                                                    color="secondary"
                                                    defaultValue="none"
                                                    sx={{ flexGrow: 1, bgcolor: '#fff' }}
                                                    disabled={!data.date_end}
                                                    value={data.reminder}
                                                    onChange={(e) => setData('reminder', e.target.value)}
                                                >
                                                    {availableReminders.map((rem) => (
                                                        <MenuItem key={rem.id} value={rem.id}>
                                                            {rem.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Tooltip>
                                    </Box>
                                </Box>
                                <Box
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragActive(true);
                                    }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={handleDrop}
                                    sx={{
                                        border: '2px dashed',
                                        bgcolor: dragActive ? '#f9c5eed6' : '#f9c5ef3b',
                                        borderColor: 'primary.main',
                                        borderRadius: 3,
                                        p: 3,
                                        mt: 2,
                                        textAlign: 'center',
                                    }}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.docx,.jpg,.jpeg,.png"
                                        id="task-files"
                                        hidden
                                       onChange={(e) => setData('files', [...data.files, ...Array.from(e.target.files)])}
                                    />

                                    <label htmlFor="task-files">
                                        <Button
                                            component="span"
                                            variant="contained"
                                            color="secondary"
                                        >
                                            Завантажити файли
                                        </Button>
                                    </label>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        або перетягніть файли сюди
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 1 }}
                                    >
                                        Дозволені формати: <b>PDF, DOCX, JPG та PNG</b><br /> Максимальний розмір файлу <b>10МБ</b>
                                    </Typography>
                                    
                                    {errors.files && (
                                        <Typography color="error" variant="caption">
                                            {errors.files}
                                        </Typography>
                                    )}

                                    {data.files?.length > 0 && (
                                        <Box
                                            sx={{
                                                mt: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                alignItems: 'flex-start'
                                            }}
                                        >
                                            {data.files.map((file, index) => (
                                               <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        width: '100%',
                                                        '&:hover': { bgcolor: '#fff', borderRadius: 2 },
                                                    }}
                                                >
                                                    <Typography
                                                        title={file.name}
                                                        sx={{
                                                            fontWeight: 600,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            maxWidth: '90%'
                                                        }}
                                                    >
                                                        <Box component="span" sx={{ fontSize: '22px' }}>📎</Box>
                                                        {file.name}
                                                    </Typography>

                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => {
                                                            const updatedFiles = data.files.filter((_, i) => i !== index);
                                                            setData('files', updatedFiles);
                                                        }}
                                                    >
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </Box>

                </Box>
            </DialogContent>

            {/* ФУТЕР */}
            <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button onClick={onClose} sx={{ color: 'secondary.main'}}>Скасувати</Button>    
                </Box>
                
                <ButtonGroup variant="contained" color="primary" disableElevation sx={{ borderRadius: 2 }}>
                    <Button
                        onClick={handleCreateTask}
                        sx={{ px: 3 }}
                        disabled={processing}
                    >
                        {processing ? 'Створення...' : 'Створити'}
                    </Button>
                    <Button size="small" onClick={handleSplitButtonClick}><ArrowDropDownIcon /></Button>
                </ButtonGroup>
                
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleSplitMenuClose}>
                    <MenuItem onClick={() => handleSelectCreateMode('create_next')} selected={createMode === 'create_next'}>
                        Створити та додати наступне
                    </MenuItem>
                </Menu>
            </DialogActions>

        </Dialog>
    );
}