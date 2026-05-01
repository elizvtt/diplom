// import '../css/app.css';
import '../css/style.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ukUA } from '@mui/x-date-pickers/locales';

const theme = createTheme(
    {
        palette: {
            primary: {
                // light: '',
                main: '#f9c5ef',
                // dark: '',
                // contrastText: '',
            },
            secondary: {
                // light: '',
                main: '#1a8638',
                // dark: '',
                contrastText: '#fff',
                // contrastText: '',
            },
        },
        typography: {
            fontFamily: "'Montserrat', sans-serif"
        }
    },
    ukUA,
);

// #26c052
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
