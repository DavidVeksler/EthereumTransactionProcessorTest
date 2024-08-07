import fs from 'fs';
import { IRepository } from './irepository-interface';
import { Transaction, Deposit } from './types';

export class TransactionProcessor {
    constructor(
        private readonly repository: IRepository,
        private readonly addressToCustomer: { [key: string]: string }
    ) {}

    public async processFiles(filePaths: string[]): Promise<void> {
        await this.repository.clearDatabase();

        for (const filePath of filePaths) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const transactions: Transaction[] = JSON.parse(fileContent).transactions || [];
            const validDeposits = transactions.filter(this.isValidDeposit);
            await this.repository.storeDeposits(validDeposits);
        }
    }

    public async generateReport(): Promise<string> {
        const deposits = await this.repository.getValidDeposits();
        const depositsByCustomer = deposits.reduce((acc: { [key: string]: { count: number, sum: number } }, deposit) => {
            const customer = this.addressToCustomer[deposit.address] || 'Unknown';
            if (!acc[customer]) {
                acc[customer] = { count: 0, sum: 0 };
            }
            acc[customer].count++;
            acc[customer].sum += deposit.amount;
            return acc;
        }, {});

        const output: string[] = [];

        const formatAmount = (amount: number): string => {
            return amount.toLocaleString('en-US', {
                minimumFractionDigits: 8,
                maximumFractionDigits: 8,
                useGrouping: false
            });
        };

        Object.values(this.addressToCustomer).forEach(customer => {
            const { count, sum } = depositsByCustomer[customer] || { count: 0, sum: 0 };
            output.push(`Deposited for ${customer}: count=${count} sum=${formatAmount(sum)}`);
        });

        const { count: unknownCount, sum: unknownSum } = depositsByCustomer['Unknown'] || { count: 0, sum: 0 };
        output.push(`Deposited without reference: count=${unknownCount} sum=${formatAmount(unknownSum)}`);

        if (deposits.length > 0) {
            const amounts = deposits.map(d => d.amount);
            output.push(`Smallest valid deposit: ${formatAmount(Math.min(...amounts))}`);
            output.push(`Largest valid deposit: ${formatAmount(Math.max(...amounts))}`);
        } else {
            output.push('Smallest valid deposit: 0.00000000');
            output.push('Largest valid deposit: 0.00000000');
        }

        return output.join('\n');
    }

    private isValidDeposit(t: Transaction): boolean {
        return t.category === 'receive' && t.confirmations >= 6 && t.amount > 0;
    }

}