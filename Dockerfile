# Dockerfile
FROM node:20.19

WORKDIR /app

COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./
COPY tailwind.config.js ./
COPY src ./src

RUN npm ci

RUN npm run build --configuration=production

EXPOSE 4000

CMD ["npm", "run", "serve:ssr:clank-dashboard"]
