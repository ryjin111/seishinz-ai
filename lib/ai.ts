import OpenAI from 'openai'
import { seishinzCharacter } from './character'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const AI_PROVIDER = (process.env.AI_PROVIDER || '').toLowerCase()
const USE_DEEPSEEK = AI_PROVIDER === 'deepseek' || (!!process.env.DEEPSEEK_API_KEY && !process.env.OPENAI_API_KEY)

export async function generateTweetContent(input: {
	topicHints?: string[]
	context?: string
	instruction: 'hourly' | 'reply' | 'analysis'
	mentionText?: string
}): Promise<string> {
	const system = [
		`${seishinzCharacter.name}: ${seishinzCharacter.bio}`,
		`Goals: ${seishinzCharacter.goals.join('; ')}`,
		`Style: ${seishinzCharacter.style.join('; ')}`,
		`Topics: ${seishinzCharacter.topics.join('; ')}`,
	].join('\n')

	const user = buildUserPrompt(input)

	if (USE_DEEPSEEK) {
		return deepseekChat({ system, user })
	}
	return openaiChat({ system, user })
}

async function openaiChat({ system, user }: { system: string; user: string }): Promise<string> {
	const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
	const completion = await openai.chat.completions.create({
		model,
		messages: [
			{ role: 'system', content: system },
			{ role: 'user', content: user },
		],
		temperature: 0.7,
		max_tokens: 220,
	})
	return completion.choices[0]?.message?.content?.trim() || ''
}

async function deepseekChat({ system, user }: { system: string; user: string }): Promise<string> {
	const apiKey = process.env.DEEPSEEK_API_KEY
	if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set')
	const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
	const res = await fetch('https://api.deepseek.com/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			messages: [
				{ role: 'system', content: system },
				{ role: 'user', content: user },
			],
			temperature: 0.7,
			max_tokens: 220,
		}),
	})
	if (!res.ok) {
		const text = await res.text()
		throw new Error(`DeepSeek API ${res.status}: ${text}`)
	}
	const data = await res.json()
	return data?.choices?.[0]?.message?.content?.trim() || ''
}

function buildUserPrompt(input: Parameters<typeof generateTweetContent>[0]): string {
	if (input.instruction === 'reply') {
		return [
			'You are replying to a mention on Twitter/X.',
			input.mentionText ? `Mention: ${input.mentionText}` : '',
			input.context ? `Context: ${input.context}` : '',
			'Keep it under 280 characters, include @user if referenced, and be helpful.',
		].filter(Boolean).join('\n')
	}
	if (input.instruction === 'analysis') {
		return [
			'Write a single tweet with an opinionated but measured analysis about Shape ecosystem.',
			input.topicHints?.length ? `Hints: ${input.topicHints.join(', ')}` : '',
			input.context ? `Context: ${input.context}` : '',
			'Keep it under 280 characters. Avoid hype, include 1 relevant hashtag max.',
		].filter(Boolean).join('\n')
	}
	return [
		'Compose a concise hourly update about a Shape project or insight.',
		input.topicHints?.length ? `Hints: ${input.topicHints.join(', ')}` : '',
		input.context ? `Context: ${input.context}` : '',
		'Keep under 280 characters. Prefer clarity over emojis. No financial advice.',
	].filter(Boolean).join('\n')
} 