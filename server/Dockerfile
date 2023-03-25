FROM node:19-alpine3.16

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY ./models/* ./models/
COPY ./server.js .
COPY ./socket-handler.js .

CMD [ "npm", "run", "server" ]

EXPOSE 5000 4000