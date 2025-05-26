import { 
    BatchWriteItemCommand, 
    BatchWriteItemCommandInput, 
    DynamoDBClient, 
    DynamoDBClientConfig, 
    PutItemCommand,
    ScanCommand,
    ScanCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { StocksRepository } from '../../domain/ports/repository';
import { splitIntoChunks } from '../../utils/split-into-chunks';
import { GetOperationFailed, InsertOperationFailed } from '../../domain/exceptions/database-exceptions';
import { PaginatedStocks, Stock } from '../../domain/entities/stock';
import { getStocksTableName, isLocalEnv } from '../../utils/environment-variables';


export class DynamoDBRepository implements StocksRepository {
    private readonly client: DynamoDBClient;
    private readonly tableName: string;

    constructor() {
        const config: DynamoDBClientConfig = isLocalEnv() ? {
            endpoint: 'http://host.docker.internal:8000',
            region: 'local',
            credentials: {
                accessKeyId: 'fake',
                secretAccessKey: 'fake'
            }
        } : {
            region: 'us-east-1',
        }
        this.client = new DynamoDBClient(config);
        this.tableName = getStocksTableName();
    }

    async saveStock(item: Stock): Promise<void> {
        const params = {
            TableName: this.tableName,
            Item: marshall(item),
        };

        try {
            await this.client.send(new PutItemCommand(params));
        } catch (error) {
            throw new InsertOperationFailed<Stock>(item);
        }
    }

    async saveStocks(items: Stock[]): Promise<void> {
        if (items.length === 0) {
            return;
        }

        const batchSize = 25;
        const chunks = splitIntoChunks<Stock>(items, batchSize);
        for (const chunk of chunks) {
            const params: BatchWriteItemCommandInput = {
                RequestItems: {
                    [this.tableName]: chunk.map(item => ({
                        PutRequest: {
                            Item: marshall(item),
                        },
                    })),
                },
            };

            try {
                await this.client.send(new BatchWriteItemCommand(params));
            } catch (error) {
                throw new InsertOperationFailed<Stock>(items);
            }
        }
    }

    async getStocks(nextToken?: string): Promise<PaginatedStocks> {
        try {
            const ExclusiveStartKey = nextToken ? JSON.parse(atob(nextToken)) : undefined;
            const params: ScanCommandInput = {
                TableName: this.tableName,
                Limit: 10,
                ExclusiveStartKey
            };
            let results = await this.client.send(new ScanCommand(params))
            const stocks: Stock[] = results.Items?.map(item => unmarshall(item) as Stock) || [];

            if (results.Count === 10 && results.LastEvaluatedKey) {
                const nextToken = btoa(JSON.stringify(results.LastEvaluatedKey));
                return {
                    items: stocks,
                    nextToken
                }
            }

            return {
                items: stocks
            }
        } catch (error) {
            throw new GetOperationFailed();
        }
    }
}
