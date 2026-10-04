import type { Horizon, Language, NeedCategory, RelationType, Stage } from "./types";

/**
 * Translations for generated content (match reasons, plan text, spoken
 * summary). The real backend generates these with Apertus; the mock uses the
 * tables below. Interface labels stay in English.
 */

export const LANGUAGE_LABEL: Record<Language, string> = { en: "English", de: "Deutsch", fr: "Français" };
export const LANGUAGES = Object.keys(LANGUAGE_LABEL) as Language[];
export const LOCALE: Record<Language, string> = { en: "en-GB", de: "de-CH", fr: "fr-CH" };

export const AREA_I18N: Record<string, Record<Language, string>> = {
  oncology: { en: "oncology", de: "Onkologie", fr: "oncologie" },
  diagnostics: { en: "diagnostics", de: "Diagnostik", fr: "diagnostic" },
  "medical devices": { en: "medical devices", de: "Medizintechnik", fr: "technologies médicales" },
  "e-health": { en: "e-health", de: "Digital Health", fr: "santé numérique" },
  "pharma r&d tech": { en: "pharma R&D tech", de: "Pharma R&D Technologie", fr: "technologie pharma R&D" },
  therapeutics: { en: "therapeutics (general)", de: "Therapeutika (allgemein)", fr: "thérapeutiques (général)" },
  neuroscience: { en: "neuroscience", de: "Neurowissenschaften", fr: "neurosciences" },
  immunology: { en: "immunology", de: "Immunologie", fr: "immunologie" },
  "infectious disease": { en: "infectious disease", de: "Infektionskrankheiten", fr: "maladies infectieuses" },
  "rare disease": { en: "rare disease", de: "seltene Krankheiten", fr: "maladies rares" },
  cardiometabolic: { en: "cardiometabolic", de: "Herz-Kreislauf und Stoffwechsel", fr: "cardiométabolique" },
  ophthalmology: { en: "ophthalmology", de: "Ophthalmologie", fr: "ophtalmologie" },
  "gene and cell therapy": { en: "gene and cell therapy", de: "Gen- und Zelltherapie", fr: "thérapie génique et cellulaire" },
  medtech: { en: "medtech", de: "Medizintechnik", fr: "technologies médicales" },
  "digital health": { en: "digital health", de: "Digital Health", fr: "santé numérique" },
  "platform technology": { en: "platform technology", de: "Plattformtechnologie", fr: "technologies de plateforme" },
};

export const STAGE_I18N: Record<Stage, Record<Language, string>> = {
  academic: { en: "academic", de: "akademische Phase", fr: "phase académique" },
  "pre-seed": { en: "pre-seed", de: "Pre-Seed", fr: "pré-amorçage" },
  seed: { en: "seed", de: "Seed", fr: "amorçage" },
  "series-a": { en: "Series A", de: "Series A", fr: "série A" },
  "series-b": { en: "Series B", de: "Series B", fr: "série B" },
  growth: { en: "growth", de: "Wachstumsphase", fr: "phase de croissance" },
};

export const NEED_I18N: Record<NeedCategory, Record<Language, string>> = {
  lab_space: { en: "lab space", de: "Laborfläche", fr: "espace de laboratoire" },
  investors: { en: "investors", de: "Investoren", fr: "investisseurs" },
  regulatory: { en: "regulatory questions", de: "regulatorische Fragen", fr: "questions réglementaires" },
  pharma_partners: { en: "pharma partnering", de: "Pharma-Partnerschaften", fr: "partenariats pharma" },
  acceleration: { en: "mentoring", de: "Mentoring", fr: "accompagnement" },
  research: { en: "research collaboration", de: "Forschungskooperation", fr: "collaboration de recherche" },
  grants: { en: "grants", de: "Fördergelder", fr: "subventions" },
  manufacturing: { en: "manufacturing", de: "Herstellung", fr: "production" },
  legal_ip: { en: "legal and IP", de: "Recht und IP", fr: "droit et propriété intellectuelle" },
  clinical: { en: "clinical trials", de: "klinische Studien", fr: "essais cliniques" },
};

