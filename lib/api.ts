/**
 * Single data-access layer. Every function here is a MOCK that resolves after
 * a short delay. To connect the real backend (Codex orchestrator + RAG +
 * Apertus), replace each function body with a fetch() call (see README) and
 * keep the signatures. Components and the store only import from this file.
 */
import { DEADLINES, ENTITIES, RELATIONS } from "./mock-data";
import { NEED_META, STAGE_LABEL } from "./entity-meta";
import { AREA_I18N, LOCALE, NEED_I18N, REASON_I18N, STAGE_I18N, STEP_I18N, planSummary, type StepKey } from "./i18n";
import type {
  Citation,
  Entity,
  IntroEmail,
  Language,
  Match,
  Need,
  NeedCategory,
  Plan,
  Profile,
  RefineResult,
  Relation,
  RoadmapStep,
  Stage,
} from "./types";
import { uid } from "./utils";

const MOCK_DELAY_MS = 800;

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/* ------------------------------------------------------------------ */
/* Text understanding (mock keyword heuristics, EN / DE / FR)          */
/* ------------------------------------------------------------------ */

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, zwölf: 12,
  deux: 2, trois: 3, quatre: 4, cinq: 5, sept: 7, huit: 8, neuf: 9, dix: 10, douze: 12,
};

const PEOPLE = "person|personen|people|personnes|employees|mitarbeitende|mitarbeiter|members|ftes?";

const AREA_KEYWORDS: [string, RegExp][] = [
  ["oncology", /on[ck]olog|cancer|krebs|tumou?r/i],
  ["neuroscience", /neuro|alzheimer|parkinson|\bcns\b/i],
  ["immunology", /immun|inflammat/i],
  ["infectious disease", /infect|infekt|antibioti|antimicrobial|vaccin|impfstoff|virus|viral/i],
  ["rare disease", /rare disease|orphan|maladies? rares?|seltene/i],
  ["cardiometabolic", /cardio|kardio|metabol|diab[eè]t|obesity/i],
  ["ophthalmology", /opht(h)?alm|eye disease|retina|vision/i],
  ["gene and cell therapy", /gene therap|cell therap|gentherap|zelltherap|thérapie (génique|cellulaire)|car-t|crispr|\baav\b/i],
  ["medtech", /medtech|medical device|medizintechnik|dispositif médical|implant/i],
  ["digital health", /digital health|santé numérique|software|\bapp\b|\bai\b|machine learning/i],
  ["diagnostics", /diagnos|biomarker|assay/i],
];

const NEED_KEYWORDS: [NeedCategory, RegExp][] = [
  ["lab_space", /\blabs?\b|laborator|labor(fläche|platz|e)?\b|bsl|bench|paillasse/i],
  ["investors", /investor|investisseur|series [ab]|série [ab]|venture|\bvc\b|fundrais|\braise\b|financing round|finanzierungsrunde|levée de fonds/i],
  ["regulatory", /regulat|réglement|swissmedic|\bema\b|\bfda\b|compliance/i],
  ["pharma_partners", /pharma|licens|lizenz|co-develop/i],
  ["acceleration", /mentor|accelerat|incubat|inkubat|coach|orientation|accompagnement|programm/i],
  ["research", /research collab|academic partner|core facilit|research institute|forschungs(partner|kooperation)|collaboration de recherche/i],
  ["grants", /grant|non-dilutive|subsid|subvention|förder(geld|mittel|ung)|innosuisse/i],
  ["manufacturing", /manufactur|cdmo|\bgmp\b|scale-up|process development|herstell|production/i],
  ["legal_ip", /\bip\b|patent|brevet|legal|lawyer|counsel|anwalt|juridique/i],
  ["clinical", /clinical trial|klinische studie|essais? cliniques?|phase [1-3i]+|\bcro\b|first-in-human/i],
];

const CREATION_INTENT =
  /spin[-\s]?(off|out)|créer une (startup|entreprise|société)|start a company|found a (company|startup)|(firma|unternehmen|startup) gründen|ausgründ/i;

