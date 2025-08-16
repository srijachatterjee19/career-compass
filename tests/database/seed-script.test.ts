import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Mock the seed script functionality
const mockSeedScript = async () => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Clear existing data
    await prisma.coverLetter.deleteMany();
    await prisma.resume.deleteMany();
    await prisma.job.deleteMany();
    await prisma.user.deleteMany();

    // Create sample users (mimicking seed.ts)
    const user1 = await prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password_hash: await bcrypt.hash('Password123', 12),
        display_name: 'John Doe',
        role: 'user'
      }
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        password_hash: await bcrypt.hash('Password123', 12),
        display_name: 'Jane Smith',
        role: 'user'
      }
    });

    const admin = await prisma.user.create({
      data: {
        email: 'admin@careercompass.com',
        password_hash: await bcrypt.hash('Admin123', 12),
        display_name: 'Admin User',
        role: 'admin'
      }
    });

    // Create sample jobs
    const job1 = await prisma.job.create({
      data: {
        user_id: user1.id,
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        description: 'Leading development of web applications',
        status: 'applied',
        salary_min: 120000,
        salary_max: 180000,
        url: 'https://techcorp.com/careers'
      }
    });

    const job2 = await prisma.job.create({
      data: {
        user_id: user1.id,
        title: 'Full Stack Developer',
        company: 'Startup Inc',
        location: 'Remote',
        description: 'Building modern web applications',
        status: 'interviewing',
        salary_min: 80000,
        salary_max: 120000
      }
    });

    // Create sample resumes
    const resume1 = await prisma.resume.create({
      data: {
        user_id: user1.id,
        job_id: job1.id,
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
        ]
      }
    });

    const resume2 = await prisma.resume.create({
      data: {
        user_id: user2.id,
        name: 'Product Manager Resume',
        summary: 'Product manager with expertise in agile methodologies',
        skills: ['Product Strategy', 'Agile', 'User Research'],
        projects: [{ name: 'Product Launch', role: 'Product Manager' }]
      }
    });

    // Create sample cover letters
    const coverLetter1 = await prisma.coverLetter.create({
      data: {
        user_id: user1.id,
        job_id: job1.id,
        resume_id: resume1.id,
        title: 'Cover Letter for Senior Software Engineer',
        content: 'I am excited to apply for the Senior Software Engineer position...',
        company_name: 'Tech Corp',
        job_title: 'Senior Software Engineer',
        job_description: 'Leading development of web applications'
      }
    });

    return {
      users: [user1, user2, admin],
      jobs: [job1, job2],
      resumes: [resume1, resume2],
      coverLetters: [coverLetter1]
    };

  } finally {
    await prisma.$disconnect();
  }
};

