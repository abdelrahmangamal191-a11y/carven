FROM node:20-slim

WORKDIR /app

COPY backend/package.json backend/package-lock.json* backend/
COPY web/package.json web/package-lock.json* web/
COPY mobile/package.json mobile/package-lock.json* mobile/

RUN cd web && npm install
RUN cd backend && npm install

COPY . .

RUN cd web && npm run build

EXPOSE 3000

CMD ["node", "backend/src/index.js"]
