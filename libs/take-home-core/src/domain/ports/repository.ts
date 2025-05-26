import { Portfolio } from '../entities/portfolio';
import { PaginatedStocks, Stock } from '../entities/stock';
import { User } from '../entities/user';

export interface StocksRepository {
    saveStock(item: Stock): Promise<void>;
    saveStocks(items: Stock[]): Promise<void>;
    getStocks(nextToken?: string): Promise<PaginatedStocks>;
}

export interface PortfolioRepository {
    savePortfolio(portfolio: Portfolio): Promise<void>;
    getPortfolio(userId: string): Promise<Portfolio>;
}

export interface UsersRepository {
    saveUser(user: User): Promise<void>;
    getUser(userId: string): Promise<User>;
    getUserByEmail(email: string): Promise<User>;
}