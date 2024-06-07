FROM node:14

WORKDIR /my-node-app

COPY package*.json ./
COPY package-lock*.json ./

RUN npm install
RUN npm install mqtt
RUN npm install --save aedes net
RUN npm install properties-reader

COPY . .

EXPOSE 3000 1883

CMD ["node", "server.js"]
