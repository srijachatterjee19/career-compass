
export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export type JobStatus = 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  status: string; // Changed from JobStatus to string
  applicationDate?: string; // ISO string
  deadline?: string; // ISO string
  notes?: string;
  companyDescription?: string;
  referrals?: string;
  checklist?: ChecklistItem[];
  roleDetails?: string;
}

export interface ExperienceEntry {
  id: string; // For React key prop
  jobTitle: string;
  companyName: string;
  dates: string; // e.g., "Jan 2020 - Present" or "2018 - 2020"
  description: string;
}

export interface EducationEntry {
  id: string; // For React key prop
  degree: string;
  institution: string;
  graduationYear: string;
  details?: string;
}

export interface TextEntry {
  id: string;
  value: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  description: string;
}

export interface Resume {
  id: string;
  name: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: TextEntry[];
  projects: ProjectEntry[];
  achievements: TextEntry[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CoverLetter {
  id: string;
  name: string;
  jobTitle?: string;
  companyName?: string;
  content: string;
  jobDescription?: string;
  resumeSnippet?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