describe('Seed Script Tests', () => {
  let seedResult: any;

  beforeAll(async () => {
    // Run the mock seed script
    seedResult = await mockSeedScript();
  });

  describe('User Creation', () => {
    it('should create the correct number of users', () => {
      expect(seedResult.users).toHaveLength(3);
    });

    it('should create users with correct roles', () => {
      const roles = seedResult.users.map((user: any) => user.role);
      expect(roles).toContain('user');
      expect(roles).toContain('admin');
    });

    it('should create users with unique emails', () => {
      const emails = seedResult.users.map((user: any) => user.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(emails.length);
    });

    it('should hash passwords correctly', () => {
      seedResult.users.forEach((user: any) => {
        expect(user.password_hash).not.toBe('Password123');
        expect(user.password_hash).not.toBe('Admin123');
        expect(user.password_hash).toHaveLength(60); // bcrypt hash length
      });
    });
  });

  describe('Job Creation', () => {
    it('should create the correct number of jobs', () => {
      expect(seedResult.jobs).toHaveLength(2);
    });

    it('should create jobs with correct user relationships', () => {
      const user1 = seedResult.users.find((u: any) => u.email === 'john.doe@example.com');
      seedResult.jobs.forEach((job: any) => {
        expect(job.user_id).toBe(user1.id);
      });
    });

    it('should create jobs with different statuses', () => {
      const statuses = seedResult.jobs.map((job: any) => job.status);
      expect(statuses).toContain('applied');
      expect(statuses).toContain('interviewing');
    });

    it('should handle optional fields correctly', () => {
      const jobWithUrl = seedResult.jobs.find((j: any) => j.url);
      const jobWithoutUrl = seedResult.jobs.find((j: any) => !j.url);
      
      expect(jobWithUrl.url).toBe('https://techcorp.com/careers');
      expect(jobWithoutUrl.url).toBeNull();
    });
  });

  describe('Resume Creation', () => {
    it('should create the correct number of resumes', () => {
      expect(seedResult.resumes).toHaveLength(2);
    });

    it('should create resumes with JSON fields', () => {
      const resumeWithSkills = seedResult.resumes.find((r: any) => r.skills);
      expect(resumeWithSkills.skills).toEqual(['TypeScript', 'React', 'Node.js']);
    });

    it('should handle linked and unlinked resumes', () => {
      const linkedResume = seedResult.resumes.find((r: any) => r.job_id);
      const unlinkedResume = seedResult.resumes.find((r: any) => !r.job_id);
      
      expect(linkedResume.job_id).toBeDefined();
      expect(unlinkedResume.job_id).toBeNull();
    });

    it('should set default values correctly', () => {
      seedResult.resumes.forEach((resume: any) => {
        expect(resume.is_active).toBe(true);
        expect(resume.version).toBe(1);
        expect(resume.created_at).toBeInstanceOf(Date);
        expect(resume.updated_at).toBeInstanceOf(Date);
      });
    });
  });

  describe('Cover Letter Creation', () => {
    it('should create cover letters with relationships', () => {
      expect(seedResult.coverLetters).toHaveLength(1);
      
      const coverLetter = seedResult.coverLetters[0];
      expect(coverLetter.job_id).toBeDefined();
      expect(coverLetter.resume_id).toBeDefined();
      expect(coverLetter.user_id).toBeDefined();
    });

    it('should include all required fields', () => {
      const coverLetter = seedResult.coverLetters[0];
      expect(coverLetter.title).toBeDefined();
      expect(coverLetter.content).toBeDefined();
      expect(coverLetter.company_name).toBeDefined();
      expect(coverLetter.job_title).toBeDefined();
    });
  });

  describe('Data Relationships', () => {
    it('should maintain referential integrity', () => {
      const user1 = seedResult.users.find((u: any) => u.email === 'john.doe@example.com');
      const user1Jobs = seedResult.jobs.filter((j: any) => j.user_id === user1.id);
      const user1Resumes = seedResult.resumes.filter((r: any) => r.user_id === user1.id);
      
      expect(user1Jobs).toHaveLength(2);
      expect(user1Resumes).toHaveLength(1);
    });

    it('should create proper job-resume relationships', () => {
      const job1 = seedResult.jobs.find((j: any) => j.title === 'Senior Software Engineer');
      const linkedResume = seedResult.resumes.find((r: any) => r.job_id === job1.id);
      
      expect(linkedResume).toBeDefined();
      expect(linkedResume.name).toBe('Software Engineer Resume');
    });
  });

  describe('Data Validation', () => {
    it('should create valid email addresses', () => {
      seedResult.users.forEach((user: any) => {
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should create valid salary ranges', () => {
      seedResult.jobs.forEach((job: any) => {
        if (job.salary_min && job.salary_max) {
          expect(job.salary_min).toBeLessThanOrEqual(job.salary_max);
          expect(job.salary_min).toBeGreaterThan(0);
          expect(job.salary_max).toBeGreaterThan(0);
        }
      });
    });

    it('should have valid dates', () => {
      const allEntities = [
        ...seedResult.users,
        ...seedResult.jobs,
        ...seedResult.resumes,
        ...seedResult.coverLetters
      ];

      allEntities.forEach((entity: any) => {
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
  });
});
