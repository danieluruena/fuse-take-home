import { Stock } from '../entities/stock';

export interface StocksRepository {
    saveStock(item: Stock): Promise<void>;
    saveStocks(items: Stock[]): Promise<void>;
}
