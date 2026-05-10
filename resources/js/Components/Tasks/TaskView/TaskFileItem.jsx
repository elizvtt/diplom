import React from 'react';
import { usePage } from '@inertiajs/react';
import { getFileIcon } from '@/utils/icons';

import { Box, Typography, IconButton, Button, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


export default function TaskFileItem({ file, onDelete }) {
    const { auth } = usePage().props;

    if (!file) return null;

    const canDelete = auth?.user?.id === file.user_id;

    const fileSizeMB = (file.file_size / 1024 / 1024).toFixed(2);

    
    return (
        <Paper 
            variant="outlined" 
            sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                transition: '0.2s',
                '&:hover': { 
                    borderColor: 'secondary.main',
                    bgcolor: '#fcfaff'
                } 
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                
                {getFileIcon(file.file_type)}  

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                        {file.filename}
                    </Typography>

                    <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
                        {fileSizeMB} MB
                    </Typography>
                </Box>

                {canDelete && (
                    <IconButton
                        size="small"
                        sx={{ mt: -0.5 }}
                        onClick={() => onDelete(file.id)}
                    >
                        <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                )}
            </Box>
            
            <Button 
                fullWidth 
                size="small" 
                variant="text" 
                color='secondary'
                sx={{ fontSize: '0.7rem', textTransform: 'none', mt: 0.5, py: 0 }}
                href={`/storage/${file.file_path}`}
                target="_blank"
            >
                Відкрити файл
            </Button>
        </Paper>
    );
}