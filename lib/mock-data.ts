import type { Canton, DataSource, Deadline, Entity, EntityType, NeedCategory, Relation, Stage } from "./types";

/**
 * MOCK DATA. Organisation names are real members of the Basel ecosystem, but
 * descriptions, facilities, stage fit, coordinates and contacts are
 * illustrative placeholders. Verify everything before showing it to users.
 */

const ALL_STAGES: Stage[] = ["academic", "pre-seed", "seed", "series-a", "series-b", "growth"];
const EARLY: Stage[] = ["academic", "pre-seed", "seed"];
const VENTURE: Stage[] = ["seed", "series-a", "series-b"];
const LATE: Stage[] = ["series-a", "series-b", "growth"];

interface Seed {
  id: string;
  name: string;
  type: EntityType;
  canton: Canton;
  lat: number;
  lng: number;
  description: string;
  focusAreas: string[];
  stageFit: Stage[];
  facilities?: string[];
  offers: NeedCategory[];
  tags?: string[];
  source?: DataSource;
  availability?: string;
  website: string;
}

/** Which of the six ingested sources a record would come from. */
function defaultSource(s: Seed): DataSource {
  if (s.type === "lab_space") return "Switzerland Innovation Park Basel";
  if (s.type === "investor" || s.type === "funding_program") return "Startup.ch";
  if (s.type === "pharma" || s.type === "service_provider") return "Zefix";
  return "Basel Super Cluster";
}

const make = (s: Seed): Entity => ({
  ...s,
  source: s.source ?? defaultSource(s),
  facilities: s.facilities ?? [],
  contactEmail: `contact+${s.id}@example.org`,
  sourceUrl: s.website,
  lastVerified: "2026-09-01",
});

