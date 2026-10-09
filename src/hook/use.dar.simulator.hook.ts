import { useEffect, useRef, useState } from "react";
import { simulateDarSync } from "@/src/app/actions";
import { darCommits, type DarReport } from "@/src/data/dar";

export type DarStatus = "idle" | "syncing" | "analyzing" | "done" | "error";

/** Gap between one commit appearing in the log and the next. */
const COMMIT_INTERVAL_MS = 420;

const STATUS_TEXT: Record<DarStatus, string> = {
  idle: "Ready",
  syncing: "Fetching commits…",
  analyzing: "Writing the report…",
  done: "Report ready",
  error: "The simulation failed. Try again.",
};

/**
 * Runs the DAR demo: sample commits arrive one at a time, then a Server
 * Action stands in for the analyzer and returns the written report.
 */
export function useDarSimulator() {
  const [status, setStatus] = useState<DarStatus>("idle");
  const [visibleCount, setVisibleCount] = useState(0);
  const [report, setReport] = useState<DarReport | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  const isRunning = status === "syncing" || status === "analyzing";

  /** A small burst from the report panel. Skipped under reduced motion. */
  const celebrate = async () => {
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;

    const { default: confetti } = await import("canvas-confetti");
    confetti({
      particleCount: 70,
      spread: 65,
      startVelocity: 32,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ["#38bdf8", "#7dd3fc", "#10b981"],
      disableForReducedMotion: true,
    });
  };

  const analyze = async () => {
    setStatus("analyzing");
    try {
      setReport(await simulateDarSync());
      setStatus("done");
      void celebrate();
    } catch {
      setStatus("error");
    }
  };

  const handleSimulate = () => {
    if (isRunning) return;

    clearInterval(timer.current);
    setReport(null);
    setVisibleCount(0);
    setStatus("syncing");

    let count = 0;
    timer.current = setInterval(() => {
      count += 1;
      setVisibleCount(count);
      if (count < darCommits.length) return;

      clearInterval(timer.current);
      void analyze();
    }, COMMIT_INTERVAL_MS);
  };

  return {
    panelRef,
    status,
    statusText: STATUS_TEXT[status],
    isRunning,
    commits: darCommits.slice(0, visibleCount),
    totalCommits: darCommits.length,
    report,
    handleSimulate,
  };
}
