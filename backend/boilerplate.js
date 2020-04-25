"use strict";

const AWS = require("aws-sdk");

// the following section injects the new ApiGatewayManagementApi service
// into the Lambda AWS SDK, otherwise you'll have to deploy the entire new version of the SDK

/* START ApiGatewayManagementApi injection */
const { Service, apiLoader } = AWS;

apiLoader.services["apigatewaymanagementapi"] = {};

const model = {
    metadata: {
        apiVersion: "2018-11-29",
        endpointPrefix: "execute-api",
        signingName: "execute-api",
        serviceFullName: "AmazonApiGatewayManagementApi",
        serviceId: "ApiGatewayManagementApi",
        protocol: "rest-json",
        jsonVersion: "1.1",
        uid: "apigatewaymanagementapi-2018-11-29",
        signatureVersion: "v4",
    },
    operations: {
        PostToConnection: {
            http: {
                requestUri: "/@connections/{connectionId}",
                responseCode: 200,
            },
            input: {
                type: "structure",
                members: {
                    Data: {
                        type: "blob",
                    },
                    ConnectionId: {
                        location: "uri",
                        locationName: "connectionId",
                    },
                },
                required: ["ConnectionId", "Data"],
                payload: "Data",
            },
        },
    },
    paginators: {},
    shapes: {},
};

AWS.ApiGatewayManagementApi = Service.defineService("apigatewaymanagementapi", [
    "2018-11-29",
]);
Object.defineProperty(
    apiLoader.services["apigatewaymanagementapi"],
    "2018-11-29",
    {
        // eslint-disable-next-line
        get: function get() {
            return model;
        },
        enumerable: true,
        configurable: true,
    }
);
/* END ApiGatewayManagementApi injection */

module.exports = { AWS };
