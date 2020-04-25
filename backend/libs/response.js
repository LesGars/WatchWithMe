function buildResponse(statusCode, body) {
    return {
        statusCode,
        body: JSON.stringify(body),
    };
}

module.exports.success = async (body) => {
    return buildResponse(200, body);
};

module.exports.failure = async (body) => {
    return buildResponse(500, body);
};