export const ENTITIES: Entity[] = [
  // Lab space
  make({
    id: "sip-main",
    name: "Switzerland Innovation Park Basel Area, Main Campus",
    type: "lab_space",
    canton: "BL",
    lat: 47.5423,
    lng: 7.5407,
    description:
      "Innovation campus in Allschwil with flexible lab and office units for biotech, medtech and digital-health teams, next to Swiss TPH and several pharma R&D sites.",
    focusAreas: ["all"],
    stageFit: ["pre-seed", "seed", "series-a", "series-b"],
    facilities: ["BSL-1", "BSL-2", "Shared equipment", "Flexible leases", "Meeting rooms"],
    offers: ["lab_space"],
    availability: "Units free from January 2027",
    website: "https://www.sip-baselarea.com",
  }),
  make({
    id: "sip-novartis",
    name: "Switzerland Innovation Park Basel Area, Novartis Campus",
    type: "lab_space",
    canton: "BS",
    lat: 47.5752,
    lng: 7.5762,
    description:
      "Lab and office space for startups on the Novartis Campus, with proximity to pharma research teams and campus infrastructure.",
    focusAreas: ["oncology", "immunology", "gene and cell therapy", "platform technology"],
    stageFit: ["seed", "series-a", "series-b"],
    facilities: ["BSL-1", "BSL-2", "Shared equipment", "Campus services"],
    offers: ["lab_space"],
    website: "https://www.sip-baselarea.com",
  }),
  make({
    id: "technologiepark",
    name: "Technologiepark Basel",
    type: "lab_space",
    canton: "BS",
    lat: 47.583,
    lng: 7.601,
    description:
      "Canton-backed technology park in the Stücki area offering affordable labs and offices to young life-sciences and technology companies.",
    focusAreas: ["all"],
    stageFit: ["pre-seed", "seed", "series-a"],
    facilities: ["BSL-1", "BSL-2", "Chemistry labs", "Shared equipment"],
    offers: ["lab_space"],
    source: "Basel Super Cluster",
    availability: "Waiting list, about three months",
    website: "https://www.technologiepark-basel.ch",
  }),
  make({
    id: "superlab",
    name: "Superlab Suisse Basel",
    type: "lab_space",
    canton: "BS",
    lat: 47.5838,
    lng: 7.5998,
    description:
      "Lab-as-a-service provider with fully equipped, ready-to-use benches and private labs on monthly terms.",
    focusAreas: ["all"],
    stageFit: ["academic", "pre-seed", "seed", "series-a"],
    facilities: ["BSL-1", "BSL-2", "Bench rental", "Shared equipment", "Monthly terms"],
    offers: ["lab_space"],
    source: "Basel Super Cluster",
    availability: "Benches free from November 2026",
    website: "https://www.superlabsuisse.com",
  }),
  make({
    id: "stuecki-park",
    name: "Stücki Park",
    type: "lab_space",
    canton: "BS",
    lat: 47.5846,
    lng: 7.6022,
    description:
      "Large life-sciences campus in the north of Basel with lab buildings suited to scaling companies that need their own floors.",
    focusAreas: ["all"],
    stageFit: ["series-a", "series-b", "growth"],
    facilities: ["BSL-1", "BSL-2", "Large floor plates", "Long leases"],
    offers: ["lab_space"],
    website: "https://www.stueckipark.ch",
  }),
  make({
    id: "tech-center-reinach",
    name: "Tech Center Reinach",
    type: "lab_space",
    canton: "BL",
    lat: 47.495,
    lng: 7.605,
    description:
      "Business and lab centre in Reinach with lower rents than the city, suited to chemistry, analytics and medtech teams.",
    focusAreas: ["medtech", "diagnostics", "platform technology"],
    stageFit: ["pre-seed", "seed", "series-a"],
    facilities: ["BSL-1", "Chemistry labs", "Workshop space"],
    offers: ["lab_space"],
    website: "https://www.tech-center.ch",
  }),

  // Investors
  make({
    id: "nvf",
    name: "Novartis Venture Fund",
    type: "investor",
    canton: "BS",
    lat: 47.5735,
    lng: 7.5788,
    description:
      "Corporate venture fund investing in novel therapeutics and platforms, typically from seed through later private rounds.",
    focusAreas: ["oncology", "neuroscience", "immunology", "rare disease", "gene and cell therapy"],
    stageFit: VENTURE,
    offers: ["investors"],
    tags: ["leads rounds", "corporate VC"],
    website: "https://www.nvfund.com",
  }),
  make({
    id: "roche-venture",
    name: "Roche Venture Fund",
    type: "investor",
    canton: "BS",
    lat: 47.5592,
    lng: 7.6068,
    description:
      "Corporate venture fund backing therapeutics, diagnostics and digital-health companies with strategic relevance to Roche.",
    focusAreas: ["oncology", "neuroscience", "ophthalmology", "diagnostics", "digital health"],
    stageFit: VENTURE,
    offers: ["investors"],
    tags: ["corporate VC"],
    website: "https://www.roche.com",
  }),
  make({
    id: "versant",
    name: "Versant Ventures",
    type: "investor",
    canton: "BS",
    lat: 47.5515,
    lng: 7.5935,
    description:
      "Healthcare venture firm with a Basel office and discovery engine, known for company creation and leading early rounds.",
    focusAreas: ["oncology", "immunology", "rare disease", "gene and cell therapy", "platform technology"],
    stageFit: ["pre-seed", "seed", "series-a"],
    offers: ["investors"],
    tags: ["leads rounds", "company creation"],
    website: "https://www.versantventures.com",
  }),
  make({
    id: "biomedpartners",
    name: "BioMedPartners",
    type: "investor",
    canton: "BS",
    lat: 47.552,
    lng: 7.5895,
    description:
      "Basel-based healthcare venture firm investing in early and mid-stage biotech and medtech companies across Europe.",
    focusAreas: ["oncology", "cardiometabolic", "medtech", "rare disease", "infectious disease"],
    stageFit: VENTURE,
    offers: ["investors"],
    tags: ["leads rounds"],
    website: "https://www.biomedvc.com",
  }),
  make({
    id: "forty51",
    name: "Forty51 Ventures",
    type: "investor",
    canton: "BS",
    lat: 47.556,
    lng: 7.588,
    description:
      "Early-stage biotech investor based in Basel that works closely with founders on building therapeutics companies.",
    focusAreas: ["oncology", "immunology", "neuroscience", "platform technology"],
    stageFit: ["pre-seed", "seed", "series-a"],
    offers: ["investors"],
    tags: ["leads rounds"],
    website: "https://www.forty51ventures.com",
  }),

  // Pharma
  make({
    id: "novartis",
    name: "Novartis",
    type: "pharma",
    canton: "BS",
    lat: 47.5745,
    lng: 7.577,
    description:
      "Global pharmaceutical company headquartered in Basel with active business development and search-and-evaluation teams.",
    focusAreas: ["oncology", "immunology", "neuroscience", "cardiometabolic", "gene and cell therapy"],
    stageFit: LATE,
    offers: ["pharma_partners"],
    website: "https://www.novartis.com",
  }),
  make({
    id: "roche",
    name: "Roche",
    type: "pharma",
    canton: "BS",
    lat: 47.5585,
    lng: 7.6075,
    description:
      "Global pharma and diagnostics group headquartered in Basel, partnering through Roche Partnering across therapeutics and diagnostics.",
    focusAreas: ["oncology", "neuroscience", "ophthalmology", "immunology", "diagnostics"],
    stageFit: LATE,
    offers: ["pharma_partners"],
    website: "https://www.roche.com",
  }),
  make({
    id: "idorsia",
    name: "Idorsia",
    type: "pharma",
    canton: "BL",
    lat: 47.5392,
    lng: 7.5372,
    description:
      "Allschwil-based biopharmaceutical company with small-molecule discovery expertise and openness to research collaborations.",
    focusAreas: ["neuroscience", "cardiometabolic", "immunology", "rare disease"],
    stageFit: ["seed", "series-a", "series-b", "growth"],
    offers: ["pharma_partners"],
    website: "https://www.idorsia.com",
  }),
  make({
    id: "basilea",
    name: "Basilea Pharmaceutica",
    type: "pharma",
    canton: "BL",
    lat: 47.5475,
    lng: 7.544,
    description:
      "Commercial-stage company in Allschwil focused on anti-infectives that regularly in-licenses external assets.",
    focusAreas: ["infectious disease"],
    stageFit: ["seed", "series-a", "series-b", "growth"],
    offers: ["pharma_partners"],
    website: "https://www.basilea.com",
  }),
  make({
    id: "jnj-allschwil",
    name: "Johnson & Johnson Innovative Medicine, Allschwil",
    type: "pharma",
    canton: "BL",
    lat: 47.544,
    lng: 7.5385,
    description:
      "Research and development site in Allschwil with a heritage in pulmonary hypertension and rare-disease drug discovery.",
    focusAreas: ["cardiometabolic", "rare disease", "immunology", "oncology"],
    stageFit: LATE,
    offers: ["pharma_partners"],
    website: "https://www.jnj.com",
  }),

  // Service providers
  make({
    id: "arcondis",
    name: "Arcondis",
    type: "service_provider",
    canton: "BL",
    lat: 47.4935,
    lng: 7.5935,
    description:
      "Life-sciences consultancy in Reinach covering regulatory affairs, quality and compliance for pharma, biotech and medtech.",
    focusAreas: ["all"],
    stageFit: ["seed", "series-a", "series-b", "growth"],
    offers: ["regulatory"],
    website: "https://www.arcondis.com",
  }),
  make({
    id: "dkf",
    name: "Department of Clinical Research, University of Basel",
    type: "service_provider",
    canton: "BS",
    lat: 47.561,
    lng: 7.581,
    description:
      "Academic clinical-research unit at University Hospital Basel supporting trial design, regulatory submissions, data management and monitoring.",
    focusAreas: ["all"],
    stageFit: ["seed", "series-a", "series-b"],
    offers: ["clinical", "regulatory"],
    website: "https://dkf.unibas.ch",
  }),
  make({
    id: "vischer",
    name: "VISCHER",
    type: "service_provider",
    canton: "BS",
    lat: 47.553,
    lng: 7.5925,
    description:
      "Law firm with a life-sciences practice advising on IP, licensing, financing rounds and regulatory law.",
    focusAreas: ["all"],
    stageFit: ALL_STAGES,
    offers: ["legal_ip", "regulatory"],
    website: "https://www.vischer.com",
  }),
  make({
    id: "lonza",
    name: "Lonza",
    type: "service_provider",
    canton: "BS",
    lat: 47.544,
    lng: 7.5995,
    description:
      "Contract development and manufacturing organisation headquartered in Basel, covering biologics, cell and gene therapies and small molecules.",
    focusAreas: ["oncology", "gene and cell therapy", "immunology", "rare disease", "platform technology"],
    stageFit: LATE,
    offers: ["manufacturing"],
    website: "https://www.lonza.com",
  }),
  make({
    id: "bachem",
    name: "Bachem",
    type: "service_provider",
    canton: "BL",
    lat: 47.448,
    lng: 7.735,
    description:
      "Bubendorf-based specialist in the development and manufacture of peptides and oligonucleotides.",
    focusAreas: ["oncology", "cardiometabolic", "rare disease", "platform technology"],
    stageFit: ["seed", "series-a", "series-b", "growth"],
    offers: ["manufacturing"],
    website: "https://www.bachem.com",
  }),
  make({
    id: "carbogen",
    name: "Carbogen Amcis",
    type: "service_provider",
    canton: "BL",
    lat: 47.4502,
    lng: 7.7382,
    description:
      "Process development and API manufacturing partner in Bubendorf with experience in highly potent compounds.",
    focusAreas: ["oncology", "rare disease", "platform technology"],
    stageFit: ["seed", "series-a", "series-b", "growth"],
    offers: ["manufacturing"],
    website: "https://www.carbogen-amcis.com",
  }),

  // Accelerators and support
  make({
    id: "baselaunch",
    name: "BaseLaunch",
    type: "accelerator",
    canton: "BS",
    lat: 47.5548,
    lng: 7.5945,
    description:
      "Biotech incubator and accelerator of Basel Area Business & Innovation that helps therapeutics ventures launch, with funding and pharma and VC partners.",
    focusAreas: ["oncology", "immunology", "neuroscience", "rare disease", "gene and cell therapy", "platform technology"],
    stageFit: EARLY,
    offers: ["acceleration", "investors"],
    source: "BaseLaunch",
    website: "https://www.baselaunch.ch",
  }),
  make({
    id: "dayone",
    name: "DayOne",
    type: "accelerator",
    canton: "BS",
    lat: 47.5553,
    lng: 7.5962,
    description:
      "Healthcare-innovation initiative and accelerator of Basel Area Business & Innovation for digital-health and medtech ventures.",
    focusAreas: ["digital health", "medtech", "diagnostics"],
    stageFit: EARLY,
    offers: ["acceleration"],
    source: "DayOne",
    website: "https://www.dayone.swiss",
  }),
  make({
    id: "basel-area",
    name: "Basel Area Business & Innovation",
    type: "accelerator",
    canton: "BS",
    lat: 47.5545,
    lng: 7.595,
    description:
      "Investment and innovation promotion agency for the region. First point of contact for company set-up, introductions and mentoring.",
    focusAreas: ["all"],
    stageFit: ALL_STAGES,
    offers: ["acceleration"],
    website: "https://www.baselarea.swiss",
  }),
  make({
    id: "unibas-innovation",
    name: "University of Basel Innovation Office",
    type: "accelerator",
    canton: "BS",
    lat: 47.5585,
    lng: 7.5835,
    description:
      "Supports researchers in turning findings into ventures, with coaching, entrepreneurship programmes and links to industry.",
    focusAreas: ["all"],
    stageFit: ["academic", "pre-seed"],
    offers: ["acceleration", "research"],
    website: "https://www.unibas.ch",
  }),

  // Research institutes
  make({
    id: "biozentrum",
    name: "Biozentrum, University of Basel",
    type: "research_institute",
    canton: "BS",
    lat: 47.564,
    lng: 7.5795,
    description:
      "Molecular and biomedical research institute with strong structural biology, infection biology and neurobiology groups and core facilities.",
    focusAreas: ["infectious disease", "neuroscience", "oncology", "platform technology"],
    stageFit: ALL_STAGES,
    facilities: ["Core facilities", "Imaging", "Proteomics"],
    offers: ["research"],
    website: "https://www.biozentrum.unibas.ch",
  }),
  make({
    id: "fmi",
    name: "Friedrich Miescher Institute for Biomedical Research",
    type: "research_institute",
    canton: "BS",
    lat: 47.569,
    lng: 7.601,
    description:
      "Basic biomedical research institute affiliated with Novartis and the University of Basel, focused on genome regulation, neurobiology and multicellular systems.",
    focusAreas: ["neuroscience", "oncology", "gene and cell therapy", "platform technology"],
    stageFit: ALL_STAGES,
    facilities: ["Core facilities", "Genomics", "Imaging"],
    offers: ["research"],
    website: "https://www.fmi.ch",
  }),
  make({
    id: "dbsse",
    name: "ETH Zurich, Department of Biosystems Science and Engineering",
    type: "research_institute",
    canton: "BS",
    lat: 47.5628,
    lng: 7.5788,
    description:
      "ETH department in Basel combining biology, engineering and computation, with expertise in synthetic biology, single-cell methods and bioengineering.",
    focusAreas: ["gene and cell therapy", "platform technology", "immunology", "diagnostics"],
    stageFit: ALL_STAGES,
    facilities: ["Core facilities", "Single-cell", "Computational biology"],
    offers: ["research"],
    website: "https://bsse.ethz.ch",
  }),
  make({
    id: "swisstph",
    name: "Swiss Tropical and Public Health Institute",
    type: "research_institute",
    canton: "BL",
    lat: 47.5405,
    lng: 7.542,
    description:
      "Institute in Allschwil for infectious-disease research, global health and clinical trials in low- and middle-income settings.",
    focusAreas: ["infectious disease", "diagnostics", "digital health"],
    stageFit: ALL_STAGES,
    facilities: ["BSL-3", "Clinical operations"],
    offers: ["research", "clinical"],
    website: "https://www.swisstph.ch",
  }),
  make({
    id: "dbm",
    name: "Department of Biomedicine, University Hospital Basel",
    type: "research_institute",
    canton: "BS",
    lat: 47.5617,
    lng: 7.5835,
    description:
      "Translational research department linking University of Basel labs with clinicians, patient samples and early clinical studies.",
    focusAreas: ["oncology", "immunology", "neuroscience", "cardiometabolic"],
    stageFit: ALL_STAGES,
    facilities: ["Patient samples", "Core facilities"],
    offers: ["research", "clinical"],
    website: "https://biomedizin.unibas.ch",
  }),
  make({
    id: "fhnw-hls",
    name: "FHNW School of Life Sciences",
    type: "research_institute",
    canton: "BL",
    lat: 47.5348,
    lng: 7.642,
    description:
      "University of applied sciences in Muttenz with applied R&D in pharma technology, medtech, bioanalytics and process development.",
    focusAreas: ["medtech", "diagnostics", "platform technology", "digital health"],
    stageFit: ALL_STAGES,
    facilities: ["Process Technology Center", "Analytics"],
    offers: ["research", "manufacturing"],
    website: "https://www.fhnw.ch",
  }),
  make({
    id: "iob",
    name: "Institute of Molecular and Clinical Ophthalmology Basel",
    type: "research_institute",
    canton: "BS",
    lat: 47.5632,
    lng: 7.576,
    description:
      "Research institute joining basic and clinical scientists to understand vision and develop therapies for eye disease.",
    focusAreas: ["ophthalmology", "gene and cell therapy", "neuroscience"],
    stageFit: ALL_STAGES,
    offers: ["research"],
    website: "https://iob.ch",
  }),

  // Funding programmes
  make({
    id: "innosuisse",
    name: "Innosuisse",
    type: "funding_program",
    canton: "BS",
    lat: 47.554,
    lng: 7.589,
    description:
      "Swiss Innovation Agency. National programme funding joint projects between companies and research partners, plus startup coaching. Pin is placed in Basel for illustration.",
    focusAreas: ["all"],
    stageFit: ["academic", "pre-seed", "seed", "series-a"],
    offers: ["grants", "acceleration"],
    website: "https://www.innosuisse.admin.ch",
  }),
  make({
    id: "venture-kick",
    name: "Venture Kick",
    type: "funding_program",
    canton: "BS",
    lat: 47.557,
    lng: 7.59,
    description:
      "National philanthropic programme giving staged pre-seed funding and training to spin-offs from Swiss universities. Pin is placed in Basel for illustration.",
    focusAreas: ["all"],
    stageFit: ["academic", "pre-seed"],
    offers: ["grants"],
    website: "https://www.venturekick.ch",
  }),
  make({
    id: "standort-bl",
    name: "Standortförderung Baselland",
    type: "funding_program",
    canton: "BL",
    lat: 47.484,
    lng: 7.734,
    description:
      "Economic-promotion office of Basel-Landschaft in Liestal that helps companies with site search, permits and cantonal support measures.",
    focusAreas: ["all"],
    stageFit: ALL_STAGES,
    offers: ["grants", "acceleration"],
    website: "https://www.economy-bl.ch",
  }),
];

