import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ClearOptions {
  seededOnly?: boolean;
  allData?: boolean;
  keepUsers?: boolean;
}

async function clearData(options: ClearOptions = {}) {
  const { seededOnly = true, allData = false, keepUsers = true } = options;

  console.log('🧹 Starting data cleanup...');
  console.log(`Options: seededOnly=${seededOnly}, allData=${allData}, keepUsers=${keepUsers}`);

  try {
    if (allData) {
      // Clear everything
      console.log('🗑️ Clearing ALL data...');
      
      const deletedCoverLetters = await prisma.coverLetter.deleteMany();
      const deletedResumes = await prisma.resume.deleteMany();
      const deletedJobs = await prisma.job.deleteMany();
      
      if (!keepUsers) {
        const deletedUsers = await prisma.user.deleteMany();
        console.log(`🗑️ Deleted ${deletedUsers.count} users`);
      }
      
      console.log(`🗑️ Deleted ${deletedCoverLetters.count} cover letters`);
      console.log(`🗑️ Deleted ${deletedResumes.count} resumes`);
      console.log(`🗑️ Deleted ${deletedJobs.count} jobs`);
      
    } else if (seededOnly) {
      // Clear only seeded data
      console.log('🗑️ Clearing seeded data only...');
      
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
    }

    // Show remaining data
    const remainingUsers = await prisma.user.count();
    const remainingJobs = await prisma.job.count();
    const remainingResumes = await prisma.resume.count();
    const remainingCoverLetters = await prisma.coverLetter.count();

    console.log('\n✅ Data cleanup completed!');
    console.log('\n📊 Remaining data:');
    console.log(`   Users: ${remainingUsers}`);
    console.log(`   Jobs: ${remainingJobs}`);
    console.log(`   Resumes: ${remainingResumes}`);
    console.log(`   Cover Letters: ${remainingCoverLetters}`);

    if (remainingUsers > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          display_name: true,
          role: true
        }
      });

      console.log('\n👥 Remaining users:');
      users.forEach(user => {
        console.log(`   - ${user.display_name} (${user.email}) - Role: ${user.role}`);
      });
    }

    console.log('\n💡 Next steps:');
    if (remainingUsers > 0) {
      console.log('   1. Users can log in with their existing credentials');
      console.log('   2. They can start fresh with no pre-existing data');
      console.log('   3. They can create their own jobs, resumes, and cover letters');
    } else {
      console.log('   1. Database is completely empty');
      console.log('   2. Run "npm run db:seed" to add sample data');
      console.log('   3. Or register new users through the app');
    }

  } catch (error) {
    console.error('❌ Error during data cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: ClearOptions = {};

if (args.includes('--all')) {
  options.allData = true;
  options.seededOnly = false;
}

if (args.includes('--no-users')) {
  options.keepUsers = false;
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: npm run db:clear [options]

Options:
  --all        Clear ALL data (not just seeded data)
  --no-users   Also delete users (use with --all)
  --help, -h   Show this help message

Examples:
  npm run db:clear              # Clear only seeded data (default)
  npm run db:clear --all        # Clear all data but keep users
  npm run db:clear --all --no-users  # Clear everything including users
  `);
  process.exit(0);
}

clearData(options);
