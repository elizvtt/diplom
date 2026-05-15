import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

import { 
    Typography, Box, Button, Avatar, 
    IconButton, Select, MenuItem , Tooltip,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

export default function MemberRow({ user, isOwner = false, currentUserIsOwner = false, teamRoles = [], onRoleChange, onRemove}) {

    console.log('user: ', user);
    const currentRole = user.pivot?.role || 'spectator';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                    src={user.avatar_url}
                    sx={{ width: 40, height: 40, bgcolor: '#c5f9cf', color: '#475c4b', fontWeight: 700, borderRadius: 2 }}
                >
                    {!user.avatar_url && user.full_name
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
                        <Select
                            size="small"
                            value={currentRole}
                            disabled={!currentUserIsOwner}
                            onChange={(e) => onRoleChange(user.id, e.target.value)}
                            sx={{ borderRadius: 2, height: 32, width: 120 }}
                        >
                            {teamRoles.map((role) => (
                                <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                            ))}
                        </Select>
                        {currentUserIsOwner && (
                            <Tooltip title="Видалити з проєкту">
                                <IconButton 
                                    color="error" 
                                    size="small"
                                    onClick={() => onRemove(user.id)}
                                >
                                    <DeleteOutlineOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}