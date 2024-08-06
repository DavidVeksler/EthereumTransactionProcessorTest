import sqlite3 from 'sqlite3';
import { IRepository } from './IRepository';
import { Transaction, Deposit } from './types';

export class SqliteRepository implements IRepository {
    private db: sqlite3.Database;

    constructor(connectionString: string) {
        this.db = new sqlite3.Database(connectionString);
        this.initializeDatabase();
    }

    private initializeDatabase(): void {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS Deposits (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Address TEXT NOT NULL,
                Amount REAL NOT NULL,
                Confirmations INTEGER NOT NULL,
                TransactionId TEXT NOT NULL
            )
        `);
    }

    public storeDeposits(deposits: Transaction[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO Deposits (Address, Amount, Confirmations, TransactionId)
            VALUES (?, ?, ?, ?)
        `);

        this.db.serialize(() => {
            this.db.run('BEGIN TRANSACTION');
            deposits.forEach(deposit => {
                stmt.run(deposit.address, deposit.amount, deposit.confirmations, deposit.txid);
            });
            this.db.run('COMMIT');
        });

        stmt.finalize();
    }

    public getValidDeposits(): Deposit[] {
        return new Promise<Deposit[]>((resolve, reject) => {
            const deposits: Deposit[] = [];
            this.db.each(
                'SELECT Address, Amount FROM Deposits WHERE Confirmations >= 6',
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        deposits.push({
                            address: row.Address,
                            amount: row.Amount
                        });
                    }
                },
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(deposits);
                    }
                }
            );
        });
    }
}
