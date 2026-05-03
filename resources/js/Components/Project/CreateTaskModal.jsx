import React, { useState } from 'react';
// import TipTapEditor from './TipTapEditor';
import TipTapEditor from '@/Components/Project/TipTapEditor';

import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button, TextField, Select, MenuItem,
    IconButton, Slider, ButtonGroup, Menu, Divider,
    FormControl, InputLabel,
    Autocomplete, Accordion, AccordionDetails, AccordionSummary
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import CloseIcon from '@mui/icons-material/Close';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// 1. Тестові дані (список команди)
const TEAM_MEMBERS = [
    { id: 1, name: 'Олексій' },
    { id: 2, name: 'Марія' },
    { id: 3, name: 'Іван' },
    { id: 4, name: 'Анна' },
];

export default function CreateTaskModal({ open, onClose, project }) {
    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);

    // Стейт вкладок (Details = 'details', Advanced = 'advanced')
    const [activeTab, setActiveTab] = useState('details');
    // Стейт прогресу для слайдера
    const [progress, setProgress] = useState(0);
    
    // Стейти для випадаючого меню кнопки створення
    const [anchorEl, setAnchorEl] = useState(null);
    const [createMode, setCreateMode] = useState('create_close'); // 'create_close' або 'create_next'

    const [description, setDescription] = useState('');

    const handleTabChange = (event, newValue) => {
        if (newValue !== null) setActiveTab(newValue);
    };

    const handleSplitButtonClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSplitMenuClose = () => setAnchorEl(null);

    const handleSelectCreateMode = (mode) => {
        setCreateMode(mode);
        handleSplitMenuClose();
    };

    // Головна функція створення завдання
    const handleCreateTask = () => {
        console.log("Task created!");
        // TODO: Тут логіка відправки даних на бекенд
        
        if (createMode === 'create_close') {
            onClose(); // Закриваємо модалку
        } else {
            // Очищаємо форму, модалка залишається відкритою
            setProgress(0);
            setActiveTab('details');
            console.log("Ready for next task!");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
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
                                        // limitTags={2}
                                        id="assignees-selector"
                                        size='small'
                                        color='secondary'
                                        options={TEAM_MEMBERS}
                                        getOptionLabel={(option) => option.name}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                size="small"
                                                label="Виконавець"
                                                color='secondary'
                                                sx={{ bgcolor: '#fff', height: 'min-content' }}
                                            />
                                        )}
                                    />
                                </Box>
                            </Box>

                            {/* Дати */}
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '35%', mt: 1 }}>
                                <CalendarTodayIcon sx={{ fontSize: 28, mr: 1.5, color: '#f58fe1' }} />
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1, // Отступ между инпутами и тире
                                            bgcolor: '#fff' 
                                        }}
                                    >
                                        {/* Дата начала */}
                                        <DatePicker
                                            format="DD.MM.YY"
                                            label="Дата початку"
                                            open={openStart}
                                            onClose={() => setOpenStart(false)}
                                            slotProps={{ 
                                                textField: {
                                                    onClick: () => setOpenStart(true),
                                                    size: 'small', 
                                                    // placeholder: 'Початок',
                                                    // Стилизуем инпут, чтобы он не казался громоздким
                                                    sx: { 
                                                        width: '100px',
                                                        '& .MuiInputBase-root': { 
                                                            fontSize: '0.6rem',
                                                            paddingRight: '8px', // Убираем пустое пространство справа
                                                        },
                                                        '& .MuiInputAdornment-root': {
                                                            display: 'none',
                                                        }
                                                    }
                                                } 
                                            }}
                                        />
                                        
                                        {/* Разделитель */}
                                        <Typography color="text.secondary" sx={{ fontWeight: 'bold' }}>-</Typography>
                                        
                                        {/* Дата конца */}
                                        <DatePicker
                                            format="DD.MM.YY"
                                            label="Дата кінця"
                                            open={openEnd}
                                            onClose={() => setOpenEnd(false)}
                                            slotProps={{ 
                                                textField: { 
                                                    onClick: () => setOpenEnd(true),
                                                    size: 'small', 
                                                    placeholder: 'Кінець',
                                                    sx: {
                                                        color: 'secondary',
                                                        width: '100px',
                                                        '& .MuiInputBase-root': { 
                                                            fontSize: '0.75rem',
                                                            paddingRight: '8px',
                                                        },
                                                        '& .MuiInputAdornment-root': {
                                                            display: 'none',
                                                        }
                                                    }
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
                                <FormControl size="small" color="secondary" sx={{ width: '100%' }}>
                                    <InputLabel id="status-select-label">Статус</InputLabel>
                                    <Select
                                        label="Статус"
                                        labelId='status-select-label'
                                        size="small"
                                        color="secondary"
                                        sx={{ width: '100%' }}
                                    >
                                        <MenuItem value="todo">To Do</MenuItem>
                                        <MenuItem value="in_progress">In Progress</MenuItem>
                                        <MenuItem value="review">Review</MenuItem>
                                        <MenuItem value="done">Done</MenuItem>
                                        <MenuItem value="canceled">Canceled</MenuItem>
                                    </Select>
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
                                    >
                                        <MenuItem value="low">Низький</MenuItem>
                                        <MenuItem value="medium">Середній</MenuItem>
                                        <MenuItem value="high">Високий</MenuItem>
                                        <MenuItem value="critical">Критичний</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    </Box> {/* /ВЛАСТИВОСТІ */}

                    {/* DESCRIPTION */}
                    <Box>
                        <TipTapEditor 
                            value={description} 
                            onChange={(html) => setDescription(html)} 
                        />
                    </Box>
                    {/* <Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <TextField
                                placeholder="Додайте детальний опис завдання"
                                label='Опис'
                                variant="outlined"
                                color="secondary"
                                minRows={3}
                                multiline
                                fullWidth
                                sx={{ mb: 2 }}
                            />
                        </Box>
                    </Box> */}
                    {/* /DESCRIPTION */}

                    {/* Додатково */}
                    <Box>
                        <Accordion
                            // disableGutters 
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
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>

                                    <Box sx={{ width: '50%'}}>
                                        <Typography variant="body2" color="text.secondary">
                                            Прогрес
                                        </Typography>
                                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Slider 
                                                size="small" 
                                                value={progress} 
                                                onChange={(e, val) => setProgress(val)} 
                                                step={10}
                                                min={0}
                                                max={100}
                                                sx={{ color: 'secondary.main'}} 
                                                // rgb(207, 112, 222)
                                            />
                                            <Typography variant="body2" sx={{ minWidth: '40px', textAlign: 'right', fontWeight: 'bold' }}>
                                                {progress}%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <NotificationsNoneIcon sx={{ fontSize: 28, mr: 0.3, color: 'secondary.main'}} />
                                        <FormControl size="small" color="secondary" sx={{ width: '100%' }}>
                                            <InputLabel id="notif-select-label">Нагадування</InputLabel>
                                            <Select
                                                lavelId='notif-select-label'
                                                label='Нагадування'
                                                size="small"
                                                color="secondary"
                                                defaultValue="none"
                                                sx={{ flexGrow: 1, bgcolor: '#fff' }}
                                            >
                                                <MenuItem value="none">Без нагадувань</MenuItem>
                                                <MenuItem value="1_hour">За 1 годину</MenuItem>
                                                <MenuItem value="1_day">За 1 день</MenuItem>
                                                <MenuItem value="2_days">За 2 дні</MenuItem>
                                                <MenuItem value="1_week">За 1 тиждень</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
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
                    <Button onClick={handleCreateTask} sx={{ px: 3 }}>Створити</Button>
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