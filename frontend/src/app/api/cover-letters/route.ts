import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const coverLetterSchema = z.object({
  title: z.string().min(1, 'Cover letter title is required'),
  content: z.string().min(1, 'Cover letter content is required'),
  job_id: z.number().optional(),
  resume_id: z.number().optional(),
  job_title: z.string().optional(),
  company_name: z.string().optional(),
  job_description: z.string().optional(),
  resume_snippet: z.string().optional(),
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

    const coverLetters = await prisma.coverLetter.findMany({
      where: { user_id: parseInt(userId) },
      orderBy: { created_at: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true
          }
        },
        resume: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(coverLetters);

  } catch (error) {
    console.error('Get cover letters error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = coverLetterSchema.parse(body);
    
    // For now, we'll get userId from the request body
    // In production, extract from JWT token
    const { userId, ...coverLetterData } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const coverLetter = await prisma.coverLetter.create({
      data: {
        ...coverLetterData,
        user_id: parseInt(userId)
      }
    });

    return NextResponse.json(coverLetter, { status: 201 });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      const validationErrors = error.errors.map((err: any) => err.message).join(', ');
      return NextResponse.json(
        { error: validationErrors },
        { status: 400 }
      );
    }

    console.error('Create cover letter error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
