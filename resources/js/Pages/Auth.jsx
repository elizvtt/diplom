import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

// импорт компонентов mui
import { 
    FormHelperText, Tooltip,
    Box, Button, Card, GlobalStyles, TextField,
    IconButton, Typography, Divider, Link, Select, MenuItem,
    InputLabel, OutlinedInput, InputAdornment, FormControl,
} from '@mui/material';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';


export default function Auth({ canLogin, canRegister, availableRoles = [] }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true); // состояние для переключения вход/регистрация
    const [passwordTooltipOpen, setPasswordTooltipOpen] = useState(false);
    const [frontendErrors, setfrontendErrors] = useState({}); // состояние для хранения ошибок валидации
    const { data, setData, post, processing, errors: backendErrors, clearErrors, reset, transform } = useForm({
        name: '', 
        surname: '', 
        email: '', 
        password: '', 
        role: ''
    });


    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => event.preventDefault();
    const handleMouseUpPassword = (event) => event.preventDefault();

    const handleInputChange = (field) => (event) => {
        setData(field, event.target.value); // Метод setData от Inertia
        if (frontendErrors[field]) setfrontendErrors({ ...frontendErrors, [field]: null }); // очистка ошибки при вводе

        clearErrors(field);
    };


    // валидация
    const validateData = () => {
        // console.log('data: ', data);

        let newErrors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const smallLetterRegex = /[a-z]/;
        const bigLetterRegex = /[A-Z]/;
        const spicialCharsRegex = /[-_^.*\/]/;
        const latinLettersRegex = /[а-яА-ЯёЁіІїЇєЄґҐ]/;
        
        const hasDigits = /\d/;
        
        // Валидация Email
        const emailError = [
            { hasError: !data.email, msg: "Введіть пошту" },
            { hasError: !emailRegex.test(data.email), msg: "Некоректна адреса" }
        ].find(rule => rule.hasError)?.msg;

        if (emailError) newErrors.email = emailError;

        if (isLogin) {
            if (!data.password) newErrors.password = "Введіть пароль";
    
        } else {
            // Валидация пароля
            const passwordError = [
                { hasError: !data.password, msg: "Введіть пароль" },
                { hasError: data.password?.length < 6, msg: "Має містити не менше 6 символів" },
                { hasError: !smallLetterRegex.test(data.password), msg: "Додайте хоча б одну малу англійську літеру" },
                { hasError: !bigLetterRegex.test(data.password), msg: "Додайте хоча б одну велику англійську літеру" },
                { hasError: !spicialCharsRegex.test(data.password), msg: "Додайте хоча б один спецсимвол" },
                { hasError: latinLettersRegex.test(data.password), msg: "Може містити лише літери латинського алфавіту" }
            ].find(rule => rule.hasError)?.msg;
    
            if (passwordError) newErrors.password = passwordError;

            // Проверка имени: не пустое и нет циф в имени
            const nameError = [
                { hasError: !data.name?.trim(), msg: "Введіть ім'я" },
                { hasError: hasDigits.test(data.name), msg: "Не може містити цифри" }
            ].find(rule => rule.hasError)?.msg;

            if (nameError) newErrors.name = nameError;
    
            // Проверка фамилии: не пустое и нет цифр
            const surnameError = [
                { hasError: !data.surname?.trim(), msg: "Введіть прізвище" },
                { hasError: hasDigits.test(data.surname), msg: "Не може містити цифри" }
            ].find(rule => rule.hasError)?.msg;
            
            if (surnameError) newErrors.surname = surnameError;
    
            if (!data.role) newErrors.role = "Оберіть роль";
        }

        setfrontendErrors(newErrors);

        return Object.keys(newErrors).length === 0;

    };

    // переключение между входом и регистрацией
    const toggleMode = (event) => {
        event.preventDefault();
        setIsLogin(!isLogin);
        reset();
        setfrontendErrors({}); // Очищаем ошибки при переключении
        clearErrors();
        setPasswordTooltipOpen(false);
    };

    const submitAuth = (event) => {
        event.preventDefault();

        if (!validateData()) return;

        if (isLogin) {
            post('/login'); // Если это вход
        } else {
            transform((data) => ({
                ...data,
                full_name: `${data.name} ${data.surname}`.trim(),
            }));

            post('/register'); // если это регистрация
        }

    };
    
    // Объединяем ошибки для отображения в UI (сначала фронтенд, если нет - бэкенд)
    const getError = (field) => frontendErrors[field] || backendErrors[field];

    const passwordRequirements = (
        <Box sx={{ p: 0.5 }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem'}}>
                Вимоги до пароля:
            </Typography>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '0.75rem' }}>
                <li>Мінімум 6 символів</li>
                <li>Хоча б одна велика англійська літера (A-Z)</li>
                <li>Хоча б одна мала англійська літера (a-z)</li>
                <li>Хоча б один спецсимвол (-, ., *, /)</li>
            </ul>
        </Box>
    );

    return (
        <>
        <Head title={isLogin ? "Вхід" : "Реєстрація"} />
        
        <GlobalStyles 
            styles={{ 
                body: { 
                    backgroundColor: '#f9c5ef', 
                    margin: 0
                } 
            }} 
        />
        
        <Box
            sx={{
                minHeight: '90vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
            }}
        >

            <Card sx={{ minWidth: 320, boxShadow: 3, padding: 4 }}>
                <Typography variant="h5" component="h1" align="center" gutterBottom sx={{ fontWeight: 800 }}>
                    {isLogin ? "Вхід" : "Реєстрація"}
                </Typography>

                <Box 
                    component='form'
                    onSubmit={submitAuth}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}
                >
                    {!isLogin && (
                        <>
                            <TextField
                                id="name-input" 
                                label="Ім'я" 
                                variant="outlined"
                                color='secondary'
                                fullWidth
                                value={data.name}
                                onChange={handleInputChange('name')}
                                error={!!getError('name')}
                                helperText={getError('name')}
                            />

                            <TextField
                                id="supname-input" 
                                label="Прізвище" 
                                variant="outlined"
                                color='secondary'
                                fullWidth
                                value={data.surname}
                                onChange={handleInputChange('surname')}
                                error={!!getError('surname')}
                                helperText={getError('surname')}
                            />
                        </>
                    )}

                    <TextField id="email-input" 
                        label="Пошта" 
                        variant="outlined"
                        color='secondary'
                        fullWidth
                        value={data.email}
                        onChange={handleInputChange('email')}
                        error={!!getError('email')}
                        helperText={getError('email')}
                    />
                    
                    <Tooltip
                        open={passwordTooltipOpen}
                        title={passwordRequirements}
                        placement="right"
                        arrow
                        disableHoverListener
                        disableTouchListener
                    >
                        <FormControl variant="outlined" color='secondary' fullWidth error={!!getError('password')}>
                            <InputLabel htmlFor="password-input">Пароль</InputLabel>
                            <OutlinedInput
                                id="password-input"
                                type={showPassword ? 'text' : 'password'}
                                onFocus={() => {
                                    if (!isLogin) setPasswordTooltipOpen(true)
                                }}
                                onBlur={() => setPasswordTooltipOpen(false)}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={showPassword ? 'приховати пароль' : 'показати пароль'}
                                            title={showPassword ? 'приховати пароль' : 'показати пароль'}
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            onMouseUp={handleMouseUpPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Пароль"
                                value={data.password}
                                onChange={handleInputChange('password')}
                            />
                            {getError('password') && <FormHelperText>{getError('password')}</FormHelperText>}
                        </FormControl>
                    </Tooltip>
                    
                    {/* выбор роли */}
                    {!isLogin && (
                        <FormControl variant="outlined" color='secondary' fullWidth error={!!getError('role')}>
                            <InputLabel htmlFor="role-select">Роль</InputLabel>
                            <Select
                                id="role-select"
                                value={data.role || ''}
                                label="Роль"
                                onChange={handleInputChange('role')}
                            
                            >
                                {availableRoles.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                                ))}
                                {/* <MenuItem value={'student'}>Студент</MenuItem>
                                <MenuItem value={'teacher'}>Викладач</MenuItem> */}
                            </Select>
                            {getError('role') && <FormHelperText>{getError('role')}</FormHelperText>}
                        </FormControl>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        size="large"
                        fullWidth
                        disabled={processing} // Блокируем кнопку, пока идет запрос на сервер
                    >
                        {processing 
                            ? 'Завантаження...' // Показываем текст загрузки
                            : (isLogin ? 'Увійти' : 'Зареєструватися')
                        }
                    </Button>

                    {isLogin && (
                        <>
                            <Divider>
                                <Typography>або</Typography>
                            </Divider>

                            <Button variant="outlined" color="secondary" size="large" fullWidth startIcon={<GoogleIcon />}> 
                                Увійти через Google
                            </Button>
                        </>
                    )}

                    <Typography variant="body2" align="center" gutterBottom>
                        {isLogin ? 'Ще не маєте акаунту? Тоді ' : 'Вже маєте акаунту? Тоді '}
                        <Link
                            color="inherit" 
                            onClick={toggleMode}
                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {isLogin ? 'зареєструйтесь' : 'увійдіть'}
                        </Link>
                    </Typography>
                </Box>

            </Card>
        
        </Box>
        </>
    );
}