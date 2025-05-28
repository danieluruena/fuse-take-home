import { AxiosClient, StocksDynamoDBRepository, PinoLogger } from '@danieluruena/take-home-core';
import { FetchAndStoreStocksUseCase } from './application/use-cases/fetch-and-store-stocks';

const logger = new PinoLogger();
const axiosClient = new AxiosClient(logger);
const stocksRepository = new StocksDynamoDBRepository();
const useCase = new FetchAndStoreStocksUseCase(axiosClient, stocksRepository, logger);

export const handler = async () => {
  logger.info('Starting function to get stocks...');
  await useCase.execute();
  logger.info('Finished function to get stocks...');
  return {
    message: 'successfully executed'
  };
};