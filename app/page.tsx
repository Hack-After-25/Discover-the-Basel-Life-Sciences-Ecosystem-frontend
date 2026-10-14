"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { parseNeed } from "@/lib/api";
import { useHydrated, useNavigator } from "@/lib/store";
import { LANGUAGES, LANGUAGE_LABEL } from "@/lib/i18n";
import { ENTITY_TYPES, TYPE_META } from "@/lib/entity-meta";
import type { EntityType, Language } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MicButton } from "@/components/mic-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

const STEPS = [
  { title: "Describe", body: "Type or speak a few sentences about your team, stage and what you need." },
  { title: "Check", body: "FadäRhy turns it into a profile. Fix anything it got wrong before matching." },
  { title: "Act", body: "Get ranked matches with sources, a 12-month plan and draft intro emails." },
];

const CATEGORY_HINT: Record<EntityType, string> = {
  lab_space: "Parks, benches, BSL-2 units",
  investor: "VCs, corporate funds, family offices",
  pharma: "Partners and licensing",
  service_provider: "Legal, IP, regulatory, CROs",
  accelerator: "Incubators and accelerators",
  research_institute: "Universities and institutes",
  funding_program: "Grants and public funding",
};

const PLACEHOLDER =
  "We are a six-person oncology startup preparing for Series A. We need BSL-2 laboratory space, regulatory expertise, potential investors and pharma partners.";

// The three demo scenarios: researcher, growing biotech, foreign founder.
const EXAMPLES = [
  {
    label: "Researcher planning a spin-off (French)",
    text: "Je suis chercheuse en oncologie à l'Université de Bâle, je veux créer une startup. Qu'est-ce que je dois faire ?",
  },
  {
    label: "Growing biotech before Series A",
    text: PLACEHOLDER,
  },
  {
    label: "Founder moving to Basel (German)",
    text: "Wir sind ein Diagnostik-Startup mit acht Personen aus Deutschland in der Seed-Phase und ziehen nach Basel. Wir brauchen Laborfläche, regulatorische Beratung und Investoren.",
  },
];