export function detectLanguage(text: string): Language {
  const count = (re: RegExp) => (text.match(re) ?? []).length;
  const fr = count(/\b(je|nous|suis|sommes|une|des|les|besoin|veux|voulons|avons|est|pour|dans|chercheu(r|se))\b/gi);
  const de = count(/\b(wir|ich|sind|bin|brauchen|brauche|und|eine?[nrm]?|mit|für|möchten?|suchen|aus|der|die|das)\b/gi);
  const en = count(/\b(we|i|are|am|need|the|and|with|for|our|looking|a|an)\b/gi);
  if (fr > de && fr > en) return "fr";
  if (de > fr && de > en) return "de";
  return "en";
}

function detectStage(text: string): Stage | undefined {
  if (/series b|série b/i.test(text)) return "series-b";
  if (/series a|série a/i.test(text)) return "series-a";
  if (/pre-?seed|pré-amorçage/i.test(text)) return "pre-seed";
  if (/\bseed\b|amorçage/i.test(text)) return "seed";
  if (/spin-?off|phd|postdoc|research group|academic|professor|chercheu(r|se)|forscher|doktorand|universit/i.test(text)) return "academic";
  if (/growth|scale-?up|ipo|commercial|wachstum|croissance/i.test(text)) return "growth";
  return undefined;
}

