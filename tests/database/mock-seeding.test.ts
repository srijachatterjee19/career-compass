import bcrypt from 'bcrypt';

// Mock data structures that match our database schema
interface MockUser {
  id: number;
  email: string;
  password_hash: string;
  display_name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

interface MockJob {
  id: number;
  user_id: number;
  title: string;
  company: string;
  description?: string | null;
  status: string;
  location?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  url?: string | null;
  created_at: Date;
  updated_at: Date;
}

interface MockResume {
  id: number;
  user_id: number;
  job_id?: number | null;
  name: string;
  summary?: string | null;
  skills?: any[] | null;
  experience?: any[] | null;
  education?: any[] | null;
  projects?: any[] | null;
  achievements?: any[] | null;
  is_active: boolean;
  version: number;
  created_at: Date;
  updated_at: Date;
}

interface MockCoverLetter {
  id: number;
  user_id: number;
  job_id?: number | null;
  resume_id?: number | null;
  title: string;
  content: string;
  company_name?: string | null;
  job_title?: string | null;
  job_description?: string | null;
  version: number;
  created_at: Date;
  updated_at: Date;
}

// Mock seeding functions
const mockSeedUsers = async (): Promise<MockUser[]> => {
  const users: MockUser[] = [
    {
      id: 1,
      email: 'john.doe@example.com',
      password_hash: await bcrypt.hash('Password123', 12),
      display_name: 'John Doe',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      email: 'jane.smith@example.com',
      password_hash: await bcrypt.hash('Password123', 12),
      display_name: 'Jane Smith',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      email: 'admin@careercompass.com',
      password_hash: await bcrypt.hash('Admin123', 12),
      display_name: 'Admin User',
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return users;
};

const mockSeedJobs = (users: MockUser[]): MockJob[] => {
  const jobs: MockJob[] = [
    {
      id: 1,
      user_id: users[0].id,
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      description: 'Leading development of web applications',
      status: 'applied',
      salary_min: 120000,
      salary_max: 180000,
      url: 'https://techcorp.com/careers',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      user_id: users[0].id,
      title: 'Full Stack Developer',
      company: 'Startup Inc',
      location: 'Remote',
      description: 'Building modern web applications',
      status: 'interviewing',
      salary_min: 80000,
      salary_max: 120000,
      url: null,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      user_id: users[1].id,
      title: 'Product Manager',
      company: 'Enterprise Solutions',
      location: 'New York, NY',
      description: 'Managing product development lifecycle',
      status: 'applied',
      salary_min: 100000,
      salary_max: 150000,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return jobs;
};

const mockSeedResumes = (users: MockUser[], jobs: MockJob[]): MockResume[] => {
  const resumes: MockResume[] = [
    {
      id: 1,
      user_id: users[0].id,
      job_id: jobs[0].id,
      name: 'Software Engineer Resume',
      summary: 'Experienced software engineer with 5+ years in full‑stack development',
      skills: ['TypeScript', 'React', 'Node.js'],
      achievements: ['Reduced build time by 30%'],
      projects: [{ name: 'Project X', role: 'Lead Developer' }],
      experience: [
        {
          title: 'Senior Developer',
          company: 'Previous Corp',
          duration: '3 years'
        }
      ],
      education: [
        {
          degree: 'Computer Science',
          school: 'Tech University',
          year: '2018'
        }
      ],
      is_active: true,
      version: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      user_id: users[1].id,
      job_id: null,
      name: 'Product Manager Resume',
      summary: 'Product manager with expertise in agile methodologies',
      skills: ['Product Strategy', 'Agile', 'User Research'],
      projects: [{ name: 'Product Launch', role: 'Product Manager' }],
      experience: null,
      education: null,
      is_active: true,
      version: 1,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return resumes;
};

const mockSeedCoverLetters = (users: MockUser[], jobs: MockJob[], resumes: MockResume[]): MockCoverLetter[] => {
  const coverLetters: MockCoverLetter[] = [
    {
      id: 1,
      user_id: users[0].id,
      job_id: jobs[0].id,
      resume_id: resumes[0].id,
      title: 'Cover Letter for Senior Software Engineer',
      content: 'I am excited to apply for the Senior Software Engineer position...',
      company_name: 'Tech Corp',
      job_title: 'Senior Software Engineer',
      job_description: 'Leading development of web applications',
      version: 1,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return coverLetters;
};

describe('Mock Database Seeding Tests', () => {
  let users: MockUser[];
  let jobs: MockJob[];
  let resumes: MockResume[];
  let coverLetters: MockCoverLetter[];

  beforeAll(async () => {
    // Run mock seeding
    users = await mockSeedUsers();
    jobs = mockSeedJobs(users);
    resumes = mockSeedResumes(users, jobs);
    coverLetters = mockSeedCoverLetters(users, jobs, resumes);
  });

  describe('User Seeding', () => {
    it('should create the correct number of users', () => {
      expect(users).toHaveLength(3);
    });

    it('should create users with correct roles', () => {
      const roles = users.map(user => user.role);
      expect(roles).toContain('user');
      expect(roles).toContain('admin');
    });

    it('should create users with unique emails', () => {
      const emails = users.map(user => user.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(emails.length);
    });

    it('should hash passwords correctly', () => {
      users.forEach(user => {
        expect(user.password_hash).not.toBe('Password123');
        expect(user.password_hash).not.toBe('Admin123');
        expect(user.password_hash).toHaveLength(60); // bcrypt hash length
      });
    });

    it('should have valid email formats', () => {
      users.forEach(user => {
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should set timestamps correctly', () => {
      users.forEach(user => {
        expect(user.created_at).toBeInstanceOf(Date);
        expect(user.updated_at).toBeInstanceOf(Date);
        expect(user.created_at.getTime()).toBeLessThanOrEqual(Date.now());
        expect(user.updated_at.getTime()).toBeLessThanOrEqual(Date.now());
      });
    });
  });

  describe('Job Seeding', () => {
    it('should create the correct number of jobs', () => {
      expect(jobs).toHaveLength(3);
    });

    it('should create jobs with correct user relationships', () => {
      const user1 = users.find(u => u.email === 'john.doe@example.com');
      const user2 = users.find(u => u.email === 'jane.smith@example.com');
      
      const user1Jobs = jobs.filter(j => j.user_id === user1!.id);
      const user2Jobs = jobs.filter(j => j.user_id === user2!.id);
      
      expect(user1Jobs).toHaveLength(2);
      expect(user2Jobs).toHaveLength(1);
    });

    it('should create jobs with different statuses', () => {
      const statuses = jobs.map(job => job.status);
      expect(statuses).toContain('applied');
      expect(statuses).toContain('interviewing');
    });

    it('should handle optional fields correctly', () => {
      const jobWithUrl = jobs.find(j => j.url);
      const jobWithoutUrl = jobs.find(j => !j.url);
      
      expect(jobWithUrl!.url).toBe('https://techcorp.com/careers');
      expect(jobWithoutUrl!.url).toBeNull();
    });

    it('should have valid salary ranges', () => {
      jobs.forEach(job => {
        if (job.salary_min && job.salary_max) {
          expect(job.salary_min).toBeLessThanOrEqual(job.salary_max);
          expect(job.salary_min).toBeGreaterThan(0);
          expect(job.salary_max).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Resume Seeding', () => {
    it('should create the correct number of resumes', () => {
      expect(resumes).toHaveLength(2);
    });

    it('should create resumes with JSON fields', () => {
      const resumeWithSkills = resumes.find(r => r.skills);
      expect(resumeWithSkills!.skills).toEqual(['TypeScript', 'React', 'Node.js']);
    });

    it('should handle linked and unlinked resumes', () => {
      const linkedResume = resumes.find(r => r.job_id);
      const unlinkedResume = resumes.find(r => !r.job_id);
      
      expect(linkedResume!.job_id).toBeDefined();
      expect(unlinkedResume!.job_id).toBeNull();
    });

    it('should set default values correctly', () => {
      resumes.forEach(resume => {
        expect(resume.is_active).toBe(true);
        expect(resume.version).toBe(1);
        expect(resume.created_at).toBeInstanceOf(Date);
        expect(resume.updated_at).toBeInstanceOf(Date);
      });
    });

    it('should handle optional sections', () => {
      const resumeWithAllSections = resumes.find(r => r.experience && r.education);
      const resumeWithMinimalSections = resumes.find(r => !r.experience && !r.education);
      
      expect(resumeWithAllSections!.experience).toBeDefined();
      expect(resumeWithAllSections!.education).toBeDefined();
      expect(resumeWithMinimalSections!.experience).toBeNull();
      expect(resumeWithMinimalSections!.education).toBeNull();
    });
  });

  describe('Cover Letter Seeding', () => {
    it('should create cover letters with relationships', () => {
      expect(coverLetters).toHaveLength(1);
      
      const coverLetter = coverLetters[0];
      expect(coverLetter.job_id).toBeDefined();
      expect(coverLetter.resume_id).toBeDefined();
      expect(coverLetter.user_id).toBeDefined();
    });

    it('should include all required fields', () => {
      const coverLetter = coverLetters[0];
      expect(coverLetter.title).toBeDefined();
      expect(coverLetter.content).toBeDefined();
      expect(coverLetter.company_name).toBeDefined();
      expect(coverLetter.job_title).toBeDefined();
    });

    it('should have proper versioning', () => {
      coverLetters.forEach(coverLetter => {
        expect(coverLetter.version).toBe(1);
      });
    });
  });

  describe('Data Relationships', () => {
    it('should maintain referential integrity', () => {
      const user1 = users.find(u => u.email === 'john.doe@example.com');
      const user1Jobs = jobs.filter(j => j.user_id === user1!.id);
      const user1Resumes = resumes.filter(r => r.user_id === user1!.id);
      
      expect(user1Jobs).toHaveLength(2);
      expect(user1Resumes).toHaveLength(1);
    });

    it('should create proper job-resume relationships', () => {
      const job1 = jobs.find(j => j.title === 'Senior Software Engineer');
      const linkedResume = resumes.find(r => r.job_id === job1!.id);
      
      expect(linkedResume).toBeDefined();
      expect(linkedResume!.name).toBe('Software Engineer Resume');
    });

    it('should have consistent user references', () => {
      const allEntities = [...jobs, ...resumes, ...coverLetters];
      
      allEntities.forEach(entity => {
        const user = users.find(u => u.id === entity.user_id);
        expect(user).toBeDefined();
      });
    });
  });

  describe('Data Validation', () => {
    it('should have valid IDs', () => {
      const allEntities = [...users, ...jobs, ...resumes, ...coverLetters];
      
      allEntities.forEach(entity => {
        expect(entity.id).toBeGreaterThan(0);
        expect(Number.isInteger(entity.id)).toBe(true);
      });
    });

    it('should have valid timestamps', () => {
      const allEntities = [...users, ...jobs, ...resumes, ...coverLetters];
      
      allEntities.forEach(entity => {
        if (entity.created_at) {
          expect(entity.created_at).toBeInstanceOf(Date);
          expect(entity.created_at.getTime()).toBeLessThanOrEqual(Date.now());
        }
        if (entity.updated_at) {
          expect(entity.updated_at).toBeInstanceOf(Date);
          expect(entity.updated_at.getTime()).toBeLessThanOrEqual(Date.now());
        }
      });
    });

    it('should have non-empty required strings', () => {
      users.forEach(user => {
        expect(user.email).toBeTruthy();
        expect(user.display_name).toBeTruthy();
        expect(user.role).toBeTruthy();
      });

      jobs.forEach(job => {
        expect(job.title).toBeTruthy();
        expect(job.company).toBeTruthy();
        expect(job.status).toBeTruthy();
      });

      resumes.forEach(resume => {
        expect(resume.name).toBeTruthy();
      });

      coverLetters.forEach(coverLetter => {
        expect(coverLetter.title).toBeTruthy();
        expect(coverLetter.content).toBeTruthy();
      });
    });
  });

  describe('Business Logic', () => {
    it('should create realistic sample data', () => {
      // Check that we have a mix of different job statuses
      const statuses = jobs.map(j => j.status);
      expect(statuses.length).toBeGreaterThan(1);
      
      // Check that we have different user roles
      const roles = users.map(u => u.role);
      expect(roles).toContain('user');
      expect(roles).toContain('admin');
      
      // Check that we have both linked and unlinked resumes
      const linkedResumes = resumes.filter(r => r.job_id);
      const unlinkedResumes = resumes.filter(r => !r.job_id);
      expect(linkedResumes.length).toBeGreaterThan(0);
      expect(unlinkedResumes.length).toBeGreaterThan(0);
    });

    it('should maintain data consistency', () => {
      // All jobs should reference valid users
      jobs.forEach(job => {
        const user = users.find(u => u.id === job.user_id);
        expect(user).toBeDefined();
      });

      // All resumes should reference valid users
      resumes.forEach(resume => {
        const user = users.find(u => u.id === resume.user_id);
        expect(user).toBeDefined();
      });

      // All cover letters should reference valid users
      coverLetters.forEach(coverLetter => {
        const user = users.find(u => u.id === coverLetter.user_id);
        expect(user).toBeDefined();
      });
    });
  });
});
