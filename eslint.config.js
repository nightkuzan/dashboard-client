import vuetify from "eslint-config-vuetify";

export default [
  ...vuetify,
  {
    rules: {
      "no-console": "warn",
      "no-debugger": "error",
      "no-unused-vars": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
