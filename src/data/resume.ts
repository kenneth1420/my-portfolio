export interface RoleMetric {
  value: string;
  label: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
  current: boolean;
  /** Headline figures for the role's tab. Only numbers the resume supports. */
  metrics: RoleMetric[];
  /** One line on what the systems were and how far the role reached. */
  scope: string;
}

export interface Project {
  title: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
}

/** Curation layer over `projects` for a bento of `BentoCard` tiles. */
export interface FeaturedWork {
  /** Must match a `projects` title exactly; resolved at module load. */
  title: string;
  /** Short line under the title: what kind of system it is. */
  kind: string;
  stack: string[];
  /** Enterprise systems take two bento columns; apps take one. */
  span: "wide" | "narrow";
}

export type FeaturedProject = Project & FeaturedWork;

export interface SkillGroup {
  category: string;
  skills: string[];
}

/** The filter bar's buckets. A skill can sit in more than one. */
export type SkillCategory = "frontend" | "backend" | "data" | "mobile";

export interface Skill {
  name: string;
  /** Resume heading the skill is listed under. */
  group: string;
  categories: SkillCategory[];
  /**
   * Year the skill first shows up in the work history; the matrix turns it
   * into "N+ years". Left out where the history gives no start date, so the
   * page never states a figure nobody can trace.
   */
  since?: number;
  /** Titles of projects built with it, shown in the skill's detail card. */
  projects: string[];
}

/** One of the three builds the Projects section leads with. */
export interface ShowcaseProject {
  id: "cliniqo" | "dar" | "dcwd-billing";
  title: string;
  kind: string;
  description: string;
  tech: string[];
  highlights: string[];
  metrics: RoleMetric[];
  /** Which live widget sits beside the copy, if any. */
  interactive: "architecture" | "dar-simulator" | null;
}

export interface Education {
  level: string;
  school: string;
  period: string;
  location: string;
}

export const experiences: Experience[] = [
  {
    role: "Full Stack Software Engineer",
    company: "Davao City Water District",
    period: "Dec 2021 – Present",
    location: "Davao City, Philippines",
    highlights: [
      "Built the New Service Connection module of the Billing & Collection Application end to end: 180 React/TypeScript files, about 20 ASP.NET Core services, and a Leaflet GIS meter picker.",
      "Developed and maintained an Attendance Recording System, improving accuracy and automating daily attendance tracking.",
      "Built a CRM system for both customers and agents, enhancing service efficiency and user experience.",
      "Developed a Document Tracking System to streamline document flow and improve processing time.",
      "Created an ERP HR Attendance module that supported employee management and HR workflows.",
      "Built an App Management platform used for internal applications and administrative tasks.",
    ],
    metrics: [
      { value: "180", label: "React / TS files in the NSC module" },
      { value: "~20", label: "ASP.NET Core services" },
      { value: "6", label: "Internal systems shipped" },
    ],
    scope:
      "React 19 and TypeScript front ends over ASP.NET Core 8 services, with EF Core, PostgreSQL, Redis, Quartz.NET jobs, and Leaflet maps.",
    current: true,
  },
  {
    role: "Front End and Mobile Developer",
    company: "The Guild Ltd.",
    period: "Jan 2021 – Oct 2021",
    location: "Davao City, Philippines",
    highlights: [
      "Developed the Mentor Mobile App, improving accessibility and user engagement.",
      "Built the Admin Portal for monitoring and managing mentorship activities.",
    ],
    metrics: [
      { value: "2", label: "Products shipped" },
      { value: "10", label: "Months on the team" },
    ],
    scope:
      "A React Native mobile app for mentors and mentees, plus the web admin portal that monitors it.",
    current: false,
  },
  {
    role: "Full Stack Developer",
    company: "Freelance Projects",
    period: "Aug 2020 – Apr 2024",
    location: "Davao City, Philippines",
    highlights: [
      "Delivered five end-to-end client projects across mobile, web, and specialized domains — education, voice AI, field operations, healthcare, and government data.",
      "Owned each engagement from requirements through delivery, covering both frontend interfaces and backend APIs.",
    ],
    metrics: [
      { value: "5", label: "Client projects delivered" },
      { value: "5", label: "Domains covered" },
    ],
    scope:
      "Solo, end-to-end builds: mobile apps, web dashboards, and the APIs behind them, from requirements through delivery.",
    current: false,
  },
  {
    role: "Full Stack Software Engineer",
    company: "Aquila",
    period: "Nov 2019 – Jul 2022",
    location: "Davao City, Philippines",
    highlights: [
      "Developed modules and features for the Aquila Clinic Management System, supporting patient records, scheduling, and clinic operations.",
      "Implemented frontend interfaces and backend APIs to improve workflow efficiency.",
    ],
    metrics: [
      { value: "3", label: "Core areas: records, scheduling, operations" },
    ],
    scope:
      "Frontend interfaces and backend APIs for a clinic management system.",
    current: false,
  },
  {
    role: "Full Stack Developer",
    company: "Iekzeed Software Development Co.",
    period: "Aug 2018 – Feb 2020",
    location: "Davao City, Philippines",
    highlights: [
      "Developed Akruals ERP Software modules including accounting, inventory, and reporting features.",
      "Built a CCTV Monitoring Web Application, enabling real-time monitoring and centralized management.",
      "Developed JCI CMS Web Application supporting content publishing and organizational workflows.",
      "Created and maintained the Iekzeed Company Website, improving brand visibility and client reach.",
    ],
    metrics: [
      { value: "4", label: "Products shipped" },
      { value: "3", label: "ERP areas: accounting, inventory, reporting" },
    ],
    scope:
      "ERP modules, a real-time CCTV monitoring app, a CMS, and the company website.",
    current: false,
  },
];

