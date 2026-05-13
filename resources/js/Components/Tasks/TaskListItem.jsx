import React, { useState } from 'react';
import { TaskListRow } from '@/Components/Tasks/TaskListRow';

import { 
    TableRow, TableCell, Box, Collapse, Table, TableBody 
} from '@mui/material';

export default function TaskListItem(props) {
    const { task } = props;
    const [subtasksOpen, setSubtasksOpen] = useState(false);
    
    return (
        <React.Fragment>
            <TaskListRow
                {...props}
                lavel={0}
                isExpandable={task.subtasks?.length > 0}
                isExpanded={subtasksOpen}
                onToggleExpand={() => setSubtasksOpen(!subtasksOpen)}
            />            

            {/* ПІДЗАДАЧІ */}
            {task.subtasks?.length > 0 && (
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0, border: 'none' }} colSpan={7}>
                        <Collapse in={subtasksOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ mb: 1 }}>
                                <Table size="small">
                                    <TableBody>
                                        {task.subtasks.map((subtask) => (
                                            <TaskListRow 
                                                key={subtask.id}
                                                {...props}
                                                task={subtask} // Подменяем задачу на подзадачу
                                                level={1} // Увеличиваем уровень
                                                isExpandable={false} // У подподзадач нет кнопок
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}


        </React.Fragment>
    );
}