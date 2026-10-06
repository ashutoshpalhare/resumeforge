import { type Resume, uid } from "./types";

export const SAMPLE_JD = `Senior Frontend Engineer — Fintech Platform

About the role
We are looking for a Senior Frontend Engineer to build fast, accessible interfaces for our payments dashboard.

Responsibilities
- Build and maintain customer-facing features using React and TypeScript
- Collaborate with design and product to ship accessible, responsive UI
- Improve web performance and Core Web Vitals across the platform
- Write unit and integration tests and review code from peers
- Mentor engineers and contribute to our design system

Requirements
- 5+ years of experience in frontend development
- Strong proficiency in React, TypeScript and modern JavaScript
- Experience with REST APIs and GraphQL
- Solid understanding of accessibility (WCAG) and responsive design
- Experience with testing frameworks such as Jest or Playwright
- Familiarity with CI/CD pipelines and Git

Nice to have
- Experience with Next.js or server-side rendering
- Knowledge of Node.js
- Experience with AWS or Docker
- Background in fintech or payments
- Experience with Storybook and design systems`;

export function createSampleResume(): Resume {
  return {
    id: uid(),
    name: "Senior Frontend — Fintech",
    template: "classic",
    updatedAt: Date.now(),
    personal: {
      fullName: "Maya Chen",
      title: "Frontend Engineer",
      email: "maya.chen@email.com",
      phone: "(415) 555-0142",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/mayachen",
      website: "mayachen.dev",
    },
    summary:
      "Frontend engineer with experience building web applications in React and TypeScript. Worked on design systems and performance improvements for consumer products.",
    experience: [
      {
        id: uid(),
        role: "Frontend Engineer",
        company: "Lumen Health",
        location: "San Francisco, CA",
        start: "2021-03",
        end: "",
        current: true,
        bullets: [
          "Responsible for building patient scheduling features in React and TypeScript used by 40,000 weekly users",
          "Worked on the component library and design system adopted by 4 product teams",
          "Reduced bundle size by 35% through code splitting, improving page load time by 1.2s",
          "Helped write Jest tests and set up CI pipelines with GitHub Actions",
        ],
      },
      {
        id: uid(),
        role: "Software Engineer",
        company: "Brightline Labs",
        location: "Oakland, CA",
        start: "2018-06",
        end: "2021-02",
        current: false,
        bullets: [
          "Built responsive marketing and onboarding pages with JavaScript and REST APIs",
          "Partnered with designers to improve accessibility, resolving 120+ WCAG issues",
          "Mentored 2 junior engineers through code review and pairing",
        ],
      },
    ],
    education: [
      {
        id: uid(),
        degree: "B.S. Computer Science",
        school: "University of California, Davis",
        location: "Davis, CA",
        start: "2014-09",
        end: "2018-06",
        details: "",
      },
    ],
    skills: [
      "React",
      "TypeScript",
      "JavaScript",
      "HTML",
      "CSS",
      "Jest",
      "REST APIs",
      "Git",
      "GitHub Actions",
      "Accessibility",
      "Figma",
    ],
    projects: [
      {
        id: uid(),
        name: "Open Budget Tracker",
        link: "github.com/mayachen/budget",
        bullets: [
          "Open-source personal finance app built with React and Node.js, 600+ GitHub stars",
        ],
      },
    ],
    certifications: [
      { id: uid(), name: "Web Accessibility Specialist (WAS)", issuer: "IAAP", date: "2022-05" },
    ],
    achievements: ["Speaker, React Bay Area Meetup — “Shipping accessible forms” (2023)"],
    custom: [],
    sectionOrder: [
      "summary",
      "experience",
      "skills",
      "projects",
      "education",
      "certifications",
      "achievements",
      "custom",
    ],
    hidden: [],
    jobDescription: SAMPLE_JD,
  };
}

export function createBlankResume(): Resume {
  const s = createSampleResume();
  return {
    ...s,
    id: uid(),
    name: "Untitled resume",
    personal: { fullName: "", title: "", email: "", phone: "", location: "", linkedin: "", website: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    custom: [],
    jobDescription: "",
  };
}
