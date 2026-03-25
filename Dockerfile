FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["npm", "test"]
