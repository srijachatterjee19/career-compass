import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const searchSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  query: z.string().optional(), // General search query
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  deadlineFrom: z.string().datetime().optional(),
  deadlineTo: z.string().datetime().optional(),
  sortBy: z.enum(['created_at', 'application_date', 'deadline', 'title', 'company', 'salary_min']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const searchParams = searchSchema.parse(body);
    
    const {
      userId,
      query,
      title,
      company,
      location,
      status,
      salaryMin,
      salaryMax,
      dateFrom,
      dateTo,
      deadlineFrom,
      deadlineTo,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = searchParams;

    // Build the where clause for filtering
    const where: any = {
      user_id: parseInt(userId),
    };

    // General text search across multiple fields
    if (query && query.trim()) {
      const searchQuery = query.trim();
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { company: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { location: { contains: searchQuery, mode: 'insensitive' } },
        { notes: { contains: searchQuery, mode: 'insensitive' } },
        { role_details: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Specific field filters
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (status && status !== 'All Statuses') {
      where.status = status;
    }

    // Salary range filter
    if (salaryMin !== undefined || salaryMax !== undefined) {
      where.AND = [];
      
      if (salaryMin !== undefined) {
        where.AND.push({
          OR: [
            { salary_min: { gte: salaryMin } },
            { salary_max: { gte: salaryMin } },
          ],
        });
      }
      
      if (salaryMax !== undefined) {
        where.AND.push({
          OR: [
            { salary_min: { lte: salaryMax } },
            { salary_max: { lte: salaryMax } },
          ],
        });
      }
    }

    // Date range filters
    if (dateFrom || dateTo) {
      where.application_date = {};
      if (dateFrom) where.application_date.gte = new Date(dateFrom);
      if (dateTo) where.application_date.lte = new Date(dateTo);
    }

    if (deadlineFrom || deadlineTo) {
      where.deadline = {};
      if (deadlineFrom) where.deadline.gte = new Date(deadlineFrom);
      if (deadlineTo) where.deadline.lte = new Date(deadlineTo);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute search with pagination
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          cover_letters: {
            select: {
              id: true,
              title: true,
              created_at: true,
            },
          },
          resumes: {
            select: {
              id: true,
              name: true,
              created_at: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        limit,
      },
      filters: {
        applied: searchParams,
        resultCount: jobs.length,
      },
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      const validationErrors = error.errors.map((err: any) => err.message).join(', ');
      return NextResponse.json(
        { error: validationErrors },
        { status: 400 }
      );
    }

    console.error('Search jobs error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for backward compatibility
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const query = searchParams.get('query');
    const status = searchParams.get('status');
    const company = searchParams.get('company');
    const title = searchParams.get('title');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      user_id: parseInt(userId),
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'All Statuses') {
      where.status = status;
    }

    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        cover_letters: {
          select: {
            id: true,
            title: true,
            created_at: true,
          },
        },
        resumes: {
          select: {
            id: true,
            name: true,
            created_at: true,
          },
        },
      },
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
