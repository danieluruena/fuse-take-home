import { Module } from '@nestjs/common';
import { StocksModule } from './stocks/stocks.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../envs/local.env',
    }),
    StocksModule,
    AuthModule,
  ],
})
export class AppModule {}
