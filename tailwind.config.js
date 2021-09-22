module.exports = {
  mode: 'jit',
  purge: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      transitionProperty: {
       'width': 'width',
       'spacing': 'margin, padding',
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
