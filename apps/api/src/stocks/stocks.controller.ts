import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { Request } from 'express';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { ItemNotFoundException, Logger } from '@shared/take-home-core';
import { TOKENS } from 'src/shared/tokens';

@Controller()
export class StocksController {
  constructor(
    private readonly stocksService: StocksService,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
  ) {}

  @Get('stocks')
  async getStocks(@Req() request: Request) {
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
  async getPortfolio(@Req() request: Request) {
    const { user } = request as any;
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
}
