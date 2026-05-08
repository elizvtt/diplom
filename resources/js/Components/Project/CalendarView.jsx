import * as React from 'react';
import { useMemo } from 'react';
import { Paper } from '@mui/material';
import { EventCalendar } from '@mui/x-scheduler/event-calendar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { schedulerColorMap } from '@/utils/constants';
import {  ukUACalendar } from '@/utils/calendarLocalization';


export default function CalendarView({ tasks, statuses, priorities, reminders }) {

    const resources = useMemo(() => statuses.map(s => ({
        id: s.id,
        title: s.label,
        eventColor: schedulerColorMap[s.id],
    })), [statuses]);
    
    // console.log('statusColors: ', statusColors);
    // console.log('tasks: ', tasks);
    // console.log('tasks: ', statuses);
    // console.log('tasks: ', statusColors[tasks[0].status]);
    

    // Форматуємо дані під EventCalendar
    const events = useMemo(() => {
        return tasks
            .filter(task => task.date_start || task.date_end)
            .map(task => ({
                id: task.id,
                title: task.title,
                start: task.date_start || task.date_end,
                end: task.date_end || task.date_start,
                resource: task.status,
                timezone: 'Europe/Kyiv'
            }));
    }, [tasks]);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale="uk">
            <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ 
                    height: 600,
                    width: '100%',
                    borderRadius: 2, 
                    overflow: 'hidden',
                    bgcolor: '#fff' 
                }}
            >
                <EventCalendar
                    events={events}
                    eventCreation={false}
                    resources={resources}
                    defaultView="month"
                    onEventClick={(event) => console.log("ID обраного завдання:", event.id)}
                    localeText={ukUACalendar}
                    defaultPreferences={{ ampm: false, isSidePanelOpen: true }}
                    preferencesMenuConfig={{ toggleAmpm: false  }}
                    readOnly
                    sx={{
                        '& .MuiEventCalendar-event': {
                            cursor: 'pointer',
                        }
                    }}
                />
            </Paper>
        </LocalizationProvider>
    );
}