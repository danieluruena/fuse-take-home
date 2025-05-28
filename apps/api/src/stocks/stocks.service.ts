import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  getBuyStocksPath,
  HttpClient,
  Logger,
  PaginatedStocks,
  Portfolio,
  PortfolioRepository,
  Stock,
  StocksRepository,
  Transaction,
  TransactionsRepository,
  TransactionStatusValues,
} from '@danieluruena/take-home-core';
import { TOKENS } from '../shared/tokens';
import { TransactionResult } from '../shared/types';

@Injectable()
export class StocksService {
  constructor(
    @Inject(TOKENS.STOCKS_REPOSITORY)
    private readonly stocksRepository: StocksRepository,
    @Inject(TOKENS.PORTFOLIO_REPOSITORY)
    private readonly portfolioRepository: PortfolioRepository,
    @Inject(TOKENS.TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: TransactionsRepository,
    @Inject(TOKENS.HTTP_CLIENT)
    private readonly httpClient: HttpClient,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
  ) {}

  async getStocks(nextToken?: string): Promise<PaginatedStocks> {
    return await this.stocksRepository.getStocks(nextToken);
  }

  async getPortfolio(userId: string): Promise<Portfolio | undefined> {
    return await this.portfolioRepository.getPortfolio(userId);
  }

  private async buyStock(
    symbol: string,
    price: number,
    quantity: number,
  ): Promise<void> {
    this.logger.info(`Buying stock: ${symbol} at price: ${price}`);
    await this.httpClient.configure();
    const url = getBuyStocksPath().replace('{symbol}', symbol);
    await this.httpClient.post(url, { price, quantity });
  }

  private async checkStockAvailability(symbol: string): Promise<Stock> {
    const stock = await this.stocksRepository.getStock(symbol.toUpperCase());
    if (!stock) {
      this.logger.error(`There is no any stock with symbol: ${symbol}`);
      throw new BadRequestException(
        `There is no any stock with symbol: ${symbol}`,
      );
    }
    return stock;
  }

  private async checkUserPortfolio(userId: string): Promise<Portfolio> {
    let portfolio = await this.portfolioRepository.getPortfolio(userId);
    if (!portfolio) {
      this.logger.warn(`Portfolio not found for user: ${userId}`);
      this.logger.info(`Creating a new portfolio for user: ${userId}`);
      portfolio = {
        userId,
        stocks: [],
      };
      await this.portfolioRepository.savePortfolio(portfolio);
    }
    return portfolio;
  }

  private async performTransaction(
    stock: Stock,
    userId: string,
    price: number,
    quantity: number,
  ): Promise<Transaction> {
    const transaction: Transaction = {
      userId,
      createdAt: new Date().toISOString(),
      status: TransactionStatusValues.SUCCESS,
      symbol: stock.symbol,
      price,
      quantity,
    };

    try {
      await this.buyStock(stock.symbol, price, quantity);
    } catch (error) {
      this.logger.error(
        `Error buying stock ${stock.symbol} for user ${userId}: ${error}`,
      );
      transaction.status = TransactionStatusValues.FAILED;
    }

    await this.transactionsRepository.saveTransaction(transaction);
    this.logger.info(`A new transaction for user ${userId} was created`);

    return transaction;
  }

  private async updatePortfolio(
    portfolio: Portfolio,
    stock: Stock,
    quantity: number,
  ): Promise<void> {
    const existingStock = portfolio.stocks.find(
      (portfolioStock) => portfolioStock.symbol === stock.symbol,
    );

    if (existingStock) {
      existingStock.quantity += quantity;
      this.logger.info(
        `Updating existing stock ${stock.symbol} quantity to ${existingStock.quantity}`,
      );
    } else {
      this.logger.info(`Adding new stock ${stock.symbol} to portfolio`);
      portfolio.stocks.push({
        symbol: stock.symbol,
        quantity,
        name: stock.name,
        sector: stock.sector,
      });
    }

    await this.portfolioRepository.updatePortfolio(portfolio);
    this.logger.info(
      `Stock ${stock.symbol} was added to portfolio for user ${portfolio.userId}`,
    );
  }

  async processTransaction(
    userId: string,
    symbol: string,
    price: number,
    quantity: number,
  ): Promise<TransactionResult> {
    const stock = await this.checkStockAvailability(symbol);
    const portfolio = await this.checkUserPortfolio(userId);
    const transaction = await this.performTransaction(
      stock,
      userId,
      price,
      quantity,
    );

    const transactionResult: TransactionResult = {
      status: transaction.status,
      message: `Stock ${stock.symbol} purchased successfully`,
    };

    if (transaction.status === TransactionStatusValues.FAILED) {
      transactionResult.message = `Failed to purchase stock ${stock.symbol}`;
      return transactionResult;
    }

    await this.updatePortfolio(portfolio, stock, quantity);

    return transactionResult;
  }
}
