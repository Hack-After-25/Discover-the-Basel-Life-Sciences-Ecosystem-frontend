# Basel Life Sciences Navigator (frontend)

Frontend for Hack am Rhein, Challenge 1. A founder or researcher speaks or
types what they need in English, German or French and gets explained matches
across Basel-Stadt and Basel-Landschaft, a 90-day action plan, a map, a
knowledge-graph view, and actions they can take straight away.

The app runs entirely on mock data. No backend or API key is needed to demo it.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Requires Node 18.17 or newer.
In the team repo this folder is `frontend/`.

## How it maps to the team plan

| Plan item | Where it lives |
| --- | --- |
| Voice in (ElevenLabs) | `components/mic-button.tsx`, `app/api/voice/transcribe` |
| Voice out (ElevenLabs) | "Read plan aloud" in `components/plan-tab.tsx`, `app/api/voice/speak` |
| DE / FR / EN | Language is detected from the text or chosen on the intake page. Generated content (match reasons, plan, spoken summary) follows it. Interface labels stay in English. |
| 90-day action plan | `components/plan-tab.tsx`: weeks 1 to 13, contacts with emails, funding deadlines, lab availability |
| Visual map of connections | Graph tab with typed edges: funds, is part of, offers lab space for, partners with |
| "Why did RAG return this?" | "Why this match?" on every match card: source, retrieved snippet, audit reference |
| Approval guard | The intro-email modal needs explicit approval before "Open in mail client" is enabled |
| Six data sources | `Entity.source` and `Citation.source`, shown in the drawer and on match cards |
| Three demo scenarios | The example prompts on the intake page: researcher (FR), growing biotech (EN), founder moving to Basel (DE) |
| Fallback if a live API fails | Mocks in `lib/api.ts`, and browser speech if ElevenLabs is not reachable or not configured |

One difference from the plan: this is a Next.js project, not a Lovable export.
Lovable generates Vite + React projects and cannot import a Next.js app. If the
team wants the UI inside Lovable, `components/` and `lib/` port over with small
changes (replace `next/link`, `next/navigation` and `next/dynamic`, and move
the three voice routes to the backend).

## Voice setup (optional)

Copy `.env.example` to `.env.local` and set:

```
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
```

The key stays on the server: the browser talks to `/api/voice/*`, which calls
ElevenLabs (`scribe_v2` for speech-to-text, `eleven_multilingual_v2` for
text-to-speech; both can be overridden with env variables). Speech-to-text
detects the spoken language automatically.

Without a key the mic button uses the browser's speech recognition (Chrome,
Edge, Safari) and "Read plan aloud" uses the browser's speech synthesis. In a
browser with neither, the mic button is hidden.

The microphone needs HTTPS or localhost.

## The flow

1. `/` Intake: speak or type, choose the answer language or leave it on Auto.
2. `/profile` Confirmation: the parsed profile, editable before matching.
3. `/results` Workspace: Matches, 90-day plan, Map and Graph tabs, a profile
   sidebar, and a "Refine results" chat panel.
4. `/shortlist` Saved organisations with notes and a compare mode (up to three).

## Structure

```
app/
  page.tsx                Intake (text, voice, language)
  profile/page.tsx        Profile confirmation
  results/page.tsx        Results workspace (tabs + chat)
  shortlist/page.tsx      Shortlist and compare
  api/voice/              ElevenLabs proxy routes: status, transcribe, speak
components/
  ui/                     Button, Badge, Input, Dialog, Skeleton (shadcn/ui pattern)
  mic-button.tsx          Voice input
  match-card.tsx          Match with reason, sources and actions
  matches-tab.tsx         Grouped matches with filters
  plan-tab.tsx            90-day plan, summary, voice output, print layout
  map-tab.tsx / map-view.tsx       Leaflet map (client only)
  graph-tab.tsx / graph-view.tsx   Knowledge-graph view (client only)
  chat-panel.tsx          Refinement chat
  entity-drawer.tsx       Organisation details
  email-modal.tsx         Intro email draft with approval
lib/
  types.ts                Data model, including the graph schema (Relation)
  api.ts                  The only data-access file (mocked)
  mock-data.ts            36 organisations, graph edges, deadlines
  i18n.ts                 DE / FR / EN text for generated content
  voice.ts                Client voice helpers with browser fallback
  store.ts                Zustand store, persisted to localStorage
  entity-meta.ts          Labels and the colour for each organisation type
```

