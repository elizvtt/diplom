import React from 'react';
import { Link, usePage} from '@inertiajs/react';

import NotificationsMenu from '@/Components/Header/NotificationsMenu';
import UserMenu from '@/Components/Header/UserMenu';
import AdminMenu from '@/Components/Header/AdminMenu';

import { AppBar, Box, Toolbar, Typography, Tooltip } from '@mui/material';

// import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
export default function AppHeader() {
    const auth = usePage().props.auth; // Получаем данные юзера
    // console.log('auth: ', auth);
    return (
        <AppBar
            position="fixed" 
            color="primary"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} // Щоб шапка була поверх бокового меню
        >
            <Toolbar>
                {/* НАЗВАНИЕ */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} >
                    <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Tooltip title="Повернутися до проєктів">
                        <Box component="span" sx={{ '&:hover': { color: '#c5f9cf' }, cursor: 'pointer', transition: 'color 0.3s ease' }}>
                            Edutive
                        </Box>
                    </Tooltip>
                </Link>
                </Typography> 
                
                <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', color: '#475c4b' }}>
                    <AdminMenu user={auth.user} />
                    {/* УВЕДОМЛЕНИЯ  */}
                    <NotificationsMenu user={auth.user} notifications={auth.notifications}/>
                    {/* АВАТАРКА */}
                    <UserMenu user={auth.user} />
                </Box>            
                
            </Toolbar>
        </AppBar>
    )
}