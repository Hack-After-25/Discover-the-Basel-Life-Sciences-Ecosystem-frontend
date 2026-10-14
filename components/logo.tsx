"use client";

import { cn } from "@/lib/utils";
import { useSite } from "./site-provider";

/**
 * FadäRhy's mark, the same drawing as the fadarhy.ch logo: a Rhine Blue tile
 * with the white thread and three Thread Lime stops. `round` gives a disc,
 * `light` a white tile with a blue thread.
 */
export function LogoMark({ className, round = false, light = false }: { className?: string; round?: boolean; light?: boolean }) {
  const tile = light ? "#FFFFFF" : "#2446F5";
  const thread = light ? "#2446F5" : "#FFFFFF";
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={className}>
      <rect width="512" height="512" rx={round ? 256 : 112} fill={tile} />
      <g transform="translate(64 196) scale(0.507)">
        <path
          d="M0,137 C110,120 220,0 303,0 C350,0 370,40 393,66 C440,118 480,141 538,141 C620,141 700,100 757,100"
          fill="none"
          stroke={thread}
          strokeWidth="56"
          strokeLinecap="round"
        />
        <circle cx="0" cy="137" r="52" fill="#D6FF3F" stroke={tile} strokeWidth="14" />
        <circle cx="393" cy="66" r="52" fill="#D6FF3F" stroke={tile} strokeWidth="14" />
        <circle cx="757" cy="100" r="52" fill="#D6FF3F" stroke={tile} strokeWidth="14" />
      </g>
    </svg>
  );
}

/** The logo uploaded in the admin panel (its dark version in dark mode), else the built-in mark. */
export function SiteLogo({ className }: { className?: string }) {
  const { logo, logoDark } = useSite();
  if (!logo) return <LogoMark className={className} />;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL from the admin panel */}
      <img src={logo} alt="" className={cn("object-contain dark-logo-hide", className)} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoDark ?? logo} alt="" className={cn("hidden object-contain dark-logo-show", className)} />
    </>
  );
}

/** The wordmark: "FadäRhy" with the umlaut's dots in Thread Lime, or the
 * name set in the admin panel as plain text. */
export function Wordmark({ className }: { className?: string }) {
  const { name, isDefaultName } = useSite();
  if (!isDefaultName) return <span className={cn("font-extrabold tracking-[-0.03em]", className)}>{name}</span>;
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
