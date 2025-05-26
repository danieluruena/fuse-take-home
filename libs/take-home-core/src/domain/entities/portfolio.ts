export type Portfolio = {
    userId: string;
    stocks: {
        symbol: string;
        quantity: number;
        name: string;
        sector: string;
    }[];
}