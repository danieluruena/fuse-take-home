import { Module } from '@nestjs/common';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import {
  AxiosClient,
  PinoLogger,
  PortfolioDynamoDBRepository,
  StocksDynamoDBRepository,
  TransactionsDynamoDBRepository,
} from '@danieluruena/take-home-core';
import { TOKENS } from '../shared/tokens';
import { AuthModule } from '../auth/auth.module';

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
    {
      provide: TOKENS.HTTP_CLIENT,
      useFactory: () => {
        return new AxiosClient(new PinoLogger());
      },
    },
    {
      provide: TOKENS.TRANSACTIONS_REPOSITORY,
      useClass: TransactionsDynamoDBRepository,
    },
  ],
})
export class StocksModule {}
