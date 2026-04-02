# Movie And Series Portal

Backend API for a movie and series platform built with TypeScript, Express, Prisma, and PostgreSQL.

## Technologies Used

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM / Database Toolkit:** Prisma
- **Authentication:** Better Auth, JWT, cookie-based auth
- **File Uploads:** Multer, Cloudinary
- **Payments:** Stripe
- **Email:** Nodemailer, EJS templates
- **Utilities:** CORS, dotenv, node-cron, zod, pdfkit
- **Build Tooling:** tsup, tsx, ESLint

## Features

- Authentication and user session handling
- Media management
- Reviews and watchlists
- Purchases and payment processing
- Stripe webhook handling
- Scheduled cleanup job for unpaid purchases
- Admin seeding on server startup

## Prerequisites

- Node.js 20+ recommended
- pnpm
- PostgreSQL database
- Accounts / API keys for Stripe, Cloudinary, Google OAuth, and email SMTP

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the project root and set the required variables:

```env
PORT=8001
NODE_ENV=development
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN=
BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE=
EMAIL_SENDER_SMTP_HOST=
EMAIL_SENDER_SMTP_PORT=
EMAIL_SENDER_SMTP_USER=
EMAIL_SENDER_SMTP_PASS=
EMAIL_SENDER_SMTP_FROM=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
FRONTEND_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

4. Generate the Prisma client:

```bash
pnpm generate
```

5. Apply database migrations:

```bash
pnpm migrate
```

## Running the Project

### Development

```bash
pnpm dev
```

The server runs on `http://localhost:8001` by default.

### Production Build

```bash
pnpm build
pnpm start
```

## Useful Scripts

- `pnpm dev` - start the app in development mode with `tsx watch`
- `pnpm build` - generate Prisma client and build the app with `tsup`
- `pnpm start` - run the compiled server from `dist/server.js`
- `pnpm generate` - generate Prisma client
- `pnpm migrate` - run Prisma migrations in development
- `pnpm push` - push schema changes to the database
- `pnpm pull` - introspect the database schema
- `pnpm studio` - open Prisma Studio
- `pnpm lint` - run ESLint

## API Overview

Main routes are mounted under `/api/v1`:

- `/api/v1/auth`
- `/api/v1/media`
- `/api/v1/reviews`
- `/api/v1/watch-lists`
- `/api/v1/payments`
- `/api/v1/purchases`

Better Auth is also exposed under `/api/auth`, and Stripe webhooks are handled at `/webhook`.

## Notes

- The server seeds the admin account on startup.
- A cron job runs periodically to cancel unpaid purchases.
- For local development, make sure your frontend URL and callback URLs match your `.env` configuration.