export const REASON_I18N = {
  area: {
    en: (a: string) => `works in ${a}`,
    de: (a: string) => `aktiv im Bereich ${a}`,
    fr: (a: string) => `actif en ${a}`,
  },
  generalist: {
    en: "open to all life-sciences fields",
    de: "offen für alle Life-Sciences-Bereiche",
    fr: "ouvert à tous les domaines des sciences de la vie",
  },
  stage: {
    en: (s: string) => `fits ${s} companies`,
    de: (s: string) => `passt zur Phase ${s}`,
    fr: (s: string) => `adapté au stade ${s}`,
  },
  bslYes: {
    en: (b: string) => `offers ${b} labs`,
    de: (b: string) => `bietet ${b}-Labore`,
    fr: (b: string) => `propose des laboratoires ${b}`,
  },
  bslCheck: {
    en: (b: string) => `${b} availability needs checking`,
    de: (b: string) => `${b}-Verfügbarkeit ist zu prüfen`,
    fr: (b: string) => `disponibilité ${b} à vérifier`,
  },
  leads: { en: "leads rounds", de: "führt Finanzierungsrunden an", fr: "mène des tours de financement" },
  fallback: {
    en: (n: string) => `can help with ${n}`,
    de: (n: string) => `unterstützt bei: ${n}`,
    fr: (n: string) => `peut aider pour : ${n}`,
  },
} as const;

export const RELATION_LABEL: Record<RelationType, string> = {
  funds: "funds",
  member_of: "is part of",
  offers_lab_space_for: "offers lab space for",
  partners_with: "partners with",
};

type StepText = { title: string; description: string };
export type StepKey = NeedCategory | "entry" | "review";