## Connect the backend

Components and the store import only from `lib/api.ts`. Replace each function
body with a request and keep the signature.

| Function | Suggested endpoint | Codex tools behind it | Returns |
| --- | --- | --- | --- |
| `parseNeed(text, language?)` | `POST /parse-need` | profile extraction | `Profile` |
| `getMatches(profile)` | `POST /match` | `search_labs`, `search_investors`, `search_programs`, `search_companies` | `Match[]` |
| `getPlan(profile, matches)` | `POST /plan` | `generate_action_plan` (Apertus) | `Plan` |
| `getRelations()` | `GET /graph/relations` | `graph_traverse` | `Relation[]` |
| `draftIntroEmail(profile, entityId)` | `POST /intro-email` | Apertus | `{ subject, body }` |
| `refine(profile, message)` | `POST /refine` | orchestrator | `{ profile, reply }` |
| `getEntities()` | `GET /entities` | | `Entity[]` |

If the backend exposes one demo endpoint instead, call it once in the store's
`runAnalysis` and split the response into `matches` and `plan`.

Example:

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL; // e.g. http://localhost:8000

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed with ${res.status}`);
  return res.json();
}

export const getMatches = (profile: Profile) => post<Match[]>("/match", { profile });
export const getPlan = (profile: Profile, matches: Match[]) => post<Plan>("/plan", { profile, matches });
```

Notes for the backend:

- JSON field names must match `lib/types.ts` (camelCase). With FastAPI and
  Pydantic, set `alias_generator=to_camel` and `populate_by_name=True`.
- `Profile.language` ("en", "de", "fr") is the language Apertus should answer
  in. `Match.reason`, `Plan.summary` and each step's `title` and `description`
  should come back in that language. `Plan.summary` is what gets read aloud,
  so keep it to a few sentences.
- `Match.citations` are the retrieved chunks that justify the match, and
  `Match.auditId` is the reference into the SHA-256 audit chain.
- Plan steps use `weekStart` and `weekEnd` from 1 to 13.
- Each `Need` needs a unique `id`. It is used as a React key.
- `refine` should return the same `profile` object unchanged when the message
  causes no change. The store re-runs matching only when the profile differs.
  With a real backend, compare by content or return a `changed` flag instead.
- `Relation.source` and `Relation.target` are entity ids. To add a relation
  type, extend `RelationType` in `lib/types.ts` and `RELATION_LABEL` in
  `lib/i18n.ts`.
- Enable CORS for the frontend origin.

## About the mock data

Everything in `lib/mock-data.ts` is placeholder content for the demo:

- Organisation names are real. Descriptions, facilities, stage fit,
  availability, coordinates, website addresses and the source assigned to each
  record are illustrative. Contact emails use `example.org` on purpose.
- The graph edges show the shape of the knowledge graph and are not a verified
  record of who funds or partners with whom.
- Funding deadlines have invented dates.
- Audit references start with `mock-` and Zefix citations are generated text.

Replace these with ingested data before presenting any of it as fact.

The mock "AI" in `lib/api.ts` is keyword matching and a scoring formula. It
understands the three example prompts and similar phrasing in the three
languages, and is there so the interface is fully clickable.

## Good to know

- State is saved in localStorage under `basel-navigator-v2`. "Start over"
  clears the profile and results and keeps the shortlist.
- "Export as PDF" calls `window.print()`. The print stylesheet prints the
  summary, contacts, deadlines, timeline and every step.
- The intro email draft is in English regardless of the answer language.
- The map uses OpenStreetMap's public tile server, which is fine for a demo.
- The typeface (Schibsted Grotesk) is bundled through `@fontsource-variable`,
  so there is no request to Google Fonts.
