import { NextResponse } from 'next/server'
import { fetchShapeInsights } from '@/lib/shape-mcp'
import { generateTweetContent } from '@/lib/ai'
import { postTweet, fetchUserTimeline } from '@/lib/twitter'

async function handle() {
	const hints = await fetchShapeInsights()
	const recent = await fetchUserTimeline('seishinzinshape', 5)
	const context = recent.map((t) => `- ${t}`).join('\n')
	const content = await generateTweetContent({ instruction: 'hourly', topicHints: hints, context })
	if (!content) return { status: 'no-content' }
	await postTweet(content)
	return { status: 'tweeted' }
}

export async function POST() {
	try { return NextResponse.json(await handle()) } catch (e: any) { return NextResponse.json({ error: e?.message || 'error' }, { status: 500 }) }
}

export async function GET() {
	try { return NextResponse.json(await handle()) } catch (e: any) { return NextResponse.json({ error: e?.message || 'error' }, { status: 500 }) }
}

export const dynamic = 'force-dynamic' 