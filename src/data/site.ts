import { totalProjects } from "./resume";

export const site = {
  name: "Kenneth Lariosa",
  initials: "KL",
  role: "Mid-to-Senior Full-Stack Engineer",
  tagline:
    "Building robust enterprise systems & scalable multi-tenant architectures with ASP.NET Core, React, TypeScript, and PostgreSQL.",
  url: "https://kennethlariosa.vercel.app",
  location: {
    city: "Davao City",
    region: "Davao del Sur",
    country: "Philippines",
    label: "Davao City, Philippines",
  },
  email: "kennethlariosa14@gmail.com",
  phone: "+63 946 036 4852",
  phoneHref: "tel:+639460364852",
  linkedin: "https://www.linkedin.com/in/kenneth-lariosa-dev",
  github: "https://github.com/kenneth1420",
  resumePath: "/resume.pdf",
  yearsExperience: 7,
  summary:
    "I'm a passionate and detail-oriented Full-Stack Developer who enjoys building reliable, high-quality web and mobile applications. I've worked across the full stack using modern tools and frameworks, and I thrive in collaborative environments where I can learn from others and share ideas.",
  summarySecondary:
    "I'm looking for a role where I can help build meaningful products, grow with new technologies, and make a positive impact through clean, maintainable, and thoughtful code.",
} as const;

/** Headline figures, shared by the hero proof strip and the About stats. */
export const stats = [
  { value: site.yearsExperience, suffix: "+", label: "Years Experience" },
  { value: totalProjects, suffix: "", label: "Projects Delivered" },
  { value: 5, suffix: "", label: "Companies Served" },
  { value: 3, suffix: "", label: "Tech Stacks" },
] as const;

/**
 * The hero's metrics row. `unit` is the word that scrambles in beside the
 * counting figure; `detail` is an optional qualifier beneath the label.
 */
export const heroStats = [
  {
    value: 180,
    suffix: "+",
    unit: "Files",
    label: "React / TS Frontend Files Built",
  },
  {
    value: 133,
    suffix: "",
    unit: "Endpoints",
    label: "API Endpoints",
    detail: "& Multi-Tenant RLS",
  },
  {
    value: 128,
    suffix: "",
    unit: "Tests",
    label: "Integration Tests Passed",
  },
] as const;

export const seoDescription = `${site.role} in Davao City, Philippines with ${site.yearsExperience}+ years building enterprise systems and multi-tenant platforms across ASP.NET Core, React, TypeScript, and PostgreSQL. ${totalProjects} delivered projects spanning ERP, CRM, healthcare, and government systems.`;

export const seoKeywords = [
  "Kenneth Lariosa",
  "Mid-to-Senior Full-Stack Engineer",
  "Full Stack Engineer",
  "Full Stack Developer",
  "Software Engineer",
  "Davao City",
  "Philippines",
  "C#",
  "ASP.NET Core",
  "React",
  "React Native",
  "TypeScript",
  "Next.js",
  "PostgreSQL",
  "MSSQL",
];
