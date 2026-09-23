# CARIO

Next.js frontend and FastAPI backend for the CARIO career development ecosystem.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Open `http://localhost:3000/workspace` and sign in to enter the workspace. Use port 3001 if 3000 is already taken.

## Run the API

The FastAPI backend connects to MongoDB for accounts, profiles, careers, mentors, and communities. Gemini powers CV review and Career Coach.

```bash
uv sync
cp .env.example .env
# Set GOOGLE_API_KEY, MONGODB_URL and AUTH_SECRET in .env
uv run uvicorn cario.main:app --reload --host 127.0.0.1 --port 8000
```

The frontend calls `http://localhost:8000` by default. Set `NEXT_PUBLIC_API_BASE_URL` when the API is hosted elsewhere.

After configuring `MONGODB_URL`, seed the initial catalogue, demo accounts, mentors and communities:

```bash
uv run python scripts/seed_careers.py
uv run python scripts/seed_users.py
uv run python scripts/seed_mentors.py
uv run python -m scripts.seed_communities
```

## Scope

- The guided discovery conversation records the user's stage, interests, strengths, values, and self-reported skills. It keeps the result on return and opens the matching career on the comparison screen.
- Career Quest filters, details, save actions, and reflections are interactive. Reflections can be added to the evidence-based Career Identity profile.
- The CV screen reads an uploaded PDF locally or accepts pasted text; its review is sent to Gemini through FastAPI.
- Career Coach sends questions and profile context to Gemini through FastAPI.
- Accounts and workspace profiles are stored in MongoDB. Browser storage is a local fallback when profile sync is unavailable.
- Communities, posts and comments are separate MongoDB collections. Creating and editing content requires login; edit/delete permissions are limited to owners or authors.
- Mentors are loaded from MongoDB. Logged-in users can create or edit their own mentor profile.
- Quest scenarios are practice exercises. Live mentor booking and verified partner opportunities are not connected yet.

Run `npm run build` to check the production build and TypeScript types.
