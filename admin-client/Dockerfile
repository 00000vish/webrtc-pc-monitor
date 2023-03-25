FROM node:19-alpine3.16

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY ./components/ ./components/
COPY ./public/ ./public/
COPY ./pages/ ./pages/
COPY ./styles/ ./styles/

CMD [ "npm", "run", "dev" ]

EXPOSE 3000