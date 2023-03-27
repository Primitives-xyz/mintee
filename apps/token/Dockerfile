FROM node:alpine AS builder
RUN apk add nodejs npm
# Update
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
# Install pnpm
RUN npm install -g pnpm

# Configure pnpm global
ENV PNPM_HOME=/app/.pnpm
ENV PATH=$PATH:$PNPM_HOME


# Install, and run turbo
RUN pnpm install turbo@latest --global
CMD turbo --version
COPY . .
RUN turbo prune --scope=token-server --docker

FROM alpine AS installer
RUN apk add nodejs npm
# Update
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN apk add --update python3 make g++\
    && rm -rf /var/cache/apk/*
RUN npm install -g pnpm    
RUN pnpm install


# Build the project and its dependencies
COPY --from=builder /app/out/full/ .  
RUN ls
COPY turbo.json turbo.json


RUN  pnpm turbo run build --filter=token-server...

FROM node:alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 cron1
RUN adduser --system --uid 1001 cron1
USER cron 
COPY --from=installer /app .

CMD node apps/token/dist/server.js