export const projects: Project[] = [
  {
    title: "Attendance Recording System",
    company: "Davao City Water District",
    period: "Dec 2021 – Present",
    description:
      "Attendance platform that improved recording accuracy and automated daily attendance tracking across the utility.",
    tags: ["Enterprise", "Automation", "Web App"],
  },
  {
    title: "Customer & Agent CRM",
    company: "Davao City Water District",
    period: "Dec 2021 – Present",
    description:
      "CRM serving both customers and agents, enhancing service efficiency and the day-to-day user experience.",
    tags: ["Enterprise", "CRM", "Web App"],
  },
  {
    title: "Document Tracking System",
    company: "Davao City Water District",
    period: "Dec 2021 – Present",
    description:
      "Document routing and tracking system that streamlined document flow and improved processing time.",
    tags: ["Enterprise", "Workflow", "Web App"],
  },
  {
    title: "ERP HR Attendance Module",
    company: "Davao City Water District",
    period: "Dec 2021 – Present",
    description:
      "HR attendance module within the ERP suite, supporting employee management and HR workflows.",
    tags: ["ERP", "HR", "Module"],
  },
  {
    title: "App Management Platform",
    company: "Davao City Water District",
    period: "Dec 2021 – Present",
    description:
      "Internal platform used to manage organizational applications and administrative tasks.",
    tags: ["Enterprise", "Admin", "Platform"],
  },
  {
    title: "Reading App for Children",
    company: "Freelance",
    period: "Jan 2024 – Mar 2024",
    description:
      "Interactive reading application designed to improve early learning engagement with fun, child-friendly UI and gamified content.",
    tags: ["Mobile", "React Native", "Education"],
  },
  {
    title: "Chess Voice Recognition App",
    company: "Freelance",
    period: "Feb 2023 – Apr 2023",
    description:
      "Mobile chess game with voice command integration, enabling users to control gameplay hands-free using natural speech.",
    tags: ["Mobile", "Voice AI", "Game"],
  },
  {
    title: "Technician App & Web Platform",
    company: "Freelance",
    period: "Jan 2023 – Apr 2024",
    description:
      "Full-stack platform for job assignments, field technician tracking, and reporting — mobile app for technicians and web dashboard for managers.",
    tags: ["Full Stack", "React", "ASP.NET"],
  },
  {
    title: "Clinic Finder Web Application",
    company: "Freelance",
    period: "Jan 2021 – Feb 2021",
    description:
      "Web app helping users discover nearby clinics and book appointments online with real-time reservation management.",
    tags: ["Web App", "React", "Booking System"],
  },
  {
    title: "Census Web Application",
    company: "Freelance",
    period: "Aug 2020 – Sep 2020",
    description:
      "Data collection and statistical reporting system to support census operations with structured data entry and export.",
    tags: ["Web App", "Data", "Reporting"],
  },
  {
    title: "Mentor Mobile App",
    company: "The Guild Ltd.",
    period: "Jan 2021 – Oct 2021",
    description:
      "Mentorship mobile app built to improve accessibility and drive user engagement between mentors and mentees.",
    tags: ["Mobile", "React Native", "Mentorship"],
  },
  {
    title: "Mentor Admin Portal",
    company: "The Guild Ltd.",
    period: "Jan 2021 – Oct 2021",
    description:
      "Admin portal for monitoring and managing mentorship activities across the platform.",
    tags: ["Web App", "Admin", "Dashboard"],
  },
  {
    title: "Aquila Clinic Management System",
    company: "Aquila",
    period: "Nov 2019 – Jul 2022",
    description:
      "Clinic management modules covering patient records, scheduling, and clinic operations, spanning frontend interfaces and backend APIs.",
    tags: ["Healthcare", "Full Stack", "Web App"],
  },
  {
    title: "Akruals ERP Software",
    company: "Iekzeed Software Development Co.",
    period: "Aug 2018 – Feb 2020",
    description:
      "ERP modules spanning accounting, inventory, and reporting features for business operations.",
    tags: ["ERP", "Accounting", "Inventory"],
  },
  {
    title: "CCTV Monitoring Web Application",
    company: "Iekzeed Software Development Co.",
    period: "Aug 2018 – Feb 2020",
    description:
      "Real-time CCTV monitoring application enabling centralized management of camera feeds.",
    tags: ["Web App", "Real-time", "Monitoring"],
  },
  {
    title: "JCI CMS Web Application",
    company: "Iekzeed Software Development Co.",
    period: "Aug 2018 – Feb 2020",
    description:
      "Content management system supporting content publishing and organizational workflows.",
    tags: ["CMS", "Web App", "Publishing"],
  },
  {
    title: "Iekzeed Company Website",
    company: "Iekzeed Software Development Co.",
    period: "Aug 2018 – Feb 2020",
    description:
      "Company website built and maintained to improve brand visibility and client reach.",
    tags: ["Website", "Marketing", "Frontend"],
  },
];

