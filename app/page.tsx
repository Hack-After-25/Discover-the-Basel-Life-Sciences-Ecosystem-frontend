"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
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
      <section className="relative overflow-hidden bg-night text-white">
        <svg
          aria-hidden
          viewBox="0 0 1440 560"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <path
            d="M-40 470 C 160 470, 220 300, 330 300 S 470 420, 600 400 M 1040 600 C 1080 480, 1110 370, 1160 370 S 1230 430, 1480 380"
            stroke="#2446F5"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="330" cy="300" r="13" fill="#D6FF3F" />
          <circle cx="1160" cy="370" r="13" fill="#D6FF3F" />
        </svg>
        <div className="relative mx-auto flex max-w-[1240px] flex-col items-center px-4 pb-16 pt-14 text-center sm:px-8 sm:pb-24 sm:pt-20">
          <span className="rounded-full border border-lime/30 bg-lime/10 px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] text-[#D6FF3F]">
            The ecosystem navigator<span className="hidden sm:inline"> · Basel · Upper Rhine</span>
          </span>
          <h1 className="mt-5 max-w-[880px] text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">
            Find your next right connection<span className="text-lime">.</span>
          </h1>
          <p className="mt-5 max-w-[680px] text-lg leading-relaxed text-[#C9CCC0]">
            Tell FadäRhy what your team needs, in English, Deutsch, Français or Baseldütsch. Get matched labs,
            investors, partners and experts across the region, each with a reason and its source, plus a 12-month
            plan.
          </p>

          <form onSubmit={submit} className="mt-10 w-full max-w-[820px] rounded-[20px] bg-card p-2 text-left text-ink shadow-hero">
            <label htmlFor="need" className="block px-4 pt-3.5 text-[13px] font-semibold text-muted">
              Your situation and needs
            </label>
            <Textarea
              id="need"
              rows={4}
              className="resize-none border-0 px-4 pb-3 text-[17px] leading-relaxed focus-visible:outline-none"
              placeholder={PLACEHOLDER}
              value={hydrated ? needText : ""}
              onChange={(e) => setNeedText(e.target.value)}
              aria-describedby={error ? "need-error" : undefined}
              aria-invalid={error ? true : undefined}
            />
            <div className="flex flex-col gap-3 rounded-b-[14px] border-t border-line bg-card-2 p-2.5 sm:flex-row sm:items-center sm:justify-between">
              <fieldset>
                <legend className="sr-only">Answer language</legend>
                <div className="inline-flex gap-0.5 rounded-xl bg-subtle p-[3px]">
                  {([null, ...LANGUAGES] as (Language | null)[]).map((option) => (
                    <label
                      key={option ?? "auto"}
                      className={cn(
                        "flex h-9 cursor-pointer items-center rounded-[9px] px-3 text-[13px] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                        hydrated && language === option
                          ? "bg-card font-semibold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                          : "font-medium text-muted hover:text-ink",
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
                  {!busy && <ArrowRight className="h-[18px] w-[18px]" aria-hidden />}
                </Button>
              </div>
            </div>
            {error && (
              <p id="need-error" role="alert" className="px-4 pb-3 pt-2 text-sm font-medium text-[#B42318]">
                {error}
              </p>
            )}
          </form>

          <div className="mt-5 flex max-w-[820px] flex-wrap justify-center gap-2">
            <span className="self-center text-[13px] text-[#A3A69B]">Try an example:</span>
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
                className="min-h-9 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-[#EEF0E8] hover:border-lime/60 hover:bg-white/10"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pt-14 sm:px-8">
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-line bg-card p-6">
              <span className="font-mono text-xs font-medium text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-2.5 text-lg font-semibold">{step.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-20 pt-12 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[26px] font-semibold">Or browse the ecosystem</h2>
            <p className="mt-1.5 text-[15px] text-muted">Every organisation in the Basel life-sciences graph, by category.</p>
          </div>
          <Link href="/directory" className="text-sm font-semibold text-primary hover:text-accent">
            Open the full directory
          </Link>
        </div>
        <ul className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {ENTITY_TYPES.map((type) => (
            <li key={type}>
              <Link
                href={`/directory?type=${type}`}
                className="flex h-full flex-col gap-2.5 rounded-[14px] border border-line bg-card p-[18px] hover:border-field-hover hover:shadow-lift"
              >
                <span aria-hidden className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: TYPE_META[type].color }} />
                <span className="font-semibold">{TYPE_META[type].label}</span>
                <span className="text-[13px] text-muted">{CATEGORY_HINT[type]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
