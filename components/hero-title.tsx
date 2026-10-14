/** A headline whose closing punctuation is drawn in Thread Lime, as on fadarhy.ch. */
export function HeroTitle({ text }: { text: string }) {
  const end = /[.!?]$/.test(text) ? text.slice(-1) : "";
  return (
    <>
      {end ? text.slice(0, -1) : text}
      {end && <span className="text-lime">{end}</span>}
    </>
  );
}
