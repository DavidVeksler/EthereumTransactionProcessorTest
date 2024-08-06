import { TransactionProcessor } from './transaction-processor';
import { SqliteRepository } from './sqlite-repository';

const AddressToCustomer: { [key: string]: string } = {
    'mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ': 'Wesley Crusher',
    'mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp': 'Leonard McCoy',
    'mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n': 'Jonathan Archer',
    '2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo': 'Jadzia Dax',
    'mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8': 'Montgomery Scott',
    'miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM': 'James T. Kirk',
    'mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV': 'Spock'
};

async function main() {
    const processor = new TransactionProcessor(new SqliteRepository('transactions.db'), AddressToCustomer);
    await processor.processFiles(['./transactions-1.json', './transactions-2.json']);
    const report = await processor.generateReport();
    console.log(report);
}

main().catch(error => {
    console.error('An error occurred:', error);
    process.exit(1);
});