import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Test database configuration
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

describe('Database Seeding Tests', () => {
  beforeAll(async () => {
    // Ensure test database is ready
    await testPrisma.$connect();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear all data before each test
    await testPrisma.coverLetter.deleteMany();
    await testPrisma.resume.deleteMany();
    await testPrisma.job.deleteMany();
    await testPrisma.user.deleteMany();
  });

  describe('User Seeding', () => {
    it('should create users with correct data structure', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        display_name: 'Test User',
        role: 'user'
      };

      const user = await testPrisma.user.create({
        data: {
          email: userData.email,
          password_hash: await bcrypt.hash(userData.password, 12),
          display_name: userData.display_name,
          role: userData.role
        }
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.display_name).toBe(userData.display_name);
      expect(user.role).toBe(userData.role);
      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.updated_at).toBeInstanceOf(Date);
      expect(user.id).toBeGreaterThan(0);
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password_hash: await bcrypt.hash('Password123', 12),
        display_name: 'User 1',
        role: 'user'
      };

      // Create first user
      await testPrisma.user.create({ data: userData });

      // Attempt to create second user with same email
      await expect(
        testPrisma.user.create({ data: userData })
      ).rejects.toThrow();
    });

    it('should hash passwords correctly', async () => {
      const plainPassword = 'TestPassword123';
      const user = await testPrisma.user.create({
        data: {
          email: 'password@test.com',
          password_hash: await bcrypt.hash(plainPassword, 12),
          display_name: 'Password Test User',
          role: 'user'
        }
      });

      // Verify password was hashed (not plain text)
      expect(user.password_hash).not.toBe(plainPassword);
      expect(user.password_hash).toHaveLength(60); // bcrypt hash length
    });
  });

  describe('Job Seeding', () => {
    it('should create jobs with correct relationships', async () => {
      // Create user first
      const user = await testPrisma.user.create({
        data: {
          email: 'jobuser@example.com',
          password_hash: await bcrypt.hash('Password123', 12),
          display_name: 'Job User',
          role: 'user'
        }
      });

      const jobData = {
        user_id: user.id,
        title: 'Software Engineer',
        company: 'Tech Company',
        description: 'Building amazing software',
        status: 'applied',
        location: 'San Francisco, CA',
        salary_min: 100000,
        salary_max: 150000,
        url: 'https://techcompany.com/careers'
      };

      const job = await testPrisma.job.create({ data: jobData });

      expect(job).toBeDefined();
      expect(job.user_id).toBe(user.id);
      expect(job.title).toBe(jobData.title);
      expect(job.company).toBe(jobData.company);
      expect(job.status).toBe(jobData.status);
      expect(job.created_at).toBeInstanceOf(Date);
      expect(job.updated_at).toBeInstanceOf(Date);
    });

    it('should handle optional job fields correctly', async () => {
      const user = await testPrisma.user.create({
        data: {
          email: 'optional@example.com',
          password_hash: await bcrypt.hash('Password123', 12),
          display_name: 'Optional User',
          role: 'user'
        }
      });

      const job = await testPrisma.job.create({
        data: {
          user_id: user.id,
          title: 'Minimal Job',
          company: 'Minimal Company'
        }
      });

      expect(job.description).toBeNull();
      expect(job.location).toBeNull();
      expect(job.salary_min).toBeNull();
      expect(job.salary_max).toBeNull();
      expect(job.url).toBeNull();
      expect(job.status).toBe('applied'); // default value
    });
  });

  describe('Resume Seeding', () => {
    it('should create resumes with JSON fields', async () => {
      const user = await testPrisma.user.create({
        data: {
          email: 'resume@example.com',
          password_hash: await bcrypt.hash('Password123', 12),
          display_name: 'Resume User',
          role: 'user'
        }
      });

      const resumeData = {
        user_id: user.id,
        name: 'My Resume',
        summary: 'Experienced developer',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [
          {
            title: 'Developer',
            company: 'Tech Corp',
            duration: '2 years'
          }
        ],
        education: [
          {
            degree: 'Computer Science',
            school: 'University',
            year: '2020'
          }
        ],
        projects: [
          {
            name: 'Project A',
            description: 'A great project'
          }
        ],
        achievements: ['Award winner', 'Performance recognition']
      };

      const resume = await testPrisma.resume.create({ data: resumeData });

      expect(resume).toBeDefined();
      expect(resume.name).toBe(resumeData.name);
      expect(resume.summary).toBe(resumeData.summary);
      expect(resume.skills).toEqual(resumeData.skills);
      expect(resume.experience).toEqual(resumeData.experience);
      expect(resume.education).toEqual(resumeData.education);
      expect(resume.projects).toEqual(resumeData.projects);
      expect(resume.achievements).toEqual(resumeData.achievements);
      expect(resume.is_active).toBe(true);
      expect(resume.version).toBe(1);
    });

    it('should handle optional resume fields', async () => {
      const user = await testPrisma.user.create({
        data: {
          email: 'minimal@example.com',
          password_hash: await bcrypt.hash('Password123', 12),
          display_name: 'Minimal User',
          role: 'user'
        }
      });

      const resume = await testPrisma.resume.create({
        data: {
          user_id: user.id,
          name: 'Minimal Resume'
        }
      });

      expect(resume.summary).toBeNull();
      expect(resume.skills).toBeNull();
      expect(resume.experience).toBeNull();
      expect(resume.education).toBeNull();
      expect(resume.projects).toBeNull();
      expect(resume.achievements).toBeNull();
      expect(resume.job_id).toBeNull();
    });

    it('should link resume to job when job_id is provided', async () => {
      const user = await testPrisma.user.create({
        data: {
          email: 'linked@example.com',
          password_hash: await bcrypt.hash('Password123', 12),
          display_name: 'Linked User',
          role: 'user'
        }
      });

      const job = await testPrisma.job.create({
        data: {
          user_id: user.id,
          title: 'Linked Job',
          company: 'Linked Company'
        }
      });

      const resume = await testPrisma.resume.create({
        data: {
          user_id: user.id,
          job_id: job.id,
          name: 'Linked Resume'
        }
      });

      expect(resume.job_id).toBe(job.id);
    });
  });

  describe('Cover Letter Seeding', () => {
    it('should create cover letters with relationships', async () => {
      const user = await testPrisma.user.create({
        data: {
          email: 'cover@example.com',
          password_hash: await bcrypt.hash('Password123', 12),
          display_name: 'Cover User',
          role: 'user'
        }
      });

      const coverLetterData = {
        user_id: user.id,
        title: 'My Cover Letter',
        content: 'I am excited to apply for this position...',
        company_name: 'Great Company',
        job_title: 'Software Engineer',
        job_description: 'Building amazing software',
        version: 1
      };

      const coverLetter = await testPrisma.coverLetter.create({ data: coverLetterData });

      expect(coverLetter).toBeDefined();
      expect(coverLetter.user_id).toBe(user.id);
      expect(coverLetter.title).toBe(coverLetterData.title);
      expect(coverLetter.content).toBe(coverLetterData.content);
      expect(coverLetter.company_name).toBe(coverLetterData.company_name);
      expect(coverLetter.job_title).toBe(coverLetterData.job_title);
      expect(coverLetter.version).toBe(1);
      expect(coverLetter.created_at).toBeInstanceOf(Date);
      expect(coverLetter.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('Data Relationships', () => {
    it('should maintain referential integrity', async () => {
      const user = await testPrisma.user.create({
        data: {
          email: 'integrity@example.com',
          password_hash: await bcrypt.hash('Password123', 12),
          display_name: 'Integrity User',
          role: 'user'
        }
      });

      const job = await testPrisma.job.create({
        data: {
          user_id: user.id,
          title: 'Integrity Job',
          company: 'Integrity Company'
        }
      });

      const resume = await testPrisma.resume.create({
        data: {
          user_id: user.id,
          job_id: job.id,
          name: 'Integrity Resume'
        }
      });

      const coverLetter = await testPrisma.coverLetter.create({
        data: {
          user_id: user.id,
          job_id: job.id,
          resume_id: resume.id,
          title: 'Integrity Cover Letter',
          content: 'Content here'
        }
      });

      // Verify relationships
      const userWithRelations = await testPrisma.user.findUnique({
        where: { id: user.id },
        include: {
          jobs: true,
          resumes: true,
          cover_letters: true
        }
      });

      expect(userWithRelations?.jobs).toHaveLength(1);
      expect(userWithRelations?.resumes).toHaveLength(1);
      expect(userWithRelations?.cover_letters).toHaveLength(1);
      expect(userWithRelations?.jobs[0].id).toBe(job.id);
      expect(userWithRelations?.resumes[0].id).toBe(resume.id);
      expect(userWithRelations?.cover_letters[0].id).toBe(coverLetter.id);
    });

    it('should cascade delete related records', async () => {
      const user = await testPrisma.user.create({
        data: {
          email: 'cascade@example.com',
          password_hash: await bcrypt.hash('Password123', 12),
          display_name: 'Cascade User',
          role: 'user'
        }
      });

      const job = await testPrisma.job.create({
        data: {
          user_id: user.id,
          title: 'Cascade Job',
          company: 'Cascade Company'
        }
      });

      const resume = await testPrisma.resume.create({
        data: {
          user_id: user.id,
          job_id: job.id,
          name: 'Cascade Resume'
        }
      });

      const coverLetter = await testPrisma.coverLetter.create({
        data: {
          user_id: user.id,
          job_id: job.id,
          resume_id: resume.id,
          title: 'Cascade Cover Letter',
          content: 'Content here'
        }
      });

      // Delete user and verify cascade
      await testPrisma.user.delete({ where: { id: user.id } });

      // Verify all related records are deleted
      const remainingJob = await testPrisma.job.findUnique({ where: { id: job.id } });
      const remainingResume = await testPrisma.resume.findUnique({ where: { id: resume.id } });
      const remainingCoverLetter = await testPrisma.coverLetter.findUnique({ where: { id: coverLetter.id } });

      expect(remainingJob).toBeNull();
      expect(remainingResume).toBeNull();
      expect(remainingCoverLetter).toBeNull();
    });
  });

  describe('Data Validation', () => {
    it('should reject invalid email format', async () => {
      await expect(
        testPrisma.user.create({
          data: {
            email: 'invalid-email',
            password_hash: await bcrypt.hash('Password123', 12),
            display_name: 'Invalid User',
            role: 'user'
          }
        })
      ).rejects.toThrow();
    });

    it('should reject negative salary values', async () => {
      const user = await testPrisma.user.create({
        data: {
          email: 'salary@example.com',
          password_hash: await bcrypt.hash('Password123', 12),
          display_name: 'Salary User',
          role: 'user'
        }
      });

      await expect(
        testPrisma.job.create({
          data: {
            user_id: user.id,
            title: 'Salary Job',
            company: 'Salary Company',
            salary_min: -1000,
            salary_max: 50000
          }
        })
      ).rejects.toThrow();
    });

    it('should enforce required fields', async () => {
      await expect(
        testPrisma.user.create({
          data: {
            email: 'required@example.com',
            // Missing password_hash, display_name, role
          } as any
        })
      ).rejects.toThrow();
    });
  });
});
