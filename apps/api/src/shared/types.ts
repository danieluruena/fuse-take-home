import { TransactionStatus } from '@danieluruena/take-home-core';
import { Request } from 'express';

export interface ApiRequest extends Request {
  user?: {
    userId: string;
  };
}

export type NewUserData = {
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type StockPurchaseData = {
  symbol: string;
  price: number;
  quantity: number;
};

export type TransactionResult = {
  status: TransactionStatus;
  message: string;
};
