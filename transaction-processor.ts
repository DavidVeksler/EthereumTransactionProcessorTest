import fs from 'fs';
import { IRepository } from './irepository-interface';
import { Transaction, Deposit } from './types';

export class TransactionProcessor {
  private processedTxids: Set<string> = new Set();

  constructor(
    private readonly repository: IRepository,
    private readonly addressToCustomer: { [key: string]: string }
  ) {}

  public async processFiles(filePaths: string[]): Promise<void> {
    await this.repository.clearDatabase();
    this.processedTxids.clear();

    for (const filePath of filePaths) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const transactions: Transaction[] =
        JSON.parse(fileContent).transactions || [];
      const validDeposits = transactions.filter(this.isValidDeposit.bind(this));
      await this.repository.storeDeposits(validDeposits);
    }
  }

  public async generateReport(): Promise<string> {
    const deposits = await this.repository.getValidDeposits();
    const depositsByCustomer = deposits.reduce(
      (acc: { [key: string]: { count: number; sum: number } }, deposit) => {
        const customer = this.addressToCustomer[deposit.address] || "Unknown";
        if (!acc[customer]) {
          acc[customer] = { count: 0, sum: 0 };
        }
        acc[customer].count++;
        acc[customer].sum += deposit.amount;
        return acc;
      },
      {}
    );

    const output: string[] = [];

    Object.values(this.addressToCustomer).forEach((customer) => {
      const { count, sum } = depositsByCustomer[customer] || {
        count: 0,
        sum: 0,
      };
      output.push(
        `Deposited for ${customer}: count=${count} sum=${sum.toFixed(8)}`
      );
    });

    const { count: unknownCount, sum: unknownSum } = depositsByCustomer[
      "Unknown"
    ] || { count: 0, sum: 0 };
    output.push(
      `Deposited without reference: count=${unknownCount} sum=${unknownSum.toFixed(
        8
      )}`
    );

    if (deposits.length > 0) {
      const amounts = deposits.map((d) => d.amount);
      output.push(`Smallest valid deposit: ${Math.min(...amounts).toFixed(8)}`);
      output.push(`Largest valid deposit: ${Math.max(...amounts).toFixed(8)}`);
    } else {
      output.push("Smallest valid deposit: 0.00000000");
      output.push("Largest valid deposit: 0.00000000");
    }

    return output.join("\n");
  }

  private isValidDeposit(t: Transaction): boolean {
    if (this.processedTxids.has(t.txid)) {
      return false;
    }

    if (t.category === "receive" && t.confirmations >= 6 && t.amount > 0) {
      this.processedTxids.add(t.txid);
      return true;
    }

    return false;
  }
}