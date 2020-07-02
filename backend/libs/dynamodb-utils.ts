import { DocumentClient } from 'aws-sdk/clients/dynamodb';

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dates are converted to strings (ISO 8601)
 */
const marshallValue = (value: any): any => {
    if (value instanceof Date) {
        return value.toISOString();
    } else {
        return value;
    }
};

/**
 * Converts a JS object to a compatible DDB format
 */
export const marshallMap = (map: Record<string, any>): Record<string, any> => {
    return Object.fromEntries(
        Object.entries(map).map(([key, value]) => [key, marshallValue(value)]),
    );
};

/**
 * Configured DynamoDB client - allows reuse across lambda function calls
 * Cannot be used in test environment
 */
export const dynamoDB = new DocumentClient();