export const STEP_I18N: Record<StepKey, Record<Language, StepText>> = {
  entry: {
    en: {
      title: "Meet your entry point to the ecosystem",
      description:
        "Book an introductory meeting with Basel Area Business & Innovation. They make introductions across both cantons and advise on company set-up.",
    },
    de: {
      title: "Erste Anlaufstelle im Ökosystem treffen",
      description:
        "Vereinbaren Sie ein Erstgespräch mit Basel Area Business & Innovation. Das Team vermittelt Kontakte in beiden Kantonen und berät zur Firmengründung.",
    },
    fr: {
      title: "Rencontrer votre point d'entrée dans l'écosystème",
      description:
        "Prenez un premier rendez-vous avec Basel Area Business & Innovation. L'équipe vous met en relation dans les deux cantons et vous conseille sur la création de l'entreprise.",
    },
  },
  acceleration: {
    en: {
      title: "Join a support programme",
      description:
        "Apply to the programmes that fit your stage and book a first conversation. They open doors to most other steps on this plan.",
    },
    de: {
      title: "Einem Förderprogramm beitreten",
      description:
        "Bewerben Sie sich bei den Programmen, die zu Ihrer Phase passen, und vereinbaren Sie ein erstes Gespräch. Sie öffnen Türen für die meisten weiteren Schritte.",
    },
    fr: {
      title: "Rejoindre un programme d'accompagnement",
      description:
        "Postulez aux programmes adaptés à votre stade et fixez un premier entretien. Ils ouvrent des portes pour la plupart des autres étapes de ce plan.",
    },
  },
  lab_space: {
    en: {
      title: "Secure laboratory space",
      description:
        "Visit the shortlisted sites, confirm biosafety level, equipment and lease terms, then sign and file the biosafety notification.",
    },
    de: {
      title: "Laborfläche sichern",
      description:
        "Besichtigen Sie die Standorte der engeren Wahl, klären Sie Sicherheitsstufe, Geräte und Mietbedingungen, unterschreiben Sie und reichen Sie die Biosicherheitsmeldung ein.",
    },
    fr: {
      title: "Trouver un laboratoire",
      description:
        "Visitez les sites présélectionnés, vérifiez le niveau de biosécurité, les équipements et les conditions du bail, puis signez et déposez la notification de biosécurité.",
    },
  },
  legal_ip: {
    en: {
      title: "Put IP and legal foundations in place",
      description:
        "Review patent filings, freedom to operate and licence terms with your university before investors start due diligence.",
    },
    de: {
      title: "IP und rechtliche Grundlagen klären",
      description:
        "Prüfen Sie Patentanmeldungen, Freedom to Operate und Lizenzbedingungen mit Ihrer Universität, bevor Investoren mit der Due Diligence beginnen.",
    },
    fr: {
      title: "Poser les bases juridiques et la propriété intellectuelle",
      description:
        "Vérifiez les dépôts de brevets, la liberté d'exploitation et les conditions de licence avec votre université avant la due diligence des investisseurs.",
    },
  },
  grants: {
    en: {
      title: "Apply for non-dilutive funding",
      description:
        "Prepare applications with a research partner where required. Grants extend your runway before the priced round.",
    },
    de: {
      title: "Nicht verwässernde Fördermittel beantragen",
      description:
        "Bereiten Sie die Anträge vor, wo nötig gemeinsam mit einem Forschungspartner. Fördergelder verlängern Ihre Liquidität vor der Finanzierungsrunde.",
    },
    fr: {
      title: "Demander des financements non dilutifs",
      description:
        "Préparez les dossiers, avec un partenaire de recherche si nécessaire. Les subventions prolongent votre trésorerie avant le tour de financement.",
    },
  },
  regulatory: {
    en: {
      title: "Define the regulatory strategy",
      description:
        "Agree the development path, the data package needed for first-in-human, and when to request scientific advice.",
    },
    de: {
      title: "Regulatorische Strategie festlegen",
      description:
        "Legen Sie den Entwicklungspfad, das Datenpaket für die erste Anwendung am Menschen und den Zeitpunkt für eine wissenschaftliche Beratung fest.",
    },
    fr: {
      title: "Définir la stratégie réglementaire",
      description:
        "Fixez le parcours de développement, les données nécessaires pour la première administration chez l'humain et le moment de demander un avis scientifique.",
    },
  },
  research: {
    en: {
      title: "Set up research collaborations",
      description:
        "Agree scope, access to core facilities and IP terms with the academic groups that strengthen your data package.",
    },
    de: {
      title: "Forschungskooperationen aufbauen",
      description:
        "Vereinbaren Sie Umfang, Zugang zu Core Facilities und IP-Bedingungen mit den akademischen Gruppen, die Ihr Datenpaket stärken.",
    },
    fr: {
      title: "Mettre en place des collaborations de recherche",
      description:
        "Convenez du périmètre, de l'accès aux plateformes et des conditions de propriété intellectuelle avec les groupes académiques qui renforcent vos données.",
    },
  },
  manufacturing: {
    en: {
      title: "Select a manufacturing partner",
      description:
        "Run technical discussions, compare proposals and timelines, and reserve capacity for your first batches.",
    },
    de: {
      title: "Herstellungspartner auswählen",
      description:
        "Führen Sie technische Gespräche, vergleichen Sie Angebote und Zeitpläne und reservieren Sie Kapazität für Ihre ersten Chargen.",
    },
    fr: {
      title: "Choisir un partenaire de production",
      description:
        "Menez les discussions techniques, comparez les offres et les délais, et réservez de la capacité pour vos premiers lots.",
    },
  },
  clinical: {
    en: {
      title: "Prepare clinical studies",
      description: "Draft the protocol, choose sites and agree the submission plan with your clinical-research partner.",
    },
    de: {
      title: "Klinische Studien vorbereiten",
      description:
        "Entwerfen Sie das Protokoll, wählen Sie Studienzentren und stimmen Sie den Einreichungsplan mit Ihrem Partner für klinische Forschung ab.",
    },
    fr: {
      title: "Préparer les études cliniques",
      description:
        "Rédigez le protocole, choisissez les centres et convenez du plan de soumission avec votre partenaire de recherche clinique.",
    },
  },
  investors: {
    en: {
      title: "Start the financing round",
      description:
        "Build the data room, begin with warm introductions and aim for a lead investor first. Expect the round to close after this 90-day window.",
    },
    de: {
      title: "Finanzierungsrunde starten",
      description:
        "Bauen Sie den Datenraum auf, beginnen Sie mit persönlichen Empfehlungen und suchen Sie zuerst einen Lead-Investor. Der Abschluss liegt voraussichtlich nach diesen 90 Tagen.",
    },
    fr: {
      title: "Lancer le tour de financement",
      description:
        "Constituez la data room, commencez par des introductions personnelles et cherchez d'abord un investisseur principal. La clôture interviendra probablement après ces 90 jours.",
    },
  },
  pharma_partners: {
    en: {
      title: "Open pharma partnering conversations",
      description:
        "Share a non-confidential deck with business-development teams and explore collaboration or option structures.",
    },
    de: {
      title: "Gespräche mit Pharmapartnern beginnen",
      description:
        "Teilen Sie eine nicht vertrauliche Präsentation mit Business-Development-Teams und prüfen Sie Kooperations- oder Optionsmodelle.",
    },
    fr: {
      title: "Ouvrir les discussions avec les partenaires pharma",
      description:
        "Partagez une présentation non confidentielle avec les équipes de business development et explorez des modèles de collaboration ou d'option.",
    },
  },
  review: {
    en: {
      title: "Review progress and plan the next 90 days",
      description: "Compare outcomes with this plan, update your needs and generate a new plan.",
    },
    de: {
      title: "Fortschritt prüfen und die nächsten 90 Tage planen",
      description:
        "Vergleichen Sie die Ergebnisse mit diesem Plan, aktualisieren Sie Ihren Bedarf und erstellen Sie einen neuen Plan.",
    },
    fr: {
      title: "Faire le point et planifier les 90 jours suivants",
      description: "Comparez les résultats avec ce plan, mettez à jour vos besoins et générez un nouveau plan.",
    },
  },
};

