"use client";

import dynamic from "next/dynamic";
import { useArchitectureVisualizer } from "@/src/hook/use.architecture.visualizer.hook";

function CanvasFallback() {
  return (
    <div className="grid h-full place-items-center font-mono text-xs text-text-dim">
      Loading diagram…
    </div>
  );
}

const ArchitectureCanvas = dynamic(() => import("./ArchitectureCanvas"), {
  ssr: false,
  loading: CanvasFallback,
});

const CHIP =
  "px-3.5 py-1.5 rounded-full border text-[11px] font-mono transition-[background-color,border-color,color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";
const CHIP_ON = "bg-primary/15 border-primary/50 text-primary-strong";
const CHIP_OFF =
  "bg-subtle/70 border-border text-text-dim hover:border-primary/40 hover:text-primary-strong";

/**
 * CliniQo's architecture, explorable. The layer buttons (or a click on any
 * box) light one layer and its connections; the panel beneath says in words
 * what that layer does, so the diagram is never the only way to get the
 * information.
 */
export default function ArchitectureVisualizer() {
  const { containerRef, shouldLoadCanvas, view, activeLayer, layers, handleViewChange } =
    useArchitectureVisualizer();

  return (
    <div
      id="cliniqo-architecture"
      ref={containerRef}
      className="scroll-mt-24 rounded-2xl border border-border bg-subtle/40"
    >
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary-strong">
          System architecture
        </h4>
        <div role="group" aria-label="Show architecture layer" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={view === "all"}
            onClick={() => handleViewChange("all")}
            className={`${CHIP} ${view === "all" ? CHIP_ON : CHIP_OFF}`}
          >
            All layers
          </button>
          {layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              aria-pressed={view === layer.id}
              onClick={() => handleViewChange(layer.id)}
              className={`${CHIP} ${view === layer.id ? CHIP_ON : CHIP_OFF}`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Below ~720px the diagram keeps its size and scrolls sideways, which
          stays legible where shrinking it to fit would not. */}
      <div className="overflow-x-auto">
        <div
          role="img"
          aria-label="CliniQo architecture diagram: an Expo mobile app talks to an ASP.NET Core API over REST and to a SignalR hub over WebSocket; the API's Application layer uses the Domain and an Infrastructure layer that reads PostgreSQL under row-level security and stores files in AWS S3."
          className="h-[400px] min-w-[720px]"
        >
          {shouldLoadCanvas ? <ArchitectureCanvas view={view} /> : <CanvasFallback />}
        </div>
      </div>

      <div aria-live="polite" className="border-t border-border p-5">
        {activeLayer ? (
          <div key={activeLayer.id} className="load-rise grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary-strong">
                {activeLayer.label} · {activeLayer.tech}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-dim">{activeLayer.summary}</p>
            </div>
            <ul className="space-y-1.5">
              {activeLayer.points.map((point) => (
                <li key={point} className="flex gap-2.5 text-sm text-text-dim">
                  <span aria-hidden="true" className="mt-1.5 shrink-0 text-xs text-primary">▸</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-text-dim">
            Request flow, left to right: mobile app, real-time layer, API, storage.
            Pick a layer above, or click any box, to see what it does.
          </p>
        )}
      </div>
    </div>
  );
}
