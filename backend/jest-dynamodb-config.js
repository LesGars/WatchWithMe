module.exports = async () => {
    const serverless = new (require('serverless'))();

    await serverless.init();
    const service = await serverless.variables.populateService();
    const resources = service.resources[0].Resources;

    console.log('DynamoDB Tables Mocked for tests', JSON.stringify(resources));

    const tables = Object.keys(resources)
        .map((name) => resources[name])
        .filter((r) => r.Type === 'AWS::DynamoDB::Table')
        .map((r) => r.Properties)
        .map((prop) => {
            prop.StreamSpecification.StreamEnabled = true;
            return prop;
        });

    console.log('Build tables', JSON.stringify(tables));
    return {
        tables,
        port: 8000,
    };
};
