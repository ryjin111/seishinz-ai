# SeishinZ AI

Autonomous Shape Chain Twitter/X agent using a lightweight Eliza-style character, optional Shape MCP insights, and Vercel Cron.

- Hourly tweets about Shape ecosystem
- Replies to mentions
- Periodic opinions/analysis
- Minimal dashboard at `/` to trigger runs manually

## Quick Deploy (Vercel)

1. Import this repo into Vercel
2. Set Environment Variables:
   - `AI_PROVIDER` (optional: `deepseek` or `openai`; auto-selects by available keys)
   - `OPENAI_API_KEY` (and `OPENAI_MODEL`, default `gpt-4o-mini`)
   - `DEEPSEEK_API_KEY` (and `DEEPSEEK_MODEL`, default `deepseek-chat`)
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_SECRET`
   - `SHAPE_MCP_HTTP_URL` (optional JSON-RPC endpoint)
3. Deploy. Vercel Cron (configured in `vercel.json`) will call:
   - `/api/cron/tweet-hourly` hourly
   - `/api/cron/reply-mentions` every 10 minutes
   - `/api/cron/analysis` every 6 hours

The dashboard at `/` lets you trigger these endpoints manually.

## Model provider selection

- If `AI_PROVIDER=deepseek`, DeepSeek is used.
- Else if `DEEPSEEK_API_KEY` is present and `OPENAI_API_KEY` is not, DeepSeek is used.
- Otherwise OpenAI is used.

## References

- ElizaOS concepts: https://docs.elizaos.ai/
- Shape MCP client demo repo: https://github.com/shape-network/mcp-client-demo
- Demo: https://shape-mcp-client-demo.vercel.app/

## Safety

- Tweets are kept under 280 chars, opinionated but measured; no financial advice.
- Twitter credentials must be user-context keys with OAuth 1.0a enabled. 