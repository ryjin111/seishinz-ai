'use client'

import { useEffect, useRef, useState } from 'react'

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
	const [messages, setMessages] = useState<{ role: 'user'|'assistant'|'system'; content: string; posted?: boolean; at: number }[]>([
		{ role: 'system', content: 'Welcome to SeishinZ Command Console. Type "help" for available commands.', at: Date.now() }
	])
	const listRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight
		}
	}, [messages])

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
		const text = cmd.trim()
		if (!text) return
		setLoading('Command')
		setDraft('')
		setMessages((m) => [...m, { role: 'user', content: text, at: Date.now() }])
		try {
			const res = await fetch('/api/command', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ command: text, dryRun }),
			})
			const data = await res.json()
			if (data?.content) setDraft(data.content)
			setMessages((m) => [...m, { role: 'assistant', content: data?.content || (data?.help ?? 'OK'), posted: !!data?.posted, at: Date.now() }])
			setLogs((l) => [
				`${new Date().toLocaleTimeString()} Command: ${data.action || ''} ${data.posted ? 'posted' : 'ok'}`,
				...l,
			])
		} catch (e: any) {
			setMessages((m) => [...m, { role: 'assistant', content: `Error: ${e?.message || e}`, at: Date.now() }])
			setLogs((l) => [
				`${new Date().toLocaleTimeString()} Command error: ${e?.message || e}`,
				...l,
			])
		} finally {
			setLoading(null)
		}
	}

	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			sendCommand()
		}
	}

	const examples = [
		'help',
		'analysis',
		'ai tweet: highlight a new Shape project launching this week',
		'tweet: Building on Shape, one block at a time. #Shape',
	]

	const count = draft.length
	const countClass = count > 280 ? 'text-red-600' : count > 240 ? 'text-yellow-600' : 'text-zinc-500'

	return (
		<main className="max-w-4xl mx-auto p-6 space-y-6">
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
				<div ref={listRef} className="h-72 w-full border rounded bg-white overflow-y-auto p-3 space-y-3">
					{messages.map((m, i) => (
						<div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
							<div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap shadow ${m.role==='user'?'bg-zinc-900 text-white':'bg-zinc-100 text-zinc-900'}`}>
								{m.content}
								{m.role==='assistant' && m.posted ? <div className="text-[10px] mt-1 opacity-70">posted</div> : null}
							</div>
						</div>
					))}
				</div>
				<div className="flex flex-wrap gap-2">
					{examples.map((ex) => (
						<button key={ex} onClick={() => setCmd(ex)} className="text-xs px-2 py-1 rounded-full border bg-zinc-50 hover:bg-zinc-100">
							{ex}
						</button>
					))}
				</div>
				<div className="flex items-start gap-3">
					<textarea value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={onKeyDown} className="flex-1 h-24 p-3 border rounded font-mono" placeholder="Type a command. Press Enter to send, Shift+Enter for newline." />
					<div className="flex flex-col gap-2 w-40">
						<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dryRun} onChange={(e)=>setDryRun(e.target.checked)} /> Dry run</label>
						<button onClick={sendCommand} disabled={loading!==null} className="px-3 py-2 rounded bg-zinc-900 text-white disabled:opacity-50">{loading==='Command'?'Processing...':'Send'}</button>
					</div>
				</div>
				{draft ? (
					<div className="p-3 border rounded bg-zinc-50">
						<div className="flex items-center justify-between text-xs text-zinc-500 mb-1"><span>Draft</span><span className={countClass}>{count}/280</span></div>
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