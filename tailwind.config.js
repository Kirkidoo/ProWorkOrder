/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                rugged: ['Bebas Neue', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
