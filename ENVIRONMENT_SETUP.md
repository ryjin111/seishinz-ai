# Environment Setup Guide for SeishinZ X AI Agent

## 🚀 Quick Setup

Create a `.env.local` file in your project root with the following variables:

```env
# DeepSeek API Key for AI functionality
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Twitter API Keys for X account management
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_SECRET=your_twitter_access_secret_here
TWITTER_USER_ID=your_twitter_user_id_here

# Shape Network MCP Server URL
SHAPE_MCP_URL=https://shape-mcp-server.vercel.app/mcp

# Optional: Alchemy API for additional blockchain data
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Optional: Redis URL for caching (if using)
REDIS_URL=your_redis_url_here

# Development settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔑 API Key Setup Instructions

### 1. DeepSeek API Key
**Required for AI functionality**

1. Visit [DeepSeek API Console](https://platform.deepseek.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to `DEEPSEEK_API_KEY`

### 2. Twitter API Keys
**Required for X account management**

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app (if you don't have one)
3. Navigate to "Keys and Tokens"
4. Generate the following:
   - **API Key** → `TWITTER_API_KEY`
   - **API Secret** → `TWITTER_API_SECRET`
   - **Access Token** → `TWITTER_ACCESS_TOKEN`
   - **Access Token Secret** → `TWITTER_ACCESS_SECRET`
5. Get your **User ID** from your profile or use a tool like [TweeterID](https://tweeterid.com/)
6. Add your User ID to `TWITTER_USER_ID`

### 3. Shape Network MCP Server
**Optional - Uses hosted version by default**

- `SHAPE_MCP_URL` is already set to the hosted version
- If you want to run your own MCP server, update this URL

### 4. Alchemy API Key
**Optional - For additional blockchain data**

1. Visit [Alchemy](https://www.alchemy.com/)
2. Create a free account
3. Create a new app
4. Copy the API key to `ALCHEMY_API_KEY`

### 5. Redis URL
**Optional - For caching**

- Only needed if you want to implement caching
- Format: `redis://username:password@host:port`

## 🔒 Security Notes

- **Never commit** your `.env.local` file to version control
- **Keep your API keys secure** and don't share them
- **Use different keys** for development and production
- **Rotate keys regularly** for security

## 🧪 Testing Your Setup

After setting up your environment variables:

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Test the AI agent:**
   - Open http://localhost:3000
   - Try a simple command like "Hello SeishinZ!"
   - Check the console for any API errors

3. **Verify API connections:**
   - Grok API: Should respond to chat messages
   - Twitter API: Will show errors if keys are invalid
   - Shape MCP: Will use fallback if unavailable

## 🚨 Troubleshooting

### Common Issues:

1. **"DEEPSEEK_API_KEY is not defined"**
   - Make sure your `.env.local` file is in the project root
   - Restart the development server after adding variables

2. **Twitter API errors**
   - Verify all Twitter keys are correct
   - Check that your app has the right permissions
   - Ensure your User ID is correct

3. **Shape MCP connection issues**
   - The hosted version should work by default
   - Check your internet connection

4. **Port 3000 already in use**
   - Kill the existing process or use a different port
   - Update `NEXT_PUBLIC_APP_URL` if you change the port

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPSEEK_API_KEY` | ✅ | DeepSeek API key for AI functionality |
| `TWITTER_API_KEY` | ✅ | Twitter API key |
| `TWITTER_API_SECRET` | ✅ | Twitter API secret |
| `TWITTER_ACCESS_TOKEN` | ✅ | Twitter access token |
| `TWITTER_ACCESS_SECRET` | ✅ | Twitter access token secret |
| `TWITTER_USER_ID` | ✅ | Your Twitter user ID |
| `SHAPE_MCP_URL` | ❌ | Shape Network MCP server URL |
| `ALCHEMY_API_KEY` | ❌ | Alchemy API key for blockchain data |
| `REDIS_URL` | ❌ | Redis URL for caching |
| `NODE_ENV` | ❌ | Environment (development/production) |
| `NEXT_PUBLIC_APP_URL` | ❌ | Public app URL |

## 🎯 Next Steps

Once your environment is set up:

1. **Test the AI agent** with various commands
2. **Explore the personality features** in the UI
3. **Try the quick actions** for common tasks
4. **Customize the personality** if needed
5. **Deploy to production** when ready

Happy coding! 🚀✨ 