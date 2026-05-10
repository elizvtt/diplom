// import React, { useEffect } from 'react';
// import TipTapEditor from '@/Components/Editors/TipTapEditor';
// import DOMPurify from 'dompurify';

// import { 
//     Box, Typography, IconButton, Avatar,
//     AvatarGroup, Tooltip, LinearProgress, Autocomplete,
//     Button, Stack, TextField, Select, MenuItem, FormControl
// } from '@mui/material';

// import FlagIcon from '@mui/icons-material/Flag';
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
// import EditIcon from '@mui/icons-material/Edit';

// import { priorityColors} from '@/utils/constants';

// export default function TaskDetails({ task, project, priorities, teamMembers, data, setData, editingField, setEditingField, handleSave }) {
    
//     const startEdit = (field) => {
//         setEditingField(field);
//     };

//     useEffect(() => {
//         const handler = (e) => {
//             if (e.key === 'Escape') setEditingField(null);
//         };

//         window.addEventListener('keydown', handler);
//         return () => window.removeEventListener('keydown', handler);
//     }, []);

//     const handleChangeAndSave = (field, value) => {
//         setData(field, value);
//         setTimeout(() => {
//             handleSave();
//             setEditingField(null);
//         }, 0);
//     };


//     return (
//         <Box sx={{ flexGrow: 1, minWidth: 0 }}>            
//             {/* Опис */}
//             <Box>
//                 {editingField === 'description' ? (
//                     <Box>
//                         <TipTapEditor
//                             content={data.description.text}
//                             onChange={(val) => {setData('description', { ...data.description, text: val });}}
//                         />

//                         <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
//                             <Button
//                                 onClick={() => {
//                                     handleSave();
//                                     setEditingField(null);
//                                 }}
//                                 variant="contained"
//                                 size="small"
//                             >
//                                 Save
//                             </Button>

//                             <Button
//                                 onClick={() => setEditingField(null)}
//                                 variant="text"
//                                 size="small"
//                             >
//                                 Cancel
//                             </Button>
//                         </Box>
//                     </Box>
//                 ) : (
//                     <Box
//                         onClick={() => {
//                             setEditingField('description');
//                         }}
//                         sx={{
//                             cursor: 'pointer',
//                             '&:hover': { bgcolor: '#f8fafc', borderRadius: 1 }
//                         }}
//                     >
//                         <Typography
//                             variant="body1"
//                             sx={{
//                                 color: 'text.primary',
//                                 '& p': { margin: 0 },
//                                 '& ol': { margin: 0 },
//                                 lineHeight: 1.6
//                             }}
//                             dangerouslySetInnerHTML={{
//                                 __html: DOMPurify.sanitize(
//                                     data.description || ''
//                                 )
//                             }}
//                         />
//                     </Box>
//                 )}
//             </Box>

//             {/* ХАРАКТЕРИСТИКИ */}
//             <Stack
//                 spacing={2}
//                 sx={{ 
//                     p: 1.5,
//                     borderRadius: 2,
//                     bgcolor: '#f9c5ef30',
//                     color: '#000'
//                 }}
//             >
                
//                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Typography variant="body2" sx={{ width: 140, flexShrink: 0 }}>Виконавці:</Typography>
                    
//                     {/* {task.assignees?.length > 0 ? ( */}
//                         {editingField === 'assignees' ? (
//                             <Autocomplete
//                                 multiple
//                                 options={teamMembers || []}
//                                 value={data.assignees || []}
//                                 autoFocus
//                                 onChange={(e, value) => handleChangeAndSave('assignees', value)}
//                                 onBlur={() => {
//                                     handleSave();
//                                     setEditingField(null);
//                                 }}
//                                 getOptionLabel={(option) => option.name}
//                                 isOptionEqualToValue={(option, value) => option.id === value.id}
//                                 renderInput={(params) => (
//                                     <TextField {...params} size="small" />
//                                 )}
//                             />
//                         ) : (
//                             <Box 
//                                 onClick={() => setEditingField('assignees')} 
//                                 sx={{ cursor: 'pointer', flexGrow: 1, display: 'flex', alignItems: 'center', minHeight: 24 }}
//                             >
//                                 {data.assignees?.length > 0 ? (
//                                     <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: '0.8rem' } }}>
//                                         {data.assignees.map((u) => (
//                                             <Tooltip key={u.id} title={u.full_name}>
//                                                 <Avatar>{u.full_name?.[0]}</Avatar>
//                                             </Tooltip>
//                                         ))}
//                                     </AvatarGroup>
//                                 ) : (
//                                     <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
//                                         Не призначено
//                                     </Typography>
//                                 )}
//                             </Box>
//                         )}

                        
//                     {/* ) : <Typography variant="body2">Не призначено</Typography>} */}
//                 </Box>

//                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Typography variant="body2" sx={{ width: 140,  flexShrink: 0 }}>Пріоритет:</Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <FlagIcon sx={{ color: priorityColors[task.priority], fontSize: 18 }} />
//                         {editingField === 'priority' ? (
//                             <FormControl size="small">
//                                 <Select
//                                     value={data.priority}
//                                     onChange={(e) => handleChangeAndSave('priority', e.target.value)}
//                                     autoFocus
//                                 >
//                                     {priorities.map((p) => (
//                                         <MenuItem key={p.id} value={p.id}>
//                                             {p.label}
//                                         </MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         ) : (
//                             <Box
//                                 onClick={() => setEditingField('priority')}
//                                 sx={{ cursor: 'pointer' }}
//                             >
//                                 {priorities.find(p => p.id === data.priority)?.label}
//                             </Box>
//                         )}
//                     </Box>
//                 </Box>

