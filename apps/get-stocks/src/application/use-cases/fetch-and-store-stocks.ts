import { 
    getStocksPath,
    HttpClient, 
    Logger, 
    Stock, 
    StocksRepository, 
    UnexpectedException, 
    VendorResponse 
} from '@danieluruena/take-home-core';

export class FetchAndStoreStocksUseCase {
    
    constructor(private httpClient: HttpClient, private stockRepository: StocksRepository, private logger: Logger) {}

    async* fetchStocks(): AsyncGenerator<Stock[]> {
        this.logger.info('Fetching stocks from vendor...');
        try {
            await this.httpClient.configure();
            let nextToken: string | undefined = undefined;
            let params: Record<string, string> = {};

            do {
                const response = await this.httpClient.get<VendorResponse>(getStocksPath(), { params });
                yield response.data.items;
                nextToken = response.data.nextToken;
                if (nextToken) {
                    params = { nextToken };
                }
            } while (nextToken);
        } catch (error) {
            this.logger.error('Error fetching stocks:', error);
            throw new UnexpectedException(`Failed to fetch stocks: ${error}`);
        }
    }


    async storeStocks(stocks: Stock[]): Promise<void> {
        this.logger.info(`Storing ${stocks.length} stocks...`);
        try {
            await this.stockRepository.saveStocks(stocks);
        } catch (error) {
            this.logger.error('Error storing stocks:', error);
            throw error;
        }
    }

    async execute(): Promise<void> {
        this.logger.info('Executing use case to fetch and store stocks...');
        try {
            for await (const stocks of this.fetchStocks()) {
                this.storeStocks(stocks);
            }
        } catch (error) {
            this.logger.error('Error executing use case:', error);
            throw error;
        }
    }
}
