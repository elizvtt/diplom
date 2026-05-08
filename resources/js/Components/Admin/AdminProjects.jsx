import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';


import {
    Paper, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Tooltip
} from '@mui/material';


export default function AdminProjects({ projects }) {
    console.log('projects: ', projects);
    return (
        <>
            <Paper sx={{ p: 3, borderRadius: 3 }}>

                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Проєкти
                </Typography>

                <TableContainer>
                    <Table>

                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Назва</TableCell>
                                <TableCell>ID Власник</TableCell>
                                <TableCell>Завдань</TableCell>
                                <TableCell>Статус</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell>{project.id}</TableCell>

                                    <TableCell>
                                        {project.title}
                                    </TableCell>

                                    <TableCell>
                                        <Tooltip title={project.owner.full_name}>
                                            {project.owner.id}
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        {project.tasks_total}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={project.is_active ? 'Активний' : 'Архів'}
                                            color={project.is_active ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </TableContainer>

            </Paper>
        
        </>
    );
}