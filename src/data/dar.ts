/**
 * Sample data for the DAR simulator. Everything here is made up for the
 * demo: the repositories, commits, and attendance record are not real.
 */

export interface DarCommit {
  sha: string;
  repo: string;
  time: string;
  message: string;
}

export interface DarReport {
  date: string;
  attendance: string;
  summary: string;
  accomplishments: string[];
  /** How the real analyzer would have fetched this many commits. */
  pipeline: { commits: number; batchSize: number; concurrency: number };
}

export const darCommits: DarCommit[] = [
  { sha: "a41f9c2", repo: "billing-web", time: "08:42", message: "feat(nsc): add applicant requirements checklist step" },
  { sha: "7be03d1", repo: "billing-web", time: "09:57", message: "fix(nsc): keep meter pin inside service area bounds" },
  { sha: "c9d2e77", repo: "billing-api", time: "11:15", message: "feat(inspection): endpoint to assign field inspector" },
  { sha: "13aa5f0", repo: "billing-api", time: "13:31", message: "test(inspection): integration tests for assignment rules" },
  { sha: "e0b7714", repo: "billing-web", time: "15:08", message: "refactor(query): share invalidation keys across NSC views" },
  { sha: "5f2c8ab", repo: "billing-api", time: "16:46", message: "chore(jobs): schedule nightly unpaid-application reminder" },
];

export const darAttendance = { timeIn: "08:03", timeOut: "17:12" };

/** Fixed analyzer settings the real project uses. */
export const DAR_BATCH_SIZE = 200;
export const DAR_CONCURRENCY = 5;
