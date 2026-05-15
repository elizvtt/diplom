import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

import {
    Box, Button, Typography, Tooltip, Dialog,
    DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, Switch, FormControlLabel
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function CreateProjectModal({ open, onClose, onSuccess, project }) {
    // Определяем, режим редактирования это или нет
    const isEditMode = Boolean(project);

    // данные 
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        generate_ai_tasks: false,
    });

    const [warnedAboutLength, setWarnedAboutLength] = useState(false);
    
    // Заполняем форму при открытии, если передан project
    useEffect(() => {
        if (open && project) {
            setData({
                title: project.title || '',
                description: project.description || '',
            });
        } else if (open && !project) {
            reset(); // Очищаем форму, если это создание нового
        }
    }, [open, project]);

    // Обробник відправки форми
    const submitProject = (e) => {
        e.preventDefault();
        
        if (isEditMode) {
            post(`/projects/${project.uuid}/edit`, {
                onSuccess: () => { reset(); onClose(); }
            });

        } else {
            const MIN_DESC_LENGTH = 20;
    
            // проверка для ии
            if (data.generate_ai_tasks && data.description.trim().length < MIN_DESC_LENGTH && !warnedAboutLength) {
                onSuccess('Для якісної генерації завдань (ШІ) рекомендуємо додати детальніший опис проєкту', 'warning');
                setWarnedAboutLength(true);
                return; 
            }
    
            post('/add/project', {
                onSuccess: (page) => {
                    reset();
                    onClose();
                    // Дістаємо повідомлення, яке прийшло з контролера
                    const serverMessage = page.props.flash?.success || 'Успіх!';
    
                    onSuccess(serverMessage, 'success');
                    setWarnedAboutLength(false);
                },
            });
        }
        
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                    {isEditMode ? 'Редагування проєкту' : 'Створення нового проєкту'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <form onSubmit={submitProject}>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
                    
                    <TextField
                        label="Назва"
                        placeholder="Введіть назву проєкту"
                        variant="outlined"
                        color='secondary'
                        fullWidth
                        required
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        error={!!errors.title}
                        helperText={errors.title}
                    />

                    {/* Поки що тут простий Multiline TextField. Пізніше сюди вставимо Tiptap */}
                    <TextField
                        label="Опис"
                        placeholder="Опишіть основні цілі та завдання проєкту"
                        variant="outlined"
                        color='secondary'
                        fullWidth
                        multiline
                        minRows={4}
                        value={data.description}
                        onChange={(e) => {
                            setData('description', e.target.value);
                            setWarnedAboutLength(false);
                        }}
                        error={!!errors.description}
                        helperText={errors.description}
                    />

                    {!isEditMode && (
                        // БЛОК ГЕНЕРАЦІЇ ШІ
                        <Box 
                            sx={{ 
                                p: 2, 
                                bgcolor: data.generate_ai_tasks ? '#DDDBEF' : 'background.default',
                                borderRadius: 2, 
                                border: '1px dashed', 
                                // borderColor: data.generate_ai_tasks ? '#6600cc' : 'divider',
                                borderColor: '#6600cc',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={data.generate_ai_tasks} 
                                        onChange={(e) => setData('generate_ai_tasks', e.target.checked)}
                                        color="default"
                                    />
                                }
                                label={
                                    <Typography fontWeight="bold" sx={{ display: 'flex', gap: 1, alignItems: 'center'}}>
                                        <AutoAwesomeIcon fontSize="small" sx={{ color: '#6600cc'}} />
                                        Згенерувати структуру завдань (ШІ)
                                    </Typography>
                                }
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 5, mt: -0.5 }}>
                                Система проаналізує назву та опис, щоб автоматично створити базовий план завдань для цього проєкту.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions sx={{ p: 2, px: 3 }}>
                    <Button 
                        color='error'
                        variant="outlined"
                        onClick={onClose}
                    >
                        Скасувати
                    </Button>

                    <Tooltip 
                        title={!data.title.trim() ? 'Спочатку введіть назву проєкту' : ''} 
                        placement="bottom"
                        arrow
                    >
                        <span>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                sx={{ background: '#475c4b', color: '#fff', '&:hover': { background: '#354638' } }}
                                disabled={processing || !data.title.trim()}
                            >
                                {isEditMode 
                                    ? (processing ? 'Збереження...' : 'Зберегти') 
                                    : (processing ? 'Створення...' : 'Створити проєкт')
                                }
                            </Button>
                        </span>
                    </Tooltip>
                </DialogActions>
            </form>
        </Dialog>

    )
}