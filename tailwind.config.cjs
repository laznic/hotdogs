const defaultTheme = require('tailwindcss/defaultTheme');

const viewportSizes = {
    '1vh': '1vh',
    '2vh': '2vh',
    '3vh': '3vh',
    '4vh': '4vh',
    '5vh': '5vh',
    '6vh': '6vh',
    '7vh': '7vh',
    '8vh': '8vh',
    '9vh': '9vh',
    '10vh': '10vh',
    '11vh': '11vh',
    '12vh': '12vh',
    '13vh': '13vh',
    '14vh': '14vh',
    '20vh': '20vh',
    '25vh': '25vh',
    '30vh': '30vh',
    '40vh': '40vh',
    '50vh': '50vh',
    '60vh': '60vh',
    '70vh': '70vh',
    '80vh': '80vh',
    '90vh': '90vh',
    '100vh': '100vh',
    '120vh': '120vh',
    '1vw': '1vw',
    '2vw': '2vw',
    '3vw': '3vw',
    '4vw': '4vw',
    '5vw': '5vw',
    '6vw': '6vw',
    '7vw': '7vw',
    '8vw': '8vw',
    '9vw': '9vw',
    '10vw': '10vw',
    '11vw': '11vw',
    '12vw': '12vw',
    '13vw': '13vw',
    '14vw': '14vw',
    '15vw': '15vw',
    '20vw': '20vw',
    '25vw': '25vw',
    '30vw': '30vw',
    '40vw': '40vw',
    '50vw': '50vw',
    '60vw': '60vw',
    '70vw': '70vw',
    '80vw': '80vw',
    '90vw': '90vw',
    '100vw': '100vw',
    '120vw': '120vw'
};

module.exports = {
    content: [
        './src/**/*.{riot,js,ts,jsx,tsx}',
        './index.html'
    ],
    darkMode: 'class', // or 'media' or 'class'
    theme: {
        extend: {
            width: viewportSizes,
            height: viewportSizes,
            spacing: viewportSizes,
            minHeight: {
                600: '600px'
            },
            maxHeight: {
                720: '720px'
            },
            inset: {
                '18': '4.5rem',
                '-18': '-4.5rem'
            },
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans]
            },
            colors: {
                discord: {
                    DEFAULT: '#7289da'
                }
            }
        }
    },
    variants: {
        extend: {
            backgroundColor: ['active'],
            scale: ['group-hover'],
            translate: ['active'],
            boxShadow: ['active']
        }
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/line-clamp'),
        require('tailwindcss'),
        require('postcss-import'),
        require('postcss-nested'),
        require('postcss-preset-env'),
        require('postcss-modules-values'),
        require('autoprefixer')
    ]
};