//                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Typography variant="body2" sx={{ width: 140,  flexShrink: 0 }}>Терміни:</Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <CalendarMonthIcon sx={{ fontSize: 18, color: 'action.active' }} />
//                         <Typography variant="body2">
//                             {new Date(task.date_start).toLocaleDateString('uk-UA')} - {task.date_end ? new Date(task.date_end).toLocaleDateString('uk-UA') : 'не вказано'}
//                         </Typography>
//                     </Box>
//                 </Box>

//                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Typography variant="body2" sx={{ width: 140,  flexShrink: 0 }}>Нагадування:</Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <NotificationsActiveIcon sx={{ fontSize: 18, color: task.reminder ? '#ff00b7' : 'action.disabled' }} />
//                         <Typography variant="body2">{task.reminder || 'Вимкнено'}</Typography>
//                     </Box>
//                 </Box>

//                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Typography variant="body2" sx={{ width: 140,  flexShrink: 0 }}>Прогрес:</Typography>
//                     <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
//                         <LinearProgress 
//                             variant="determinate" 
//                             value={task.progress}
//                             color="secondary"
//                             sx={{ flexGrow: 1, height: 6, borderRadius: 5 }}
//                         />
//                         <Typography variant="caption" fontWeight="bold">{task.progress}%</Typography>
//                     </Box>
//                 </Box>
//             </Stack>
//         </Box>

//     )
// }

import React, { useEffect, useState  } from 'react';
import TipTapEditor from '@/Components/Editors/TipTapEditor';
import DOMPurify from 'dompurify';
import dayjs from 'dayjs';
import 'dayjs/locale/uk'; // Для української локалізації
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { 
    Box, Typography, IconButton, Avatar,
    AvatarGroup, Tooltip, LinearProgress, Autocomplete,
    Button, Stack, TextField, Select, MenuItem, FormControl, Slider
} from '@mui/material';

import FlagIcon from '@mui/icons-material/Flag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckIcon from '@mui/icons-material/Check';

import { priorityColors } from '@/utils/constants';

export default function TaskDetails({ task, project, priorities, teamMembers, data, setData, editingField, setEditingField, handleSave }) {
    
    console.log('data: ', data);

    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') setEditingField(null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);


    // Функція для завершення редагування та збереження
    const applySave = () => {
        handleSave();
        setEditingField(null);
    };

    return (
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>            
            {/* ОПИС */}
            <Box>
                {editingField === 'description' ? (
                    <Box>
                        <TipTapEditor
                            value={data.description}
                            onChange={(html) => setData('description', html)}
                        />

                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Button onClick={applySave} variant="contained" size="small">
                                Зберегти
                            </Button>
                            <Button onClick={() => setEditingField(null)} variant="text" size="small">
                                Скасувати
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        onClick={() => setEditingField('description')}
                        sx={{
                            cursor: 'pointer',
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
                                    options={teamMembers || []}
                                    value={data.assignees || []}
                                    onChange={(e, value) => setData('assignees', value)}
                                    getOptionLabel={(option) => option.name || option.full_name || ''}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    sx={{ width: '100%' }}
                                    renderInput={(params) => <TextField {...params} size="small" autoFocus placeholder="Оберіть..." />}
                                />
                                <IconButton size="small" color="primary" onClick={applySave}><CheckIcon /></IconButton>
                            </Box>
                        ) : (
                            <Box 
                                onClick={() => setEditingField('assignees')} 
                                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', height: '100%' }}
                            >
                                {data.assignees?.length > 0 ? (
                                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.8rem' } }}>
                                        {data.assignees.map((u) => (
                                            <Tooltip key={u.id} title={u.name || u.full_name}>
                                                <Avatar>{(u.name || u.full_name)?.[0]}</Avatar>
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
                                <FormControl size="small" fullWidth>
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
                                <IconButton size="small" color="primary" onClick={applySave}><CheckIcon /></IconButton>
                            </Box>
                        ) : (
                            <Box onClick={() => setEditingField('priority')} sx={{ cursor: 'pointer', flexGrow: 1 }}>
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
                                            borderRadius: 1
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
                                            slotProps={{ 
                                                textField: {
                                                    onClick: () => setOpenStart(true),
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
                                            slotProps={{ 
                                                textField: { 
                                                    onClick: () => setOpenEnd(true),
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
                                <IconButton size="small" color="primary" onClick={applySave}>
                                    <CheckIcon />
                                </IconButton>
                            </Box>
                        ) : (
                            <Box onClick={() => setEditingField('dates')} sx={{ cursor: 'pointer', flexGrow: 1 }}>
                                <Typography variant="body2">
                                    {dayjs(data.date_start).format('DD.MM.YY HH:mm')} - 
                                    {dayjs(data.date_end).format('DD.MM.YY HH:mm')}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* НАГАДУВАННЯ (Без змін, тільки стилістика) */}
                <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                    <Typography variant="body2" sx={{ width: 140, flexShrink: 0, fontWeight: 500 }}>Нагадування:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotificationsActiveIcon sx={{ fontSize: 18, color: data.reminder ? '#ff00b7' : 'action.disabled' }} />
                        <Typography variant="body2">{data.reminder || 'Вимкнено'}</Typography>
                    </Box>
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
                                />
                                <IconButton size="small" color="primary" onClick={applySave}><CheckIcon /></IconButton>
                            </Box>
                        ) : (
                            <Box onClick={() => setEditingField('progress')} sx={{ cursor: 'pointer', flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
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
        </Box>
    );
}