const CLINIQO = "CliniQo";
const DAR = "DAR Report Generator";
const BILLING = "DCWD Billing & Collection";

/**
 * Every skill on the page, in resume order.
 *
 * `since` comes from the work history, not from memory: 2018 is the first
 * full-stack role (C#, ASP.NET Core, React, React Native), 2021 is the start
 * of the current role and the stack it runs on. Skills first used on personal
 * projects carry no year. Correct any of these here and the matrix follows.
 */
export const skills: Skill[] = [
  // Languages & Frameworks
  { name: "C#", group: "Languages & Frameworks", categories: ["backend"], since: 2018, projects: [CLINIQO, BILLING, "Attendance Recording System"] },
  { name: "ASP.NET Core (.NET 8/10)", group: "Languages & Frameworks", categories: ["backend"], since: 2018, projects: [CLINIQO, BILLING, "Technician App & Web Platform"] },
  { name: "EF Core", group: "Languages & Frameworks", categories: ["backend", "data"], since: 2021, projects: [CLINIQO, BILLING] },
  { name: "JavaScript", group: "Languages & Frameworks", categories: ["frontend", "mobile"], since: 2018, projects: [] },
  { name: "TypeScript", group: "Languages & Frameworks", categories: ["frontend", "mobile"], since: 2021, projects: [CLINIQO, DAR, BILLING] },
  { name: "React JS", group: "Languages & Frameworks", categories: ["frontend"], since: 2018, projects: [DAR, BILLING, "Customer & Agent CRM"] },
  { name: "React Native (Expo)", group: "Languages & Frameworks", categories: ["mobile"], since: 2018, projects: [CLINIQO, "Mentor Mobile App", "Reading App for Children"] },
  { name: "Next.js", group: "Languages & Frameworks", categories: ["frontend"], projects: ["This portfolio"] },

  // Web & State
  { name: "Redux", group: "Web & State", categories: ["frontend"], projects: [] },
  { name: "Zustand", group: "Web & State", categories: ["frontend", "mobile"], since: 2021, projects: [CLINIQO, DAR, BILLING] },
  { name: "MobX", group: "Web & State", categories: ["frontend"], projects: [] },
  { name: "Axios", group: "Web & State", categories: ["frontend", "mobile"], projects: [] },
  { name: "TanStack Query", group: "Web & State", categories: ["frontend", "mobile"], since: 2021, projects: [CLINIQO, DAR, BILLING] },
  { name: "Zod", group: "Web & State", categories: ["frontend", "mobile"], projects: [CLINIQO, "This portfolio"] },
  { name: "Tailwind CSS", group: "Web & State", categories: ["frontend"], projects: [DAR, "This portfolio"] },
  { name: "shadcn/ui", group: "Web & State", categories: ["frontend"], projects: ["This portfolio"] },
  { name: "Ant Design", group: "Web & State", categories: ["frontend"], since: 2021, projects: [BILLING] },

  // Backend & Real-time
  { name: "REST APIs", group: "Backend & Real-time", categories: ["backend"], since: 2018, projects: [CLINIQO, BILLING] },
  { name: "Clean Architecture", group: "Backend & Real-time", categories: ["backend"], projects: [CLINIQO] },
  { name: "SignalR", group: "Backend & Real-time", categories: ["backend"], projects: [CLINIQO] },
  { name: "Redis", group: "Backend & Real-time", categories: ["backend", "data"], since: 2021, projects: [CLINIQO, BILLING] },
  { name: "Quartz.NET", group: "Backend & Real-time", categories: ["backend"], since: 2021, projects: [BILLING] },
  { name: "FluentValidation", group: "Backend & Real-time", categories: ["backend"], projects: [] },
  { name: "JWT / Identity", group: "Backend & Real-time", categories: ["backend"], projects: [] },

  // Databases & Tools
  { name: "PostgreSQL", group: "Databases & Tools", categories: ["data"], since: 2021, projects: [CLINIQO, BILLING] },
  { name: "MSSQL", group: "Databases & Tools", categories: ["data"], since: 2018, projects: ["Attendance Recording System", "Customer & Agent CRM"] },
  { name: "MySQL", group: "Databases & Tools", categories: ["data"], projects: [] },
  { name: "Supabase", group: "Databases & Tools", categories: ["data", "backend"], projects: [DAR] },
  { name: "AWS S3", group: "Databases & Tools", categories: ["data"], projects: [CLINIQO] },
  { name: "Firebase", group: "Databases & Tools", categories: ["data", "mobile"], projects: [] },
  { name: "Git", group: "Databases & Tools", categories: ["data"], since: 2018, projects: [] },
  { name: "xUnit", group: "Databases & Tools", categories: ["backend"], projects: [] },
  { name: "Jest", group: "Databases & Tools", categories: ["frontend"], projects: [] },
  { name: "Docker", group: "Databases & Tools", categories: ["data"], projects: ["This portfolio"] },
];

