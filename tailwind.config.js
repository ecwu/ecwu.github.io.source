module.exports = {
  content: ["themes/ecwu-theme/layouts/**/*.html", "themes/ecwu-theme/layouts/**/**/*.html"],
  theme: {
    extend: {},
    fontFamily: {
      'serif': ['et-book', 'Palatino', '"Palatino Linotype"', '"Palatino LT STD"', '"Book Antiqua"', 'Georgia', 'serif'],
    }
  },
  variants: {},
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ]
}