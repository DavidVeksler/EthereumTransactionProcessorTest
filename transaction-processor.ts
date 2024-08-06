import fs from 'fs';
import { IRepository } from './irepository-interface';
import { Transaction, Deposit } from './types';

export class TransactionProcessor {
    private static readonly AddressToCustomer: { [key: string]: string } = {
        'mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ': 'Wesley Crusher',
        'mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp': 'Leonard McCoy',
        'mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n': 'Jonathan Archer',
        '2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo': 'Jadzia Dax',
        'mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8': 'Montgomery Scott',
        'miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM': 'James T. Kirk',
        'mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV': 'Spock'
    };

    constructor(private readonly repository: IRepository) {}

    public processFiles(filePaths: string[]): void {
        filePaths.forEach(filePath => {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const transactions: Transaction[] = JSON.parse(fileContent).transactions || [];
            this.repository.storeDeposits(transactions.filter(this.isValidDeposit));
        });
    }

    public async generateReport(): Promise<string> {
        const deposits = await this.repository.getValidDeposits();
        const depositsByCustomer = deposits.reduce((acc: { [key: string]: { count: number, sum: number } }, deposit) => {
            const customer = TransactionProcessor.AddressToCustomer[deposit.address] || 'Unknown';
            if (!acc[customer]) {
                acc[customer] = { count: 0, sum: 0 };
            }
            acc[customer].count++;
            acc[customer].sum += deposit.amount;
            return acc;
        }, {});

        const output: string[] = [];

        Object.values(TransactionProcessor.AddressToCustomer).forEach(customer => {
            const { count, sum } = depositsByCustomer[customer] || { count: 0, sum: 0 };
            output.push(`Deposited for ${customer}: count=${count} sum=${sum.toFixed(8)}`);
        });

        const { count: unknownCount, sum: unknownSum } = depositsByCustomer['Unknown'] || { count: 0, sum: 0 };
        output.push(`Deposited without reference: count=${unknownCount} sum=${unknownSum.toFixed(8)}`);

        if (deposits.length > 0) {
            const amounts = deposits.map(d => d.amount);
            output.push(`Smallest valid deposit: ${Math.min(...amounts).toFixed(8)}`);
            output.push(`Largest valid deposit: ${Math.max(...amounts).toFixed(8)}`);
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