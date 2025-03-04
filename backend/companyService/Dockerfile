FROM node:alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --only=production

COPY . .

EXPOSE 5002

CMD ["node", "index.js"]

