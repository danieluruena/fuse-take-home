import { 
    DynamoDBClient, 
    PutItemCommandInput, 
    PutItemCommand, 
    GetItemCommandInput,
    GetItemCommandOutput,
    GetItemCommand 
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { PortfolioRepository } from "../../domain/ports/repository";
import { getPortfolioTableName, isLocalEnv } from "../../utils/environment-variables";
import { Portfolio } from "../../domain/entities/portfolio";
import { GetOperationFailed, InsertOperationFailed, ItemNotFoundException } from "../../domain/exceptions/database-exceptions";

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

    async getPortfolio(userId: string): Promise<Portfolio> {
        const params: GetItemCommandInput = {
            TableName: this.tableName,
            Key: marshall({ userId})
        };

        try {
            const response: GetItemCommandOutput = await this.client.send(new GetItemCommand(params));
            if (!response.Item) {
                throw new ItemNotFoundException(`Portfolio for user ${userId} not found`);
            }

            return unmarshall(response.Item) as Portfolio;
        } catch (error) {
            throw new GetOperationFailed();
        }
    }
}
