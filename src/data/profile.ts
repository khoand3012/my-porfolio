export type WorkItem = {
  id: string;
  company: string;
  title: string;
  context: string;
  bullets: string[];
  tech: string[];
  note?: string;
};

export type Role = {
  company: string;
  title: string;
  start: string;
  end: string;
};

export type Education = {
  degree: string;
  school: string;
  end: string;
};

export type SkillGroup = { label: string; items: string[] };

export type Credential = { name: string; issued: string; url?: string };

export const profile = {
  name: "Nguyen Duong Khoa",
  headline: "Senior Frontend Engineer",
  description: "React · TypeScript · Accessible UI & Design Systems",
  availability: "Freelance & full-time · remote or hybrid (VN)",
  availabilityLong:
    "Open to freelance and full-time · remote (global) or hybrid (Vietnam)",
  summary:
    "Frontend engineer with 6+ years building production React and " +
    "TypeScript applications, from a multi-tenant storefront platform to a " +
    "reusable component library adopted across two Electrolux brand sites.",
  email: "khoa.duongnguyen3022@gmail.com",
  phone: "(+84) 914 510 584",
  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/khoand3012/" },
    { label: "GitHub", url: "https://github.com/khoand3012" },
  ],
};

export const nav: { label: string; href: string }[] = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export const work: WorkItem[] = [
  {
    id: "selless",
    company: "Crossian",
    title: "Selless Storefront System",
    context: "Multi-tenant storefront engine, comparable to Shopify",
    bullets: [
      "Modernised the front end to the latest React and Next.js and migrated the legacy styling system to a structured CSS architecture, improving performance, maintainability and developer experience.",
      "Cut incident recovery time from ~15 minutes to under 30 seconds by redesigning low-traffic product page deployment and traffic isolation, and eliminated recurring memory spikes and server crashes during bulk content updates.",
      "Designed and shipped A/B testing features, owning the experimentation lifecycle from scoping to results analysis.",
      "Led a data pipeline migration from polling to a real-time, event-driven system on Apache Kafka, improving data freshness for every storefront tenant.",
      "Wrote automated end-to-end tests with Playwright and Cypress.",
    ],
    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "TanStack",
      "Playwright",
      "Cypress",
      "Apache Kafka",
      "Node.js",
      "AWS S3",
    ],
  },
  {
    id: "shophelp",
    company: "Crossian",
    title: "Shophelp App",
    context: "iOS-optimised mobile storefront (Next.js web app)",
    bullets: [
      "Owned the end-to-end checkout flow independently, including REST API integration with backend services and payment providers.",
      "Integrated Stripe, Apple Pay and PayPal into a conversion-optimised mobile checkout, with attention to speed and drop-off reduction.",
      "Wrote automated end-to-end tests with Playwright and Cypress.",
    ],
    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "TanStack",
      "Playwright",
      "Cypress",
      "Stripe",
      "Apple Pay",
      "PayPal",
    ],
  },
  {
    id: "component-library",
    company: "Niteco",
    title: "React Component Library, Electrolux EU & AEG",
    context: "Shared design-system toolkit",
    bullets: [
      "Built a reusable React component library from Figma designs, adopted across the Electrolux EU and AEG e-commerce websites, accelerating feature delivery across teams.",
      "Documented each component in Storybook so designers and developers across teams could consume and extend components with confidence.",
      "Architected the shell application for a micro-frontend architecture using Next.js and Webpack Module Federation, enabling independently deployed front-end modules across product teams.",
      "Wrote automated end-to-end tests with Playwright and Cypress.",
    ],
    tech: [
      "Next.js",
      "React.js",
      "TypeScript",
      "Storybook",
      "Playwright",
      "Cypress",
      "Module Federation",
      "Sass",
    ],
  },
  {
    id: "levande-sg",
    company: "Niteco",
    title: "Levande SG",
    context: "Singapore's first appliance platform (Electrolux)",
    bullets: [
      "Delivered a high-performance Vue.js e-commerce platform integrating with multiple external systems and APIs, translating Figma designs into pixel-accurate, accessible UI and collaborating with backend engineers on API integration.",
    ],
    tech: ["Vue.js", "EPiServer/Optimizely CMS"],
    note: "2023 SBR Technology Excellence Award",
  },
  {
    id: "dynamic-yield-optimizely",
    company: "Niteco",
    title: "Dynamic Yield / Optimizely",
    context: "A/B testing and personalisation",
    bullets: [
      "Built A/B tests, personalisation campaigns and recommendation modules for Electrolux and AEG sites across multiple markets, owning the lifecycle from scoping to results analysis.",
    ],
    tech: ["React.js", "Dynamic Yield", "Optimizely Web Experimentation"],
  },
  {
    id: "power-plant-energy-system",
    company: "Toshiba Software Development Vietnam",
    title: "Power Plant Energy System",
    context: "Nuclear power plant equipment monitoring",
    bullets: [
      "Built a web application for real-time monitoring and management of critical equipment, with live status displays, and authored detailed technical design documentation for current and future engineers.",
    ],
    tech: ["React.js", "Node.js", "Chart.js", "PostgreSQL"],
  },
];

export const experience: Role[] = [
  {
    company: "Crossian",
    title: "Frontend Engineer",
    start: "Apr 2025",
    end: "Sep 2026",
  },
  {
    company: "Niteco",
    title: "Frontend Developer",
    start: "Oct 2022",
    end: "Apr 2025",
  },
  {
    company: "Toshiba Software Development Vietnam",
    title: "Software Engineer",
    start: "Dec 2020",
    end: "Oct 2022",
  },
];

export const education: Education = {
  degree: "B.Sc. Software Engineering",
  school: "Hanoi University of Science and Technology (HUST)",
  end: "Jul 2020",
};

export const skills: SkillGroup[] = [
  {
    label: "Frontend",
    items: [
      "React.js (hooks, composition)",
      "TypeScript",
      "JavaScript (ES6+)",
      "Next.js",
    ],
  },
  {
    label: "HTML & CSS",
    items: [
      "Semantic HTML5",
      "CSS3",
      "Sass/SCSS",
      "CSS Modules",
      "responsive design",
    ],
  },
  {
    label: "Design Systems",
    items: [
      "Component libraries",
      "Storybook",
      "Figma-to-code",
      "Module Federation",
    ],
  },
  {
    label: "APIs & Data",
    items: ["REST/JSON APIs", "TanStack", "Node.js", "Chart.js", "PostgreSQL"],
  },
  {
    label: "Testing",
    items: [
      "Playwright",
      "Cypress",
      "Jest",
      "unit/integration/E2E",
      "Postman",
    ],
  },
  {
    label: "Build & CI/CD",
    items: [
      "Vite",
      "Webpack",
      "GitHub Actions",
      "Azure DevOps",
      "Git workflows",
    ],
  },
  {
    label: "Cloud, AI & Language",
    items: ["AWS S3", "Claude Code", "GitHub Copilot", "English (IELTS 7.5)"],
  },
];

export const credentials: Credential[] = [
  { name: "IELTS 7.5", issued: "" },
  {
    name: "Optimizely Web Experimentation Expert",
    issued: "Oct 3, 2024",
    url: "https://www.credly.com/badges/2f01cb70-ba22-4547-8c37-dbd908ca7ed6/linked_in_profile",
  },
];
