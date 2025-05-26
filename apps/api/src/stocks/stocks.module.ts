import { Module } from '@nestjs/common';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import {
  PinoLogger,
  PortfolioDynamoDBRepository,
  StocksDynamoDBRepository,
} from '@shared/take-home-core';
import { TOKENS } from '../shared/tokens';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StocksController],
  providers: [
    StocksService,
    { provide: TOKENS.STOCKS_REPOSITORY, useClass: StocksDynamoDBRepository },
    {
      provide: TOKENS.PORTFOLIO_REPOSITORY,
      useClass: PortfolioDynamoDBRepository,
    },
    { provide: TOKENS.LOGGER, useClass: PinoLogger },
  ],
})
export class StocksModule {}
