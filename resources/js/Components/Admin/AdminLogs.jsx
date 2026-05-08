import { Paper, Box, Typography, Chip, Divider } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import LanguageIcon from '@mui/icons-material/Language';

export default function AdminLogs({ logs }) {
    return (
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <HistoryIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                    Журнал активності
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {logs.length > 0 ? logs.map((log, index) => (
                    <Paper
                        key={index}
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            transition: '0.2s',
                            '&:hover': { bgcolor: '#e3fbe45c', borderColor: '#1a8638' }
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography fontWeight="bold">
                                {log.action}
                            </Typography>
                            <Chip 
                                label={log.created_at} 
                                size="small" 
                                variant="outlined" 
                                sx={{ fontSize: '0.75rem' }}
                            />
                        </Box>

                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {log.description} [{log.ip}]
                        </Typography>

                        {log.details && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                {Object.entries(log.details).map(([key, value]) => (
                                    <Chip 
                                        key={key}
                                        label={`${key}: ${value}`} 
                                        size="small" 
                                        sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#e3f2fd' }} 
                                    />
                                ))}
                            </Box>
                        )}
                    </Paper>
                )) : (
                    <Typography color="text.secondary" textAlign="center" py={4}>
                        Записів поки немає
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}