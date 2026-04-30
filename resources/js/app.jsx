// import '../css/app.css';
import '../css/style.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            // light: '#757ce8',
            main: '#f9c5ef',
            // dark: '#002884',
            // contrastText: '#fff',
        },
        secondary: {
            // light: '#ff7961',
            main: '#1a8638',
            // dark: '#ba000d',
            contrastText: '#fff',
            // contrastText: '#000',
        },
    },
    typography: {
        fontFamily: "'Montserrat', sans-serif"
    }
});

// #c5f9cf
// #e9c5f9
// #f9c5d5
// #f9cfc5

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider theme={theme}>
                <App {...props} />
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
