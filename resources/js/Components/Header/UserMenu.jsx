import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';

import { IconButton, Avatar, Menu, MenuItem, Divider, ListItemIcon } from '@mui/material';

import Logout from '@mui/icons-material/Logout';

export default function UserMenu({ user }) {

    const avatarPreview = user.avatar_path ? `/storage/${user.avatar_path}` : null;
    
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleLogout = () => router.post(route('logout'));

    return (
        <>
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 1 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <Avatar src={avatarPreview} sx={{ width: 38, height: 38, bgcolor: '#c5f9cf', color: '#475c4b', fontWeight: 700 }}>
                    {!avatarPreview && user.full_name
                        ? user.full_name.charAt(0).toUpperCase()
                        : ''}
                </Avatar>
            </IconButton>

            {/* меню при нажатии на аватарку */}
            <Menu 
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem
                    component={Link}
                    href='/profile'
                >
                    <Avatar /> Мій профіль
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main'}}>
                    <ListItemIcon>
                        <Logout fontSize="small" color="error" />
                    </ListItemIcon>
                    Вийти
                </MenuItem>
            </Menu>
        </>
    );

}