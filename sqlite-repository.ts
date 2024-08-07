import sqlite3 from 'sqlite3';
import { IRepository } from './irepository-interface';
import { Transaction, Deposit } from './types';

export class SqliteRepository implements IRepository {
    private db: sqlite3.Database;
    private initialized: Promise<void>;

    constructor(connectionString: string) {
        this.db = new sqlite3.Database(connectionString);
        this.initialized = this.initializeDatabase();
    }

    // TODO: for maximum accuracy, we would store the amount as an int wei value
    private initializeDatabase(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS Deposits (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Address TEXT NOT NULL,
                    Amount REAL NOT NULL, 
                    Confirmations INTEGER NOT NULL,
                    TransactionId TEXT NOT NULL UNIQUE
                )
            `, (err: Error | null) => {
                if (err) {
                    console.error('Error creating Deposits table:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public async clearDatabase(): Promise<void> {
        await this.initialized;
        return new Promise<void>((resolve, reject) => {
            this.db.run('DELETE FROM Deposits', (err: Error | null) => {
                if (err) {
                    console.error('Error clearing database:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public async storeDeposits(deposits: Transaction[]): Promise<void> {
        await this.initialized;
        return new Promise<void>((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT OR IGNORE INTO Deposits (Address, Amount, Confirmations, TransactionId)
                VALUES (?, ?, ?, ?)
            `);

            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                deposits.forEach((deposit) => {
                    stmt.run(
                        deposit.address, 
                        deposit.amount, 
                        deposit.confirmations, 
                        deposit.txid
                    );
                });
                this.db.run('COMMIT', (err: Error | null) => {
                    if (err) {
                        console.error('Error committing transaction:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            stmt.finalize();
        });
    }

    public async getValidDeposits(): Promise<Deposit[]> {
        await this.initialized;
        return new Promise<Deposit[]>((resolve, reject) => {
            const deposits: Deposit[] = [];
            this.db.each(
                'SELECT Address, Amount FROM Deposits WHERE Confirmations >= 6',
                (err: Error | null, row: { Address: string; Amount: number }) => {
                    if (err) {
                        console.error('Error fetching deposit:', err);
                        reject(err);
                    } else {
                        deposits.push({
                            address: row.Address,
                            amount: row.Amount
                        });
                    }
                },
                (err: Error | null, count: number) => {
                    if (err) {
                        console.error('Error after fetching deposits:', err);
                        reject(err);
                    } else {
                        resolve(deposits);
                    }
                }
            );
        });
    }
}