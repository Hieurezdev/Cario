# CARIO

Next.js frontend and FastAPI backend for the CARIO career development ecosystem.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Open `http://localhost:3000/workspace` and sign in to enter the workspace. Use port 3001 if 3000 is already taken.

Only run one Next.js development server per build directory. For port 3001, use a dedicated cache so another local build cannot cause intermittent 404s:

```bash
NEXT_DIST_DIR=.next-dev-3001 npm run dev -- --port 3001
```

## Run the API

The FastAPI backend connects to MongoDB for accounts, profiles, careers, mentors, and communities. The configured Qwen proxy powers CV review, Oracle analysis, and Career Coach.

```bash
uv sync
cp .env.example .env
# Set QWEN_BASE_URL, QWEN_API_KEY, MONGODB_URL and AUTH_SECRET in .env
uv run uvicorn cario.main:app --reload --host 127.0.0.1 --port 8000
```

The frontend calls `http://localhost:8000` by default. Set `NEXT_PUBLIC_API_BASE_URL` when the API is hosted elsewhere.

## Docker

Set `MONGODB_URL`, `QWEN_BASE_URL`, `QWEN_API_KEY`, and a long random `AUTH_SECRET` in `.env` first. Compose connects to your existing MongoDB; it does not start or overwrite a database. Only the API container receives `.env` (the proxy key is never copied into the web image). Use an HTTPS proxy URL outside a trusted network: the supplied HTTP endpoint sends the bearer key without transport encryption.

```bash
docker compose build
docker compose up -d
docker compose ps
```

Open `http://localhost:3001` and check the API at `http://localhost:8000/health`. Stop with `docker compose down`. The default ports must be free. If local development already occupies them, use alternate host ports and rebuild the web image with the matching public API URL:

```bash
CARIO_FRONTEND_PORT=3101 CARIO_API_PORT=8100 NEXT_PUBLIC_API_BASE_URL=http://localhost:8100 FRONTEND_ORIGINS=http://localhost:3101 docker compose up --build -d
```

Then open `http://localhost:3101`. `NEXT_PUBLIC_API_BASE_URL` is embedded at web build time, so changing it requires `docker compose build web` (or `up --build`). When deploying on another machine, replace `localhost` with the browser-reachable API address and set `FRONTEND_ORIGINS` to the browser's web origin.

To build/run the two images without Compose:

```bash
docker build -f Dockerfile.api -t cario-api:local .
docker build -f Dockerfile.web --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 -t cario-web:local .
docker run -d --name cario-api --env-file .env -e FRONTEND_ORIGINS=http://localhost:3001 -p 8000:8000 cario-api:local
docker run -d --name cario-web -p 3001:3000 cario-web:local
```

After the API is healthy, seed an empty database with `docker compose exec api python -m scripts.seed_oracle_questions` and the other seed commands below. Do not reseed an existing database unless intended; the Oracle seed is idempotent.

After configuring `MONGODB_URL`, seed the initial catalogue, demo accounts, mentors, communities, and Oracle situations:

```bash
uv run python scripts/seed_careers.py
uv run python scripts/seed_users.py
uv run python -m scripts.seed_user_evidence  # 2 labeled demo records for hoangchihien301105@gmail.com (existing account only)
uv run python scripts/seed_mentors.py
uv run python -m scripts.seed_communities
uv run python -m scripts.seed_oracle_questions
# Existing v1 Oracle attempts only: recalculate stored shares from their saved answers.
uv run python -m scripts.migrate_oracle_v2
```

## Scope

- The guided discovery conversation records the user's stage, interests, strengths, values, and self-reported skills. Its skill checklist comes from careers in MongoDB, with search across fields. Career comparison ranks suggestions using declared skills, actual evidence, and interests; demo evidence is excluded from matching.
- Career Quest filters, details, and save actions are interactive. Submitting an HTTP(S) link to the work plus a reflection marks the quest complete and saves the submission to Career Identity. Completion is self-reported, not reviewed or verified. Deleting its evidence reopens the quest.
- The CV screen reads an uploaded PDF locally or accepts pasted text; its review is sent to the Qwen proxy through FastAPI.
- Oracle reads 18 versioned fictional situations from `Cario.oracle_question`. Answers are saved as a draft on the user, then scored by a transparent six-dimension rubric. Scores are calibrated for how often each dimension appears in the question bank, and integer percentages add to 100. Completed attempts go to `Cario.oracle_attempt`, and the latest vector appears in the user profile. The optional Qwen reading is saved on both the attempt and latest profile; repeated requests return the saved text. Existing cached Gemini readings are preserved. These are exploration signals, not a validated psychometric assessment.
- Career Coach sends recent conversation turns and profile context to the Qwen proxy through FastAPI.
- Accounts and workspace profiles are stored in MongoDB. Browser storage is a local fallback when profile sync is unavailable.
- Communities, posts and comments are separate MongoDB collections. Creating and editing content requires login; edit/delete permissions are limited to owners or authors.
- Mentors are loaded from MongoDB. Logged-in users can create or edit their own mentor profile.
- Quest scenarios are practice exercises. Live mentor booking and verified partner opportunities are not connected yet.

Run `npm run build` to check the production build and TypeScript types.
