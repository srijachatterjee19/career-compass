import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearSeededData() {
  console.log('🧹 Starting to clear seeded data...');

  try {
    // Clear cover letters first (due to foreign key constraints)
    const deletedCoverLetters = await prisma.coverLetter.deleteMany({
      where: {
        OR: [
          { title: 'Cover Letter for Senior Software Engineer' },
          { title: 'Cover Letter for Product Manager' }
        ]
      }
    });
    console.log(`🗑️ Deleted ${deletedCoverLetters.count} seeded cover letters`);

    // Clear resumes
    const deletedResumes = await prisma.resume.deleteMany({
      where: {
        OR: [
          { title: 'Software Engineer Resume' },
          { title: 'Product Manager Resume' }
        ]
      }
    });
    console.log(`🗑️ Deleted ${deletedResumes.count} seeded resumes`);

    // Clear jobs
    const deletedJobs = await prisma.job.deleteMany({
      where: {
        OR: [
          { title: 'Senior Software Engineer' },
          { title: 'Full Stack Developer' },
          { title: 'Product Manager' }
        ]
      }
    });
    console.log(`🗑️ Deleted ${deletedJobs.count} seeded jobs`);

    // Keep users but show their info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        display_name: true,
        role: true,
        created_at: true
      }
    });

    console.log('\n✅ Seeded data cleared successfully!');
    console.log('\n👥 Remaining users:');
    users.forEach(user => {
      console.log(`   - ${user.display_name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n💡 Users can now:');
    console.log('   1. Log in with their existing credentials');
    console.log('   2. Start fresh with no pre-existing data');
    console.log('   3. Create their own jobs, resumes, and cover letters');

  } catch (error) {
    console.error('❌ Error clearing seeded data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearSeededData();
