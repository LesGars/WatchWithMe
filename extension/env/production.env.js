var common = require("./common").prod;

module.exports = {
    NODE_ENV: '"production"',
    HOST: '"prod-host:80"',
    USE_API_MOCK: "false",
    ...common,
};
