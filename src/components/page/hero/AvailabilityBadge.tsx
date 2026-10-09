/**
 * Live-status pill: a mint dot with a ping halo and a soft glow.
 *
 * The label is a darker emerald in light mode. #10b981 on white is only about
 * 2.5:1, below the 4.5:1 small text needs; the dot and border keep the sharp
 * mint in both themes.
 *
 * A tint rather than frosted glass, for the same reason as the stats panel
 * beside it: the hero text fades on scroll over a moving canvas, and a
 * backdrop blur neither survives the fade nor comes cheap there.
 */
export default function AvailabilityBadge() {
  return (
    <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-mint/35 bg-mint/15 text-emerald-700 dark:text-mint text-xs font-mono tracking-wider shadow-[0_0_24px_-6px] shadow-mint/60">
      <span aria-hidden="true" className="relative flex size-2">
        <span className="absolute inset-0 rounded-full bg-mint opacity-75 animate-ping motion-reduce:animate-none" />
        <span className="relative size-2 rounded-full bg-mint shadow-[0_0_10px_2px] shadow-mint/70" />
      </span>
      Available for Opportunities
    </span>
  );
}
