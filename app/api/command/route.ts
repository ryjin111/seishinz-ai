import { NextResponse } from 'next/server'
import { generateTweetContent } from '@/lib/ai'
import { postTweet, fetchUserTimeline } from '@/lib/twitter'
import { fetchShapeInsights } from '@/lib/shape-mcp'

function helpText() {
	return [
		'Commands:',
		'- tweet: <text>               # post exactly this tweet',
		'- ai tweet: <hint/context>    # AI crafts tweet using persona',
		'- analysis                    # AI crafts analysis tweet with Shape insights',
		'- help                        # show this help',
		'',
		'Add dryRun=true to preview without posting.',
	].join('\n')
}

async function handleCommand(command: string, dryRun: boolean | undefined) {
	const raw = command.trim()
	const lower = raw.toLowerCase()

	if (lower === 'help' || lower === '/help') {
		return { action: 'help', content: helpText(), posted: false }
	}

	if (lower.startsWith('tweet:')) {
		const content = raw.slice(raw.indexOf(':') + 1).trim()
		if (!content) return { action: 'tweet', error: 'empty tweet' }
		if (dryRun) return { action: 'tweet', content, posted: false }
		await postTweet(content)
		return { action: 'tweet', content, posted: true }
	}

	if (lower.startsWith('ai tweet:')) {
		const hint = raw.slice(raw.indexOf(':') + 1).trim()
		const recent = await fetchUserTimeline('seishinzinshape', 5)
		const context = [hint, ...recent.map((t) => `Prev: ${t}`)].filter(Boolean).join('\n')
		const content = await generateTweetContent({ instruction: 'hourly', context })
		if (dryRun) return { action: 'ai-tweet', content, posted: false }
		await postTweet(content)
		return { action: 'ai-tweet', content, posted: true }
	}

	if (lower === 'analysis' || lower.startsWith('analysis')) {
		const hints = await fetchShapeInsights()
		const recent = await fetchUserTimeline('seishinzinshape', 8)
		const context = recent.map((t) => `- ${t}`).join('\n')
		const content = await generateTweetContent({ instruction: 'analysis', topicHints: hints, context })
		if (dryRun) return { action: 'analysis', content, posted: false }
		await postTweet(content)
		return { action: 'analysis', content, posted: true }
	}

	// Default: treat as AI tweet with the whole text as hint
	const recent = await fetchUserTimeline('seishinzinshape', 5)
	const context = [raw, ...recent.map((t) => `Prev: ${t}`)].filter(Boolean).join('\n')
	const content = await generateTweetContent({ instruction: 'hourly', context })
	if (dryRun) return { action: 'ai-tweet', content, posted: false }
	await postTweet(content)
	return { action: 'ai-tweet', content, posted: true }
}

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({})) as { command?: string; dryRun?: boolean }
		if (!body.command) return NextResponse.json({ error: 'command required', help: helpText() }, { status: 400 })
		const result = await handleCommand(body.command, body.dryRun)
		return NextResponse.json({ ok: true, ...result })
	} catch (e: any) {
		return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
	}
}

export async function GET() {
	return NextResponse.json({ help: helpText() })
}

export const dynamic = 'force-dynamic' 