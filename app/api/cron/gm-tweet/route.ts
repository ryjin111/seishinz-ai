import { NextRequest, NextResponse } from 'next/server';
import { SeishinZTwitterClient } from '@/lib/twitter';
import { accessCodeManager } from '@/lib/access-codes';
import { shinZDB } from '@/lib/database';

// GM tweet templates with variations
const GM_TWEET_TEMPLATES = [
  "GM Shapers @ShapeL2. Morning check-in. Explore seishinz.xyz for fresh drops and updates.",
  "GM @ShapeL2 Shapers. New day, new alpha. See what's moving at seishinz.xyz.",
  "GM Shapers @ShapeL2. Time to scan the market. Highlights updated on seishinz.xyz.",
  "GM @ShapeL2. Good morning. Keep an eye on new collections at seishinz.xyz.",
  "GM Shapers @ShapeL2. Rise and build. Daily updates live on seishinz.xyz."
];

export async function GET(req: NextRequest) {
  try {
    // Check if this is a valid cron request (you can add authentication here)
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    // Optional: Add a secret key for security
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Enable admin bypass for the cron job
    accessCodeManager.enableAdminBypass();

    // Initialize database
    await shinZDB.initialize();
    
    // Check if we already posted a GM tweet today
    const today = new Date().toDateString();
    const lastGmDate = await getLastGmDate();
    
    if (lastGmDate === today) {
      return NextResponse.json({ 
        message: 'GM tweet already posted today',
        date: today 
      });
    }

    // Select a random GM template
    const randomTemplate = GM_TWEET_TEMPLATES[Math.floor(Math.random() * GM_TWEET_TEMPLATES.length)];
    
    // Initialize Twitter client
    const twitterClient = new SeishinZTwitterClient();
    
    // Post the GM tweet
    const result = await twitterClient.postTweet(randomTemplate);
    
    if (result.success) {
      // Store the date of the last GM tweet
      await storeLastGmDate(today);
      
      return NextResponse.json({
        success: true,
        message: 'GM tweet posted successfully',
        tweetId: result.tweetId,
        content: randomTemplate,
        date: today
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        details: result.details
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error posting GM tweet:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Database storage for last GM date
async function getLastGmDate(): Promise<string | null> {
  try {
    const lastGm = await shinZDB.getLastGmTweet();
    return lastGm?.date || null;
  } catch (error) {
    console.error('Error getting last GM date:', error);
    return null;
  }
}

async function storeLastGmDate(date: string): Promise<void> {
  try {
    await shinZDB.storeGmTweet({
      id: Date.now().toString(),
      date,
      timestamp: new Date().toISOString(),
      success: true
    });
  } catch (error) {
    console.error('Error storing GM date:', error);
  }
}

// Manual trigger endpoint for testing
export async function POST(req: NextRequest) {
  try {
    // Enable admin bypass
    accessCodeManager.enableAdminBypass();
    
    // Select a random GM template
    const randomTemplate = GM_TWEET_TEMPLATES[Math.floor(Math.random() * GM_TWEET_TEMPLATES.length)];
    
    // Initialize Twitter client
    const twitterClient = new SeishinZTwitterClient();
    
    // Post the GM tweet
    const result = await twitterClient.postTweet(randomTemplate);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'GM tweet posted successfully',
        tweetId: result.tweetId,
        content: randomTemplate
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        details: result.details
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error posting GM tweet:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 