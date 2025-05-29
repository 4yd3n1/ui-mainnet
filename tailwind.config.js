module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#10182A',
        'bg-card': 'rgba(35, 43, 69, 0.6)',
        'bg-card-alt': 'rgba(30, 38, 65, 0.6)',
        'accent-orange': '#FFA500',
        'accent-yellow': '#FFD600',
        'accent-pink': '#FF9800',
        'accent-blue': '#2196F3',
        'gray-light': '#B0B8D1',
        'gray-medium': '#A0AEC0',
        'gray-dark': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Menlo', 'Monaco', 'ui-monospace'],
        press: ['"Press Start 2P"', 'cursive'],
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(16, 24, 42, 0.12)',
      },
      borderRadius: {
        xl: '1rem',
        lg: '0.75rem',
      },
    },
  },
  plugins: [],
}; 