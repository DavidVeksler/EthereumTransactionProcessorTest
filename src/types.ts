export interface Transaction {
    address: string;
    category: string;
    amount: number;
    confirmations: number;
    txid: string;
}

export interface Deposit {
    address: string;
    amount: number;
}