/** Wording that differs when the plan covers twelve months instead of 90 days. */
export const STEP_I18N_12M: Partial<Record<StepKey, Record<Language, StepText>>> = {
  investors: {
    en: {
      title: "Run the financing round",
      description:
        "Build the data room, begin with warm introductions, aim for a lead investor first, then fill the syndicate and close.",
    },
    de: {
      title: "Finanzierungsrunde durchführen",
      description:
        "Bauen Sie den Datenraum auf, beginnen Sie mit persönlichen Empfehlungen, gewinnen Sie zuerst einen Lead-Investor, ergänzen Sie dann das Syndikat und schliessen Sie die Runde ab.",
    },
    fr: {
      title: "Mener le tour de financement",
      description:
        "Constituez la data room, commencez par des introductions personnelles, trouvez d'abord un investisseur principal, puis complétez le syndicat et clôturez le tour.",
    },
  },
  review: {
    en: {
      title: "Review progress and plan the next year",
      description: "Compare outcomes with this plan, update your needs and generate a new plan.",
    },
    de: {
      title: "Fortschritt prüfen und das nächste Jahr planen",
      description:
        "Vergleichen Sie die Ergebnisse mit diesem Plan, aktualisieren Sie Ihren Bedarf und erstellen Sie einen neuen Plan.",
    },
    fr: {
      title: "Faire le point et planifier l'année suivante",
      description: "Comparez les résultats avec ce plan, mettez à jour vos besoins et générez un nouveau plan.",
    },
  },
};

export const HORIZON_LABEL: Record<Horizon, string> = { "12m": "12 months", "90d": "90 days" };

export function planSummary(
  lang: Language,
  p: { horizon: Horizon; steps: number; first: string; contacts: string[]; deadline?: { title: string; date: string } },
): string {
  const names = p.contacts.join(", ");
  const year = p.horizon === "12m";
  if (lang === "de") {
    return [
      `Hier ist Ihr ${year ? "12-Monats-Plan" : "90-Tage-Plan"} für Basel mit ${p.steps} Schritten.`,
      `Beginnen Sie mit: ${p.first}.`,
      names && `Ihre ersten Kontakte sind ${names}.`,
      p.deadline && `Die nächste Frist ist ${p.deadline.title}, am ${p.deadline.date}.`,
    ].filter(Boolean).join(" ");
  }
  if (lang === "fr") {
    return [
      `Voici votre plan sur ${year ? "12 mois" : "90 jours"} à Bâle, en ${p.steps} étapes.`,
      `Commencez par : ${p.first}.`,
      names && `Vos premiers contacts sont ${names}.`,
      p.deadline && `La prochaine échéance est ${p.deadline.title}, le ${p.deadline.date}.`,
    ].filter(Boolean).join(" ");
  }
  return [
    `Here is your ${year ? "12-month" : "90-day"} plan for Basel, in ${p.steps} steps.`,
    `Start with: ${p.first}.`,
    names && `Your first contacts are ${names}.`,
    p.deadline && `The next deadline is ${p.deadline.title}, on ${p.deadline.date}.`,
  ].filter(Boolean).join(" ");
}