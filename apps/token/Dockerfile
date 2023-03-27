FROM node:alpine AS builder
RUN apk add nodejs npm
# Update
RUN apk add --no-cache libc6-compat
RUN apk update  && apk add openssl && apk add ca-certificates
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
COPY turbo.json turbo.json

RUN  --mount=type=secret,id=DATABASE_URL_TEST DATABASE_URL_TEST=="$(cat /run/secrets/DATABASE_URL_TEST)" pnpm turbo run build --filter=token-server...

FROM node:alpine AS runner
RUN apk update  && apk add openssl && apk add ca-certificates
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 cron1
RUN adduser --system --uid 1001 cron1
USER cron 
COPY --from=installer /app .
RUN ls

CMD node apps/token/dist/server.js