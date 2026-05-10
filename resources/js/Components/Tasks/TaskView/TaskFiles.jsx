import React, { useState } from 'react';
import TaskFileItem from '@/Components/Tasks/TaskView/TaskFileItem';
import { useTaskActions } from '@/hooks/useTaskActions';

import { Box, Typography, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function TaskFiles({ task }) {

    const { uploadFiles, deleteFile } = useTaskActions(task.id);
    const [dragActive, setDragActive] = useState(false);

    const handleUpload = (files) => {
        if (!files || files.length === 0) return;
        uploadFiles(files);
    };

    const attachments = [...(task.attachments || [])].reverse();

    return (
        <Box>
            <Box
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    handleUpload(files);
                }}
                component="label"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    mb: 2,
                    border: '1px dashed',
                    borderColor: dragActive ? 'secondary.main' : '#db8acb',
                    borderRadius: 2,
                    bgcolor: dragActive ? '#f9c5ef20' : 'transparent',
                    cursor: 'pointer',
                    transition: '0.2s',
                    '&:hover': {
                        bgcolor: '#f9c5ef10',
                        borderColor: 'secondary.main'
                    }
                }}
            >
                {/* Прихований інпут */}
                <input 
                    type="file" 
                    multiple 
                    hidden 
                    onChange={(e) => { handleUpload(Array.from(e.target.files)); }} 
                />

                <AddIcon sx={{ color: '#db8acb', mb: 0.5 }} />
                
                <Typography variant="caption" sx={{ color: '#db8acb', fontWeight: 'bold' }}>
                    Додати файл
                </Typography>
                
                {dragActive && (
                    <Typography variant="caption" sx={{ color: 'secondary.main', mt: 0.5 }}>
                        Відпустіть файл тут
                    </Typography>
                )}
            </Box>

            <Stack spacing={1.5}>
                {attachments?.length > 0 ? (
                    attachments.map((file) => (
                        <TaskFileItem 
                            key={file.id}
                            file={file}
                            onDelete={deleteFile}
                        
                        />
                    ))
                ) : (
                    <Box sx={{ p: 4, border: '2px dashed #e2e8f0', borderRadius: 3, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Файлів немає</Typography>
                    </Box>
                )}
            </Stack>
        </Box>
    )
}
