import React from 'react';
import { SvgIcon } from '@mui/material';

// --- БАЗОВІ КОМПОНЕНТИ ІКОНОК ---

export const PdfIcon = (props) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
            <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" /><path d="M17 18h2" /><path d="M20 15h-3v6" />
            <path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" />
        </g>
    </SvgIcon>
);

export const DocIcon = (props) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
            <path d="M5 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" />
            <path d="M20 16.5a1.5 1.5 0 0 0 -3 0v3a1.5 1.5 0 0 0 3 0" />
            <path d="M12.5 15a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1 -3 0v-3a1.5 1.5 0 0 1 1.5 -1.5z" />
        </g>
    </SvgIcon>
);

export const DocxIcon = (props) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3v4a1 1 0 0 0 1 1h4" /> <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
            <path d="M2 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" /> <path d="M17 16.5a1.5 1.5 0 0 0 -3 0v3a1.5 1.5 0 0 0 3 0" />
            <path d="M9.5 15a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1 -3 0v-3a1.5 1.5 0 0 1 1.5 -1.5z" />
            <path d="M19.5 15l3 6" /> <path d="M19.5 21l3 -6" />
        </g>
    </SvgIcon>
);

export const PngIcon = (props) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
            <path d="M20 15h-1a2 2 0 0 0 -2 2v2a2 2 0 0 0 2 2h1v-3" />
            <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" /><path d="M11 21v-6l3 6v-6" />
        </g>
    </SvgIcon>
);

export const JpgIcon = (props) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3v4a1 1 0 0 0 1 1h4" /> <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
            <path d="M11 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" /> <path d="M20 15h-1a2 2 0 0 0 -2 2v2a2 2 0 0 0 2 2h1v-3" />
            <path d="M5 15h3v4.5a1.5 1.5 0 0 1 -3 0" />
        </g>
    </SvgIcon>
);

export const defaultIcon = (props) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3v4a1 1 0 0 0 1 1h4" /> <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
            <path d="M12 17v.01" /> <path d="M12 14a1.5 1.5 0 1 0 -1.14 -2.474" />
        </g>
    </SvgIcon>
);

// --- ФУНКЦІЯ-МАППЕР ---

export const getFileIcon = (fileType) => {
    switch (fileType) {
        case 'application/pdf':
            return <PdfIcon sx={{ color: '#ef4444' }} />;
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return <DocxIcon sx={{ color: '#2b579a' }} />;
        
        case 'application/msword':
            return <DocIcon sx={{ color: '#2b579a' }} />;
            
        case 'image/jpeg':
        case 'image/jpg':
            return <JpgIcon sx={{ color: '#0d7d20' }} />;

        case 'image/png':
            return <PngIcon sx={{ color: '#d84ce5' }} />;

        default:
            return <defaultIcon sx={{ color: '#64748b' }} />; // Дефолтна сіра
    }
};
