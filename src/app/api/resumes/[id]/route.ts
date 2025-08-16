import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const resumeUpdateSchema = z.object({
  name: z.string().min(1, 'Resume name is required').max(100, 'Resume name must be less than 100 characters'),
  summary: z.string().max(500, 'Summary must be less than 500 characters').optional(),
  experience: z.array(z.object({
    id: z.string(),
    jobTitle: z.string().max(100, 'Job title must be less than 100 characters'),
    companyName: z.string().max(100, 'Company name must be less than 100 characters'),
    dates: z.string().max(50, 'Dates must be less than 50 characters'),
    description: z.string().max(5000, 'Description must be less than 5000 characters')
  })).optional(),
  education: z.array(z.object({
    id: z.string(),
    degree: z.string().max(100, 'Degree must be less than 100 characters'),
    institution: z.string().max(100, 'Institution must be less than 100 characters'),
    graduationYear: z.string().max(20, 'Graduation year must be less than 20 characters'),
    details: z.string().max(500, 'Details must be less than 500 characters').optional()
  })).optional(),
  skills: z.array(z.object({
    id: z.string(),
    value: z.string().max(200, 'Skill must be less than 200 characters')
  })).optional(),
  projects: z.array(z.object({
    id: z.string(),
    title: z.string().max(100, 'Title must be less than 100 characters'),
    description: z.string().max(5000, 'Description must be less than 5000 characters')
  })).optional(),
  achievements: z.array(z.object({
    id: z.string(),
    value: z.string().max(200, 'Achievement must be less than 200 characters')
  })).optional(),
  job_id: z.number().optional(),
  is_active: z.boolean().optional(),
});

// GET /api/resumes/[id] - Get a specific resume
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resumeId = parseInt(id);
    
    if (isNaN(resumeId)) {
      return NextResponse.json(
        { error: 'Invalid resume ID' },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
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

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(resume);

  } catch (error) {
    console.error('Get resume error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT /api/resumes/[id] - Update a specific resume
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resumeId = parseInt(id);
    
    if (isNaN(resumeId)) {
      return NextResponse.json(
        { error: 'Invalid resume ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = resumeUpdateSchema.parse(body);
    
    // Check if resume exists
    const existingResume = await prisma.resume.findUnique({
      where: { id: resumeId }
    });

    if (!existingResume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Prepare the data for update
    const updateData = {
      name: data.name,
      summary: data.summary,
      experience: data.experience ? JSON.stringify(data.experience) : null,
      education: data.education ? JSON.stringify(data.education) : null,
      skills: data.skills ? JSON.stringify(data.skills) : null,
      projects: data.projects ? JSON.stringify(data.projects) : null,
      achievements: data.achievements ? JSON.stringify(data.achievements) : null,
      job_id: data.job_id,
      is_active: data.is_active,
    };

    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: updateData
    });

    return NextResponse.json(updatedResume);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      const validationErrors = error.errors.map((err: any) => err.message).join(', ');
      return NextResponse.json(
        { error: validationErrors },
        { status: 400 }
      );
    }

    console.error('Update resume error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/resumes/[id] - Delete a specific resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resumeId = parseInt(id);
    
    if (isNaN(resumeId)) {
      return NextResponse.json(
        { error: 'Invalid resume ID' },
        { status: 400 }
      );
    }

    // Check if resume exists
    const existingResume = await prisma.resume.findUnique({
      where: { id: resumeId }
    });

    if (!existingResume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    await prisma.resume.delete({
      where: { id: resumeId }
    });

    return NextResponse.json({ message: 'Resume deleted successfully' });

  } catch (error) {
    console.error('Delete resume error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