/** The same skills under their resume headings, for the printable resume. */
export const skillGroups: SkillGroup[] = [
  ...new Set(skills.map((skill) => skill.group)),
].map((category) => ({
  category,
  skills: skills
    .filter((skill) => skill.group === category)
    .map((skill) => skill.name),
}));

export const education: Education[] = [
  {
    level: "College",
    school: "Christian Colleges of Southeast Asia",
    period: "2014 – 2018",
    location: "Davao City, Philippines",
  },
];

/**
 * The three builds the Projects section leads with, in page order. The first
 * two carry a live widget; the third stands on its figures.
 */
export const showcaseProjects: ShowcaseProject[] = [
  {
    id: "cliniqo",
    title: "CliniQo",
    kind: "Multi-Tenant Clinic Management Platform",
    description:
      "A clinic platform where every tenant's data is fenced off in the database itself, with a waiting room that updates in real time for staff and patients.",
    tech: [
      ".NET 10",
      "ASP.NET Core",
      "EF Core 10",
      "PostgreSQL",
      "Redis",
      "SignalR",
      "AWS S3",
      "React Native (Expo)",
      "TypeScript",
      "TanStack Query",
      "Zustand",
      "Zod",
    ],
    highlights: [
      "133-endpoint Clean Architecture API",
      "23 clinical domain entities",
      "Row-level security across 4 roles: Admin, Secretary, Doctor, Patient",
      "Real-time waiting room over SignalR",
    ],
    metrics: [
      { value: "133", label: "API endpoints" },
      { value: "23", label: "Domain entities" },
      { value: "4", label: "Roles under RLS" },
    ],
    interactive: "architecture",
  },
  {
    id: "dar",
    title: "DAR",
    kind: "Daily Accomplishment Report Generator",
    description:
      "Turns a day of GitHub commits and attendance records into a written accomplishment report, on a schedule, without hitting API rate limits.",
    tech: [
      "React 19",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "TanStack Query",
      "Zustand",
      "Supabase",
      "Deno Edge Functions",
      "OpenAI API",
      "GitHub API",
      "Google Sheets API",
    ],
    highlights: [
      "AI reports that match GitHub commits against attendance",
      "Rate-limit aware, resumable analyzer: batches of 200, 5 concurrent requests",
      "pg_cron automation",
    ],
    metrics: [
      { value: "200", label: "Commits per batch" },
      { value: "5", label: "Concurrent requests" },
    ],
    interactive: "dar-simulator",
  },
  {
    id: "dcwd-billing",
    title: "Billing & Collection Application",
    kind: "Davao City Water District · New Service Connection Module",
    description:
      "The full New Service Connection pipeline for a public water utility, including a map-based picker for placing meters.",
    tech: [
      "React 19",
      "TypeScript",
      "Ant Design",
      "TanStack Query",
      "Zustand",
      "ASP.NET Core 8",
      "EF Core",
      "PostgreSQL",
      "Redis",
      "Quartz.NET",
      "Leaflet",
    ],
    highlights: [
      "Full New Service Connection pipeline",
      "Leaflet GIS meter picker",
    ],
    metrics: [
      { value: "180", label: "React / TS files" },
      { value: "~20", label: "ASP.NET services" },
    ],
    interactive: null,
  },
];

/** Earlier work, listed in the archive beneath the three showcase builds. */
export const archivedProjects = projects;

/** Headline project count: the archive plus the three showcase builds. */
export const totalProjects = projects.length + showcaseProjects.length;
