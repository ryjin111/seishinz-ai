import { TwitterApi } from 'twitter-api-v2'
import { splitIntoTweets } from './util'

const appKey = process.env.TWITTER_API_KEY || ''
const appSecret = process.env.TWITTER_API_SECRET || ''
const accessToken = process.env.TWITTER_ACCESS_TOKEN || ''
const accessSecret = process.env.TWITTER_ACCESS_SECRET || process.env.TWITTER_ACCESS_TOKEN_SECRET || ''

function assertCreds() {
	if (!appKey || !appSecret || !accessToken || !accessSecret) {
		throw new Error('Twitter credentials missing (check TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET/TWITTER_ACCESS_TOKEN_SECRET)')
	}
}

function client() {
	assertCreds()
	return new TwitterApi({ appKey, appSecret, accessToken, accessSecret })
}

function sanitize(text: string): string {
	return text
		.replace(/\*\*/g, '')
		.replace(/\s+/g, ' ')
		.trim()
}

export async function postTweet(status: string, inReplyToId?: string) {
	const c = client()
	const text = sanitize(status)
	const maxLen = Math.max(1, Number(process.env.TWEET_MAX_LEN || '280'))

	if (text.length <= maxLen) {
		if (inReplyToId) {
			const r = await c.v2.reply(text, inReplyToId)
			return { id: r.data.id, text: r.data.text }
		}
		const t = await c.v2.tweet(text)
		return { id: t.data.id, text: t.data.text }
	}

	// Long content: post as a thread
	const parts = splitIntoTweets(text, maxLen)
	let previousId: string | undefined = inReplyToId
	let firstText = parts[0]
	for (let i = 0; i < parts.length; i++) {
		if (i === 0 && !previousId) {
			const t = await c.v2.tweet(parts[i])
			previousId = t.data.id
			firstText = t.data.text
			continue
		}
		const r = await c.v2.reply(parts[i], previousId!)
		previousId = r.data.id
	}
	return { id: previousId!, text: firstText, parts: parts.length }
}

export type Mention = { id: string; text: string; user: { screen_name: string } }

export async function fetchMentions(count = 10, sinceId?: string): Promise<Mention[]> {
	const c = client()
	const userId = process.env.TWITTER_USER_ID
	if (!userId) throw new Error('TWITTER_USER_ID is required to fetch mentions with v2 API')
	const res = await c.v2.userMentionTimeline(userId, { max_results: Math.min(count, 100), 'tweet.fields': ['text','author_id'] })
	const data = res.data?.data || []
	return data.map((t: any) => ({ id: t.id, text: t.text, user: { screen_name: '' } }))
}

export async function fetchUserTimeline(screenName: string, count = 5): Promise<string[]> {
	const c = client()
	// Resolve screen name to user id
	const user = await c.v2.userByUsername(screenName)
	const userId = user.data?.id
	if (!userId) return []
	const tl = await c.v2.userTimeline(userId, { max_results: Math.min(count, 100), exclude: ['replies','retweets'] })
	return (tl.data?.data || []).map((t: any) => t.text)
} 