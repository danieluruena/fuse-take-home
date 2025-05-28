import { 
    DynamoDBClient, 
    DynamoDBClientConfig, 
    PutItemCommandInput, 
    PutItemCommand, 
    QueryCommandInput, 
    QueryCommand 
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Transaction, PaginatedTransactions, TransactionStatus } from "../../domain/entities/transaction";
import { TransactionsRepository } from "../../domain/ports/repository";
import { getTransactionsTableName, isLocalEnv } from "../../utils/environment-variables";
import { GetOperationFailed, InsertOperationFailed } from "../../domain/exceptions/database-exceptions";

export class TransactionsDynamoDBRepository implements TransactionsRepository {
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
            region: 'us-east-1'
        };
        this.client = new DynamoDBClient(config);
        this.tableName = getTransactionsTableName();
    }
    async saveTransaction(transaction: Transaction): Promise<void> {
        const params: PutItemCommandInput = {
            TableName: this.tableName,
            Item: marshall(transaction)
        }

        try {
            await this.client.send(new PutItemCommand(params));
        } catch (error) {
            throw new InsertOperationFailed<Transaction>(transaction);
        }
    }
    getTransactions(userId: string, nextToken?: string): Promise<PaginatedTransactions> {
        throw new Error("Method not implemented.");
    }
    async getTransactionsByDateRangeAndStatus(startDate: string, endDate: string, status: TransactionStatus): Promise<Transaction[]> {
        const params: QueryCommandInput = {
            TableName: this.tableName,
            IndexName: 'status-index',
            KeyConditionExpression: 'status = :status AND transactionDate BETWEEN :startDate AND :endDate',
            ExpressionAttributeValues: {
                ':status': { S: status },
                ':startDate': { S: startDate },
                ':endDate': { S: endDate }
            }
        };

        try {
            let transactions: Transaction[] = [];
            let lastEvaluatedKey;
            do {
                const results = await this.client.send(new QueryCommand(params));
                if (results.Items) {
                    transactions = [...transactions, ...results.Items.map(item => unmarshall(item) as Transaction)]
                }
                lastEvaluatedKey = results.LastEvaluatedKey;
                if (lastEvaluatedKey) {
                    params.ExclusiveStartKey = lastEvaluatedKey;
                }
            } while (lastEvaluatedKey)
            return transactions;
        } catch (error) {
            throw new GetOperationFailed();
        }
    }
    getTransactionsByStatus(status: TransactionStatus): Promise<Transaction[]> {
        throw new Error("Method not implemented.");
    }
    getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
        throw new Error("Method not implemented.");
    }
    
}
