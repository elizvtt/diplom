import { useState } from 'react';
import { router } from '@inertiajs/react';

import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ActionMenu({ onEdit, onDelete, className = "action-menu-trigger" }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    const handleMenuOpen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setAnchorEl(null);
    };

    const handleEdit = (e) => {
        handleMenuClose();
        if (onEdit) onEdit(); 
    };

    const handleDelete = (e) => {
        handleMenuClose();
        if (onDelete) onDelete();
    };

    return (
        <>
            <IconButton
                className={className}
                size='small'
                onClick={handleMenuOpen}
                sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    bgcolor: 'rgba(255,255,255,0.8)'
                }}
            >
                <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 3,
                    sx: { minWidth: 150, borderRadius: 2, mt: 0.5 }
                }}
            >
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Редагувати</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Видалити</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}