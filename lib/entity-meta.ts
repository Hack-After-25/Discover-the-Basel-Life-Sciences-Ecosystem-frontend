import type { Canton, EntityType, NeedCategory, Stage } from "./types";

/** One colour per entity type, shared by cards, map pins and graph nodes. */
export const TYPE_META: Record<EntityType, { label: string; color: string }> = {
  lab_space: { label: "Lab space", color: "#0E8F8A" },
  investor: { label: "Investor", color: "#B7791F" },
  pharma: { label: "Pharma", color: "#5B3FD1" },
  service_provider: { label: "Service provider", color: "#C2386B" },
  accelerator: { label: "Accelerator", color: "#E0531F" },
  research_institute: { label: "Research institute", color: "#2F855A" },
  funding_program: { label: "Funding programme", color: "#2B6CB0" },
};

export const ENTITY_TYPES = Object.keys(TYPE_META) as EntityType[];

export const NEED_META: Record<NeedCategory, { label: string; defaultDetail: string }> = {
  lab_space: { label: "Lab space", defaultDetail: "Laboratory space" },
  investors: { label: "Investors", defaultDetail: "Investors for the next round" },
  regulatory: { label: "Regulatory", defaultDetail: "Regulatory strategy and expertise" },
  pharma_partners: { label: "Pharma partners", defaultDetail: "Pharma partnering and licensing" },
  acceleration: { label: "Mentoring", defaultDetail: "Acceleration and mentoring" },
  research: { label: "Research collaboration", defaultDetail: "Academic research collaboration" },
  grants: { label: "Grants", defaultDetail: "Non-dilutive funding" },
  manufacturing: { label: "Manufacturing", defaultDetail: "Process development and manufacturing" },
  legal_ip: { label: "Legal and IP", defaultDetail: "IP and legal counsel" },
  clinical: { label: "Clinical trials", defaultDetail: "Clinical trial support" },
};

export const NEED_CATEGORIES = Object.keys(NEED_META) as NeedCategory[];

export const STAGE_LABEL: Record<Stage, string> = {
  academic: "Academic / pre-company",
  "pre-seed": "Pre-seed",
  seed: "Seed",
  "series-a": "Series A",
  "series-b": "Series B",
  growth: "Growth",
};

export const STAGES = Object.keys(STAGE_LABEL) as Stage[];

export const CANTON_LABEL: Record<Canton, string> = {
  BS: "Basel-Stadt",
  BL: "Basel-Landschaft",
};

export const THERAPEUTIC_AREAS = [
  "oncology",
  "diagnostics",
  "medical devices",
  "therapeutics",
  "e-health",
  "pharma r&d tech"
];

export const THERAPEUTIC_AREA_LABELS: Record<string, string> = {
  oncology: "Oncology",
  diagnostics: "Diagnostics",
  "medical devices": "Medical Devices",
  therapeutics: "Therapeutics (General)",
  "e-health": "E-Health",
  "pharma r&d tech": "Pharma R&D Tech",
};
