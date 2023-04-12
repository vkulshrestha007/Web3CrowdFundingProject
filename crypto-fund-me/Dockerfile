FROM node:16.19-alpine3.17 AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY . .
RUN npm run build
CMD npm run start
