"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type LogoItem =
  | {
      node: React.ReactNode;
      href?: string;
      title?: string;
      ariaLabel?: string;
    }
  | {
      src: string;
      alt?: string;
      href?: string;
      title?: string;
      srcSet?: string;
      sizes?: string;
      width?: number;
      height?: number;
    };

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: React.Key) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SMOOTH_TAU = 0.25;
const MIN_COPIES = 2;
const COPY_HEADROOM = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toCssLength = (v?: number | string) =>
  typeof v === "number" ? `${v}px` : (v ?? undefined);

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Observes element resize and fires callback. Falls back to window resize. */
function useResizeObserver(
  callback: () => void,
  refs: Array<React.RefObject<Element | null>>,
  deps: React.DependencyList,
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.ResizeObserver) {
      window.addEventListener("resize", callback);
      callback();
      return () => window.removeEventListener("resize", callback);
    }

    const observers = refs.flatMap((ref) => {
      if (!ref.current) return [];
      const ro = new ResizeObserver(callback);
      ro.observe(ref.current);
      return [ro];
    });

    callback();
    return () => observers.forEach((ro) => ro.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Waits for all <img> inside seqRef to load, then fires onLoad. */
function useImageLoader(
  seqRef: React.RefObject<HTMLUListElement | null>,
  onLoad: () => void,
  deps: React.DependencyList,
) {
  useEffect(() => {
    const images = Array.from(seqRef.current?.querySelectorAll("img") ?? []);
    if (!images.length) {
      onLoad();
      return;
    }

    let remaining = images.length;
    const done = () => {
      if (--remaining === 0) onLoad();
    };

    images.forEach((img) => {
      if ((img as HTMLImageElement).complete) {
        done();
      } else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });

    return () =>
      images.forEach((img) => {
        img.removeEventListener("load", done);
        img.removeEventListener("error", done);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Drives the CSS transform animation via rAF with smooth velocity easing. */
function useAnimationLoop(
  trackRef: React.RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  seqHeight: number,
  isHovered: boolean,
  hoverSpeed: number | undefined,
  isVertical: boolean,
) {
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const seqSize = isVertical ? seqHeight : seqWidth;

    const setTransform = (offset: number) => {
      track.style.transform = isVertical
        ? `translate3d(0,${-offset}px,0)`
        : `translate3d(${-offset}px,0,0)`;
    };

    if (seqSize > 0) {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
      setTransform(offsetRef.current);
    }

    if (prefersReduced) {
      track.style.transform = "translate3d(0,0,0)";
      return () => {
        lastTsRef.current = null;
      };
    }

    const animate = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.max(0, ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const target =
        isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;
      velRef.current +=
        (target - velRef.current) * (1 - Math.exp(-dt / SMOOTH_TAU));

      if (seqSize > 0) {
        const next =
          (((offsetRef.current + velRef.current * dt) % seqSize) + seqSize) %
          seqSize;
        offsetRef.current = next;
        setTransform(next);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical]);
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LogoLoop = React.memo<LogoLoopProps>(function LogoLoop({
  logos,
  speed = 120,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = "Partner logos",
  className,
  style,
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  // Hydration-safe: start with minimum copies and never render more until
  // client effects have measured the container. This keeps SSR output stable.
  const [copyCount, setCopyCount] = useState(MIN_COPIES);
  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const isVertical = direction === "up" || direction === "down";

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === true) return 0;
    if (pauseOnHover === false) return undefined;
    return 0;
  }, [hoverSpeed, pauseOnHover]);

  const targetVelocity = useMemo(() => {
    const mag = Math.abs(speed);
    const dir = isVertical
      ? direction === "up"
        ? 1
        : -1
      : direction === "left"
        ? 1
        : -1;
    return mag * dir * (speed < 0 ? -1 : 1);
  }, [speed, direction, isVertical]);

  const updateDimensions = useCallback(() => {
    const containerW = containerRef.current?.clientWidth ?? 0;
    const rect = seqRef.current?.getBoundingClientRect();
    const sw = rect?.width ?? 0;
    const sh = rect?.height ?? 0;

    if (isVertical) {
      const parentH = containerRef.current?.parentElement?.clientHeight ?? 0;
      if (containerRef.current && parentH > 0) {
        const h = Math.ceil(parentH);
        if (containerRef.current.style.height !== `${h}px`)
          containerRef.current.style.height = `${h}px`;
      }
      if (sh > 0) {
        setSeqHeight(Math.ceil(sh));
        const viewport = containerRef.current?.clientHeight ?? parentH ?? sh;
        setCopyCount(
          Math.max(MIN_COPIES, Math.ceil(viewport / sh) + COPY_HEADROOM),
        );
      }
    } else if (sw > 0) {
      setSeqWidth(Math.ceil(sw));
      setCopyCount(
        Math.max(MIN_COPIES, Math.ceil(containerW / sw) + COPY_HEADROOM),
      );
    }
  }, [isVertical]);

  useResizeObserver(
    updateDimensions,
    [containerRef, seqRef],
    [logos, gap, logoHeight, isVertical],
  );
  useImageLoader(seqRef, updateDimensions, [
    logos,
    gap,
    logoHeight,
    isVertical,
  ]);
  useAnimationLoop(
    trackRef,
    targetVelocity,
    seqWidth,
    seqHeight,
    isHovered,
    effectiveHoverSpeed,
    isVertical,
  );

  const handleMouseEnter = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(true);
  }, [effectiveHoverSpeed]);

  const handleMouseLeave = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(false);
  }, [effectiveHoverSpeed]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // ── Derived class strings (stable; no browser-only values) ─────────────────

  const liClass = cx(
    "flex-none text-[length:var(--logoloop-logoHeight)] leading-[1]",
    isVertical ? "mb-[var(--logoloop-gap)]" : "mr-[var(--logoloop-gap)]",
    mounted && scaleOnHover && "overflow-visible group/item", // ← add mounted &&
  );

  const spanClass = cx(
    "inline-flex items-center motion-reduce:transition-none",
    mounted &&
      scaleOnHover && // ← add mounted &&
      "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-120",
  );

  const imgClass = cx(
    "h-[var(--logoloop-logoHeight)] w-auto block object-contain",
    "[-webkit-user-drag:none] pointer-events-none",
    "[image-rendering:-webkit-optimize-contrast]",
    "motion-reduce:transition-none",
    mounted &&
      scaleOnHover && // ← add mounted &&
      "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-120",
  );

  const rootClass = cx(
    "relative group",
    isVertical ? "overflow-hidden h-full inline-block" : "overflow-x-hidden",
    "[--logoloop-gap:32px] [--logoloop-logoHeight:28px]",
    "[--logoloop-fadeColorAuto:#ffffff] dark:[--logoloop-fadeColorAuto:#0b0b0b]",
    mounted && scaleOnHover && "py-[calc(var(--logoloop-logoHeight)*0.1)]", // ← add mounted &&
    className,
  );

  const anchorClass =
    "inline-flex items-center no-underline rounded " +
    "transition-opacity duration-200 ease-linear hover:opacity-80 " +
    "focus-visible:outline focus-visible:outline-current focus-visible:outline-offset-2";

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderLogoItem = useCallback(
    (item: LogoItem, key: React.Key) => {
      if (renderItem) {
        return (
          <li className={liClass} key={key} role="listitem">
            {renderItem(item, key)}
          </li>
        );
      }

      const isNode = "node" in item;
      const anyItem = item as any;

      const content = isNode ? (
        <span
          className={spanClass}
          aria-hidden={!!anyItem.href && !anyItem.ariaLabel}
        >
          {anyItem.node}
        </span>
      ) : (
        <img
          className={imgClass}
          src={anyItem.src}
          srcSet={anyItem.srcSet}
          sizes={anyItem.sizes}
          width={anyItem.width}
          height={anyItem.height}
          alt={anyItem.alt ?? ""}
          title={anyItem.title}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      );

      const label = isNode
        ? (anyItem.ariaLabel ?? anyItem.title)
        : (anyItem.alt ?? anyItem.title);

      const inner = anyItem.href ? (
        <a
          className={anchorClass}
          href={anyItem.href}
          aria-label={label || "logo link"}
          target="_blank"
          rel="noreferrer noopener"
        >
          {content}
        </a>
      ) : (
        content
      );

      return (
        <li className={liClass} key={key} role="listitem">
          {inner}
        </li>
      );
    },
    // liClass / spanClass / imgClass are stable strings derived from stable props
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVertical, scaleOnHover, renderItem],
  );

  const logoLists = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, i) => (
        <ul
          key={`copy-${i}`}
          className={cx("flex items-center", isVertical && "flex-col")}
          role="list"
          aria-hidden={i > 0}
          ref={i === 0 ? seqRef : undefined}
        >
          {logos.map((item, j) => renderLogoItem(item, `${i}-${j}`))}
        </ul>
      )),
    [copyCount, logos, renderLogoItem, isVertical],
  );

  const containerStyle = useMemo(
    (): React.CSSProperties =>
      ({
        width: isVertical
          ? toCssLength(width) === "100%"
            ? undefined
            : toCssLength(width)
          : (toCssLength(width) ?? "100%"),
        "--logoloop-gap": `${gap}px`,
        "--logoloop-logoHeight": `${logoHeight}px`,
        ...(fadeOutColor && { "--logoloop-fadeColor": fadeOutColor }),
        ...style,
      }) as React.CSSProperties,
    [width, gap, logoHeight, fadeOutColor, style, isVertical],
  );

  // ── Fade overlays ──────────────────────────────────────────────────────────

  const fadeOverlays =
    fadeOut &&
    (isVertical ? (
      <>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[clamp(24px,8%,120px)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[clamp(24px,8%,120px)]"
        />
      </>
    ) : (
      <>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[clamp(24px,8%,120px)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[clamp(24px,8%,120px)]"
        />
      </>
    ));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={rootClass}
      style={containerStyle}
      role="region"
      aria-label={ariaLabel}
      // The copyCount-driven children will differ between SSR (MIN_COPIES=2)
      // and client (measured copies) on first paint. Suppress to avoid the
      // hydration warning on the container and its descendants.
      suppressHydrationWarning
    >
      {fadeOverlays}

      <div
        className={cx(
          "flex will-change-transform select-none relative z-0",
          "motion-reduce:transform-none",
          isVertical ? "flex-col h-max w-full" : "flex-row w-max",
        )}
        ref={trackRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {logoLists}
      </div>
    </div>
  );
});

LogoLoop.displayName = "LogoLoop";
export default LogoLoop;
