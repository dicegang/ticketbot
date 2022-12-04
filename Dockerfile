FROM node:18.12.1-bullseye-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
CMD ["node", "index.js"]
