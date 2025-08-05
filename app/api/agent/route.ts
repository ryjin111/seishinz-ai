import { NextRequest } from 'next/server';
import { SeishinZTwitterClient } from '@/lib/twitter';
import { PersonalityEngine, SEISHINZ_PERSONALITY } from '@/lib/ai-personality';
import { DeepSeekClient } from '@/lib/deepseek-client';

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
    const personalityEngine = new PersonalityEngine(SEISHINZ_PERSONALITY);
    const deepseekClient = new DeepSeekClient({
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: 'deepseek-chat',
      maxTokens: 1000,
      temperature: 0.7,
    });

    // Create custom tools for X functionality
    const customTools = [
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

    // Create messages for DeepSeek
    const deepseekMessages = [
      deepseekClient.createSystemMessage(personalityEngine.generateSystemPrompt()),
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await deepseekClient.streamChat(deepseekMessages, (chunk: string) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          });
          
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