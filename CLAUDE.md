# CLAUDE.md

## Project Overview

EPiLOG is a Letterboxd-style web app for TV shows. Users can search, follow, rate, and review shows, and view public profiles.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router) + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | MySQL 8.0 + Prisma ORM |
| Auth | JWT + bcrypt |
| Show Data | TMDB API (v3) |
| Deployment | Docker Compose |

## Project Structure

```
EPiLOG/
├── docker-compose.yml
├── .env.example
├── frontend/               # Next.js app
│   ├── Dockerfile
│   └── src/
│       ├── app/            # Pages (App Router)
│       ├── components/     # UI components
│       ├── hooks/          # useAuth, useDebounce
│       ├── lib/            # API client, auth helpers
│       └── types/
└── backend/                # Express API
    ├── Dockerfile
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── routes/
        ├── controllers/
        ├── services/       # TMDB, auth, follows, reviews
        ├── middleware/
        └── lib/
```

## Development

### Prerequisites
- Docker + Docker Compose
- TMDB API key (free at themoviedb.org)

### Environment Variables
Copy `.env.example` to `.env` and fill in:
```
DB_ROOT_PASSWORD=
DB_USER=epilog_user
DB_PASSWORD=
JWT_SECRET=
TMDB_API_KEY=
```

### Running Locally
```bash
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- MySQL: port 3306

Database migrations run automatically on startup via Prisma.

## API

All API routes are prefixed with `/api`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | — | Register |
| POST | /auth/login | — | Login |
| GET | /auth/me | ✓ | Current user |
| GET | /shows/search?q= | — | Search TMDB |
| GET | /shows/:id | — | Show detail |
| GET | /follows | ✓ | My followed shows |
| POST | /follows | ✓ | Follow a show |
| DELETE | /follows/:tmdbId | ✓ | Unfollow |
| GET | /reviews/show/:tmdbId | — | Reviews for a show |
| GET | /reviews/user/:username | — | Reviews by user |
| POST | /reviews | ✓ | Create review |
| PUT | /reviews/:tmdbId | ✓ | Update review |
| DELETE | /reviews/:tmdbId | ✓ | Delete review |
| GET | /users/:username | — | User profile |
| GET | /users/:username/follows | — | User's followed shows |

## Database Schema

- **User** — id, username, email, passwordHash
- **FollowedShow** — userId, tmdbShowId, showName, posterPath
- **Review** — userId, tmdbShowId, showName, posterPath, rating (1–10), body

## Testing

### Running Tests
```bash
cd backend && npm test
cd backend && npm run test:coverage
```

### Test Framework
- Jest + ts-jest for TypeScript
- Supertest for HTTP integration testing
- jest-mock-extended for Prisma mocking (no real DB required)

### Test Structure
```
backend/src/__tests__/
  setup.ts                      # env vars for tests
  prismaMock.ts                 # typed Prisma mock singleton
  testApp.ts                    # Express app factory (no listen)
  middleware/auth.test.ts
  services/authService.test.ts
  controllers/
    authController.test.ts
    showController.test.ts
    followController.test.ts
    reviewController.test.ts
    userController.test.ts
  lib/tmdb.test.ts
```

### TDD Workflow
Write tests before implementing new features. Run `npm test` to verify red/green status.

## Key Conventions

- Backend is TypeScript — use types throughout, no `any`
- Auth middleware attaches `req.user` to protected routes
- TMDB data is fetched at request time and not stored in the DB (except denormalized fields like `showName`, `posterPath` on follows/reviews)
- Frontend uses Next.js App Router — pages go in `src/app/`, shared UI in `src/components/`
- API calls from the frontend go through a central client in `src/lib/`
