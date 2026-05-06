import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';

import {
    Alert, Snackbar,
    Box, Button, Card, CardActionArea, CardContent, Divider,
    Grid, Link, LinearProgress, Menu, MenuItem,
    Typography, Tooltip, ToggleButton, ToggleButtonGroup, Chip, 
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    IconButton, Switch, FormControlLabel
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';


//сохраняем данные в локал сторедж
function useLocalStorage(key, initialValue) {
    // сначала проверяем есть ли значения в локал сторедже
    const [state, setState] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            // если есть данные, то используем их, если нет, используем начальные
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn('Помилка читання з localStorage', error);
            return initialValue;
        }
    });

    // когда данные меняются сохраняем их
    useEffect(() => {
        try {
            // Зберігаємо об'єкт як JSON-рядок
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.warn('Помилка запису в localStorage', error);
        }
    }, [key, state]);

    return [state, setState];
}

// ЗАГЛУШКИ
// const mockProjects = [
//     {
//         id: 1,
//         title: 'Оновлення корпоративного сайту',
//         description: 'Повний редизайн та перехід на новий стек технологій.',
//         is_active: 1,
//         is_owner: true,
//         tasks_total: 12,
//         tasks_completed: 9,
//     },
//     {
//         id: 2,
//         title: 'Мобільний додаток для клієнтів',
//         description: 'Розробка iOS та Android додатків.',
//         is_active: 1,
//         is_owner: false,
//         tasks_total: 5,
//         tasks_completed: 5,
//     },
//     {
//         id: 3,
//         title: 'Внутрішня CRM система',
//         description: 'Інтеграція з існуючими базами даних та налаштування ролей.',
//         is_active: 0,
//         is_owner: true,
//         tasks_total: 0,
//         tasks_completed: 0,
//     }
// ];

const sortOptions = [
    { value: 'newest', label: 'Спочатку нові' },
    { value: 'oldest', label: 'Спочатку старі' },
    { value: 'title_asc', label: 'За алфавітом (А-Я)' },
    { value: 'title_desc', label: 'За алфавітом (Я-А)' },
    { value: 'progress_desc', label: 'За прогресом (від більшого)' },
    { value: 'progress_asc', label: 'За прогресом (від меншого)' },
];

const statusOptions = [
    { value: 'all', label: 'Всі' },
    { value: 'active', label: 'Активні' },
    { value: 'archived', label: 'В архіві' },
];

const roleOptions = [
    { value: 'all', label: 'Всі' },
    { value: 'owner', label: 'Власник' },
    { value: 'participant', label: 'Учасник' },
];

// Стиль для пунктів меню
const menuItemStyle = {
    '&.Mui-selected': {
        fontWeight: 'bold',
        backgroundColor: '#9e08e11f',
    },
    '&.Mui-selected:hover': {
        backgroundColor: '#7a05b047',
    }
};

