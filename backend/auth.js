// In case we want to have authenticated socket connections
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
