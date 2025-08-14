import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.string().default('applied'),
  salary_min: z.number().nullable().optional().transform(val => val === null ? undefined : val),
  salary_max: z.number().nullable().optional().transform(val => val === null ? undefined : val),
  url: z.string().url().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  application_date: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),
  company_description: z.string().optional(),
  notes: z.string().optional(), // Keep for backward compatibility
  referrals: z.string().optional(),
  role_details: z.string().optional(),
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

    const jobs = await prisma.job.findMany({
      where: { user_id: parseInt(userId) },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(jobs);

  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = jobSchema.parse(body);
    
    // For now, we'll get userId from the request body
    // In production, extract from JWT token
    const { userId, ...jobData } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        ...jobData,
        user_id: parseInt(userId)
      }
    });

    return NextResponse.json(job, { status: 201 });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      const validationErrors = error.errors.map((err: any) => err.message).join(', ');
      return NextResponse.json(
        { error: validationErrors },
        { status: 400 }
      );
    }

    console.error('Create job error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
