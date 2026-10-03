"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { parseNeed } from "@/lib/api";
import { useHydrated, useNavigator } from "@/lib/store";
import { LANGUAGES, LANGUAGE_LABEL } from "@/lib/i18n";
import type { Language } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MicButton } from "@/components/mic-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

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
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-12 sm:px-6 sm:pt-20">
      <p className="text-sm font-medium uppercase tracking-[0.12em] text-accent">De Fadä durch Basel</p>
      <h1 className="mt-2 text-4xl font-semibold leading-[1.1] text-primary sm:text-5xl">
        Your thread through Basel’s life-sciences labyrinth.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Tell ARIADNE what your team needs — in English, Deutsch, Français or Baseldütsch. Get matched labs,
        investors, programmes and experts across Basel-Stadt and Basel-Landschaft, each with a reason and its
        source, and a 12-month plan.
      </p>

      <form onSubmit={submit} className="mt-10 rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
        <label htmlFor="need" className="block text-sm font-semibold">
          Your situation and needs
        </label>
        <Textarea
          id="need"
          rows={5}
          className="mt-2 resize-y border-0 px-0 text-base focus-visible:outline-none"
          placeholder={PLACEHOLDER}
          value={hydrated ? needText : ""}
          onChange={(e) => setNeedText(e.target.value)}
          aria-describedby={error ? "need-error" : undefined}
          aria-invalid={error ? true : undefined}
        />
        <div className="mt-3 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <fieldset>
            <legend className="text-sm text-muted">
              Answer language
            </legend>
            <div className="mt-1.5 inline-flex rounded-lg border border-line p-0.5">
              {([null, ...LANGUAGES] as (Language | null)[]).map((option) => (
                <label
                  key={option ?? "auto"}
                  className={cn(
                    "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                    hydrated && language === option ? "bg-primary text-white" : "text-muted hover:text-ink",
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
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
              {busy ? "Reading your needs" : "Find my path"}
              {!busy && <ArrowRight className="h-5 w-5" aria-hidden />}
            </Button>
          </div>
        </div>
        {error && (
          <p id="need-error" role="alert" className="mt-3 text-sm font-medium text-[#B42318]">
            {error}
          </p>
        )}
      </form>

      <div className="mt-8">
        <h2 className="text-sm font-semibold">Or start from an example</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {EXAMPLES.map((example) => (
            <li key={example.label}>
              <button
                type="button"
                onClick={() => {
                  setNeedText(example.text);
                  setError(null);
                  document.getElementById("need")?.focus();
                }}
                className="h-full w-full rounded-xl border border-line bg-surface p-4 text-left text-sm hover:border-accent"
              >
                <span className="font-medium text-ink">{example.label}</span>
                <span className="mt-1.5 block text-muted">{example.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
