module.exports = {
  content: ["themes/ecwu-theme/layouts/**/*.html", "themes/ecwu-theme/layouts/**/**/*.html"],
  theme: {
    extend: {},
    fontFamily: {
    //   'sans': ['et-book', 'Palatino', '"Palatino Linotype"', '"Palatino LT STD"', '"Book Antiqua"', 'Georgia', 'serif'],
      'serif': ['et-book', 'Palatino', '"Palatino Linotype"', '"Palatino LT STD"', '"Book Antiqua"', 'Georgia', 'serif'],
    //   'display': ['et-book', 'Palatino', '"Palatino Linotype"', '"Palatino LT STD"', '"Book Antiqua"', 'Georgia', 'serif'],
    //   'body': ['et-book', 'Palatino', '"Palatino Linotype"', '"Palatino LT STD"', '"Book Antiqua"', 'Georgia', 'serif'],
    }
  },
  variants: {},
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ]
}