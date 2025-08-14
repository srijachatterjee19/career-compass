
export interface User {
  id: number;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export type JobStatus = 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface Job {
  id: number; // Changed to number to match database
  title: string;
  company: string;
  url?: string;
  status: string;
  application_date?: string; // ISO string - matches database schema
  deadline?: string; // ISO string - matches database schema
  notes?: string;
  company_description?: string; // matches database schema
  referrals?: string;
  role_details?: string; // matches database schema
  location?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  created_at: string;
  updated_at: string;
  user_id: number;
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
