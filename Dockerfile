# Stage 1: Build the application
FROM node:16-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install  --legacy-peer-deps

COPY . .

RUN npm run build

# Stage 2: Run the application
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install  --legacy-peer-deps --production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
