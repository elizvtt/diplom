import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

import { Typography, Box, Button, Avatar, IconButton, Select, MenuItem } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';


export default function MemberRow({ user, isOwner = false }) {
    // Допоміжний компонент для рядка учасника
    const avatarPreview = user.avatar_path ? `/storage/${user.avatar_path}` : null;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                    src={avatarPreview}
                    sx={{ width: 40, height: 40, bgcolor: '#c5f9cf', color: '#475c4b', fontWeight: 700, borderRadius: 2 }}
                >
                    {!avatarPreview && user.full_name
                        ? user.full_name.split(' ').map(n => n[0]).join('')
                        : ''}
                </Avatar>

                <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {user.full_name} {isOwner && '• Власник'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {user.email}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isOwner ? (
                    <Button disabled variant="outlined" size="small" sx={{ borderRadius: 2, width: 120 }}>
                        Власник
                    </Button>
                ) : (
                    <>
                        <Select size="small" value="member" sx={{ borderRadius: 2, height: 32, width: 120 }}>
                            <MenuItem value="member">Учасник</MenuItem>
                            <MenuItem value="editor">Редактор</MenuItem>
                        </Select>
                        <IconButton color="error" size="small">
                            <DeleteOutlineOutlinedIcon />
                        </IconButton>
                    </>
                )}
            </Box>
        </Box>
    );
}