/**
 * MOCK knowledge-graph edges. They show the shape of the graph
 * (funds, member_of, offers_lab_space_for, partners_with) and are not a
 * verified record of real relationships.
 */
export const RELATIONS: Relation[] = [
  { source: "baselaunch", target: "basel-area", type: "member_of" },
  { source: "dayone", target: "basel-area", type: "member_of" },
  { source: "sip-main", target: "basel-area", type: "partners_with" },
  { source: "sip-novartis", target: "novartis", type: "partners_with" },
  { source: "sip-main", target: "baselaunch", type: "offers_lab_space_for" },
  { source: "technologiepark", target: "baselaunch", type: "offers_lab_space_for" },
  { source: "superlab", target: "unibas-innovation", type: "offers_lab_space_for" },
  { source: "nvf", target: "novartis", type: "member_of" },
  { source: "roche-venture", target: "roche", type: "member_of" },
  { source: "roche-venture", target: "baselaunch", type: "funds" },
  { source: "versant", target: "baselaunch", type: "partners_with" },
  { source: "biomedpartners", target: "baselaunch", type: "partners_with" },
  { source: "roche", target: "baselaunch", type: "partners_with" },
  { source: "jnj-allschwil", target: "baselaunch", type: "partners_with" },
  { source: "fmi", target: "novartis", type: "partners_with" },
  { source: "fmi", target: "biozentrum", type: "partners_with" },
  { source: "dbm", target: "dkf", type: "partners_with" },
  { source: "unibas-innovation", target: "biozentrum", type: "partners_with" },
  { source: "unibas-innovation", target: "venture-kick", type: "partners_with" },
  { source: "innosuisse", target: "fhnw-hls", type: "funds" },
  { source: "innosuisse", target: "dbsse", type: "funds" },
  { source: "swisstph", target: "sip-main", type: "partners_with" },
  { source: "standort-bl", target: "sip-main", type: "funds" },
  { source: "lonza", target: "dbsse", type: "partners_with" },
  { source: "arcondis", target: "dayone", type: "partners_with" },
];

/** MOCK funding deadlines. Dates are invented for the demo. */
export const DEADLINES: Deadline[] = [
  {
    id: "dl-venture-kick",
    title: "Venture Kick, stage 1 application",
    entityId: "venture-kick",
    date: "2026-10-26",
    note: "Short pitch deck and video. Open to university spin-offs before incorporation.",
  },
  {
    id: "dl-baselaunch",
    title: "BaseLaunch, next application review",
    entityId: "baselaunch",
    date: "2026-11-15",
    note: "Therapeutics ventures. Non-confidential summary of the science and team.",
  },
  {
    id: "dl-dayone",
    title: "DayOne accelerator call",
    entityId: "dayone",
    date: "2026-11-30",
    note: "Digital-health and medtech projects with a clinical partner.",
  },
  {
    id: "dl-innosuisse",
    title: "Innosuisse innovation project submission",
    entityId: "innosuisse",
    date: "2026-12-01",
    note: "Joint application with a research partner. Plan four weeks for the budget.",
  },
];
