import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.js',
        './resources/js/**/*.jsx',
        './resources/js/**/*.ts',
        './resources/js/**/*.tsx',
    ],

    safelist: [
        // object-fit variants used dynamically
        'object-cover', 'object-contain', 'object-fill',
        // shadow variants used dynamically
        'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg',
        // overlay vertical align and spacing
        'items-start', 'items-center', 'items-end', 'pt-3', 'pb-3',
        // layout toggles
        'flex-col', 'flex-row',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
