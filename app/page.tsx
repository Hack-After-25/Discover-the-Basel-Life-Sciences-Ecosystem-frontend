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
  { title: "Check", body: "ARIADNE turns it into a profile. Fix anything it got wrong before matching." },
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
      <section className="relative overflow-hidden bg-primary-dark text-white">
        <svg
          aria-hidden
          viewBox="0 0 1440 560"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
        >
          <path
            d="M-20 420 C 220 300, 360 520, 560 380 S 900 120, 1100 260 S 1380 420, 1480 300"
            stroke="#5EEAD4"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M-20 470 C 260 360, 420 560, 640 430 S 960 200, 1160 320 S 1400 470, 1480 380"
            stroke="#3B6FD8"
            strokeWidth="1"
            fill="none"
          />
        </svg>
        <div className="relative mx-auto flex max-w-[1240px] flex-col items-center px-4 pb-16 pt-14 text-center sm:px-8 sm:pb-24 sm:pt-20">
          <span className="rounded-full border border-accent-bright/30 bg-accent-bright/10 px-3 py-1.5 text-[13px] font-medium text-[#99F6E4]">
            Basel life-sciences navigator
          </span>
          <h1 className="mt-5 max-w-[880px] text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">
            Your thread through Basel’s life-sciences labyrinth.
          </h1>
          <p className="mt-5 max-w-[680px] text-lg leading-relaxed text-[#C7D2E8]">
            Tell ARIADNE what your team needs, in English, Deutsch, Français or Baseldütsch. Get matched labs,
            investors, partners and experts across the region, each with a reason and its source, plus a 12-month
            plan.
          </p>

          <form onSubmit={submit} className="mt-10 w-full max-w-[820px] rounded-[20px] bg-white p-2 text-left text-ink shadow-hero">
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
            <div className="flex flex-col gap-3 rounded-b-[14px] border-t border-line bg-[#F8F9FB] p-2.5 sm:flex-row sm:items-center sm:justify-between">
              <fieldset>
                <legend className="sr-only">Answer language</legend>
                <div className="inline-flex gap-0.5 rounded-xl bg-[#EEF0F3] p-[3px]">
                  {([null, ...LANGUAGES] as (Language | null)[]).map((option) => (
                    <label
                      key={option ?? "auto"}
                      className={cn(
                        "flex h-9 cursor-pointer items-center rounded-[9px] px-3 text-[13px] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                        hydrated && language === option
                          ? "bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
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
            <span className="self-center text-[13px] text-[#9FB0D0]">Try an example:</span>
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
                className="min-h-9 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-[#E6ECF7] hover:border-accent-bright/60 hover:bg-white/10"
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
            <li key={step.title} className="rounded-2xl border border-line bg-white p-6">
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
                className="flex h-full flex-col gap-2.5 rounded-[14px] border border-line bg-white p-[18px] hover:border-[#C9CED6] hover:shadow-lift"
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
