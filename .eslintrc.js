module.exports = {
  parser: "babel-eslint",
  env: {
    es6: true,
    node: true
  },
  extends: ["airbnb"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
    "linebreak-style": ["error", "windows"],
    quotes: ["error", "double"],
    "one-var": ["error", "consecutive"],
    camelcase: ["off"],
    "no-unused-expressions": ["warn"],
    "no-debugger": ["warn"],
    "react/jsx-filename-extension": ["off"],
    //prettier
    "operator-linebreak": ["off"],
    "comma-dangle": ["off"],
    "arrow-parens": ["off"],
    "object-curly-newline": ["off"],
    "nonblock-statement-body-position": ["off"],
    "space-before-function-paren": ["off"]
  }
};
