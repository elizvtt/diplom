import React, { useState, useEffect } from 'react';
import { router, usePage, useForm } from '@inertiajs/react';
import TaskDetails from '@/Components/Tasks/TaskView/TaskDetails';
import TaskComments from '@/Components/Tasks/TaskView/TaskComments';
import TaskFiles from '@/Components/Tasks/TaskView/TaskFiles';

import {
    Dialog, DialogTitle, DialogContent, Box, Typography, IconButton,
    Chip, Tabs, Tab, TextField
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';

import { statusColors } from '@/utils/constants';

export default function TaskView({ task, project, teamMembers, priorities, statuses, reminders, open, onClose, onStatusChange }) {
    if (!task) return null;
    const { auth } = usePage().props;
    console.log('%c [TaskView] task: ', 'color: orange;', task);
    // console.log('%c [TaskView] priorities: ', 'color: green;', priorities);
    // console.log('%c [TaskView] statuses: ', 'color: blue;', statuses);
    console.log('[TaskView] project: ', project);

    const [currTab, setcurrTab] = useState('comments');
    const [editingField, setEditingField] = useState(null);

    const { data, setData, processing } = useForm({
        title: task.title || '',
        description: task.description?.text || '',
        date_start: task.date_start || null,
        date_end: task.date_end || null,
        priority: task.priority || '',
        assignees: task.assignees || [],
        progress: task.progress || 0,
    });

    const handleSave = () => {
        router.post(`/tasks/${task.id}/update`, data, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingField(null);
            }
        });
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, minHeight: '60vh', maxHheight: '300px' } }}
        >            
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                        label={(statuses.find(s => s.id === task.status))?.label} 
                        size="small"
                        sx={{ 
                            bgcolor: statusColors[task.status],
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                        }}
                    />
                    {editingField === 'title' ? (
                        <TextField
                            autoFocus
                            fullWidth
                            size="small"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault(); // чтобы не было лишнего поведения
                                    handleSave();
                                    setEditingField(null);
                                }

                                if (e.key === 'Escape') setEditingField(null);
                            }}
                            helperText="Натисність Enter щоб зберегти"
                        />
                    ) : (
                        <Typography
                            variant="h5"
                            onClick={() => setEditingField('title')}
                            // sx={{ cursor: 'pointer' }}
                            sx={{
                                cursor: 'pointer',
                                borderRadius: 1,
                                px: 1,
                                py: 0.5,
                                transition: '0.2s',
                                '&:hover': { backgroundColor: '#f8fafc'}
                            }}
                        >
                            {data.title}
                        </Typography>
                    )}
                </Box>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' }, 
                    gap: 4 
                }}>
                    
                    {/* ЛІВА ЧАСТИНА  */}
                    <TaskDetails
                        task={task}
                        project={project}
                        priorities={priorities}
                        teamMembers={teamMembers}
                        reminders={reminders}
                        data={data}
                        setData={setData}
                        editingField={editingField}
                        setEditingField={setEditingField}
                        handleSave={handleSave}
                    />
                    

                    {/* ПРАВА ЧАСТИНА */}
                    <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0 }}>
                        {/* ПЕРЕМИКАЧ ВКЛАДОК */}
                        <Tabs 
                            value={currTab} 
                            onChange={(e, v) => setcurrTab(v)} 
                            variant="fullWidth" 
                            indicatorColor="secondary"
                            textColor="secondary"
                            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                        >
                            <Tab 
                                icon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18 }} />} 
                                iconPosition="start" 
                                label={`Коментарі (${task.comments?.length || 0})`} 
                                value="comments" 
                                sx={{ fontSize: '0.75rem', fontWeight: 'bold', minHeight: 48 }}
                            />
                            <Tab 
                                icon={<AttachFileIcon sx={{ fontSize: 18 }} />} 
                                iconPosition="start" 
                                label={`Файли (${task.attachments?.length || 0})`} 
                                value="files" 
                                sx={{ fontSize: '0.75rem', fontWeight: 'bold', minHeight: 48 }}
                            />
                        </Tabs>

                        {/* ПРАВА ЧАСТИНА */}
                        <Box sx={{ height: '400px', overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '4px' } }}>
                            
                            {/* ВКЛАДКА: КОМЕНТАРІ */}
                            {currTab === 'comments' && (
                                <TaskComments task={task} />  
                            )}

                            {/* ВКЛАДКА: ФАЙЛИ */}
                            {currTab === 'files' && (
                                <TaskFiles task={task} />
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>

        </Dialog>
    );
}