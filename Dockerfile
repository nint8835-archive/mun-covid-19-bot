FROM node:12-alpine

WORKDIR /app
COPY . /app

RUN npm ci && npm run build

CMD ["node", "dist/index.js"]