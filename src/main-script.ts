import { TransactionProcessor } from './TransactionProcessor';
import { SqliteRepository } from './SqliteRepository';

const processor = new TransactionProcessor(new SqliteRepository('transactions.db'));
processor.processFiles(['./transactions-1.json', './transactions-2.json']);
console.log(processor.generateReport());
