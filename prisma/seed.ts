import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.coverLetter.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create sample users
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

  console.log('👥 Created sample users');

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

  const job3 = await prisma.job.create({
    data: {
      user_id: user2.id,
      title: 'Product Manager',
      company: 'Enterprise Solutions',
      location: 'New York, NY',
      description: 'Managing product development lifecycle',
      status: 'applied',
      salary_min: 100000,
      salary_max: 150000
    }
  });

  console.log('💼 Created sample jobs');

  // Create sample resumes
  const resume1 = await prisma.resume.create({
    data: {
      user_id: user1.id,
      job_id: job1.id,
      name: 'Software Engineer Resume',
      summary: 'Experienced software engineer with 5+ years in full‑stack dev...',
      skills: ['TypeScript', 'React', 'Node.js'],          // Json field
      achievements: ['Reduced build time by 30%'],         // Json field
      projects: [{ name: 'Project X', role: 'Lead' }],     // Json field
    },
  });

  const resume2 = await prisma.resume.create({
    data: {
      user_id: user1.id,
      job_id: job2.id,
      name: 'Frontend Engineer Resume',
      summary: 'Frontend-focused engineer with strong React and UX background...',
      skills: ['React', 'Next.js', 'Tailwind CSS'],
      experience: [{ company: 'Startup Inc', title: 'FE Dev' }],
    },
  });

  console.log('📄 Created sample resumes');

  // Create sample cover letters
  const coverLetter1 = await prisma.coverLetter.create({
    data: {
      user_id: user1.id,
      job_id: job1.id,
      resume_id: resume1.id,
      title: 'Cover Letter for Senior Software Engineer',
      content: 'Dear Hiring Manager, I am excited to apply...',
      version: 1
    }
  });

  const coverLetter2 = await prisma.coverLetter.create({
    data: {
      user_id: user2.id,
      job_id: job3.id,
      resume_id: resume2.id,
      title: 'Cover Letter for Product Manager',
      content: 'Dear Hiring Team, I am writing to express...',
      version: 1
    }
  });

  console.log('✉️ Created sample cover letters');

  // Generate simple tokens for testing
  const user1Token = Buffer.from(JSON.stringify({ userId: user1.id, timestamp: Date.now() })).toString('base64');
  const user2Token = Buffer.from(JSON.stringify({ userId: user2.id, timestamp: Date.now() })).toString('base64');
  const adminToken = Buffer.from(JSON.stringify({ userId: admin.id, timestamp: Date.now() })).toString('base64');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Sample Data Summary:');
  console.log(`Users: ${user1.email}, ${user2.email}, ${admin.email}`);
  console.log(`Jobs: ${job1.title}, ${job2.title}, ${job3.title}`);
  console.log(`Resumes: ${resume1.title}, ${resume2.title}`);
  console.log(`Cover Letters: ${coverLetter1.title}, ${coverLetter2.title}`);
  
  console.log('\n🔑 Test Tokens (for API testing):');
  console.log(`User 1 (${user1.email}): ${user1Token}`);
  console.log(`User 2 (${user2.email}): ${user2Token}`);
  console.log(`Admin (${admin.email}): ${adminToken}`);
  
  console.log('\n💡 You can use these tokens in the Authorization header:');
  console.log('Authorization: Bearer <token>');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
