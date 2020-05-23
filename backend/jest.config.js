module.exports = {
    coveragePathIgnorePatterns: ['/node_modules/'],
    collectCoverage: true,
    modulePaths: ['.'],
    moduleDirectories: ['node_modules', '.'],
    preset: '@shelf/jest-dynamodb',
    testEnvironment: 'node',
};
