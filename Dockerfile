# Multi-stage build for minimal production image (TypeScript)
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* tsconfig.json ./
COPY src ./src
RUN npm install && npm run build

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY public ./public

USER node
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
