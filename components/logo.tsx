import { cn } from "@/lib/utils";

/**
 * FadäRhy's mark: a Rhine Blue tile with the thread running through it and
 * Thread Lime dots at its stops. `round` gives a disc, `light` a white tile
 * with a blue thread (the light app icon).
 */
export function LogoMark({ className, round = false, light = false }: { className?: string; round?: boolean; light?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <rect width="48" height="48" rx={round ? 24 : 12} fill={light ? "#FFFFFF" : "#2446F5"} />
      <path
        d="M10.5 31.5C14.5 24 18 16.5 22.5 16.5S28 27 32 29.5 36.5 30.5 38 29"
        stroke={light ? "#2446F5" : "#FFFFFF"}
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="10.5" cy="31.5" r="3.6" fill="#D6FF3F" stroke={light ? "#2446F5" : "#FFFFFF"} strokeWidth="1.2" />
      <circle cx="38" cy="29" r="3.6" fill="#D6FF3F" stroke={light ? "#2446F5" : "#FFFFFF"} strokeWidth="1.2" />
    </svg>
  );
}

/** The wordmark: "FadäRhy" with the umlaut's dots in Thread Lime. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-extrabold tracking-[-0.03em]", className)} aria-label="FadäRhy">
      <span aria-hidden>
        Fad
        <span className="relative inline-block">
          a
          <span className="absolute left-1/2 top-[0.29em] flex -translate-x-1/2 gap-[0.12em]">
            <span className="h-[0.19em] w-[0.19em] rounded-full bg-lime" />
            <span className="h-[0.19em] w-[0.19em] rounded-full bg-lime" />
          </span>
        </span>
        Rhy
      </span>
    </span>
  );
}
