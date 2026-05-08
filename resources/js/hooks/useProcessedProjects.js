import { useMemo } from 'react';

export default function useProcessedProjects(
    projects,
    sortBy,
    filterStatus,
    filterRole
) {
    return useMemo(() => {
        let result = [...projects];
        
        // Фильтрация по статусу
        if (filterStatus === 'active') result = result.filter(p => p.is_active === 1);
        if (filterStatus === 'archived') result = result.filter(p => p.is_active === 0);
    
        // фильтрация по роли
        if (filterRole === 'owner') result = result.filter(p => p.is_owner === true);
        if (filterRole === 'participant') result = result.filter(p => p.is_owner === false);
    
        // сортировка
        result.sort((a, b) => {
            switch (sortBy) {
                case 'newest': 
                    return new Date(b.created_at) - new Date(a.created_at);

                case 'oldest': 
                    return new Date(a.created_at) - new Date(b.created_at);

                case 'title_asc': 
                    return a.title.localeCompare(b.title);

                case 'title_desc': 
                    return b.title.localeCompare(a.title);

                case 'progress_desc':
                case 'progress_asc': {
                    const progressA = a.tasks_total > 0 ? a.tasks_completed / a.tasks_total : 0;
                    const progressB = b.tasks_total > 0 ? b.tasks_completed / b.tasks_total : 0;
                    
                    return sortBy === 'progress_desc' 
                        ? progressB - progressA 
                        : progressA - progressB;
                }
                default:
                    return 0;
            }
        });
        return result;

    }, [projects, sortBy, filterStatus, filterRole]);
}
