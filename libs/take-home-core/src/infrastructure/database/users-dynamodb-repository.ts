import { 
    DynamoDBClient, 
    DynamoDBClientConfig, 
    PutItemCommandInput, 
    PutItemCommand, 
    QueryCommandInput, 
    QueryCommand 
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { UsersRepository } from "../../domain/ports/repository";
import { getUsersTableName, isLocalEnv } from "../../utils/environment-variables";
import { User } from "../../domain/entities/user";
import { GetOperationFailed, InsertOperationFailed, ItemNotFoundException } from "../../domain/exceptions/database-exceptions";

export class UsersDynamoDBRepository implements UsersRepository {
    private readonly tableName: string;
    private readonly client: DynamoDBClient;

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
        this.tableName = getUsersTableName();
    }

    async saveUser(user: User): Promise<void> {
        const params: PutItemCommandInput = {
            TableName: this.tableName,
            Item: marshall(user)
        }
        try {
            await this.client.send(new PutItemCommand(params))
        } catch (error) {
            throw new InsertOperationFailed(user);
        }
    }

    async getUser(userId: string): Promise<User | undefined> {
        const params: QueryCommandInput = {
            TableName: this.tableName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': { S: userId }
            }
        };
        try {
            const response = await this.client.send(new QueryCommand(params));
            if (!response.Items || response.Items.length === 0) {
                return;
            }

            return unmarshall(response.Items[0]) as User;
        } catch (error) {
            throw new GetOperationFailed();
        }
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const params: QueryCommandInput = {
            TableName: this.tableName,
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': { S: email }
            }
        };
        try {
            const response = await this.client.send(new QueryCommand(params));
            if (!response.Items || response.Items.length === 0) {
                return;
            }

            return unmarshall(response.Items[0]) as User;
        } catch (error) {
            throw new GetOperationFailed();
        }
    }
}
