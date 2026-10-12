export type EntityType =
  | "lab_space"
  | "investor"
  | "pharma"
  | "service_provider"
  | "accelerator"
  | "research_institute"
  | "funding_program";

/** Swiss canton code ("BS", "BL", "AG", ...). The available regions come
 * from the backend (GET /regions), not a fixed list. */
export type Canton = string;

/** A region the directory has organisations in, with its display name. */
export interface Region {
  code: Canton;
  name: string;
  count: number;
}

/** Answer and voice language. */
export type Language = "en" | "de" | "fr";

/** The six sources ingested by the RAG pipeline. */
export type DataSource =
  | "Zefix"
  | "Basel Super Cluster"
  | "BaseLaunch"
  | "DayOne"
  | "Startup.ch"
  | "Switzerland Innovation Park Basel"
  | "Swiss Biotech Association"
  | "Basel Area guides"
  | "SECA"
  | "Sachs Biotech Forum"
  | "Company registers"
  | "ROR / Wikidata"
  | "Official websites";

export type Stage = "academic" | "pre-seed" | "seed" | "series-a" | "series-b" | "growth";

/** What a startup can ask for. An entity lists the categories it can serve in `offers`. */
export type NeedCategory =
  | "lab_space"
  | "investors"
  | "regulatory"
  | "pharma_partners"
  | "acceleration"
  | "research"
  | "grants"
  | "manufacturing"
  | "legal_ip"
  | "clinical"
  | "consulting"
  | "clients";

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  canton: Canton;
  /** null when nothing places the entity, e.g. an investor outside Switzerland. */
  lat: number | null;
  lng: number | null;
  description: string;
  /** Therapeutic or technology areas. "all" means generalist. */
  focusAreas: string[];
  stageFit: Stage[];
  /** e.g. "BSL-2", "Shared equipment" */
  facilities: string[];
  /** Need categories this entity can help with. */
  offers: NeedCategory[];
  /** Free-form traits used by refinements, e.g. "leads rounds". */
  tags?: string[];
  /** Which ingested source this record came from. */
  source: DataSource;
  /** Lab space only, e.g. "Benches free from November 2026". */
  availability?: string;
  /** Funding programmes only: the most a venture can get, in CHF. */
  fundingMaxChf?: number | null;
  /** How the money is paid out, e.g. "Convertible loan", "Voucher". */
  fundingType?: string | null;
  website: string;
  /** A real address from the organisation's own site, or null when none is published. */
  contactEmail: string | null;
  /** Their contact page if known, else their website. Optional for older backends. */
  contactUrl?: string;
  sourceUrl: string;
  lastVerified: string;
}

export interface Need {
  id: string;
  category: NeedCategory;
  detail: string;
}

export interface Profile {
  companyName?: string;
  teamSize: number;
  stage: Stage;
  therapeuticArea: string;
  needs: Need[];
  /** Language of generated answers and voice output. */
  language: Language;
  /** Optional refinements set through the chat panel. */
  cantonFilter?: Canton;
  /** "service_provider": a consultancy, CRO or law firm looking for clients and partners. */
  userKind?: "startup" | "service_provider";
  constraints?: string[];
}

/** A retrieved chunk that supports a match ("why did RAG return this?"). */
export interface Citation {
  source: DataSource;
  snippet: string;
  url: string;
}

export interface Match {
  entity: Entity;
  score: number;
  reason: string;
  needCategory: NeedCategory;
  citations: Citation[];
  /** Reference into the backend audit chain for this retrieval. */
  auditId: string;
  /**
   * "provider" is the thing itself (a lab, an investor, a pharma company).
   * "programme" is a support programme that can arrange it. Missing means provider.
   */
  role?: MatchRole;
}

export type MatchRole = "provider" | "programme";

export type RelationType = "funds" | "member_of" | "offers_lab_space_for" | "partners_with";

/** Knowledge-graph edge between two entities. */
export interface Relation {
  source: string;
  target: string;
  type: RelationType;
}

export interface Deadline {
  id: string;
  title: string;
  entityId: string;
  /** ISO date */
  date: string;
  note: string;
}

/** "12m" = months 1 to 12, "90d" = weeks 1 to 13. */
export type Horizon = "12m" | "90d";

export interface RoadmapStep {
  id: string;
  /** First and last period, counted in months (12m) or weeks (90d). */
  start: number;
  end: number;
  title: string;
  description: string;
  relatedEntityIds: string[];
  dependsOn: string[];
}

export interface Plan {
  horizon: Horizon;
  /** Short text in the profile language, also used for voice output. */
  summary: string;
  steps: RoadmapStep[];
  deadlines: Deadline[];
}

export interface IntroEmail {
  subject: string;
  body: string;
}

export interface RefineResult {
  profile: Profile;
  reply: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}