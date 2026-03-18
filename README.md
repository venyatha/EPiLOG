# EPiLOG

A Letterboxd-style web app for TV shows. Search, follow, rate, and review TV shows. View your profile and see your top-rated shows.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router) + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | MySQL 8.0 + Prisma ORM |
| Auth | JWT + bcrypt |
| Show Data | TMDB API (v3) |
| Deployment | Docker Compose |

## Features

- Register and login with email/password
- Search TV shows powered by TMDB
- Follow shows — saved to your profile
- Rate (1–10) and review any show
- Public user profiles with followed shows and top-rated shows
- Show detail pages with EPiLOG community ratings

## Getting Started

### Prerequisites

- Docker + Docker Compose
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

### Setup

1. Clone the repo and copy the env file:
   ```bash
   cp .env.example .env
   ```

2. Fill in `.env`:
   ```
   DB_ROOT_PASSWORD=your_root_password
   DB_USER=epilog_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=a_long_random_secret_string
   TMDB_API_KEY=your_tmdb_v3_api_key
   ```

3. Start everything:
   ```bash
   docker compose up --build
   ```

4. Open [http://localhost:3000](http://localhost:3000)

The backend runs at `http://localhost:4000`. MySQL is available at port 3306. Database migrations run automatically on startup.

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
    │   └── schema.prisma   # DB schema
    └── src/
        ├── routes/
        ├── controllers/
        ├── services/       # TMDB, auth, follows, reviews
        ├── middleware/
        └── lib/
```

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✓ | Current user |
| GET | /api/shows/search?q= | — | Search TMDB |
| GET | /api/shows/:id | — | Show detail |
| GET | /api/follows | ✓ | My followed shows |
| POST | /api/follows | ✓ | Follow a show |
| DELETE | /api/follows/:tmdbId | ✓ | Unfollow |
| GET | /api/reviews/show/:tmdbId | — | Reviews for a show |
| GET | /api/reviews/user/:username | — | Reviews by user |
| POST | /api/reviews | ✓ | Create review |
| PUT | /api/reviews/:tmdbId | ✓ | Update review |
| DELETE | /api/reviews/:tmdbId | ✓ | Delete review |
| GET | /api/users/:username | — | User profile |
| GET | /api/users/:username/follows | — | User's followed shows |

## Database Schema

- **User** — id, username, email, passwordHash
- **FollowedShow** — userId, tmdbShowId, showName, posterPath
- **Review** — userId, tmdbShowId, showName, posterPath, rating (1–10), body

## Deployment

The app is fully containerized. To deploy to a VPS:

1. Install Docker + Docker Compose on the server
2. Clone the repo and set up `.env`
3. Run `docker compose up -d --build`
4. (Optional) Add an Nginx reverse proxy for a custom domain + HTTPS
