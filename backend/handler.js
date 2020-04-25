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
        console.info(`inserted data for ${event.requestContext.connectionId}`);
        return success();
    } catch (e) {
        console.error(`Failed with ${e}`);
        return failure();
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

    return success();
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

module.exports.read = async (event, context) => {
    const client = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    const params = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "username = :u",
        ExpressionAttributeValues: {
            ":u": "anonymous",
        },
    };

    try {
        const dynamoDb = new DynamoDB.DocumentClient();
        const data = await dynamoDb.query(params).promise();
        await client
            .postToConnection({
                ConnectionId: event.requestContext.connectionId,
                Data: `found: ${JSON.stringify(data)}`,
            })
            .promise();

        console.info(`sent data to ${event.requestContext.connectionId}`);
        return success();
    } catch (e) {
        console.error(`Failed with ${e}`);
        return failure();
    }
};
