export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "achievements"
  | "custom";

export type TemplateId = "classic" | "modern" | "compact";

export interface Personal {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM or ""
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  start: string;
  end: string;
  details: string;
}

export interface Project {
  id: string;
  name: string;
  link: string;
  bullets: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: string[];
}

export interface Resume {
  id: string;
  name: string;
  template: TemplateId;
  updatedAt: number;
  personal: Personal;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  achievements: string[];
  custom: CustomSection[];
  sectionOrder: SectionKey[];
  hidden: SectionKey[];
  jobDescription: string;
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements",
  custom: "Additional",
};

export const uid = () => Math.random().toString(36).slice(2, 10);
