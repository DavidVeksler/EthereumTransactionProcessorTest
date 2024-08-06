
# Blockchain Transaction Processor

This Node.js application processes blockchain transactions from JSON files, stores valid deposits in a SQLite database, and generates a report of the deposits.

## Prerequisites

- Docker
- Docker Compose

## Setup and Running

1. Clone this repository to your local machine.
2. Ensure that the `transactions-1.json` and `transactions-2.json` files are in the root directory of the project.
3. Build and run the application using Docker Compose:

   ```
   docker-compose up --build
   ```

   This command will build the Docker image, create a container, and run the application. The output will be displayed in the console.

## Output

The application processes the transactions and outputs the following information:

1. Deposits for each known customer (count and sum)
2. Deposits without reference (count and sum)
3. Smallest valid deposit
4. Largest valid deposit


## Notes

- The application uses SQLite as its database, with the database file stored as `transactions.db`.
- Valid deposits are those with at least 6 confirmations.
- The application is configured to process `transactions-1.json` and `transactions-2.json` files.

# Testing:

- Run:
npx tsc
node dist/main-script.js

- or:

docker-compose up --build