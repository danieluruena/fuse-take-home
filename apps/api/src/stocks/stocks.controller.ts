import { Controller, Get, Req } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { Request } from 'express';

@Controller()
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get('stocks')
  async getStocks(@Req() request: Request) {
    const { nextToken } = request.query;
    const results = await this.stocksService.getStocks(nextToken as string);
    return {
      status: 200,
      data: { items: results.items, nextToken: results.nextToken },
    };
  }
}
