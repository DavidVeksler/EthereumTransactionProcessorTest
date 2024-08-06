FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++ sqlite-dev

COPY package*.json ./
RUN npm install

# RUN npm uninstall sqlite3 && npm install better-sqlite3

COPY . .
RUN npx tsc

EXPOSE 3000
ENV NODE_ENV production
CMD ["node", "dist/main.js"]