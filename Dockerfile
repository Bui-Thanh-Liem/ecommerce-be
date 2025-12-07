# Build stage
FROM node:24-alpine  AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM node:24-alpine AS prod-stage

COPY --from=build-stage /app/dist ./app
COPY --from=build-stage /app/package.json ./app/package.json

WORKDIR /app

RUN npm install --only=production

EXPOSE 9000

CMD ["node", "./src/main.js"] 