function detectTeamSize(text: string): number | undefined {
  const digits =
    text.match(new RegExp(`(\\d+)[-\\s]?(?:${PEOPLE})`, "i")) ?? text.match(/(?:team of|équipe de|team von) (\d+)/i);
  if (digits) return Number(digits[1]);
  const words = Object.keys(NUMBER_WORDS).join("|");
  const word =
    text.match(new RegExp(`(?:^|[^\\p{L}])(${words})[-\\s]?(?:${PEOPLE})`, "iu")) ??
    text.match(new RegExp(`(?:team of|équipe de|team von) (${words})(?![\\p{L}])`, "iu"));
  if (word) return NUMBER_WORDS[word[1].toLowerCase()];
  if (/\b(je suis|i am|i'm|ich bin)\b/i.test(text)) return 1;
  return undefined;
}

function detectNeedCategories(text: string): NeedCategory[] {
  return NEED_KEYWORDS.filter(([, re]) => re.test(text)).map(([category]) => category);
}

function needDetail(category: NeedCategory, text: string, stage: Stage): string {
  if (category === "lab_space") {
    const bsl = text.match(/bsl[-\s]?([1-4])/i);
    return bsl ? `BSL-${bsl[1]} laboratory space` : NEED_META.lab_space.defaultDetail;
  }
  if (category === "investors") return `Investors for a ${STAGE_LABEL[stage]} round`;
  return NEED_META[category].defaultDetail;
}

/* ------------------------------------------------------------------ */
/* parseNeed                                                           */
/* ------------------------------------------------------------------ */

/** `language` is the user's explicit choice. Leave it out to detect it from the text. */
export async function parseNeed(text: string, language?: Language): Promise<Profile> {
  const creating = CREATION_INTENT.test(text);
  const stage = detectStage(text) ?? (creating ? "academic" : "seed");
  const area = AREA_KEYWORDS.find(([, re]) => re.test(text))?.[0] ?? "platform technology";
  const name = text.match(/(?:We are|We're|I work at|I am from|Wir sind|Nous sommes)\s+([A-Z][\w-]+(?:\s[A-Z][\w-]+)?)/);

  let categories = detectNeedCategories(text);
  // "How do I start a company?" implies programmes, funding, a lab and investors.
  if (creating) {
    for (const c of ["acceleration", "grants", "lab_space", "investors"] as NeedCategory[]) {
      if (!categories.includes(c)) categories.push(c);
    }
  }
  if (categories.length === 0) categories = ["acceleration"];

  const profile: Profile = {
    companyName: name?.[1],
    teamSize: detectTeamSize(text) ?? 3,
    stage,
    therapeuticArea: area,
    language: language ?? detectLanguage(text),
    needs: categories.map((category) => ({
      id: uid("need"),
      category,
      detail: needDetail(category, text, stage),
    })),
  };
  return delay(profile);
}

/* ------------------------------------------------------------------ */
/* getMatches                                                          */
/* ------------------------------------------------------------------ */

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

function scoreEntity(entity: Entity, need: Need, profile: Profile): { score: number; reason: string } {
  const lang = profile.language;
  let score = 50 + (hash(entity.id) % 7);
  const parts: string[] = [];

  const areaHit = entity.focusAreas.includes(profile.therapeuticArea);
  if (areaHit) {
    score += 18;
    parts.push(REASON_I18N.area[lang](AREA_I18N[profile.therapeuticArea]?.[lang] ?? profile.therapeuticArea));
  } else if (entity.focusAreas.includes("all")) {
    score += 9;
    parts.push(REASON_I18N.generalist[lang]);
  }

  if (entity.stageFit.includes(profile.stage)) {
    score += 15;
    parts.push(REASON_I18N.stage[lang](STAGE_I18N[profile.stage][lang]));
  } else {
    score -= 8;
  }

  const bsl = need.detail.match(/BSL-[1-4]/i)?.[0]?.toUpperCase();
  if (need.category === "lab_space" && bsl) {
    if (entity.facilities.includes(bsl)) {
      score += 12;
      parts.unshift(REASON_I18N.bslYes[lang](bsl));
    } else {
      score -= 18;
      parts.push(REASON_I18N.bslCheck[lang](bsl));
    }
  }

  if (need.category === "investors" && entity.tags?.includes("leads rounds")) {
    score += 4;
    parts.push(REASON_I18N.leads[lang]);
  }

  score = Math.max(30, Math.min(98, Math.round(score)));
  const sentence = parts.length ? parts.join(", ") : REASON_I18N.fallback[lang](NEED_I18N[need.category][lang]);
  return { score, reason: sentence.charAt(0).toUpperCase() + sentence.slice(1) + "." };
}

/** Mock of the retrieved chunks the backend returns with each match. */
function citationsFor(entity: Entity): Citation[] {
  const citations: Citation[] = [
    { source: entity.source, snippet: entity.description, url: entity.sourceUrl },
  ];
  if (entity.source !== "Zefix" && ["pharma", "service_provider", "investor"].includes(entity.type)) {
    citations.push({
      source: "Zefix",
      snippet: `Commercial register entry, canton ${entity.canton === "BS" ? "Basel-Stadt" : "Basel-Landschaft"}. Status: active.`,
      url: "https://www.zefix.ch",
    });
  }
  return citations;
}

const MATCHES_PER_NEED = 4;

function computeMatches(profile: Profile): Match[] {
  const leadOnly = profile.constraints?.includes("leads rounds");
  return profile.needs.flatMap((need) =>
    ENTITIES.filter((e) => e.offers.includes(need.category))
      .filter((e) => !profile.cantonFilter || e.canton === profile.cantonFilter)
      .filter((e) => !(leadOnly && need.category === "investors" && e.type === "investor") || e.tags?.includes("leads rounds"))
      .map((entity) => ({
        entity,
        needCategory: need.category,
        ...scoreEntity(entity, need, profile),
        citations: citationsFor(entity),
        // Placeholder. The backend returns the SHA-256 audit-chain reference.
        auditId: `mock-${hash(`${entity.id}:${need.category}`).toString(16).padStart(8, "0")}`,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MATCHES_PER_NEED),
  );
}

export async function getMatches(profile: Profile): Promise<Match[]> {
  return delay(computeMatches(profile));
}

/* ------------------------------------------------------------------ */
/* getPlan: 90-day action plan, shown as weeks 1 to 13                 */
/* ------------------------------------------------------------------ */

const STEP_TIMING: Record<NeedCategory, { start: number; end: number; after?: NeedCategory[] }> = {
  acceleration: { start: 1, end: 3 },
  lab_space: { start: 1, end: 6 },
  legal_ip: { start: 2, end: 5 },
  grants: { start: 2, end: 8 },
  research: { start: 3, end: 10 },
  regulatory: { start: 4, end: 8, after: ["lab_space"] },
  investors: { start: 6, end: 13, after: ["legal_ip", "regulatory"] },
  manufacturing: { start: 7, end: 12, after: ["regulatory"] },
  clinical: { start: 8, end: 13, after: ["regulatory"] },
  pharma_partners: { start: 10, end: 13, after: ["investors"] },
};

function buildPlan(profile: Profile, matches: Match[]): Plan {
  const lang = profile.language;
  const text = (key: StepKey) => STEP_I18N[key][lang];
  const idFor = (c: NeedCategory) => `step-${c}`;
  const categories = profile.needs.map((n) => n.category);
  const unique = categories.filter((c, i) => categories.indexOf(c) === i);

  const steps: RoadmapStep[] = [
    { id: "step-entry", weekStart: 1, weekEnd: 1, ...text("entry"), relatedEntityIds: ["basel-area"], dependsOn: [] },
  ];

  for (const category of unique) {
    const t = STEP_TIMING[category];
    steps.push({
      id: idFor(category),
      weekStart: t.start,
      weekEnd: t.end,
      ...text(category),
      relatedEntityIds: matches
        .filter((m) => m.needCategory === category)
        .slice(0, 3)
        .map((m) => m.entity.id),
      dependsOn: ["step-entry", ...(t.after ?? []).filter((c) => unique.includes(c)).map(idFor)],
    });
  }

  steps.push({
    id: "step-review",
    weekStart: 13,
    weekEnd: 13,
    ...text("review"),
    relatedEntityIds: [],
    dependsOn: steps.slice(1).map((s) => s.id),
  });
  steps.sort((a, b) => a.weekStart - b.weekStart || a.weekEnd - b.weekEnd);

  // Deadlines of matched programmes first, then others open to this stage. Three at most.
  const matchedIds = new Set(matches.map((m) => m.entity.id));
  const byDate = [...DEADLINES].sort((a, b) => a.date.localeCompare(b.date));
  const fitsStage = (entityId: string) =>
    ENTITIES.find((e) => e.id === entityId)?.stageFit.includes(profile.stage) ?? false;
  const deadlines = [
    ...byDate.filter((d) => matchedIds.has(d.entityId)),
    ...byDate.filter((d) => !matchedIds.has(d.entityId) && fitsStage(d.entityId)),
  ]
    .slice(0, 3)
    .sort((a, b) => a.date.localeCompare(b.date));

  const contacts = topContacts(matches, 3).map((e) => e.name);
  const next = deadlines[0];
  const summary = planSummary(lang, {
    steps: steps.length,
    first: steps[0].title,
    contacts,
    deadline: next && {
      title: next.title,
      date: new Date(next.date).toLocaleDateString(LOCALE[lang], { day: "numeric", month: "long" }),
    },
  });

  return { summary, steps, deadlines };
}

/** Best-scoring distinct entities across all needs. */
export function topContacts(matches: Match[], limit: number): Entity[] {
  const seen = new Set<string>();
  return [...matches]
    .sort((a, b) => b.score - a.score)
    .filter((m) => (seen.has(m.entity.id) ? false : (seen.add(m.entity.id), true)))
    .slice(0, limit)
    .map((m) => m.entity);
}

export async function getPlan(profile: Profile, matches: Match[]): Promise<Plan> {
  return delay(buildPlan(profile, matches));
}

/* ------------------------------------------------------------------ */
/* draftIntroEmail                                                     */
/* ------------------------------------------------------------------ */

export async function draftIntroEmail(profile: Profile, entityId: string): Promise<IntroEmail> {
  const entity = ENTITIES.find((e) => e.id === entityId);
  if (!entity) throw new Error(`Unknown entity: ${entityId}`);
  if (profile.needs.length === 0) throw new Error("Profile has no needs");

  const company = profile.companyName ?? "our team";
  const relevant = profile.needs.filter((n) => entity.offers.includes(n.category));
  const asks = (relevant.length ? relevant : profile.needs).map((n) => n.detail.toLowerCase());
  const askText = asks.length > 1 ? `${asks.slice(0, -1).join(", ")} and ${asks[asks.length - 1]}` : asks[0];

  const subject = `Introduction: ${profile.therapeuticArea} team looking for ${NEED_META[(relevant[0] ?? profile.needs[0]).category].label.toLowerCase()}`;
  const body = [
    `Dear ${entity.name} team,`,
    "",
    `I am writing on behalf of ${company}, a ${profile.teamSize}-person ${profile.therapeuticArea} team at ${STAGE_LABEL[profile.stage]} stage, based in the Basel region.`,
    "",
    `We are currently looking for ${askText}. Your work stood out to us because of your focus and your experience with teams at our stage.`,
    "",
    "Would you be open to a 20-minute call in the next two weeks? I am happy to share a short non-confidential overview beforehand.",
    "",
    "Kind regards,",
    "[Your name]",
    "[Role, organisation]",
  ].join("\n");

  return delay({ subject, body });
}

/* ------------------------------------------------------------------ */
/* refine                                                              */
/* ------------------------------------------------------------------ */

export async function refine(profile: Profile, message: string): Promise<RefineResult> {
  const next: Profile = {
    ...profile,
    needs: profile.needs.map((n) => ({ ...n })),
    constraints: [...(profile.constraints ?? [])],
  };
  const changes: string[] = [];
  const removing = /\b(remove|drop|no longer|don't need|do not need|without)\b/i.test(message);
  const mentioned = detectNeedCategories(message);

  // Answer language
  const langAsk = message.match(/\b(in|auf|en)\s+(english|german|deutsch|french|français|francais|anglais|allemand|englisch|französisch)\b/i);
  if (langAsk) {
    const word = langAsk[2].toLowerCase();
    const lang: Language = /german|deutsch|allemand/.test(word) ? "de" : /french|fran|französisch/.test(word) ? "fr" : "en";
    if (lang !== next.language) {
      next.language = lang;
      changes.push(`Switched answers to ${lang === "de" ? "German" : lang === "fr" ? "French" : "English"}`);
    }
  }

  // Canton filter
  if (/both cantons|any canton|all cantons/i.test(message)) {
    next.cantonFilter = undefined;
    changes.push("Showing both cantons again");
  } else if (/basel[-\s]?stadt|\bBS\b/.test(message)) {
    next.cantonFilter = "BS";
    changes.push("Limited results to Basel-Stadt");
  } else if (/basel[-\s]?land|baselland|\bBL\b/.test(message)) {
    next.cantonFilter = "BL";
    changes.push("Limited results to Basel-Landschaft");
  }

  // Stage
  const stage = detectStage(message);
  if (stage && stage !== next.stage && !/investor/i.test(message)) {
    next.stage = stage;
    changes.push(`Changed stage to ${STAGE_LABEL[stage]}`);
  }

  // Lead investors only
  if (/lead/i.test(message) && /investor|round|vc/i.test(message)) {
    if (!next.constraints!.includes("leads rounds")) next.constraints!.push("leads rounds");
    changes.push("Kept only investors who lead rounds");
  }

  // Biosafety level
  const bsl = message.match(/bsl[-\s]?([1-4])/i);
  if (bsl && !removing) {
    const detail = `BSL-${bsl[1]} laboratory space`;
    const lab = next.needs.find((n) => n.category === "lab_space");
    if (lab) lab.detail = detail;
    else next.needs.push({ id: uid("need"), category: "lab_space", detail });
    changes.push(`Set lab requirement to BSL-${bsl[1]}`);
  }

  // Add or remove needs
  if (removing) {
    for (const category of mentioned) {
      if (next.needs.some((n) => n.category === category)) {
        next.needs = next.needs.filter((n) => n.category !== category);
        changes.push(`Removed ${NEED_META[category].label.toLowerCase()}`);
      }
    }
  } else {
    for (const category of mentioned) {
      if (!next.needs.some((n) => n.category === category)) {
        next.needs.push({ id: uid("need"), category, detail: needDetail(category, message, next.stage) });
        changes.push(`Added ${NEED_META[category].label.toLowerCase()}`);
      }
    }
  }

  const reply = changes.length
    ? `${changes.join(". ")}. Matches and plan are updated.`
    : 'No change made. Try "only investors who lead rounds", "we need BSL-3", "add grants", "answer in German" or "only Basel-Landschaft".';

  return delay({ profile: changes.length ? next : profile, reply });
}

/* ------------------------------------------------------------------ */
/* Entities and knowledge graph                                        */
/* ------------------------------------------------------------------ */

export async function getEntities(): Promise<Entity[]> {
  return delay(ENTITIES, 300);
}

/** Knowledge-graph edges (backend: graph_traverse). */
export async function getRelations(): Promise<Relation[]> {
  return delay(RELATIONS, 300);
}
