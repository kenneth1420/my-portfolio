export interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
  current: boolean;
}

export interface Project {
  title: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
}

export interface SkillGroup {
  category: string;
  icon: string;
  skills: string[];
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
      "Developed and maintained an Attendance Recording System, improving accuracy and automating daily attendance tracking.",
      "Built a CRM system for both customers and agents, enhancing service efficiency and user experience.",
      "Developed a Document Tracking System to streamline document flow and improve processing time.",
      "Created an ERP HR Attendance module that supported employee management and HR workflows.",
      "Built an App Management platform used for internal applications and administrative tasks.",
    ],
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

export const skillGroups: SkillGroup[] = [
  {
    category: "Languages & Frameworks",
    icon: "⟨/⟩",
    skills: [
      "C#",
      "ASP.NET",
      "ASP.NET Core",
      "JavaScript",
      "TypeScript",
      "React JS",
      "React Native",
      "jQuery",
    ],
  },
  {
    category: "Web Technologies & Styling",
    icon: "◈",
    skills: [
      "HTML5",
      "CSS3",
      "Bootstrap",
      "Tailwind CSS",
      "Styled Components",
      "Material UI",
      "Ant Design",
      "Redux",
      "Zustand",
      "MobX",
      "Axios",
      "TanStack",
    ],
  },
  {
    category: "Databases",
    icon: "⬡",
    skills: ["MSSQL", "MySQL", "PostgreSQL"],
  },
  {
    category: "Tools & Platforms",
    icon: "⚙",
    skills: ["Git", "Firebase"],
  },
];

export const education: Education[] = [
  {
    level: "College",
    school: "Christian Colleges of Southeast Asia",
    period: "2014 – 2018",
    location: "Davao City, Philippines",
  },
];
