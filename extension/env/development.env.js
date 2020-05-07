var merge = require("webpack-merge");
var prodEnv = require("./production.env");
var common = require("./common");

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    HOST: '"127.0.0.1:8000"',
    USE_API_MOCK: "false",
    ...common,
});
