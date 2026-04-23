FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=9000
ENV ADMIN_DISABLED=true
ENV XDG_CONFIG_HOME=/app/.config
COPY --from=builder /app ./
EXPOSE 9000
CMD ["sh", "-c", "npx medusa db:migrate --execute-safe-links && npm run start"]
