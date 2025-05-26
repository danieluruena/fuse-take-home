import { Injectable } from '@nestjs/common';
import { DynamoDBRepository, PaginatedStocks } from '@shared/take-home-core';

@Injectable()
export class StocksService {
  async getStocks(nextToken?: string): Promise<PaginatedStocks> {
    const repository = new DynamoDBRepository();
    const results = await repository.getStocks(nextToken);
    return results;
  }
}
