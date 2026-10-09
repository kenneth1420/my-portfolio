"use server";

import {
  DAR_BATCH_SIZE,
  DAR_CONCURRENCY,
  darAttendance,
  darCommits,
  type DarReport,
} from "@/src/data/dar";
import {
  contactSchema,
  type ContactFieldErrors,
  type ContactResult,
} from "@/src/lib/contact.schema";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Re-validates a contact message on the server.
 *
 * Server Actions are plain POST endpoints, so the input is typed `unknown`
 * and parsed here regardless of what the form checked. Nothing is stored or
 * sent: on success the cleaned values go back to the browser, which opens
 * the visitor's own email app with them. The action has no side effects, so
 * it needs no rate limit.
 */
export async function validateContactMessage(
  input: unknown,
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: ContactFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && field in contactSchema.shape) {
        fieldErrors[field as keyof ContactFieldErrors] ??= issue.message;
      }
    }
    return {
      ok: false,
      message: "Some fields need another look.",
      fieldErrors,
    };
  }

  return { ok: true, values: parsed.data };
}

/**
 * Stands in for DAR's analyzer for the portfolio demo. It takes no input and
 * calls nothing external: it waits about as long as a model call would, then
 * returns a report written for the sample commits in `data/dar.ts`.
 */
export async function simulateDarSync(): Promise<DarReport> {
  await wait(1400);

  return {
    date: "Sample workday",
    attendance: `${darAttendance.timeIn} – ${darAttendance.timeOut}`,
    summary:
      "Moved the New Service Connection flow forward on both sides: a new applicant checklist step and a map fix in the web app, and inspector assignment with tests in the API.",
    accomplishments: [
      "Added the applicant requirements checklist step to the NSC flow.",
      "Fixed the meter pin so it stays inside the service area.",
      "Built and tested the endpoint that assigns a field inspector.",
      "Shared query invalidation keys across the NSC views.",
      "Scheduled a nightly reminder job for unpaid applications.",
    ],
    pipeline: {
      commits: darCommits.length,
      batchSize: DAR_BATCH_SIZE,
      concurrency: DAR_CONCURRENCY,
    },
  };
}
