import { Transaction, Deposit } from './types';

export interface IRepository {
  clearDatabase(): unknown;
  storeDeposits(deposits: Transaction[]): void;
  getValidDeposits(): Promise<Deposit[]>;
}