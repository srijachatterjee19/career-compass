import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const resumeSchema = z.object({
  name: z.string().min(1, 'Resume name is required').max(200, 'Resume name must be less than 200 characters'),
  summary: z.string().max(2000, 'Summary must be less than 2000 characters').optional(),
  experience: z.array(z.object({
    id: z.string(),
    jobTitle: z.string().max(200, 'Job title must be less than 200 characters'),
    companyName: z.string().max(200, 'Company name must be less than 200 characters'),
    dates: z.string().max(100, 'Dates must be less than 100 characters'),
    description: z.string().max(5000, 'Description must be less than 5000 characters')
  })).optional(),
  education: z.array(z.object({
    id: z.string(),
    degree: z.string().max(200, 'Degree must be less than 200 characters'),
    institution: z.string().max(300, 'Institution must be less than 300 characters'),
    graduationYear: z.string().max(50, 'Graduation year must be less than 50 characters'),
    details: z.string().max(2000, 'Details must be less than 2000 characters').optional()
  })).optional(),
  skills: z.array(z.object({
    id: z.string(),
    value: z.string().max(500, 'Skill must be less than 500 characters')
  })).optional(),
  projects: z.array(z.object({
    id: z.string(),
    title: z.string().max(200, 'Title must be less than 200 characters'),
    description: z.string().max(5000, 'Description must be less than 5000 characters')
  })).optional(),
  achievements: z.array(z.object({
    id: z.string(),
    value: z.string().max(1000, 'Achievement must be less than 1000 characters')
  })).optional(),
  job_id: z.number().nullable().optional(),
  is_active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const resumes = await prisma.resume.findMany({
      where: { user_id: parseInt(userId) },
      orderBy: { created_at: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true
          }
        }
      }
    });

    return NextResponse.json(resumes);

  } catch (error) {
    console.error('Get resumes error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = resumeSchema.parse(body);
    
    // For now, we'll get userId from the request body
    // In production, extract from JWT token
    const { userId, ...resumeData } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prepare the data for database insertion
    const dbData = {
      name: resumeData.name,
      summary: resumeData.summary || null,
      experience: resumeData.experience ? JSON.stringify(resumeData.experience) : null,
      education: resumeData.education ? JSON.stringify(resumeData.education) : null,
      skills: resumeData.skills ? JSON.stringify(resumeData.skills) : null,
      projects: resumeData.projects ? JSON.stringify(resumeData.projects) : null,
      achievements: resumeData.achievements ? JSON.stringify(resumeData.achievements) : null,
      job_id: resumeData.job_id || null,
      is_active: resumeData.is_active ?? true,
      user_id: parseInt(userId)
    };

    const resume = await prisma.resume.create({
      data: dbData as any // Type assertion to bypass Prisma type mismatch
    });

    return NextResponse.json(resume, { status: 201 });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      const validationErrors = error.errors.map((err: any) => err.message).join(', ');
      return NextResponse.json(
        { error: validationErrors },
        { status: 400 }
      );
    }

    console.error('Create resume error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
