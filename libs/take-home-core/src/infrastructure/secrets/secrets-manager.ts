import { SecretsManager } from 'aws-sdk';
import { SecretsProvider } from '../../domain/ports/secrets-provider';
import { MisconfigurationException, UnexpectedException } from '../../domain/exceptions/base';

export class SecretsManagerProvider implements SecretsProvider {
    private readonly secrets: Record<string, string>;

    constructor(private stocksApiKeySecretName: string) {
        const secretsManager = new SecretsManager();
    }

    async getStocksApiKey(): Promise<string> {
        if (this.secrets[this.stocksApiKeySecretName]) {
            return this.secrets[this.stocksApiKeySecretName];
        }

        try {
            const secretValue = await new SecretsManager().getSecretValue({ SecretId: this.stocksApiKeySecretName }).promise();
            if ('SecretString' in secretValue) {
                this.secrets[this.stocksApiKeySecretName] = secretValue.SecretString!;
                return this.secrets[this.stocksApiKeySecretName];
            } else {
                throw new MisconfigurationException(`Secret ${this.stocksApiKeySecretName} does not contain a string value.`);
            }
        } catch (error) {
            throw new UnexpectedException(`Failed to retrieve secret ${this.stocksApiKeySecretName}: ${error.message}`);
        }
    }
}
