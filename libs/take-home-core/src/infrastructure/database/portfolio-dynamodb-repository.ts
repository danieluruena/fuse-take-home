import { 
    DynamoDBClient, 
    PutItemCommandInput, 
    PutItemCommand, 
    GetItemCommandInput,
    GetItemCommandOutput,
    GetItemCommand,
    DeleteItemCommandInput,
    DeleteItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { PortfolioRepository } from '../../domain/ports/repository';
import { getPortfolioTableName, isLocalEnv } from '../../utils/environment-variables';
import { Portfolio } from '../../domain/entities/portfolio';
import { DeleteOperationFailed, GetOperationFailed, InsertOperationFailed, ItemNotFoundException, UpdateOperationFailed } from '../../domain/exceptions/database-exceptions';

export class PortfolioDynamoDBRepository implements PortfolioRepository {
    private readonly client: DynamoDBClient;
    private readonly tableName: string;

    constructor() {
        const config = isLocalEnv() ? {
            endpoint: 'http://host.docker.internal:8000',
            region: 'local',
            credentials: {
                accessKeyId: 'fake',
                secretAccessKey: 'fake'
            }
        } : {
            region: 'us-east-1'
        };
        this.client = new DynamoDBClient(config);
        this.tableName = getPortfolioTableName();
    }

    async savePortfolio(portfolio: Portfolio): Promise<void> {
        const params: PutItemCommandInput = {
            TableName: this.tableName,
            Item: marshall(portfolio)
        };

        try {
            await this.client.send(new PutItemCommand(params));
        } catch (error) {
            throw new InsertOperationFailed<Portfolio>(portfolio);
        }
    }

    async getPortfolio(userId: string): Promise<Portfolio | undefined> {
        const params: GetItemCommandInput = {
            TableName: this.tableName,
            Key: marshall({ userId})
        };

        try {
            const response: GetItemCommandOutput = await this.client.send(new GetItemCommand(params));
            if (!response.Item) {
                return;
            }

            return unmarshall(response.Item) as Portfolio;
        } catch (error) {
            throw new GetOperationFailed();
        }
    }

    async deletePortfolio(userId: string): Promise<void> {
        const params: DeleteItemCommandInput = {
            TableName: this.tableName,
            Key: marshall({ userId})
        };

        try {
            await this.client.send(new DeleteItemCommand(params));
        } catch (error) {
            throw new DeleteOperationFailed();
        }
    }

    async updatePortfolio(portfolio: Portfolio): Promise<void> {
        try {
            return await this.savePortfolio(portfolio);
        } catch (error) {
            throw new UpdateOperationFailed(portfolio);
        }
    }
}
