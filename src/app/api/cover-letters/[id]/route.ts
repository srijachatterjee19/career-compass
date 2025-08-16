import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const coverLetterUpdateSchema = z.object({
  title: z.string().min(1, 'Cover letter title is required'),
  content: z.string().min(1, 'Cover letter content is required'),
  job_id: z.number().optional(),
  resume_id: z.number().optional(),
  job_title: z.string().optional(),
  company_name: z.string().optional(),
  job_description: z.string().optional(),
  resume_snippet: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const coverLetterId = parseInt(id);

    if (isNaN(coverLetterId)) {
      return NextResponse.json(
        { error: 'Invalid cover letter ID' },
        { status: 400 }
      );
    }

    const coverLetter = await prisma.coverLetter.findUnique({
      where: { id: coverLetterId },
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

    if (!coverLetter) {
      return NextResponse.json(
        { error: 'Cover letter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(coverLetter);

  } catch (error) {
    console.error('Get cover letter error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const coverLetterId = parseInt(id);

    if (isNaN(coverLetterId)) {
      return NextResponse.json(
        { error: 'Invalid cover letter ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = coverLetterUpdateSchema.parse(body);

    const updatedCoverLetter = await prisma.coverLetter.update({
      where: { id: coverLetterId },
      data: {
        title: data.title,
        content: data.content,
        job_id: data.job_id,
        resume_id: data.resume_id,
        job_title: data.job_title,
        company_name: data.company_name,
        job_description: data.job_description,
        resume_snippet: data.resume_snippet,
      }
    });

    return NextResponse.json(updatedCoverLetter);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      const validationErrors = error.errors.map((err: any) => err.message).join(', ');
      return NextResponse.json(
        { error: validationErrors },
        { status: 400 }
      );
    }

    console.error('Update cover letter error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const coverLetterId = parseInt(id);

    if (isNaN(coverLetterId)) {
      return NextResponse.json(
        { error: 'Invalid cover letter ID' },
        { status: 400 }
      );
    }

    // Check if cover letter exists
    const existingCoverLetter = await prisma.coverLetter.findUnique({
      where: { id: coverLetterId }
    });

    if (!existingCoverLetter) {
      return NextResponse.json(
        { error: 'Cover letter not found' },
        { status: 404 }
      );
    }

    // Delete the cover letter
    await prisma.coverLetter.delete({
      where: { id: coverLetterId }
    });

    return NextResponse.json(
      { message: 'Cover letter deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete cover letter error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
