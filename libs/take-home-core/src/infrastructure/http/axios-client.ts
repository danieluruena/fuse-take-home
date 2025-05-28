import axios, { AxiosInstance } from 'axios';
import { HttpClient } from '../../domain/ports/http-client';
import { retryWithBackoff } from '../../utils/retry';
import { Logger } from '../../domain/ports/logger';
import { AUTHORIZATION_ERROR_CODES, CLIENT_ERROR_CODES, SERVER_ERROR_CODES } from '../../utils/http-codes';
import { BadRequestException, ServerException, UnauthorizedException } from '../../domain/exceptions/http-exceptions';
import { DomainException, MisconfigurationException, UnexpectedException } from '../../domain/exceptions/base';
import { getStocksApiKey, getStocksApiUrl, isLocalEnv } from '../../utils/environment-variables';
import { SecretsManagerProvider } from '../secrets/secrets-manager';


const shouldRetry = (error: Error): boolean => {
    return axios.isAxiosError(error) || error instanceof ServerException;
};

export class AxiosClient implements HttpClient {
    private readonly axiosInstance: AxiosInstance;

    constructor(private logger: Logger) {
        this.axiosInstance = axios.create({
            baseURL: getStocksApiUrl(),
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async configure(): Promise<void> {
        let apiKey = getStocksApiKey();
        
        if (!isLocalEnv()) {
            const secretsManager = new SecretsManagerProvider();
            apiKey = await secretsManager.getStocksApiKey();
        }

        if (!apiKey) {
            throw new MisconfigurationException('API key is not set. Please check your environment variables or secrets manager.');
        }

        this.axiosInstance.defaults.headers['x-api-key'] = apiKey;
    }

    @retryWithBackoff({ maxRetries: 5, initialDelayMs: 200, shouldRetry })
    async get<T>(url: string, options?: { headers?: Record<string, string>, params?: Record<string, string> }): Promise<T> {
        try {
            const response = await this.axiosInstance.get<T>(url, options);
            return response.data;
        } catch (error) {
            this.logger.error(`Error fetching data from ${url}:`, error);
            throw this.handleError(error);
        }
    }

    @retryWithBackoff({ maxRetries: 5, initialDelayMs: 200, shouldRetry })
    async post<T>(url: string, data: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
        try {
            const response = await this.axiosInstance.post<T>(url, data, options);
            return response.data;
        } catch (error) {
            this.logger.error(`Error posting data to ${url}: ${error}`);
            throw this.handleError(error);
        }
    }

    private handleError(error: Error): DomainException {
        if (axios.isAxiosError(error)) {
            if (error.response && SERVER_ERROR_CODES.includes(error.response.status)) {
                return new ServerException(`Service error: ${error.message}`);
            }
            if (error.response && CLIENT_ERROR_CODES.includes(error.response.status)) {
                return new BadRequestException(`Client error: ${error.message}`, error.response.status);
            }
            if (error.response && AUTHORIZATION_ERROR_CODES.includes(error.response.status)) {
                return new UnauthorizedException(`Authorization error: ${error.message}`, error.response.status);
            }
        }
        return new UnexpectedException(`Unexpected error: ${error.message}`);
    }
}
