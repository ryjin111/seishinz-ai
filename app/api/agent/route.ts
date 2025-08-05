import { NextRequest } from 'next/server';
import { SeishinZTwitterClient } from '@/lib/twitter';
import { PersonalityEngine, SEISHINZ_PERSONALITY } from '@/lib/ai-personality';
import { DeepSeekClient } from '@/lib/deepseek-client';
import { SimpleShapeClient } from '@/lib/shape-mcp-simple';

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  return new Response(JSON.stringify({ 
    message: "SeishinZ AI Agent API", 
    status: "running",
    endpoints: {
      chat: "POST /api/agent"
    }
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request format. Expected messages array.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if DeepSeek API key is available
    if (!process.env.DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'DEEPSEEK_API_KEY not configured. Please add it to your .env.local file.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize clients
    const twitterClient = new SeishinZTwitterClient();
    const shapeClient = new SimpleShapeClient();
    const personalityEngine = new PersonalityEngine(SEISHINZ_PERSONALITY);
    const deepseekClient = new DeepSeekClient({
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: 'deepseek-chat',
      maxTokens: 1000,
      temperature: 0.7,
    });

    // Create custom tools for X functionality
    const xTools = [
      {
        name: 'post_tweet',
        description: 'Post a tweet to the SeishinZ X account',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'The tweet content to post'
            }
          },
          required: ['content']
        }
      },
      {
        name: 'reply_to_tweet',
        description: 'Reply to a specific tweet',
        inputSchema: {
          type: 'object',
          properties: {
            tweetId: {
              type: 'string',
              description: 'The ID of the tweet to reply to'
            },
            content: {
              type: 'string',
              description: 'The reply content'
            }
          },
          required: ['tweetId', 'content']
        }
      },
      {
        name: 'get_mentions',
        description: 'Get recent mentions of the SeishinZ account'
      },
      {
        name: 'get_trending_topics',
        description: 'Get current trending topics on X'
      },
      {
        name: 'search_tweets',
        description: 'Search for tweets with specific keywords',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results (default: 10)'
            }
          },
          required: ['query']
        }
      }
    ];

    // Create Shape Network tools
    const shapeTools = [
      {
        name: 'get_gasback_data',
        description: 'Get Gasback rewards data from Shape Network',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_nft_analytics',
        description: 'Get NFT collection analytics from Shape Network',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_stack_achievements',
        description: 'Get Stack achievements and leaderboard data',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_chain_status',
        description: 'Get Shape Network chain status and metrics',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    ];

    // Combine all tools
    const allTools = [...xTools, ...shapeTools];

    // Create messages for DeepSeek
    const deepseekMessages = [
      deepseekClient.createSystemMessage(personalityEngine.generateSystemPrompt()),
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];

    // Create a streaming response with tool calling
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // First, send the system message and user message
          const response = await deepseekClient.chat(deepseekMessages);
          
          if (response.error) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: `Error: ${response.error}` })}\n\n`));
          } else {
            // Check if the response mentions any tools we should call
            const content = response.content.toLowerCase();
            const userMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
            
            let additionalData = '';
            let toolResults = '';
            
            // Check for Twitter posting requests
            if (userMessage.includes('post') && userMessage.includes('tweet')) {
              // Extract the tweet content from the AI response
              const tweetContent = response.content;
              if (tweetContent.length > 0) {
                const tweetResult = await twitterClient.postTweet(tweetContent);
                if (tweetResult.success) {
                  toolResults += `\n\n✅ **Tweet Posted Successfully!**\nTweet ID: ${tweetResult.tweetId}\nView: https://x.com/seishinzinshape/status/${tweetResult.tweetId}`;
                } else {
                  toolResults += `\n\n❌ **Failed to post tweet:** ${tweetResult.error}`;
                }
              }
            }
            
            // Check for reply requests
            if (userMessage.includes('reply') && userMessage.includes('mention')) {
              const mentionsResult = await twitterClient.getMentions();
              if (mentionsResult.success && mentionsResult.mentions && Array.isArray(mentionsResult.mentions) && mentionsResult.mentions.length > 0) {
                const latestMention = mentionsResult.mentions[0];
                const replyContent = `Thanks for the mention! ${response.content}`;
                const replyResult = await twitterClient.replyToTweet(latestMention.id, replyContent);
                if (replyResult.success) {
                  toolResults += `\n\n✅ **Replied to mention:** ${replyResult.tweetId}`;
                } else {
                  toolResults += `\n\n❌ **Failed to reply:** ${replyResult.error}`;
                }
              }
            }
            
            // Add Shape Network data based on content
            if (content.includes('gasback') || content.includes('reward')) {
              const gasbackData = await shapeClient.getGasbackData();
              if (gasbackData.success) {
                additionalData += `\n\n📊 **Gasback Data:**\nTotal Rewards: ${gasbackData.data.totalRewards}\nAverage Reward: ${gasbackData.data.averageReward}\nTotal Users: ${gasbackData.data.totalUsers}`;
              }
            }
            
            if (content.includes('nft') || content.includes('collection')) {
              const nftData = await shapeClient.getNFTCollectionAnalytics();
              if (nftData.success) {
                additionalData += `\n\n🎨 **NFT Collections:**\nSeishinZ Floor: ${nftData.data.collections[0].floorPrice}\nVolume: ${nftData.data.collections[0].volume}\nHolders: ${nftData.data.collections[0].holders}`;
              }
            }
            
            if (content.includes('stack') || content.includes('achievement')) {
              const stackData = await shapeClient.getStackAchievements();
              if (stackData.success) {
                additionalData += `\n\n🏆 **Stack Achievements:**\n${stackData.data.achievements.length} achievements available\nTop user has ${stackData.data.leaderboard[0].points} points`;
              }
            }
            
            // Send the enhanced response with tool results
            const finalContent = response.content + additionalData + toolResults;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: finalContent })}\n\n`));
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in AI agent:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 