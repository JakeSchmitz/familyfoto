# FamilyFoto

A family photo sharing application that allows extended family members to upload, review, and share photos from their trips together.

## Features

- Google OAuth SSO authentication
- Photo slideshow viewing
- Secure photo storage
- Family member access control

## Tech Stack

- Frontend: TypeScript/React with ShadCN components
- Backend: Node.js with TypeScript
- Database: PostgreSQL
- Authentication: Google OAuth
- Package Manager: pnpm

## Project Structure

```
familyfoto/
├── apps/
│   ├── web/          # Frontend React application
│   └── server/       # Backend server
├── packages/
│   ├── database/     # Database schema and migrations
│   └── shared/       # Shared types and utilities
```

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in both `apps/web` and `apps/server`
   - Fill in the required environment variables

3. Start development servers:
   ```bash
   pnpm dev
   ```

## Development

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm lint` - Run linting
- `pnpm test` - Run tests
