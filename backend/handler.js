const AWS = require("aws-sdk");
const uuid = require("uuid");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const { success, failure } = require("./libs/response");

module.exports.connect = async (event, context) => {
    if (!process.env.TABLE_NAME) {
        throw new Error("env.tableName must be defined");
    }

    const data = {
        test: "....",
    };

    const params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            username: "anonymous",
            uuid: uuid.v4(),
            content: data.content,
            createdAt: Date.now(),
        },
    };

    try {
        const dynamoDb = new DynamoDB.DocumentClient();
        await dynamoDb.put(params).promise();
        return success(params.Item);
    } catch (e) {
        return failure({ status: false, error: e.message });
    }
};

module.exports.disconnect = async (event, context) => {
    if (!process.env.TABLE_NAME) {
        throw new Error("env.tableName must be defined");
    }

    const params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            username: "anonymous",
        },
    };

    try {
        const dynamoDb = new DynamoDB.DocumentClient();
        await dynamoDb.delete(params).promise();
        return success({ status: true });
    } catch (e) {
        return failure({ status: false, error: e.message });
    }
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
