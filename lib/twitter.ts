import crypto from 'crypto'

const API_KEY = process.env.TWITTER_API_KEY || ''
const API_SECRET = process.env.TWITTER_API_SECRET || ''
const ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN || ''
const ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET || ''

const TW_BASE = 'https://api.twitter.com/1.1'

function nonce(length = 32) {
	return crypto.randomBytes(length).toString('hex')
}

function percentEncode(str: string) {
	return encodeURIComponent(str)
		.replace(/!/g, '%21')
		.replace(/\*/g, '%2A')
		.replace(/\(/g, '%28')
		.replace(/\)/g, '%29')
}

function signRequest(method: string, url: string, params: Record<string, string>) {
	const baseParams: Record<string, string> = {
		oauth_consumer_key: API_KEY,
		oauth_nonce: nonce(16),
		oauth_signature_method: 'HMAC-SHA1',
		oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
		oauth_token: ACCESS_TOKEN,
		oauth_version: '1.0',
	}
	const allParams = { ...baseParams, ...params }
	const paramString = Object.keys(allParams)
		.sort()
		.map((k) => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
		.join('&')
	const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(paramString)].join('&')
	const signingKey = `${percentEncode(API_SECRET)}&${percentEncode(ACCESS_SECRET)}`
	const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64')
	const oauthHeader =
		'OAuth ' +
		Object.keys(baseParams)
			.sort()
			.map((k) => `${percentEncode(k)}="${percentEncode(baseParams[k])}"`)
			.concat([`oauth_signature="${percentEncode(signature)}"`])
			.join(', ')
	return oauthHeader
}

async function twFetch<T>(method: 'GET' | 'POST', path: string, params: Record<string, string>): Promise<T> {
	if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_SECRET) {
		throw new Error('Twitter credentials missing')
	}
	const url = `${TW_BASE}${path}`
	const headers: Record<string, string> = {
		Authorization: signRequest(method, url, params),
		'Content-Type': 'application/x-www-form-urlencoded',
	}
	const body = method === 'POST' ? new URLSearchParams(params).toString() : undefined
	const qs = method === 'GET' ? `?${new URLSearchParams(params).toString()}` : ''
	const res = await fetch(url + qs, { method, headers, body })
	if (!res.ok) {
		const text = await res.text()
		throw new Error(`Twitter API ${res.status}: ${text}`)
	}
	return res.json() as Promise<T>
}

export async function postTweet(status: string, inReplyToId?: string) {
	const params: Record<string, string> = { status }
	if (inReplyToId) {
		params['in_reply_to_status_id'] = inReplyToId
		params['auto_populate_reply_metadata'] = 'true'
	}
	return twFetch('POST', '/statuses/update.json', params)
}

export type Mention = { id: string; text: string; user: { screen_name: string } }

export async function fetchMentions(count = 10, sinceId?: string): Promise<Mention[]> {
	const params: Record<string, string> = { count: String(count), tweet_mode: 'extended' }
	if (sinceId) params.since_id = sinceId
	const raw = await twFetch<any[]>('GET', '/statuses/mentions_timeline.json', params)
	return raw.map((t) => ({ id: t.id_str, text: t.full_text || t.text, user: { screen_name: t.user?.screen_name } }))
}

export async function fetchUserTimeline(screenName: string, count = 5): Promise<string[]> {
	const params: Record<string, string> = { screen_name: screenName, count: String(count), tweet_mode: 'extended', exclude_replies: 'true', include_rts: 'false' }
	const raw = await twFetch<any[]>('GET', '/statuses/user_timeline.json', params)
	return raw.map((t) => t.full_text || t.text).filter(Boolean)
} 