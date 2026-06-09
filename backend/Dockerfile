FROM node:20-alpine

WORKDIR /app

# 1. Instalamos openssl usando el gestor de paquetes de Alpine (apk)
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .

# Al estar openssl instalado, Prisma podrá generar su cliente sin problemas de librerías faltantes
RUN npx prisma generate

RUN chmod +x entrypoint.sh

EXPOSE 4000

CMD ["sh", "entrypoint.sh"]
