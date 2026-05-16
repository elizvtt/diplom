export const statusColors = {
    backlog: '#94a3b8',
    todo: '#f48fb1',
    in_progress: '#ffb74d',
    review: '#4fc3f7',
    done: '#81c784'
};

export const priorityColors = {
    low: '#1a8638',
    medium: '#ff7300',
    high: '#ff0000',
    critical: 'hsl(0, 90%, 19%)',
};

export const schedulerColorMap = {
    backlog: 'gray',
    todo: 'pink',
    in_progress: 'orange',
    review: 'blue',
    done: 'green'
};

export const EVENT_LABELS = {
    task_assigned: 'Призначено нове завдання',
    task_completed: 'Завдання виконано',
    task_created: 'Створено нове завдання у проєкті',
    grade_changed: 'Оцінку змінено',
    new_comment: 'Новий коментар',
    deadline_risk: 'Ризик зриву дедлайну',
    project_invite: 'Запрошення до проєкту'
};

export const LOG_LEVEL_STYLES = {
    ERROR: { color: 'error', bg: '#fdecea', border: '#ff0000' },
    EMERGENCY: { color: 'error', bg: '#fdecea', border: '#ff0000' },
    CRITICAL: { color: 'error', bg: '#fdecea', border: '#ff0000' },
    WARNING: { color: 'warning', bg: '#fff4e5', border: '#ff7d13' },
    INFO: { color: 'info', bg: '#ddf1dea5', border: '#81c784' },
    DEFAULT: { color: 'default', bg: '#f5f5f5', border: '#e0e0e0' }
};

/**
 * Функція для отримання стилю логу за його рівнем
 * @param {string} level 
 * @returns {object}
 */
export const getLogsLevelColor = (level) => {
    const normalizedLevel = level?.toUpperCase();
    return LOG_LEVEL_STYLES[normalizedLevel] || LOG_LEVEL_STYLES.DEFAULT;
};