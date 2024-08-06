import { Transaction, Deposit } from './types';

export interface IRepository {
    storeDeposits(deposits: Transaction[]): void;
    getValidDeposits(): Promise<Deposit[]>;
}