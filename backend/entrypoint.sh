#!/bin/sh
set -e

echo "⏳ Esperando base de datos..."
sleep 3

echo "📦 Aplicando migraciones..."
npx prisma migrate deploy

echo "🌱 Ejecutando seed..."
node src/seed.js

echo "🚀 Iniciando servidor..."
exec node src/index.js
