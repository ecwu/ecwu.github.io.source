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
            code: {
              backgroundColor: theme('colors.gray.100'),
              color: "#DD1144",
              fontWeight: "400",
              "border-radius": "0.25rem",
              padding: "0.1rem 0.25rem",
            },
            ".dark code": {
              backgroundColor: theme('colors.gray.800'),
              color: "#DD1144",
            },
            "code::before": false,
            "code::after": false,
            "blockquote p:first-of-type::before": false,
            "blockquote p:last-of-type::after": false,
          }
        }
      })
    },
    fontFamily: {
      'serif': ['et-book', 'Bembo', 'Palatino', '"Palatino Linotype"', '"Palatino LT STD"', '"Book Antiqua"', 'Georgia', 'serif'],
    },
  },
}