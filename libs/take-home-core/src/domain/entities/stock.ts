export type Stock = {
    symbol: string
    name: string
    price: number
    change: number
    lastUpdated: string
    sector: string
}

export type VendorResponse = {
    data: {
        items: Stock[]
        nextToken?: string
    }
}

export type PaginatedStocks = {
    items: Stock[]
    nextToken?: string
}