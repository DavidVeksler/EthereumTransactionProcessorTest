import { TransactionProcessor } from './transaction-processor';
import { SqliteRepository } from './sqlite-repository';

async function main() {
    // console.log('Starting process...');
    const processor = new TransactionProcessor(new SqliteRepository('transactions.db'));
    // console.log('Processing files...');
    processor.processFiles(['./transactions-1.json', './transactions-2.json']);
    // console.log('Generating report...');
    const report = await processor.generateReport();
    // console.log('Report generated:');
     console.log(report);
}
main().catch(error => {
    console.error('An error occurred:', error);
    process.exit(1);
});