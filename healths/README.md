# Health Atlas

An educational healthcare knowledge graph built with Next.js App Router, React, PostgreSQL, and Drizzle ORM. It connects conditions, symptoms, treatment approaches, medication categories, risk factors, and body systems. This is not a diagnostic or prescribing system.

## Included experience

- A responsive dashboard with locally hosted typefaces and original medical illustrations, with two selectable visual design options: Option A (HealthMesh) and Option B (Clinical Blue). Your selection persists in this browser.
- Instant, keyboard-accessible autocomplete with common aliases and edit-distance typo tolerance.
- An SVG knowledge graph with node dragging, panning, zoom, category filters, expansion/collapse, recentering, history, and reset.
- Condition and topic profiles, emergency signposting, treatment safety information, and external authoritative references.
- A side-by-side condition comparison that highlights shared educational associations.
- All 10 body systems, with an interactive body map and connected topic categories.
- Anonymous, PostgreSQL-backed saved topics using a first-party HTTP-only cookie.
- Searchable source references, transparent content limitations, responsive navigation, and loading/error/empty states.

## Stack and layout

- `src/app`: server-rendered application routes and API endpoints.
- `src/components`: shared interface components and interactive views.
- `src/lib/knowledge-data.ts`: curated starter data (24 conditions, 38 symptoms, 25 treatments, 15 medication categories, 14 associated factors, and 10 body systems).
- `src/lib/library.ts`: transactional, concurrency-safe initial database seeding and Drizzle queries.
- `src/db/schema.ts`: normalized entity and relationship tables, plus anonymous bookmarks.
- `public/fonts` and `public/images`: self-hosted brand assets.
- `scripts/smoke-test.mjs`: real Chromium end-to-end verification.

## Run the project in VS Code

### 1. Install prerequisites

Install [VS Code](https://code.visualstudio.com/), [Node.js 20.9 or newer](https://nodejs.org/) (Node.js 22 LTS is recommended), and [Docker Desktop](https://www.docker.com/products/docker-desktop/) if you do not already have PostgreSQL installed. Open Docker Desktop before continuing when using the included database container.

### 2. Open the project folder

In VS Code, select **File → Open Folder** and open the `health-atlas` project folder—the folder that contains `package.json`. Open **Terminal → New Terminal**. The commands below work in PowerShell, macOS, and Linux.

### 3. Create your local environment file

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

`.env.example` contains a local development connection URL for the bundled PostgreSQL container. Do not use its example password for a shared or production database. Keep your real `.env` file private.

### 4. Start PostgreSQL

For the simplest setup, run the included Docker database from the project root:

```bash
docker compose up -d postgres
```

Wait until it is ready:

```bash
docker compose ps
```

Alternatively, start your existing PostgreSQL server and update `DATABASE_URL` in `.env` to match its username, password, host, port, and database. Make sure the database named in the connection URL exists. The application and Drizzle migrations both read `DATABASE_URL` from the same `.env` file.

### 5. Install dependencies and create the database tables

```bash
npm install
npx drizzle-kit push
```

### 6. Start the application

```bash
npm run dev
```

Open **http://localhost:3000** in your browser. The first request creates the sample health topics and their relationships automatically. No API keys or additional seed command are required. Keep the VS Code terminal running while you use the app; press **Ctrl+C** to stop it.

### Check that it is working

Visit **http://localhost:3000/api/health**. A healthy connection returns `{"ok":true}`. The VS Code terminal shows server errors if Node.js or PostgreSQL is not running.

### Troubleshooting

- **`DATABASE_URL is required`:** Check that `.env` exists in the project root beside `package.json` and contains a valid `DATABASE_URL`.
- **Connection refused:** Start PostgreSQL or Docker Desktop, then run `docker compose up -d postgres`.
- **Password authentication failed:** Update `DATABASE_URL` in `.env` to match your PostgreSQL credentials. For Docker, the development defaults are username `postgres`, password `postgres`, database `app_db`, and port `5432`.
- **Port 5432 already in use:** Stop the conflicting PostgreSQL service, or change the host port in `compose.yaml` and the port in `.env` to the same new value.
- **Port 3000 already in use:** Run `npm run dev -- -p 3001`, then open **http://localhost:3001**.
- **Reset local database:** `docker compose down -v` removes the local PostgreSQL volume and its data. Start the container again and rerun `npx drizzle-kit push`. This permanently deletes local saved topics.

No external API credentials are needed. For the platform-managed preview or production build, use `npm run build` and the hosting platform's managed runtime.

## API

- `GET /api/health`: verifies database connectivity.
- `GET /api/knowledge?q=asthma&kind=condition`: query the database-backed library.
- `GET /api/knowledge/:id`: one topic, its relationships, and connected topics.
- `GET /api/bookmarks`: the current anonymous browser's saved topic IDs.
- `POST /api/bookmarks`: JSON with an existing topic `id` and an `action` of `save` or `remove`.

Medical library endpoints are read-only. The library is seeded only when it is empty. After intentionally editing `src/lib/knowledge-data.ts`, run `npx tsx scripts/refresh-library.ts` to update topic content and citations while preserving bookmarks. This maintenance script upserts existing records; it does not automatically delete old topics.

The locally hosted DM Sans and Manrope typefaces are distributed under the SIL Open Font License; their licenses are included in `public/fonts/`. The topic illustrations are original generated decorative assets, not diagnostic or anatomical reference images.

## Verification

Run `npx next typegen`, `npm exec tsc -- --noEmit --pretty false`, and `npm run build`. After starting a preview through the hosting platform, run `npx playwright install chromium` and `node scripts/smoke-test.mjs`. Set `BASE_URL` if the preview is not at `http://127.0.0.1:3000`. The test creates browser screenshots in `artifacts/` and removes its test bookmark.

## Content and safety

The starter content is a curated educational summary based primarily on MedlinePlus, a service of the National Library of Medicine. Profiles link to original sources. The sample library is not exhaustive, is not independently clinically reviewed, and is not endorsed by the referenced organizations. Source organizations may update their material independently.

Connections are general educational associations, not evidence of individual causation or ranked differential diagnoses. No personal symptoms, medical history, or identifying information are requested. There are no personalized recommendations, prescriptions, or dosages.

Saved topics are associated with a random browser identifier, not an authenticated account. Clearing the browser cookie removes access to that collection but does not itself delete database records. A bookmark can be explicitly removed through the interface.

**Health Atlas provides general educational information only. It is not a medical diagnostic tool and does not replace advice, diagnosis, or treatment from a qualified healthcare professional.**
