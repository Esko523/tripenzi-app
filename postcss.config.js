/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // <--- Tady byla změna (původně jen 'tailwindcss')
    autoprefixer: {},
  },
};

export default config;