# SeishinZ X AI Agent

An intelligent AI agent that manages the SeishinZ X (Twitter) account, combining X functionality with real-time Shape Network blockchain data.

## 🚀 Features

### X (Twitter) Account Management
- **Post tweets** to the SeishinZ X account
- **Reply to mentions** and engage with followers
- **Monitor trending topics** and create relevant content
- **Search and analyze tweets** for insights
- **Like and retweet** relevant content

### Shape Network Integration
- **Gasback rewards data** - Share latest reward statistics
- **NFT collection analytics** - Post about trending collections
- **Stack achievements** - Highlight user accomplishments
- **Chain status** - Share network updates and statistics

### AI-Powered Features
- **Intelligent content creation** based on real-time data
- **Contextual responses** to mentions and comments
- **Trend analysis** and content recommendations
- **Brand voice consistency** across all interactions

## 🛠️ Technology Stack

- **Next.js 14** - React framework with App Router
- **Vercel AI SDK** - AI agent development and streaming
- **Shape Network MCP** - Blockchain data access
- **Twitter API v2** - X (Twitter) account management
- **DeepSeek API** - Advanced AI reasoning and content generation
- **Tailwind CSS** - Modern UI styling
- **TypeScript** - Type safety and development experience

## 📋 Prerequisites

Before setting up the project, you'll need:

1. **X (Twitter) Developer Account** with API access
2. **DeepSeek API Key** for AI functionality (advanced reasoning and content generation)
3. **Shape Network MCP Server** (or use the hosted version)
4. **Node.js 18+** and npm/yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd seishinz-ai-agent
npm install
```

### 2. Environment Setup

Create a `.env.local` file with the following variables:

```env
# DeepSeek API Key
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# X (Twitter) API Keys
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_SECRET=your_twitter_access_secret_here
TWITTER_USER_ID=your_twitter_user_id_here

# Shape Network MCP Server
SHAPE_MCP_URL=https://shape-mcp-server.vercel.app/mcp

# Optional: Alchemy API
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

### 3. Twitter API Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app and get your API keys
3. Generate access tokens with read/write permissions
4. Add your Twitter user ID to the environment variables

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the AI agent interface.

## 🎯 Usage

### Chat Interface
- **Natural language commands** - "Post a tweet about Gasback rewards"
- **Multi-step actions** - "Check mentions and reply to relevant ones"
- **Data-driven content** - "Get NFT analytics and create a tweet"

### Quick Actions
- **Post GM Tweet** - Post daily GM tweet with seishinz.xyz
- **Post Gasback Tweet** - Share latest reward statistics
- **Post NFT Update** - Share trending collections
- **Auto-Reply to Mentions** - Reply to recent mentions
- **Check Replies** - View recent mentions and replies

### Admin Controls
- **Admin Toggle** - Click the "🔓 Enable Admin" button in the sidebar to bypass access code requirements for development

### Automated Features
- **🤖 AI Scheduler** - Intelligent automation system that handles all daily tasks
- **Daily GM Tweets** - Automatically posts GM tweets every day at 9 AM with @ShapeL2 and seishinz.xyz
- **Weekly Gasback Updates** - Posts Gasback rewards updates every Monday at 10 AM
- **Daily NFT Updates** - Posts NFT collection analytics daily at 2 PM
- **Community Engagement** - Automatically replies to mentions every 4 hours

## 🔧 API Endpoints

### `/api/agent`
Main AI agent endpoint that handles:
- X account operations (post, reply, like, retweet)
- Shape Network data queries
- AI reasoning and content generation

### `/api/ai-scheduler`
AI-powered scheduler endpoint that handles:
- Start/stop automated tasks
- Schedule optimization
- Task status monitoring

### `/api/cron/gm-tweet`
Daily GM tweet endpoint for manual triggering

## 📁 Project Structure

```
seishinz-ai-agent/
├── app/
│   ├── api/agent/route.ts    # Main AI agent API
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main UI component
├── lib/
│   ├── twitter.ts            # Twitter API client
│   └── shape-mcp.ts          # Shape Network MCP client
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 🔒 Security Considerations

- **API Keys**: Never commit API keys to version control
- **Rate Limiting**: Respect Twitter API rate limits
- **Content Moderation**: Review AI-generated content before posting
- **Access Control**: Implement proper authentication for production

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
- Check the [Shape Network AI documentation](https://docs.shape.network/building-on-shape/ai)
- Review Twitter API documentation
- Open an issue in this repository

## 🔮 Future Enhancements

- **Scheduled posting** - Automate content scheduling
- **Analytics dashboard** - Track engagement metrics
- **Multi-language support** - International audience engagement
- **Advanced content generation** - More sophisticated AI prompts
- **Community management** - Automated community engagement 