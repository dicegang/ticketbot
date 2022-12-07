# syntax=docker/dockerfile:1.4.3
FROM node:18.12.1-bullseye-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY --link src .
USER node
CMD ["node", "index.js"]
