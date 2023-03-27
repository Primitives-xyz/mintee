FROM node:alpine AS builder
RUN apk add nodejs npm
# Update
RUN apk add --no-cache libc6-compat
RUN apk update  && apk add openssl && apk add ca-certificates && apk add curl
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
COPY apps/token/crontab /app/crontab 
RUN apk add --update python3 make g++\
    && rm -rf /var/cache/apk/*
RUN npm install -g pnpm    
RUN pnpm install



# Build the project and its dependencies
COPY --from=builder /app/out/full/ .  
COPY turbo.json turbo.json

RUN  --mount=type=secret,id=DATABASE_URL_TEST DATABASE_URL_TEST=="$(cat /run/secrets/DATABASE_URL_TEST)" pnpm turbo run build --filter=token-server...

FROM node:alpine AS runner
RUN apk update  && apk add openssl && apk add ca-certificates && apk add curl
WORKDIR /app




# Install and configure supercronic
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.1.12/supercronic-linux-amd64 \
    SUPERCRONIC=supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=048b95b48b708983effb2e5c935a1ef8483d9e3e

RUN curl -fsSLO "$SUPERCRONIC_URL" \
    && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
    && chmod +x "$SUPERCRONIC" \
    && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
    && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic

# Copy the crontab file
COPY --from=installer /app/crontab crontab

# Don't run production as root
RUN addgroup --system --gid 1001 cron1
RUN adduser --system --uid 1001 cron1
USER cron 
COPY --from=installer /app .

# Start the application
CMD supercronic crontab