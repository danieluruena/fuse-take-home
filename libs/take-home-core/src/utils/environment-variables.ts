import { MisconfigurationException } from '../domain/exceptions/base';

export const getStocksApiUrl = (): string => {
    const url = process.env.STOCKS_API_URL;
    if (!url) {
        throw new MisconfigurationException('STOCKS_API_URL environment variable is not set.');
    }
    return url;
};

export const getStocksApiKeySecretName = (): string => {
    const secretName = process.env.STOCKS_API_KEY_SECRET_NAME;
    if (!secretName) {
        throw new MisconfigurationException('STOCKS_API_KEY_SECRET_NAME environment variable is not set.');
    }
    return secretName;
};

export const getStocksApiKey = (): string | undefined => {
    return process.env.STOCKS_API_KEY;
};

export const getStocksTableName = (): string => {
    const tableName = process.env.STOCKS_TABLE;
    if (!tableName) {
        throw new MisconfigurationException('STOCKS_TABLE environment variable is not set.');
    }
    return tableName;
};

export const getJwtSecretName = (): string => {
    const secretName = process.env.JWT_SECRET_NAME;
    if (!secretName) {
        throw new MisconfigurationException('JWT_SECRET_NAME environment variable is not set.');
    }
    return secretName;
};

export const getJwtSecret = (): string | undefined => {
    return process.env.JWT_SECRET;
};

export const getPortfolioTableName = (): string => {
    const tableName = process.env.PORTFOLIO_TABLE;
    if (!tableName) {
        throw new MisconfigurationException('PORTFOLIO_TABLE environment variable is not set.');
    }
    return tableName;
};

export const getUsersTableName = (): string => {
    const tableName = process.env.USERS_TABLE;
    if (!tableName) {
        throw new MisconfigurationException('USERS_TABLE environment variable is not set.');
    }
    return tableName;
};

export const getStocksPath = (): string => {
    const path = process.env.STOCKS_PATH;
    if (!path) {
        throw new MisconfigurationException('STOCKS_PATH environment variable is not set.');
    }
    return path;
};

export const getBuyStocksPath = (): string => {
    const path = process.env.BUY_STOCKS_PATH;
    if (!path) {
        throw new MisconfigurationException('BUY_STOCKS_PATH environment variable is not set.');
    }
    return path;
};

export const getTransactionsTableName = (): string => {
    const tableName = process.env.TRANSACTIONS_TABLE;
    if (!tableName) {
        throw new MisconfigurationException('TRANSACTIONS_TABLE environment variable is not set.');
    }
    return tableName;
};

export const getStage = (): string => {
    const stage = process.env.STAGE;
    if (!stage) {
        throw new MisconfigurationException('STAGE environment variable is not set.');
    }
    return stage;
};

export const isLocalEnv = (): boolean => {
    return getStage() === 'local';
};