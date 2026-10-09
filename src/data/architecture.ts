/**
 * CliniQo's system diagram as data: four layers, the pieces inside each, and
 * the connections between them. The visualizer lays this out left to right.
 */

export type ArchitectureLayerId = "frontend" | "middleware" | "backend" | "database";

export interface ArchitectureLayer {
  id: ArchitectureLayerId;
  label: string;
  tech: string;
  /** Shown beside the diagram when the layer is selected. */
  summary: string;
  points: string[];
}

export interface ArchitectureNodeSpec {
  id: string;
  layer: ArchitectureLayerId;
  title: string;
  detail: string;
  /** Grid position: column is the layer, row stacks within it. */
  column: number;
  row: number;
}

export interface ArchitectureEdgeSpec {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export const architectureLayers: ArchitectureLayer[] = [
  {
    id: "frontend",
    label: "Frontend",
    tech: "React Native (Expo)",
    summary:
      "One mobile app for all four roles. What each person sees is decided by the API, not hidden in the client.",
    points: [
      "React Native (Expo) with TypeScript",
      "TanStack Query for server state",
      "Zustand for client state, Zod for validation",
    ],
  },
  {
    id: "middleware",
    label: "Middleware",
    tech: "SignalR / Redis",
    summary:
      "The real-time layer. The waiting room updates on every device the moment the queue changes.",
    points: ["SignalR hub for the live waiting room", "Redis alongside the API"],
  },
  {
    id: "backend",
    label: "Backend",
    tech: "ASP.NET Core 10 · Clean Architecture",
    summary:
      "A Clean Architecture API: dependencies point inward, so clinical rules do not depend on the database or the web framework.",
    points: [
      "133 endpoints",
      "23 clinical domain entities",
      "EF Core 10 for data access",
    ],
  },
  {
    id: "database",
    label: "Database",
    tech: "PostgreSQL RLS",
    summary:
      "Tenant isolation is enforced by PostgreSQL itself. Row-level security filters every query, so a missed WHERE clause cannot leak another clinic's data.",
    points: [
      "Row-level security across Admin, Secretary, Doctor, and Patient",
      "AWS S3 for file storage",
    ],
  },
];

export const architectureNodes: ArchitectureNodeSpec[] = [
  { id: "app", layer: "frontend", title: "Expo App", detail: "React Native · TypeScript", column: 0, row: 0 },
  { id: "query", layer: "frontend", title: "TanStack Query", detail: "Server state", column: 0, row: 1 },
  { id: "client-state", layer: "frontend", title: "Zustand + Zod", detail: "Client state · validation", column: 0, row: 2 },

  { id: "hub", layer: "middleware", title: "SignalR Hub", detail: "Live waiting room", column: 1, row: 0 },
  { id: "redis", layer: "middleware", title: "Redis", detail: "In-memory store", column: 1, row: 2 },

  // Infrastructure sits beside Application, not under Domain: it implements
  // the Application layer's interfaces and is the only piece that touches
  // storage.
  { id: "api", layer: "backend", title: "API", detail: "133 endpoints", column: 2, row: 0 },
  { id: "application", layer: "backend", title: "Application", detail: "Use cases", column: 2, row: 1 },
  { id: "domain", layer: "backend", title: "Domain", detail: "23 clinical entities", column: 2, row: 2 },
  { id: "infrastructure", layer: "backend", title: "Infrastructure", detail: "EF Core 10", column: 3, row: 1 },

  { id: "postgres", layer: "database", title: "PostgreSQL", detail: "Row-level security · 4 roles", column: 4, row: 1 },
  { id: "s3", layer: "database", title: "AWS S3", detail: "File storage", column: 4, row: 2 },
];

export const architectureEdges: ArchitectureEdgeSpec[] = [
  { id: "app-query", source: "app", target: "query" },
  { id: "query-state", source: "query", target: "client-state" },
  { id: "app-hub", source: "app", target: "hub", label: "WebSocket" },
  { id: "query-api", source: "query", target: "api", label: "REST" },
  { id: "hub-api", source: "hub", target: "api" },
  { id: "redis-api", source: "redis", target: "api" },
  { id: "api-application", source: "api", target: "application" },
  { id: "application-domain", source: "application", target: "domain" },
  { id: "application-infrastructure", source: "application", target: "infrastructure" },
  { id: "infrastructure-postgres", source: "infrastructure", target: "postgres", label: "SQL + RLS" },
  { id: "infrastructure-s3", source: "infrastructure", target: "s3" },
];
