import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';

import {
    Box, Typography, Button, Paper, Table, TableHead,
    TableBody, TableRow, TableCell, TextField, LinearProgress,
    Chip, Avatar, Stack, IconButton, Tooltip, 
} from '@mui/material';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

export default function Grades({project, students, allTasksDone}) {

    const [grades, setGrades] = useState(
        students.map(student => ({
            user_id: student.id,
            score: student.score || '',
            comment: student.comment || '',
        }))
    );

    const updateField = (userId, field, value) => {
        setGrades(prev =>
            prev.map(item =>
                item.user_id === userId
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };

    const handleSave = () => {
        router.post(
            route('grades.save', project.id),
            { grades }
        );
    };

    return (
        <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
            {/* HEADER */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    flexWrap: 'wrap',
                    gap: 2
                }}
            >

                {/* LEFT */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                    <IconButton
                        component={Link}
                        href={route('projects.show', project.uuid)}
                        sx={{
                            bgcolor: '#fff',
                            border: '1px solid #e2e8f0',
                            '&:hover': {
                                bgcolor: '#f8fafc'
                            }
                        }}
                    >
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>

                    <Box>
                        <Typography variant="h4" fontWeight="bold" >
                            Оцінювання внеску студентів
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Проєкт "{project.title}"
                        </Typography>
                    </Box>

                </Box>

                {/* RIGHT */}
                <Button
                    variant="contained"
                    size="large"
                    disabled={!allTasksDone}
                    onClick={handleSave}
                    startIcon={<AssignmentTurnedInIcon />}
                    sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                    }}
                >
                    Зберегти оцінки
                </Button>

            </Box>

            {/* WARNING */}
            {!allTasksDone && (
                <Paper
                    sx={{
                        p: 2,
                        mb: 3,
                        bgcolor: '#fff1f2',
                        border: '1px solid #fecdd3',
                        borderRadius: 3,
                    }}
                >
                    <Typography color="error" fontWeight="bold">
                        Не всі завдання мають статус DONE
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        Поки всі завдання не завершені - оцінювання недоступне.
                    </Typography>
                </Paper>
            )}

            {/* TABLE */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                }}
            >

                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }} >
                            <TableCell>
                                <Typography fontWeight="bold">
                                    Студент
                                </Typography>
                            </TableCell>

                            <TableCell width={260}>
                                <Typography fontWeight="bold">
                                    Виконання
                                </Typography>
                            </TableCell>

                            <TableCell width={350}>
                                <Typography fontWeight="bold">
                                    Коментар
                                </Typography>
                            </TableCell>

                            <TableCell width={140}>
                                <Typography fontWeight="bold">
                                    Бал
                                </Typography>
                            </TableCell>
                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {students.map(student => {

                            const current = grades.find(
                                g => g.user_id === student.id
                            );

                            const progress =
                                student.tasks_total > 0
                                    ? Math.round(
                                        (student.tasks_done / student.tasks_total) * 100
                                    )
                                    : 0;

                            return (
                                <TableRow key={student.id} hover>
                                    {/* STUDENT */}
                                    <TableCell>
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            alignItems="center"
                                        >

                                            <Avatar>{student.name?.[0]}</Avatar>

                                            <Box>

                                                <Typography fontWeight="600">
                                                    {student.name}
                                                </Typography>

                                                <Typography variant="caption" color="text.secondary">
                                                    Виконано:
                                                    {' '}
                                                    {student.tasks_done}
                                                    /
                                                    {student.tasks_total}
                                                </Typography>

                                            </Box>

                                        </Stack>

                                    </TableCell>

                                    {/* PROGRESS */}
                                    <TableCell>
                                        <Box>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    mb: 0.5
                                                }}
                                            >
                                                <Typography variant="body2">
                                                    Прогрес
                                                </Typography>

                                                <Chip
                                                    size="small"
                                                    label={`${progress}%`}
                                                    color={
                                                        progress === 100
                                                            ? 'success'
                                                            : 'warning'
                                                    }
                                                />
                                            </Box>

                                            <Tooltip
                                                title={`${student.tasks_done} з ${student.tasks_total} завдань`}
                                            >
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={progress}
                                                    color={
                                                        progress === 100
                                                            ? 'success'
                                                            : 'secondary'
                                                    }
                                                    sx={{ height: 8, borderRadius: 10 }}
                                                />
                                            </Tooltip>
                                        </Box>

                                    </TableCell>

                                    {/* COMMENT */}
                                    <TableCell>

                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={2}
                                            size="small"
                                            placeholder="Коментар до оцінки..."
                                            value={current.comment}
                                            onChange={(e) =>
                                                updateField(
                                                    student.id,
                                                    'comment',
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </TableCell>

                                    {/* SCORE */}
                                    <TableCell>

                                        <TextField
                                            size="small"
                                            type="number"
                                            value={current.score}
                                            placeholder="0-100"
                                            inputProps={{
                                                min: 0,
                                                max: 100
                                            }}
                                            onChange={(e) =>
                                                updateField(
                                                    student.id,
                                                    'score',
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </TableCell>

                                </TableRow>
                            );
                        })}

                    </TableBody>

                </Table>

            </Paper>

        </Box>
    );
}