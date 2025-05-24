
export interface SecretsProvider {
    getStocksApiKey(): Promise<string>;
}
