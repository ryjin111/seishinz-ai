import { NextRequest, NextResponse } from 'next/server';
import { aiScheduler } from '@/lib/ai-scheduler';

export async function GET(req: NextRequest) {
  try {
    const status = aiScheduler.getStatus();
    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    
    switch (action) {
      case 'start':
        await aiScheduler.startScheduler();
        return NextResponse.json({
          success: true,
          message: 'AI Scheduler started successfully'
        });
        
      case 'stop':
        aiScheduler.stopScheduler();
        return NextResponse.json({
          success: true,
          message: 'AI Scheduler stopped successfully'
        });
        
      case 'optimize':
        await aiScheduler.optimizeSchedule();
        return NextResponse.json({
          success: true,
          message: 'AI Scheduler optimized successfully'
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: start, stop, or optimize'
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 