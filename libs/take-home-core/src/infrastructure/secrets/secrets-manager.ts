import { SecretsManager } from 'aws-sdk';
import { SecretsProvider } from '../../domain/ports/secrets-provider';
import { MisconfigurationException, UnexpectedException } from '../../domain/exceptions/base';
import { getJwtSecretName, getStocksApiKeySecretName } from '../../utils/environment-variables';

export class SecretsManagerProvider implements SecretsProvider {
    private readonly secrets: Record<string, string>;
    private readonly secretsManager: SecretsManager;

    constructor() {
        this.secretsManager = new SecretsManager();
    }

    async getStocksApiKey(): Promise<string> {
        const stocksApiKeySecretName = getStocksApiKeySecretName();
        if (this.secrets[stocksApiKeySecretName]) {
            return this.secrets[stocksApiKeySecretName];
        }

        try {
            const secretValue = await this.secretsManager.getSecretValue({ SecretId: stocksApiKeySecretName }).promise();
            if ('SecretString' in secretValue) {
                this.secrets[stocksApiKeySecretName] = secretValue.SecretString!;
                return this.secrets[stocksApiKeySecretName];
            } else {
                throw new MisconfigurationException(`Secret ${stocksApiKeySecretName} does not contain a string value.`);
            }
        } catch (error) {
            throw new UnexpectedException(`Failed to retrieve secret ${stocksApiKeySecretName}: ${error.message}`);
        }
    }

    async getJwtSecret(): Promise<string> {
        const jwtSecretName = getJwtSecretName();
        if (this.secrets[jwtSecretName]) {
            return this.secrets[jwtSecretName];
        }

        try {
            const secretValue = await this.secretsManager.getSecretValue({ SecretId: jwtSecretName }).promise();
            if ('SecretString' in secretValue) {
                this.secrets[jwtSecretName] = secretValue.SecretString!;
                return this.secrets[jwtSecretName];
            } else {
                throw new MisconfigurationException(`Secret ${jwtSecretName} does not contain a string value.`);
            }
        } catch(error) {
            throw new UnexpectedException(`Failed to retrieve secret ${jwtSecretName}: ${error.message}`);
        }
    }
}
