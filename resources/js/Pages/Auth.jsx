import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

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


export default function Auth() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true); // состояние для переключения вход/регистрация
    const [passwordTooltipOpen, setPasswordTooltipOpen] = useState(false);
    const [errors, setErrors] = useState({}); // состояние для хранения ошибок валидации
    const [formData, setFormData] = useState({ name: '', surname: '', email: '', password: '', role: '' }); // данные для отправки на сервер

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => event.preventDefault();
    const handleMouseUpPassword = (event) => event.preventDefault();

    const handleInputChange = (field) => (event) => {
        setFormData({ ...formData, [field]: event.target.value });

        if (errors[field]) setErrors({ ...errors, [field]: null }); // очистка ошибки при вводе
    };


    // валидация
    const validateData = () => {
        console.log('data: ', formData );

        let newErrors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const hasDigits = /\d/;

        
        // Валидация Email
        if (!formData.email) {
            newErrors.email = "Введіть пошту";
            
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Некоректна адреса";
            
        }

        // Валидация пароля
        if (!formData.password) {
            newErrors.password = "Введіть пароль";
            
        } else if (formData.password.length < 6) {
            newErrors.password = "Має містити не менше 6 символів";
            
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = "Додайте хоча б одну малу англійську літеру";
            
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = "Додайте хоча б одну велику англійську літеру";
            
        } else if (!/[-._!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]/.test(formData.password)) {
            // Проверяем наличие хотя бы одного спецсимвола
            newErrors.password = "Додайте хоча б один спецсимвол";
            
        } else if (/[а-яА-ЯёЁіІїЇєЄґҐ]/.test(formData.password)) {
            // Бонус: так как буквы должны быть английские, запрещаем кириллицу
            newErrors.password = "Може містити лише літери латинського алфавіту";
            
        }

        // Валидация специфичная для Регистрации
        if (!isLogin) {
            

            if (!formData.name.trim()) {
                newErrors.name = "Введіть ім'я";
                
            } else if (hasDigits.test(formData.name)) {
                newErrors.name = "Не може містити цифри";
                
            }

            if (!formData.surname.trim()) {
                newErrors.surname = "Введіть прізвище";
                
            } else if (hasDigits.test(formData.surname)) {
                newErrors.surname = "Не може містити цифри";
                
            }

            if (!formData.role) {
                newErrors.role = "Оберіть роль";
                
            }
        }

        const isValid = Object.keys(newErrors).length === 0;

        setErrors(newErrors);

        // Если все ок - отправляем данные
        if (isValid) {
            console.log('Дані валідні: ', formData);
            // submitForm(); 
        } 

    };

    // переключение между входом и регистрацией
    const toggleMode = (event) => {
        event.preventDefault();
        setIsLogin(!isLogin);

        setFormData({ name: '', surname: '', email: '', password: '', role: '' });
        setErrors({}); // Очищаем ошибки при переключении
        setPasswordTooltipOpen(false);
    };

    const submitAuth = async (formData) => {
        try {
            console.log('formData: ', formData) ;

            const response = await axios.post('/', {formData});
            console.log('submitAuth response: ', response) ;
        } catch (error) {
            console.log('%submitAuth error: ', 'background: red; color: white' , error);
        }
    }
    
    const passwordRequirements = (
        <Box sx={{ p: 0.5 }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem'}}>
                Вимоги до пароля:
            </Typography>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '0.75rem' }}>
                <li>Мінімум 6 символів</li>
                <li>Хоча б одна велика англійська літера (A-Z)</li>
                <li>Хоча б одна мала англійська літера (a-z)</li>
                <li>Хоча б один спецсимвол</li>
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
                    component="form" 
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
                                value={formData.name}
                                onChange={handleInputChange('name')}
                                error={!!errors.name}
                                helperText={errors.name}
                            />

                            <TextField
                                id="supname-input" 
                                label="Прізвище" 
                                variant="outlined"
                                color='secondary'
                                fullWidth
                                value={formData.surname}
                                onChange={handleInputChange('surname')}
                                error={!!errors.surname}
                                helperText={errors.surname}
                            />
                        </>
                    )}

                    <TextField id="email-input" 
                        label="Пошта" 
                        variant="outlined"
                        color='secondary'
                        fullWidth
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        error={!!errors.email}
                        helperText={errors.email}
                    />
                    
                    <Tooltip
                        open={passwordTooltipOpen}
                        title={passwordRequirements}
                        placement="right"
                        arrow
                        disableHoverListener
                        disableTouchListener
                    >
                        <FormControl variant="outlined" color='secondary' fullWidth error={!!errors.password}>
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
                                value={formData.password}
                                onChange={handleInputChange('password')}
                            />
                            {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
                        </FormControl>
                    </Tooltip>
                    
                    {/* выбор роли */}
                    {!isLogin && (
                        <FormControl variant="outlined" color='secondary' fullWidth error={!!errors.role}>
                            <InputLabel htmlFor="role-select">Роль</InputLabel>
                            <Select
                                id="role-select"
                                value={formData.role}
                                label="Роль"
                                onChange={handleInputChange('role')}
                            
                            >
                                <MenuItem value={'student'}>Студент</MenuItem>
                                <MenuItem value={'teacher'}>Викладач</MenuItem>
                            </Select>
                            {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                        </FormControl>
                    )}

                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={validateData}
                        fullWidth
                    >
                        {isLogin ? 'Увійти' : 'Зареєструватися'}
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