const { AWS } = require("./aws-boilerplate");

module.exports.connect = (event, context, cb) => {
    cb(null, {
        statusCode: 200,
        body: "Connected.",
    });
};

module.exports.disconnect = (event, context, cb) => {
    cb(null, {
        statusCode: 200,
        body: "Disconnected.",
    });
};

module.exports.default = async (event, context, cb) => {
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

    cb(null, {
        statusCode: 200,
        body: "Sent.",
    });
};
