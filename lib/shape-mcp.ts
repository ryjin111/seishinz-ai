type MCPResult = {
	insights: string[]
}

export async function fetchShapeInsights(hints?: string[]): Promise<string[]> {
	const endpoint = process.env.SHAPE_MCP_HTTP_URL
	if (!endpoint) {
		return hints && hints.length ? hints : [
			'New tooling on Shape for onchain data indexing',
			'Partner integration shipped this week',
		]
	}
	try {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: String(Date.now()),
				method: 'shape.get_insights',
				params: { hints: hints || [] },
			}),
		})
		if (!res.ok) throw new Error(`MCP ${res.status}`)
		const data = await res.json()
		const result: MCPResult | undefined = data?.result
		return result?.insights?.slice(0, 5) || hints || []
	} catch (e) {
		console.error('Shape MCP error', e)
		return hints || []
	}
} 