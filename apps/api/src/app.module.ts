import { Module } from '@nestjs/common';
import { StocksModule } from './stocks/stocks.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    StocksModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
