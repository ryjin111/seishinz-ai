import { NextResponse } from 'next/server'
import { fetchMentions, postTweet } from '@/lib/twitter'
import { generateTweetContent } from '@/lib/ai'

let LAST_MENTION_ID: string | undefined

async function handle() {
	const mentions = await fetchMentions(5, LAST_MENTION_ID)
	if (mentions.length === 0) return { status: 'no-mentions' }
	LAST_MENTION_ID = mentions[0].id
	for (const m of mentions) {
		const text = await generateTweetContent({ instruction: 'reply', mentionText: m.text })
		if (text) await postTweet(text, m.id)
	}
	return { status: 'replied', count: mentions.length }
}

export async function POST() { try { return NextResponse.json(await handle()) } catch (e: any) { return NextResponse.json({ error: e?.message || 'error' }, { status: 500 }) } }
export async function GET() { try { return NextResponse.json(await handle()) } catch (e: any) { return NextResponse.json({ error: e?.message || 'error' }, { status: 500 }) } }

export const dynamic = 'force-dynamic' 