import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const version = process.env.APP_VERSION || '1.0.0';
  const buildTime = process.env.BUILD_TIME || new Date().toISOString();
  
  return NextResponse.json({
    version,
    buildTime,
    timestamp: new Date().toISOString()
  });
}