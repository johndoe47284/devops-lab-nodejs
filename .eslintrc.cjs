// .eslintrc.js (CommonJS, compatible ESLint v8)
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 2022, // top-level await in src/app.js
    sourceType: 'module',
  },
  rules: {
    // Ajoute ici tes règles personnalisées si besoin
  },
};