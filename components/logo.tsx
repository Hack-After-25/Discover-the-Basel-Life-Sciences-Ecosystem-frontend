/** Ariadne's mark: a thread running through a navy tile (or disc, with `round`). */
export function LogoMark({ className, round = false }: { className?: string; round?: boolean }) {
  return (
    <svg viewBox="0 0 30 30" aria-hidden className={className}>
      <rect width="30" height="30" rx={round ? 15 : 9} fill="#0E2A5E" />
      <path d="M6 19c4-9 8 3 12-4s4-4 6-2" stroke="#5EEAD4" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
