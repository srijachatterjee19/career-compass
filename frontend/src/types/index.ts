
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
  company_description?: string; // matches database schema
  notes?: string; 
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
  job_id?: number; // Optional association with a specific job
  created_at: string; // ISO string - matches Prisma schema
  updated_at: string; // ISO string - matches Prisma schema
}

export interface CoverLetter {
  id: string;
  title: string; // Changed from 'name' to 'title' to match database schema
  jobTitle?: string;
  companyName?: string;
  content: string;
  jobDescription?: string;
  resumeSnippet?: string;
  job_id?: number; // Optional association with a specific job
  created_at: string; // ISO string - matches Prisma schema
  updated_at: string; // ISO string - matches Prisma schema
}
