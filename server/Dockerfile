FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

COPY . .

FROM base AS migration

CMD ["npx", "prisma", "migrate", "deploy"]

FROM base AS builder

RUN npm run build

FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE ${PORT}

CMD ["npm", "run", "start"]
