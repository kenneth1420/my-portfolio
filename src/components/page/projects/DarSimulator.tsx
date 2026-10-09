"use client";

import { GitCommitHorizontal, RefreshCw, Sparkles } from "lucide-react";
import { useDarSimulator } from "@/src/hook/use.dar.simulator.hook";

/**
 * DAR in miniature: press the button, watch sample commits arrive, then read
 * the report the analyzer writes from them. Everything shown is sample data,
 * and the widget says so.
 */
export default function DarSimulator() {
  const { panelRef, status, statusText, isRunning, commits, totalCommits, report, handleSimulate } =
    useDarSimulator();

  return (
    <div id="dar-simulator" className="scroll-mt-24 rounded-2xl border border-border bg-subtle/40">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary-strong">
            Commit sync simulator
          </h4>
          <p className="mt-1 text-xs text-text-dim">
            Sample data. No real GitHub or OpenAI calls are made.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSimulate}
          disabled={isRunning}
          className="btn-shine inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors duration-200 hover:bg-primary-light disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
        >
          <RefreshCw
            aria-hidden="true"
            size={14}
            className={isRunning ? "animate-spin motion-reduce:animate-none" : ""}
          />
          {status === "idle" ? "Simulate Sync" : isRunning ? "Syncing…" : "Run again"}
        </button>
      </div>

      <div className="grid md:grid-cols-2">
        {/* Commit log */}
        <div className="border-b border-border p-5 md:border-b-0 md:border-r">
          <p className="mb-3 flex items-center justify-between font-mono text-[11px] text-text-dim">
            <span>github · commits</span>
            <span className="tabular-nums">
              {commits.length}/{totalCommits}
            </span>
          </p>
          <ol className="min-h-[15.5rem] space-y-2 font-mono text-xs">
            {commits.length === 0 && (
              <li className="text-text-dim">Waiting for a sync…</li>
            )}
            {commits.map((commit) => (
              <li key={commit.sha} className="load-rise flex gap-2.5 leading-snug">
                <GitCommitHorizontal
                  aria-hidden="true"
                  size={14}
                  className="mt-0.5 shrink-0 text-primary-strong"
                />
                <span className="min-w-0">
                  <span className="text-text-dim">
                    {commit.time} · {commit.repo} · {commit.sha}
                  </span>
                  <span className="block break-words text-text">{commit.message}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Report */}
        <div ref={panelRef} className="p-5">
          <p className="mb-3 flex items-center gap-2 font-mono text-[11px] text-text-dim">
            <Sparkles aria-hidden="true" size={13} className="text-primary-strong" />
            <span role="status">{statusText}</span>
          </p>

          {status === "analyzing" && (
            <div aria-hidden="true" className="space-y-3">
              <p className="font-mono text-[11px] text-text-dim">
                Server Action · simulateDarSync()
              </p>
              {[92, 78, 85, 60].map((width) => (
                <span
                  key={width}
                  style={{ width: `${width}%` }}
                  className="block h-3 animate-pulse rounded-full bg-border motion-reduce:animate-none"
                />
              ))}
            </div>
          )}

          {report && (
            <div className="load-rise">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-dim">
                {report.date} · Attendance {report.attendance}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text">{report.summary}</p>
              <ul className="mt-3 space-y-1.5">
                {report.accomplishments.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-snug text-text-dim">
                    <span aria-hidden="true" className="mt-1 shrink-0 text-xs text-primary">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-mono text-[11px] text-text-dim">
                {report.pipeline.commits} commits · batches of {report.pipeline.batchSize} ·{" "}
                {report.pipeline.concurrency} concurrent requests
              </p>
            </div>
          )}

          {status === "idle" && (
            <p className="text-sm leading-relaxed text-text-dim">
              Press Simulate Sync to pull a day of sample commits and turn them
              into a written accomplishment report.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
