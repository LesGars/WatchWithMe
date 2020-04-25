const { AWS } = require("./aws-boilerplate");

module.exports.connect = async (event, context) => {
    return {
        statusCode: 200,
    };
};

module.exports.disconnect = async (event, context) => {
    return {
        statusCode: 200,
    };
};

module.exports.default = async (event, context) => {
    // default function that just echos back the data to the client
    const client = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    await client
        .postToConnection({
            ConnectionId: event.requestContext.connectionId,
            Data: `received: ${event.body}`,
        })
        .promise();

    return {
        statusCode: 200,
    };
};
