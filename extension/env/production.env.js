try {
    var common = require("./common").prod;
} catch {
    var common = {};
}

module.exports = {
    NODE_ENV: '"production"',
    HOST: '"prod-host:80"',
    USE_API_MOCK: "false",
    ...common,
};
