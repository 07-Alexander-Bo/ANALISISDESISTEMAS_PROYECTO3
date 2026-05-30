FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN chmod +x entrypoint.sh

EXPOSE 4000

CMD ["sh", "entrypoint.sh"]
