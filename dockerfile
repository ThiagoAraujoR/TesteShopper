FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install express body-parser ejs \
    && npm install sequelize sqlite3 \
    && npm install sqlite3 \
    && npm install db-migrate-sqlite3 \
    && npm install express-validator \
    && npm install -g db-migrate \
    && npm install  dotenv

COPY . .

EXPOSE 3000

CMD ["db-migrate","up", ";","node", "index.js" ]