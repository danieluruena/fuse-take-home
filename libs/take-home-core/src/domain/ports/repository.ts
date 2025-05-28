import { Portfolio } from '../entities/portfolio';
import { PaginatedStocks, Stock } from '../entities/stock';
import { PaginatedTransactions, Transaction, TransactionStatus } from '../entities/transaction';
import { User } from '../entities/user';

export interface StocksRepository {
    saveStock(item: Stock): Promise<void>;
    saveStocks(items: Stock[]): Promise<void>;
    getStocks(nextToken?: string): Promise<PaginatedStocks>;
    getStock(symbol: string): Promise<Stock | undefined>;
}

export interface PortfolioRepository {
    savePortfolio(portfolio: Portfolio): Promise<void>;
    updatePortfolio(portfolio: Portfolio): Promise<void>;
    getPortfolio(userId: string): Promise<Portfolio | undefined>;
    deletePortfolio(userId: string): Promise<void>;
}

export interface UsersRepository {
    saveUser(user: User): Promise<void>;
    getUser(userId: string): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
}

export interface TransactionsRepository {
    saveTransaction(transaction: Transaction): Promise<void>;
    getTransactions(userId: string, nextToken?: string): Promise<PaginatedTransactions>;
    getTransactionsByStatus(status: TransactionStatus): Promise<Transaction[]>;
    getTransactionsByDateRangeAndStatus(startDate: string, endDate: string, status: TransactionStatus): Promise<Transaction[]>;
    getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]>;
}