export default function IntakePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const needText = useNavigator((s) => s.needText);
  const setNeedText = useNavigator((s) => s.setNeedText);
  const setProfile = useNavigator((s) => s.setProfile);
  const language = useNavigator((s) => s.language);
  const setLanguage = useNavigator((s) => s.setLanguage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = needText.trim();
    if (text.length < 15) {
      setError("Describe your team and what you need in at least one sentence.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setProfile(await parseNeed(text, language ?? undefined));
      router.push("/profile");
    } catch {
      setError("Your description could not be read. Check your connection and try again.");
      setBusy(false);
    }
  };

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <img src="/brand/basel-daylight.webp" alt="" className="theme-light-only absolute inset-0 h-full w-full object-cover" />
        <img src="/brand/basel-dusk.jpg" alt="" className="theme-dark-only absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden className="hero-scrim absolute inset-0" />
        <div aria-hidden className="hero-grid absolute inset-y-0 left-1/2 right-0 hidden md:block" />
        <RhineThreads />
        <div className="relative mx-auto max-w-[1400px] px-4 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
          <p className="label-mono flex items-center gap-2.5 !text-ink">
            <span aria-hidden className="h-2 w-2 rounded-full bg-cta ring-4 ring-cta/25" />
            Overall winner · Hack am Rhein 2026
          </p>
          <p className="label-mono mt-8">The ecosystem navigator · Basel-first, Swiss-wide</p>
          <h1 className="mt-4 max-w-[760px] text-[42px] font-bold leading-[1.02] sm:text-[72px]">
            Find your next right connection.
          </h1>
          <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-ink-2 sm:text-lg">
            Describe where you are, in English, Deutsch, Français or Baseldütsch. Get source-linked routes to the right
            labs, investors, partners and experts, and a clear 12-month plan.
          </p>

          <form onSubmit={submit} className="mt-9 w-full max-w-[700px] rounded-lg border border-line bg-card text-left text-ink shadow-hero">
            <label htmlFor="need" className="label-mono block px-5 pt-4 !text-muted">
              Your situation and needs
            </label>
            <Textarea
              id="need"
              rows={4}
              className="resize-none border-0 bg-transparent px-5 pb-3 text-[17px] leading-relaxed focus-visible:outline-none"
              placeholder={PLACEHOLDER}
              value={hydrated ? needText : ""}
              onChange={(e) => setNeedText(e.target.value)}
              aria-describedby={error ? "need-error" : undefined}
              aria-invalid={error ? true : undefined}
            />
            <div className="flex flex-col gap-3 border-t border-line p-3 sm:flex-row sm:items-center sm:justify-between">
              <fieldset>
                <legend className="sr-only">Answer language</legend>
                <div className="inline-flex gap-0.5 rounded-md border border-line p-[3px]">
                  {([null, ...LANGUAGES] as (Language | null)[]).map((option) => (
                    <label
                      key={option ?? "auto"}
                      className={cn(
                        "flex h-8 cursor-pointer items-center rounded px-2.5 text-[13px] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                        hydrated && language === option ? "bg-ink font-semibold text-surface" : "font-medium text-muted hover:text-ink",
                      )}
                    >
                      <input
                        type="radio"
                        name="language"
                        className="sr-only"
                        checked={hydrated && language === option}
                        onChange={() => setLanguage(option)}
                      />
                      {option ? LANGUAGE_LABEL[option] : "Auto"}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex flex-wrap gap-2">
                <MicButton
                  language={language}
                  onTranscript={(heard) => {
                    setNeedText(needText.trim() ? `${needText.trim()} ${heard}` : heard);
                    setError(null);
                  }}
                  onError={setError}
                />
                <Button type="submit" size="md" disabled={busy}>
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
                  {busy ? "Reading your needs" : "Find my path"}
                  {!busy && <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden />}
                </Button>
              </div>
            </div>
            {error && (
              <p id="need-error" role="alert" className="px-5 pb-3 pt-2 text-sm font-medium text-[#B42318]">
                {error}
              </p>
            )}
          </form>

          <div className="mt-5 flex max-w-[700px] flex-wrap items-center gap-2">
            <span className="label-mono mr-1 !text-muted">Try an example</span>
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                type="button"
                title={example.text}
                onClick={() => {
                  setNeedText(example.text);
                  setError(null);
                  document.getElementById("need")?.focus();
                }}
                className="min-h-9 rounded-full border border-line bg-card/70 px-3 py-1.5 text-[13px] font-medium text-ink backdrop-blur hover:border-ink"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-4 md:grid-cols-[1fr_2fr] md:gap-12">
          <p className="label-mono pt-3">How it works</p>
          <h2 className="text-[34px] font-semibold leading-[1.05] sm:text-[52px]">One thread from question to next step.</h2>
        </div>
        <ol className="relative mt-12 border-t border-line">
          {STEPS.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-6 gap-y-1 border-b border-line py-6 md:grid-cols-[64px_minmax(0,1fr)_minmax(0,1.3fr)_16px]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cta font-mono text-[13px] font-bold text-on-cta">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="col-start-2 text-[15px] leading-relaxed text-muted md:col-start-3">{step.body}</p>
              <span aria-hidden className="hidden h-2.5 w-2.5 justify-self-end rounded-full bg-accent md:block" />
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-card-2">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8 sm:py-24">
          <div>
            <div className="grid gap-4 md:grid-cols-[1fr_2fr] md:gap-12">
              <p className="label-mono pt-3">What you can find</p>
              <div>
                <h2 className="text-[34px] font-semibold leading-[1.05] sm:text-[52px]">The whole ecosystem, one map.</h2>
                <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-muted">
                  Every organisation in the Basel life-sciences graph, by category, each with its source.
                </p>
              </div>
            </div>
          </div>
          <figure className="mt-10 overflow-hidden rounded-lg border border-line">
            <img src="/brand/founders-maze.webp" alt="A founder facing a hedge maze of labs, investors, accelerators and funding programmes along the Rhine." className="aspect-[1280/505] w-full object-cover" />
          </figure>
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {ENTITY_TYPES.map((type) => (
              <li key={type}>
                <Link
                  href={`/directory?type=${type}`}
                  className="group flex h-full flex-col gap-3 rounded-lg border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:border-ink"
                >
                  <span className="flex items-center justify-between">
                    <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_META[type].color }} />
                    <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
                  </span>
                  <span className="text-[17px] font-bold">{TYPE_META[type].label}</span>
                  <span className="label-mono !text-muted">{CATEGORY_HINT[type]}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/directory" className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink underline decoration-accent decoration-2 underline-offset-4">
              Open the full directory <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <figure className="relative">
        <img src="/brand/basel-thread.webp" alt="The Rhine through Basel with the FadäRhy thread drawn across it." className="h-[180px] w-full object-cover sm:h-auto sm:aspect-[1600/489]" />
        <figcaption className="label-mono mx-auto max-w-[1400px] px-4 py-4 !text-muted sm:px-8">
          Basel-first · Swiss-wide · 47.5596° N, 7.5886° E
        </figcaption>
      </figure>
    </div>
  );
}

/** The Rhine traced on each hero photo, from fadarhy.ch. */
function RhineThreads() {
  return (
    <>
      <svg aria-hidden className="rhine-mask theme-dark-only pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1824 1366" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rhine-dusk" x1="260" y1="214" x2="1824" y2="697" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1A35D1" />
            <stop offset="1" stopColor="#5C76FF" />
          </linearGradient>
        </defs>
        <path className="rhine-line" pathLength={1} stroke="url(#rhine-dusk)" d="M260 214 C365 225 500 222 590 241 C715 257 544 290 469 335 C407 377 433 461 479 493 C536 533 599 545 670 566 C755 594 837 621 930 640 C1024 664 1103 682 1190 695 C1450 742 1645 736 1824 697" />
        <circle className="rhine-node" cx="930" cy="640" r="9" />
        <circle className="rhine-node" cx="1190" cy="695" r="9" />
        <circle className="rhine-node" cx="1560" cy="733" r="9" />
      </svg>
      <svg aria-hidden className="rhine-mask theme-light-only pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1920 1127" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rhine-day" x1="448" y1="370" x2="1920" y2="837" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1A35D1" />
            <stop offset="1" stopColor="#2446F5" />
          </linearGradient>
        </defs>
        <path className="rhine-line" pathLength={1} stroke="url(#rhine-day)" d="M448 370 C584 387 768 400 896 413 C1056 419 971 445 821 458 C658 470 493 526 368 584 C266 630 274 704 386 762 C544 883 650 881 830 875 C950 871 1070 868 1192 862 C1483 856 1715 845 1920 837" />
        <circle className="rhine-node" cx="1192" cy="862" r="9" />
        <circle className="rhine-node" cx="1560" cy="851" r="9" />
      </svg>
    </>
  );
}
