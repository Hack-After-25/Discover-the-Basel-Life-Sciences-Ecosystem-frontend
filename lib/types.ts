export type EntityType =
  | "lab_space"
  | "investor"
  | "pharma"
  | "service_provider"
  | "accelerator"
  | "research_institute"
  | "funding_program";

export type Canton = "BS" | "BL";

/** Answer and voice language. */
export type Language = "en" | "de" | "fr";

/** The six sources ingested by the RAG pipeline. */
export type DataSource =
  | "Zefix"
  | "Basel Super Cluster"
  | "BaseLaunch"
  | "DayOne"
  | "Startup.ch"
  | "Switzerland Innovation Park Basel";

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
  | "clinical";

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  canton: Canton;
  lat: number;
  lng: number;
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
  website: string;
  contactEmail: string;
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
}

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