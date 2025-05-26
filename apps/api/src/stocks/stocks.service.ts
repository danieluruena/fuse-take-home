import { Inject, Injectable } from '@nestjs/common';
import {
  PaginatedStocks,
  Portfolio,
  PortfolioRepository,
  StocksRepository,
} from '@shared/take-home-core';
import { TOKENS } from '../shared/tokens';

@Injectable()
export class StocksService {
  constructor(
    @Inject(TOKENS.STOCKS_REPOSITORY)
    private readonly stocksRepository: StocksRepository,
    @Inject(TOKENS.PORTFOLIO_REPOSITORY)
    private readonly portfolioRepository: PortfolioRepository,
  ) {}

  async getStocks(nextToken?: string): Promise<PaginatedStocks> {
    return await this.stocksRepository.getStocks(nextToken);
  }

  async getPortfolio(userId: string): Promise<Portfolio> {
    return await this.portfolioRepository.getPortfolio(userId);
  }
}
