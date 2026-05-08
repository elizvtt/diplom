import React from 'react';

import { sortOptions, statusOptions, roleOptions } from '@/utils/projectConstants';
import { menuItemStyle } from '@/utils/menuItemStyle';

import {
    Box, Button, Divider, Menu, MenuItem,
    Typography, ToggleButton, ToggleButtonGroup, Chip,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SwapVertIcon from '@mui/icons-material/SwapVert';

export default function ProjectToolbar({
    view, sortBy, filterStatus, filterRole,
    setView, setSortBy, setFilterStatus, setFilterRole,
    handleChange, handleClearAll, handleOpenModal,
    filterMenuAnchor, setFilterMenuAnchor,
    sortMenuAnchor, setSortMenuAnchor
}) {
    return (
        <>
            {/* TOP BUTTONS */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}} >
                <Typography variant="h3" component="div" sx={{ fontWeight: 600 }}>
                    Мої проєкти
                </Typography>

                <Box>
                    <Button
                        sx = {{ background: '#475c4b', color: '#fff' }}
                        variant='contained'
                        title='Створити новий проєкт'
                        startIcon={<AddIcon />}
                        onClick={handleOpenModal}
                    >
                        Створити
                    </Button>
                </Box>
            </Box>

            {/* КНОПКИ */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center'}}>
                {/* ФИЛЬТРАЦИЯ И СОРТИРОВКА */}
                <Box>
                    <ToggleButtonGroup color='primary' size='small'>
                        <ToggleButton 
                            value="filter" 
                            title="Фільтрація"
                            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                            selected={filterStatus !== 'all' || filterRole !== 'all'} 
                        >
                            <FilterAltIcon />
                        </ToggleButton>
                        <ToggleButton 
                            value="sort" 
                            title="Сортування"
                            onClick={(e) => setSortMenuAnchor(e.currentTarget)}
                            selected={sortBy !== 'newest'}
                        >
                            <SwapVertIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            

                {/* МЕНЮ ФІЛЬТРАЦІЇ */}
                <Menu
                    anchorEl={filterMenuAnchor}
                    open={Boolean(filterMenuAnchor)}
                    onClose={() => setFilterMenuAnchor(null)}
                >
                    <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 'bold', color: 'text.primary' }}>Статус проєкту</MenuItem>
                    {statusOptions.map((option) => (
                        <MenuItem 
                            key={option.value}
                            selected={filterStatus === option.value} 
                            onClick={() => { setFilterStatus(option.value); setFilterMenuAnchor(null); }}
                            sx={menuItemStyle}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                    <Divider />
                    
                    <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 'bold', color: 'text.primary' }}>Моя роль</MenuItem>
                    {roleOptions.map((option) => (
                        <MenuItem 
                            key={option.value}
                            selected={filterRole === option.value} 
                            onClick={() => { setFilterRole(option.value); setFilterMenuAnchor(null); }}
                            sx={menuItemStyle}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                    
                </Menu>

                {/* МЕНЮ СОРТУВАННЯ */}
                <Menu
                    anchorEl={sortMenuAnchor}
                    open={Boolean(sortMenuAnchor)}
                    onClose={() => setSortMenuAnchor(null)}
                >
                    {sortOptions.map((option) => (
                        <MenuItem 
                            key={option.value}
                            selected={sortBy === option.value} 
                            onClick={() => { setSortBy(option.value); setSortMenuAnchor(null); }}
                            sx={menuItemStyle}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Menu>

                {/* ОТОБРАЖЕНИЕ ПРОЭКТОВ */}
                <Box>
                    <ToggleButtonGroup color='secondary' value={view} size='small' exclusive onChange={handleChange} title='Відображення проєктів'>
                        <ToggleButton value="module" title="Картки"><ViewModuleIcon /></ToggleButton>
                        <ToggleButton value="list" title="Список"><ViewListIcon /></ToggleButton>
                    </ToggleButtonGroup>
                </Box>

            </Box>

            
            {/* РЯДОК З АКТИВНИМИ ФИЛЬТРАМИ */}
            {(filterStatus !== 'all' || filterRole !== 'all' || sortBy !== 'newest') && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', }} >
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Активні фільтри:
                        </Typography>

                        {/* Статус */}
                        {filterStatus !== 'all' && (
                            <Chip 
                                label={`Статус: ${statusOptions.find(opt => opt.value === filterStatus)?.label}`} 
                                size="small" 
                                onDelete={() => setFilterStatus('all')} 
                            />
                        )}

                        {/* Роль */}
                        {filterRole !== 'all' && (
                            <Chip 
                                label={`Роль: ${roleOptions.find(opt => opt.value === filterRole)?.label}`} 
                                size="small" 
                                onDelete={() => setFilterRole('all')} 
                            />
                        )}
                        
                        {/* Сортировка */}
                        {sortBy !== 'newest' && (
                            <Chip 
                                label={`Сортування: ${sortOptions.find(opt => opt.value === sortBy)?.label}`} 
                                size="small" 
                                onDelete={() => setSortBy('newest')} 
                            />
                        )}
                    </Box>

                    <Box>
                        <Button size="small" color="error" onClick={handleClearAll} sx={{ textTransform: 'none', ml: 1 }}>
                            Очистити все
                        </Button>
                    </Box>

                </Box>
            )}
        </>
    )
}