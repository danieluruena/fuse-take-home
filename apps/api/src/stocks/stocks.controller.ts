import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ItemNotFoundException, Logger } from '@danieluruena/take-home-core';
import { StocksService } from './stocks.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { TOKENS } from '../shared/tokens';
import { ApiRequest, StockPurchaseData } from '../shared/types';

@Controller()
export class StocksController {
  constructor(
    private readonly stocksService: StocksService,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
  ) {}

  @Get('stocks')
  async getStocks(@Req() request: ApiRequest) {
    const { nextToken } = request.query;
    this.logger.info(`Getting stocks with nextToken: ${nextToken as string}`);
    const results = await this.stocksService.getStocks(nextToken as string);
    this.logger.info(`${results.items.length} stocks retrieved`);
    return {
      status: 200,
      data: { items: results.items, nextToken: results.nextToken },
    };
  }

  @UseGuards(JwtGuard)
  @Get('portfolio')
  async getPortfolio(@Req() request: ApiRequest) {
    const { user } = request;
    if (!user || !user.userId) {
      return {
        status: 400,
        message: 'User ID is required',
      };
    }

    this.logger.info(`Getting portfolio for user: ${user.userId}`);

    try {
      const portfolio = await this.stocksService.getPortfolio(user.userId);
      this.logger.info(`Portfolio retrieved for user: ${user.userId}`);
      return {
        status: 200,
        data: portfolio,
      };
    } catch (error) {
      if (error instanceof ItemNotFoundException) {
        throw new NotFoundException('Portfolio not found');
      }
    }
  }

  @UseGuards(JwtGuard)
  @Post('stocks/buy')
  async buyStock(@Req() request: ApiRequest, @Body() body: StockPurchaseData) {
    const { user } = request;
    const { symbol, quantity, price } = body;

    if (!symbol || !quantity || !price) {
      throw new BadRequestException('Symbol, quantity, and price are required');
    }

    if (!user || !user.userId) {
      throw new UnauthorizedException('User must be authenticated');
    }

    const transactionResult = await this.stocksService.processTransaction(
      user.userId,
      symbol,
      price,
      quantity,
    );

    return {
      status: 200,
      data: transactionResult,
    };
  }
}
