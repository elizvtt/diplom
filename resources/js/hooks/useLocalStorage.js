import { useState, useEffect } from 'react';

export default function useLocalStorage(key, initialValue) {

    const [state, setState] = useState(() => {
        try {

            const item = localStorage.getItem(key);

            return item
                ? JSON.parse(item)
                : initialValue;

        } catch (error) {

            console.warn('Помилка читання з localStorage', error);

            return initialValue;
        }
    });

    useEffect(() => {
        try {

            localStorage.setItem(key, JSON.stringify(state));

        } catch (error) {

            console.warn('Помилка запису в localStorage', error);
        }

    }, [key, state]);

    return [state, setState];
}