import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

import { 
    Paper, Typography, Box,
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Button, TextField, Chip
} from '@mui/material';


export default function AdminUsers({ users }) {
    // console.log('users: ', users);
    return (
        <>
            <Paper sx={{ p: 3, borderRadius: 3 }}>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 3,
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        Користувачі
                    </Typography>

                    <TextField
                        size="small"
                        placeholder="Пошук користувача..."
                        sx={{ width: 300 }}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Ім’я</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Роль</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Дії</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>

                                    <TableCell>
                                        {user.full_name}
                                    </TableCell>

                                    <TableCell>
                                        {user.email}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            size="small"
                                            variant="outlined"
                                            color={
                                                user.role === 'admif9c5efn'
                                                    ? 'secondary'
                                                    : 'default'
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={user.is_active ? 'Активний' : 'Заблокований'}
                                            size="small"
                                            variant="outlined"
                                            color={user.is_active ? 'success' : 'error'}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{ '&:hover': { bgcolor: '#f9c5ef', color: '#fff'} }}
                                        >
                                            Переглянути
                                        </Button>
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