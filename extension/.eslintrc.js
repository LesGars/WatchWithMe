module.exports = {
    root: true,

    env: {
        es6: true,
        node: true,
        browser: true,
    },

    extends: ["plugin:vue/recommended", "@vue/prettier", "airbnb", "prettier"],

    plugins: ["prettier"],

    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "vue/html-self-closing": "off",
    },

    parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module",
    },

    extends: [
        "@vue/typescript",
        "plugin:vue/vue3-essential",
        "@vue/prettier",
        "airbnb",
        "prettier",
    ],
};
