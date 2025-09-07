'use client'

import { useState } from 'react'

async function trigger(path: string) {
	const res = await fetch(path, { method: 'POST' })
	return res.json()
}

export default function Page() {
	const [logs, setLogs] = useState<string[]>([])
	const [loading, setLoading] = useState<string | null>(null)
	const [cmd, setCmd] = useState('help')
	const [dryRun, setDryRun] = useState(true)
	const [draft, setDraft] = useState<string>('')

	const run = async (label: string, path: string) => {
		setLoading(label)
		try {
			const data = await trigger(path)
			setLogs((l) => [
				`${new Date().toLocaleTimeString()} ${label}: ${data.status || data.ok || 'ok'}`,
				...l,
			])
		} catch (e: any) {
			setLogs((l) => [
				`${new Date().toLocaleTimeString()} ${label}: error ${e?.message || e}`,
				...l,
			])
		} finally {
			setLoading(null)
		}
	}

	const sendCommand = async () => {
		setLoading('Command')
		setDraft('')
		try {
			const res = await fetch('/api/command', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ command: cmd, dryRun }),
			})
			const data = await res.json()
			if (data?.content) setDraft(data.content)
			setLogs((l) => [
				`${new Date().toLocaleTimeString()} Command: ${data.action || ''} ${data.posted ? 'posted' : 'ok'}`,
				...l,
			])
		} catch (e: any) {
			setLogs((l) => [
				`${new Date().toLocaleTimeString()} Command error: ${e?.message || e}`,
				...l,
			])
		} finally {
			setLoading(null)
		}
	}

	return (
		<main className="max-w-3xl mx-auto p-6 space-y-6">
			<header className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">SeishinZ AI Dashboard</h1>
				<a className="text-blue-600 underline" href="https://x.com/seishinzinshape" target="_blank" rel="noreferrer">@seishinzinshape</a>
			</header>

			<section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				<button onClick={() => run('Tweet Hourly', '/api/cron/tweet-hourly')} disabled={loading!==null} className="px-4 py-3 rounded bg-black text-white disabled:opacity-50">{loading==='Tweet Hourly'?'Running...':'Run Hourly Tweet'}</button>
				<button onClick={() => run('Reply Mentions', '/api/cron/reply-mentions')} disabled={loading!==null} className="px-4 py-3 rounded bg-black text-white disabled:opacity-50">{loading==='Reply Mentions'?'Running...':'Reply Mentions'}</button>
				<button onClick={() => run('Analysis', '/api/cron/analysis')} disabled={loading!==null} className="px-4 py-3 rounded bg-black text-white disabled:opacity-50">{loading==='Analysis'?'Running...':'Run Analysis'}</button>
			</section>

			<section className="space-y-3">
				<h2 className="text-lg font-medium">Command Console</h2>
				<textarea value={cmd} onChange={(e) => setCmd(e.target.value)} className="w-full h-28 p-3 border rounded font-mono" placeholder="e.g. ai tweet: highlight a Shape project" />
				<div className="flex items-center gap-3">
					<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dryRun} onChange={(e)=>setDryRun(e.target.checked)} /> Dry run</label>
					<button onClick={sendCommand} disabled={loading!==null} className="px-4 py-2 rounded bg-zinc-900 text-white disabled:opacity-50">{loading==='Command'?'Processing...':'Send Command'}</button>
				</div>
				{draft ? (
					<div className="p-3 border rounded bg-zinc-50">
						<div className="text-xs text-zinc-500 mb-1">Draft</div>
						<div className="whitespace-pre-wrap">{draft}</div>
					</div>
				) : null}
				<div className="text-xs text-zinc-500">Commands: help · tweet: &lt;text&gt; · ai tweet: &lt;hint&gt; · analysis</div>
			</section>

			<section>
				<h2 className="text-lg font-medium mb-2">Logs</h2>
				<div className="text-sm space-y-1">
					{logs.length===0 ? <p className="text-zinc-500">No runs yet.</p> : logs.map((l, i) => (<div key={i} className="font-mono">{l}</div>))}
				</div>
			</section>

			<section className="text-xs text-zinc-500">
				<p>Vercel cron will call these endpoints automatically on schedule.</p>
			</section>
		</main>
	)
} 