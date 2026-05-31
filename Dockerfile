FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 5000

CMD ["sh", "entrypoint.sh"]