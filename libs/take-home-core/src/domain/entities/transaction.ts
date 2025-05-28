export const TransactionStatusValues = {
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED'
} as const;

export type TransactionStatus = typeof TransactionStatusValues[keyof typeof TransactionStatusValues];

export type Transaction = {
    userId: string;
    createdAt: string;
    status: TransactionStatus;
    symbol: string;
    price: number;
    quantity: number;
}

export type PaginatedTransactions = {
    items: Transaction[];
    nextToken?: string;
}