// відображення прогресу
const ProjectProgressBar = ({ completed, total }) => {
    // Рахуємо відсоток
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <Box sx={{ mt: 'auto', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    Виконано: {completed || 0}/{total || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    {percent}%
                </Typography>
            </Box>
            <LinearProgress 
                variant="determinate" 
                value={percent} 
                color={percent === 100 ? 'success' : 'primary'} 
                sx={{ height: 6, borderRadius: 3, backgroundColor: percent === 0 ? '#e0e0e0' : undefined }} 
            />
        </Box>
    );
};

export default function ProjectsList({ projects }) {
    // console.log('projects: ', projects);
    const displayProjects = projects || mockProjects;

    // Форма Inertia
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        generate_ai_tasks: false,
    });

    // Стейт для всех настроек
    const [settings, setSettings] = useLocalStorage('project_list', {
        view: 'module',
        sortBy: 'newest',
        filterStatus: 'all',
        filterRole: 'all'
    });
    const { view, sortBy, filterStatus, filterRole } = settings; // деструктуризация

    // модальное окно для создания проєкта
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Стейти для відкриття випадаючих меню
    const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
    const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
    const [warnedAboutLength, setWarnedAboutLength] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'warning',
    });

    // Фильтрация и сортировка проэктов
    const processedProjects = useMemo(() => {
        let result = [...displayProjects];
        // console.log('processedProjects: ', result);
        // console.log('filterStatus: ', filterStatus);

        // Фильтрация по статусу
        if (filterStatus === 'active') result = result.filter(p => p.is_active === 1);
        if (filterStatus === 'archived') result = result.filter(p => p.is_active === 0);

        // фильтрация по роли
        if (filterRole === 'owner') result = result.filter(p => p.is_owner === true);
        if (filterRole === 'participant') result = result.filter(p => p.is_owner === false);

        // сортировка
        result.sort((a, b) => {
            switch (sortBy) {
                case 'newest': 
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest': 
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'title_asc': 
                    return a.title.localeCompare(b.title);
                case 'title_desc': 
                    return b.title.localeCompare(a.title);
                case 'progress_desc':
                case 'progress_asc': {
                    const progressA = a.tasks_total > 0 ? a.tasks_completed / a.tasks_total : 0;
                    const progressB = b.tasks_total > 0 ? b.tasks_completed / b.tasks_total : 0;
                    
                    return sortBy === 'progress_desc' 
                        ? progressB - progressA 
                        : progressA - progressB;
                }
                default:
                    return 0;
            }
        });

        return result;
    }, [displayProjects, sortBy, filterStatus, filterRole]);
    
    // ^ Handlers
    // Обробники фільтрів та відображення
    const setView = (newView) => setSettings(prev => ({ ...prev, view: newView }));
    const handleChange = (event, nextView) => {
        if (nextView !== null) setView(nextView);
    };
    // Стейти для збереження вибраних параметрів
    const setSortBy = (newSort) => setSettings(prev => ({ ...prev, sortBy: newSort }));
    const setFilterStatus = (newStatus) => setSettings(prev => ({ ...prev, filterStatus: newStatus }));
    const setFilterRole = (newRole) => setSettings(prev => ({ ...prev, filterRole: newRole }));
    // Функція очищення всіх фільтрів
    const handleClearAll = () => {
        setSettings(prev => ({
            ...prev,
            sortBy: 'newest',
            filterStatus: 'all',
            filterRole: 'all'
        }));
    };

    // обработчики ui    
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = (event, reason) => {
        if (reason && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
        setIsModalOpen(false);
        reset(); // Очищуємо форму, якщо юзер закрив модалку
    };
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // Обробник відправки форми
    const submitProject = (e) => {
        e.preventDefault();
        
        const MIN_DESC_LENGTH = 20;

        // проверка для ии
        if (data.generate_ai_tasks && data.description.trim().length < MIN_DESC_LENGTH && !warnedAboutLength) {
            setSnackbar({
                open: true,
                message: 'Для якісної генерації завдань (ШІ) рекомендуємо додати детальніший опис проєкту',
                severity: 'warning'
            });
            setWarnedAboutLength(true);
            return; 
        }

        post('/add/project', {
            onSuccess: (page) => {
                handleCloseModal();

                // Дістаємо повідомлення, яке прийшло з контролера
                const serverMessage = page.props.flash?.success || 'Успіх!';

                setSnackbar({
                    open: true,
                    message: serverMessage,
                    severity: 'success'
                });
                setWarnedAboutLength(false);
            },
        });
        
    };


    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Project List
                </h2>
            }
        >
            <Head title="Проєкти" />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}} >
                <Typography variant="h3" component="div" sx={{ fontWeight: 600 }}>
                    Мої проєкти
                </Typography>

                <Box>
                    <Button
                        sx = {{ background: '#475c4b', color: '#fff' }}
                        variant='contained'
                        title='Створити новий проєкт'
                        startIcon={<AddIcon />}
                        onClick={handleOpenModal}
                    >
                        Створити
                    </Button>
                </Box>
            </Box>

            {/* КНОПКИ */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center'}}>
                {/* ФИЛЬТРАЦИЯ И СОРТИРОВКА */}
                <Box>
                    <ToggleButtonGroup color='primary' size='small'>
                        <ToggleButton 
                            value="filter" 
                            title="Фільтрація"
                            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                            selected={filterStatus !== 'all' || filterRole !== 'all'} 
                        >
                            <FilterAltIcon />
                        </ToggleButton>
                        <ToggleButton 
                            value="sort" 
                            title="Сортування"
                            onClick={(e) => setSortMenuAnchor(e.currentTarget)}
                            selected={sortBy !== 'newest'}
                        >
                            <SwapVertIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            

                {/* МЕНЮ ФІЛЬТРАЦІЇ */}
                <Menu
                    anchorEl={filterMenuAnchor}
                    open={Boolean(filterMenuAnchor)}
                    onClose={() => setFilterMenuAnchor(null)}
                >
                    <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 'bold', color: 'text.primary' }}>Статус проєкту</MenuItem>
                    {statusOptions.map((option) => (
                        <MenuItem 
                            key={option.value}
                            selected={filterStatus === option.value} 
                            onClick={() => { setFilterStatus(option.value); setFilterMenuAnchor(null); }}
                            sx={menuItemStyle}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                    <Divider />
                    
                    <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 'bold', color: 'text.primary' }}>Моя роль</MenuItem>
                    {roleOptions.map((option) => (
                        <MenuItem 
                            key={option.value}
                            selected={filterRole === option.value} 
                            onClick={() => { setFilterRole(option.value); setFilterMenuAnchor(null); }}
                            sx={menuItemStyle}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                    
                </Menu>

                {/* МЕНЮ СОРТУВАННЯ */}
                <Menu
                    anchorEl={sortMenuAnchor}
                    open={Boolean(sortMenuAnchor)}
                    onClose={() => setSortMenuAnchor(null)}
                >
                    {sortOptions.map((option) => (
                        <MenuItem 
                            key={option.value}
                            selected={sortBy === option.value} 
                            onClick={() => { setSortBy(option.value); setSortMenuAnchor(null); }}
                            sx={menuItemStyle}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Menu>

                {/* ОТОБРАЖЕНИЕ ПРОЭКТОВ */}
                <Box>
                    <ToggleButtonGroup color='secondary' value={view} size='small' exclusive onChange={handleChange} title='Відображення проєктів'>
                        <ToggleButton value="module" title="Картки"><ViewModuleIcon /></ToggleButton>
                        <ToggleButton value="list" title="Список"><ViewListIcon /></ToggleButton>
                    </ToggleButtonGroup>
                </Box>

            </Box>

           
            {/* РЯДОК З АКТИВНИМИ ФИЛЬТРАМИ */}
            {(filterStatus !== 'all' || filterRole !== 'all' || sortBy !== 'newest') && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', }} >
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Активні фільтри:
                        </Typography>

                        {/* Статус */}
                        {filterStatus !== 'all' && (
                            <Chip 
                                label={`Статус: ${statusOptions.find(opt => opt.value === filterStatus)?.label}`} 
                                size="small" 
                                onDelete={() => setFilterStatus('all')} 
                            />
                        )}

                        {/* Роль */}
                        {filterRole !== 'all' && (
                            <Chip 
                                label={`Роль: ${roleOptions.find(opt => opt.value === filterRole)?.label}`} 
                                size="small" 
                                onDelete={() => setFilterRole('all')} 
                            />
                        )}
                        
                        {/* Сортировка */}
                        {sortBy !== 'newest' && (
                            <Chip 
                                label={`Сортування: ${sortOptions.find(opt => opt.value === sortBy)?.label}`} 
                                size="small" 
                                onDelete={() => setSortBy('newest')} 
                            />
                        )}
                    </Box>

                    <Box>
                        <Button size="small" color="error" onClick={handleClearAll} sx={{ textTransform: 'none', ml: 1 }}>
                            Очистити все
                        </Button>
                    </Box>

                </Box>
            )}
    
            {/* ПРОЭКТЫ */}
            <Box>
                {view === 'module' ? (
                    // & СЕТКА
                    <Grid container spacing={3}>
                        {processedProjects.map((project) => (
                            <Grid item key={project.id} size={{ xs: 2, sm: 4, md: 4 }}>
                                <Card
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.03)',
                                            boxShadow: 6,
                                        }
                                    }}
                                >
                                    {/* CardActionArea делает карточку кликабельной ссылкой */}
                                    <CardActionArea 
                                        component={Link}
                                        href={`/projects/${project.uuid}`}
                                        // href={route('projects.show', project.id)} // ссылка на проект
                                        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', height: '100%' }}
                                    >
                                        <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                            <Box>
                                                {/* СТАТУС ПРОЭКТА */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                    <Chip 
                                                        label={project.is_active ? 'Активний' : 'В архіві'} 
                                                        color={project.is_active ? 'success' : 'default'} 
                                                        size="small" 
                                                        variant="outlined"
                                                    />
                                                </Box>

                                                {/* НАЗВАНИЕ И ОПИСАНИЕ */}
                                                <Typography variant="h6" component="div" gutterBottom>
                                                    {project.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {project.description?.html || "Опис відсутній"}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ mt: 'auto', width: '100%', pt: 2 }}>
                                                {/* РОЛЬ ПОЛЬЗОВАТЕЛЯ */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 1 }}>
                                                    {project.is_owner ? (
                                                        <Tooltip title="Ви власник цього проєкту">
                                                            <ManageAccountsIcon fontSize="medium" color="action" />
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Ви учасник цього проєкту">
                                                            <PeopleAltIcon fontSize="medium" color="action" />
                                                        </Tooltip>
                                                    )}
                                                </Box>

                                                {/* ПРОГРЕСС БАР */}
                                                <Box sx={{ width: '100%' }}>
                                                    <ProjectProgressBar
                                                        completed={project.tasks_completed}
                                                        total={project.tasks_total}
                                                    /> 
                                                </Box>
                                            </Box>

                                        </CardContent>
                                    </CardActionArea>
                                </Card>

                            </Grid>
                        ))}
                    </Grid>

                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {processedProjects.map((project) => (
                            <Card 
                                key={project.id}
                                sx={{ 
                                    transition: 'box-shadow 0.2s',
                                    '&:hover': { boxShadow: 4 }
                                }}
                            >
                                <CardActionArea 
                                    component={Link} 
                                    href={`/projects/${project.uuid}`}
                                    // вміст горизонтальним на ПК, і вертикальним на мобільних
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: { xs: 'column', sm: 'row' }, 
                                        p: 2, 
                                        gap: 3,
                                        alignItems: { xs: 'flex-start', sm: 'center' } 
                                    }}
                                >
                                    {/* Статус, Назва, Опис */}
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                                {project.title}
                                            </Typography>
                                            <Chip 
                                                label={project.is_active ? 'Активний' : 'В архіві'} 
                                                color={project.is_active ? 'success' : 'default'} 
                                                size="small" 
                                                variant="outlined"
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {project.description?.html || "Опис відсутній"}
                                        </Typography>
                                    </Box>

                                    {/* Роль */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '120px' }}>
                                        {project.is_owner ? (
                                            <ManageAccountsIcon fontSize="medium" color="action" />
                                        ) : (
                                            <PeopleAltIcon fontSize="medium" color="action" />
                                        )}
                                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                            {project.is_owner ? 'Власник' : 'Учасник'}
                                        </Typography>
                                    </Box>

                                    {/* Прогрес */}
                                    <Box sx={{ width: { xs: '100%', sm: '200px' } }}>
                                        <ProjectProgressBar
                                            completed={project.tasks_completed}
                                            total={project.tasks_total}
                                        />
                                    </Box>

                                </CardActionArea>
                            </Card>
                        ))}
                    </Box>

                )}
            </Box>

            {/* МОДАЛЬНЕ ВІКНО СТВОРЕННЯ ПРОЄКТУ */}
            <Dialog 
                open={isModalOpen} 
                onClose={handleCloseModal} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Створення нового проєкту</Typography>
                    <IconButton onClick={handleCloseModal} size="small">
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

                        {/* БЛОК ГЕНЕРАЦІЇ ШІ */}
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
                    </DialogContent>
                    
                    <DialogActions sx={{ p: 2, px: 3 }}>
                        <Button 
                            color='error'
                            variant="outlined"
                            onClick={handleCloseModal}
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
                                    {processing ? 'Створення...' : 'Створити проєкт'}
                                </Button>
                            </span>
                        </Tooltip>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Спливаюче повідомлення */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={snackbar.severity === 'warning' ? 7000 : 4000} // Попередження висить трохи довше
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </AuthenticatedLayout>
    );
}
