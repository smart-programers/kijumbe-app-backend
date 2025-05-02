# Build stage
FROM oven/bun AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma

RUN bun install
COPY ./src ./src

ENV NODE_ENV=production

RUN bunx prisma generate

RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile server \
  ./src/index.ts

# Final runtime stage (distroless)
FROM debian:bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgcc-s1 \
 && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/server server
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY .env .env

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000
