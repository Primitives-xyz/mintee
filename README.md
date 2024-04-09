# Mintee

Minting as a service, at the speed of light.

## What's inside?

This turborepo uses [pnpm](https://pnpm.io) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `api`: Cloudflare code for the Mintee API
- `docs`: The Mintee documentation site, built with nextra: [https://docs.mintee.io/](https://docs.mintee.io/)
- `hooks`: A Cloudflare worker for handling webhooks
- `Token`: A Node.js server deployed to fly.io for minting purposes
- `web`: Mintee Frontend

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm run dev
```
