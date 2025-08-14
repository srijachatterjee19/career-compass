import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Auth test endpoint working',
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries())
  });
}
