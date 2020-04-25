const { AWS } = require("./boilerplate");

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

module.exports.auth = async (event, context) => {
    // return policy statement that allows to invoke the connect function.
    // in a real world application, you'd verify that the header in the event
    // object actually corresponds to a user, and return an appropriate statement accordingly
    return {
        principalId: "user",
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: "Allow",
                    Resource: event.methodArn,
                },
            ],
        },
    };
};
