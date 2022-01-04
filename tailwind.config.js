module.exports = {
  content: ["themes/ecwu-theme/layouts/**/*.html", "themes/ecwu-theme/layouts/**/**/*.html"],
  darkMode: 'class',
  variants: {},
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            "code::before": false,
            "code::after": false,
            "blockquote p:first-of-type::before": false,
            "blockquote p:last-of-type::after": false,
          }
        }
      })
    },
    fontFamily: {
      'serif': ['et-book', 'Palatino', '"Palatino Linotype"', '"Palatino LT STD"', '"Book Antiqua"', 'Georgia', 'serif'],
    },
  },
}