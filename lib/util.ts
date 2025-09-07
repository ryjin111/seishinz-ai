export function splitIntoTweets(text: string, limit = 280): string[] {
	const parts: string[] = []
	let remaining = text.trim()
	while (remaining.length > limit) {
		let idx = remaining.lastIndexOf(' ', limit)
		if (idx <= 0) idx = limit
		parts.push(remaining.slice(0, idx).trim())
		remaining = remaining.slice(idx).trim()
	}
	if (remaining) parts.push(remaining)
	return parts
} 