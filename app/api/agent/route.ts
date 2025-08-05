import { NextRequest } from 'next/server';
import { SeishinZTwitterClient } from '@/lib/twitter';
import { PersonalityEngine, SEISHINZ_PERSONALITY } from '@/lib/ai-personality';
import { DeepSeekClient } from '@/lib/deepseek-client';
import { SimpleShapeClient } from '@/lib/shape-mcp-simple';
import { enhancedLearning } from '@/lib/enhanced-learning';
import { shinZDB } from '@/lib/database';

export const maxDuration = 30;

// Helper functions for learning system
function extractTopic(message: string): string {
  const topics = ['gasback', 'nft', 'shape network', 'crypto', 'blockchain', 'defi', 'rewards'];
  const lowerMessage = message.toLowerCase();
  
  for (const topic of topics) {
    if (lowerMessage.includes(topic)) {
      return topic;
    }
  }
  return 'general';
}

function analyzeSentiment(message: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['good', 'great', 'awesome', 'love', 'like', 'excellent', 'amazing'];
  const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'awful', 'horrible'];
  
  const lowerMessage = message.toLowerCase();
  
  const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function extractIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('post') && lowerMessage.includes('tweet')) return 'post_tweet';
  if (lowerMessage.includes('reply') || lowerMessage.includes('respond to')) return 'reply_to_tweet';
  if (lowerMessage.includes('mention')) return 'reply_to_mention';
  if (lowerMessage.includes('data') || lowerMessage.includes('get')) return 'get_data';
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) return 'greeting';
  
  // Check if message contains a tweet URL
  if (message.includes('twitter.com/') || message.includes('x.com/')) {
    if (lowerMessage.includes('reply') || lowerMessage.includes('respond')) {
      return 'reply_to_tweet';
    }
    return 'share_tweet';
  }
  
  return 'conversation';
}

function extractNFTMentions(message: string): string[] {
  const nftPatterns = [
    /seishinz/gi,
    /shape network/gi,
    /nft/gi,
    /collection/gi,
    /floor/gi,
    /mint/gi
  ];
  
  const mentions: string[] = [];
  nftPatterns.forEach(pattern => {
    const matches = message.match(pattern);
    if (matches) {
      mentions.push(...matches);
    }
  });
  
  return Array.from(new Set(mentions)); // Remove duplicates
}

function extractTweetId(message: string): string | null {
  // Try to extract tweet ID from X/Twitter URLs
  const urlMatch = message.match(/https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  // Try to extract tweet ID from the message (fallback)
  const tweetIdMatch = message.match(/(\d{19,})/);
  if (tweetIdMatch) {
    return tweetIdMatch[1];
  }
  
  return null;
}

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
    
    // Initialize database and learning system
    await shinZDB.initialize();
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

    // Get recent context for learning
    const recentInteractions = await shinZDB.getRecentInteractions(3);
    const contextMessages = recentInteractions.map(interaction => ({
      role: 'system' as const,
      content: `Previous interaction: User asked "${interaction.message}" and I responded about "${interaction.context.topic}"`
    }));

    // Create messages for DeepSeek with learning context
    const deepseekMessages = [
      deepseekClient.createSystemMessage(personalityEngine.generateSystemPrompt()),
      ...contextMessages,
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
            const currentUserMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
            
            let additionalData = '';
            let toolResults = '';
            
            // Check for Twitter posting requests
            if (currentUserMessage.includes('post') && currentUserMessage.includes('tweet')) {
              // Extract the tweet content from the AI response
              let tweetContent = response.content;
              
              // Try to extract just the tweet content by looking for patterns
              // Remove common prefixes and explanations
              tweetContent = tweetContent
                .replace(/^(Here's|Here is|I'll post|Posting|Tweet:?|Content:?)\s*/gi, '')
                .replace(/^(GM|Good morning|Hello|Hey)\s+/gi, '')
                .replace(/\*\*.*?\*\*/g, '') // Remove bold text
                .replace(/\[.*?\]/g, '') // Remove brackets
                .replace(/\(.*?\)/g, '') // Remove parentheses
                .replace(/---.*?---/g, '') // Remove separator lines
                .replace(/\n+/g, ' ') // Replace newlines with spaces
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
              
              // If the content is still too long, try to find the first sentence or line
              if (tweetContent.length > 280) {
                // Look for the first line that contains @mentions or hashtags
                const lines = response.content.split('\n');
                for (const line of lines) {
                  const cleanLine = line
                    .replace(/\*\*/g, '')
                    .replace(/\[.*?\]/g, '')
                    .replace(/\(.*?\)/g, '')
                    .trim();
                  
                  if (cleanLine.includes('@') || cleanLine.includes('#') || 
                      (cleanLine.length > 0 && cleanLine.length <= 280 && 
                       !cleanLine.includes('Posted') && !cleanLine.includes('Successfully') && 
                       !cleanLine.includes('View on X') && !cleanLine.includes('Tweet ID'))) {
                    tweetContent = cleanLine;
                    break;
                  }
                }
                
                // If still too long, truncate
                if (tweetContent.length > 280) {
                  tweetContent = tweetContent.substring(0, 280);
                }
              }
              
              // Clean and validate tweet content
              if (tweetContent.length > 0) {
                // Remove any markdown formatting
                tweetContent = tweetContent.replace(/\*\*/g, '').replace(/\*/g, '');
                
                // Remove any potentially problematic content
                tweetContent = tweetContent.replace(/[^\w\s@#.,!?$%&*()+\-=\[\]{}|\\:";'<>?,.\/]/g, '');
                
                console.log('Posting tweet:', tweetContent);
                
                const tweetResult = await twitterClient.postTweet(tweetContent);
                if (tweetResult.success) {
                  toolResults += `\n\n✅ **Tweet Posted Successfully!**\nTweet ID: ${tweetResult.tweetId}\nView: https://x.com/seishinzinshape/status/${tweetResult.tweetId}`;
                } else {
                  toolResults += `\n\n❌ **Failed to post tweet:** ${tweetResult.error}`;
                  if (tweetResult.details) {
                    toolResults += `\n\n**Error Details:** ${JSON.stringify(tweetResult.details, null, 2)}`;
                  }
                }
              }
            }
            
            // Check for tweet URLs and reply requests
            const tweetIdInMessage = extractTweetId(currentUserMessage);
            
            // Check if user wants to check for replies to AI's tweets
            if (currentUserMessage.includes('check replies') || currentUserMessage.includes('check responses') || currentUserMessage.includes('see replies')) {
              const mentionsResult = await twitterClient.getMentions();
              if (mentionsResult.success && mentionsResult.mentions && Array.isArray(mentionsResult.mentions) && mentionsResult.mentions.length > 0) {
                const recentMentions = mentionsResult.mentions.slice(0, 5); // Get last 5 mentions
                toolResults += `\n\n📱 **Recent Mentions/Replies:**\n`;
                recentMentions.forEach((mention, index) => {
                  toolResults += `\n${index + 1}. **@${mention.author_id}**: "${mention.text.substring(0, 50)}${mention.text.length > 50 ? '...' : ''}"\n   [View Tweet](https://x.com/seishinzinshape/status/${mention.id})`;
                });
                toolResults += `\n\n💡 **Want me to reply to any of these?** Just say "reply to mention #1" or "respond to the first mention"`;
              } else {
                toolResults += `\n\n📱 **No recent mentions found.**`;
              }
            }
            
            // Auto-reply to first 3-5 people who reply to AI's tweets
            if (currentUserMessage.includes('auto reply') || currentUserMessage.includes('reply to first') || currentUserMessage.includes('reply to all')) {
              const mentionsResult = await twitterClient.getMentions();
              if (mentionsResult.success && mentionsResult.mentions && Array.isArray(mentionsResult.mentions) && mentionsResult.mentions.length > 0) {
                const maxReplies = currentUserMessage.includes('5') ? 5 : 3; // Default to 3, or 5 if specified
                const mentionsToReply = mentionsResult.mentions.slice(0, maxReplies);
                
                toolResults += `\n\n🤖 **Auto-replying to first ${maxReplies} mentions...**\n`;
                
                for (let i = 0; i < mentionsToReply.length; i++) {
                  const mention = mentionsToReply[i];
                  
                  // Generate contextual reply based on the mention content
                  let replyContent = '';
                  const mentionText = mention.text.toLowerCase();
                  
                  if (mentionText.includes('thanks') || mentionText.includes('thank')) {
                    replyContent = `You're welcome! 🙏 Always happy to share NFT alpha! 🚀`;
                  } else if (mentionText.includes('great') || mentionText.includes('awesome') || mentionText.includes('love')) {
                    replyContent = `Thanks! 🙌 Glad you found it helpful! More alpha coming soon! 🔥`;
                  } else if (mentionText.includes('floor') || mentionText.includes('price')) {
                    replyContent = `Floor watching is key! 📊 Keep an eye on those movements! 👀`;
                  } else if (mentionText.includes('mint') || mentionText.includes('minting')) {
                    replyContent = `Mint season is here! 🎨 Good luck with your mints! 💎`;
                  } else if (mentionText.includes('nft') || mentionText.includes('collection')) {
                    replyContent = `NFTs are the future! 🚀 Keep building that collection! 💪`;
                  } else if (mentionText.includes('gasback') || mentionText.includes('rewards')) {
                    replyContent = `Gasback rewards are stacking up! 💰 Keep earning! 📈`;
                  } else if (mentionText.includes('?') || mentionText.includes('question')) {
                    replyContent = `Great question! 🤔 Let me know if you need more details! 💡`;
                  } else {
                    // Default friendly reply
                    replyContent = `Thanks for engaging! 🙏 Love the NFT community energy! 🔥`;
                  }
                  
                  // Ensure reply is under 280 characters
                  if (replyContent.length > 280) {
                    replyContent = replyContent.substring(0, 280);
                  }
                  
                  const replyResult = await twitterClient.replyToTweet(mention.id, replyContent);
                  if (replyResult.success) {
                    toolResults += `\n✅ **Replied to @${mention.author_id}**: "${replyContent}"\n   [View Reply](https://x.com/seishinzinshape/status/${replyResult.tweetId})`;
                  } else {
                    toolResults += `\n❌ **Failed to reply to @${mention.author_id}**: ${replyResult.error}`;
                  }
                  
                  // Add small delay between replies to avoid rate limiting
                  if (i < mentionsToReply.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                }
                
                toolResults += `\n\n🎯 **Auto-reply complete!** Replied to ${mentionsToReply.length} mentions.`;
              } else {
                toolResults += `\n\n📱 **No mentions found to reply to.**`;
              }
            }
            
            if (currentUserMessage.includes('reply') || currentUserMessage.includes('respond to')) {
              let tweetIdToReplyTo: string | null = tweetIdInMessage;
              
              if (tweetIdToReplyTo) {
                console.log('Extracted tweet ID:', tweetIdToReplyTo);
              }
              
              // Check if user wants to reply to a specific mention by number
              const mentionNumberMatch = currentUserMessage.match(/mention #?(\d+)/i);
              if (mentionNumberMatch) {
                const mentionIndex = parseInt(mentionNumberMatch[1]) - 1; // Convert to 0-based index
                const mentionsResult = await twitterClient.getMentions();
                if (mentionsResult.success && mentionsResult.mentions && Array.isArray(mentionsResult.mentions) && mentionsResult.mentions[mentionIndex]) {
                  tweetIdToReplyTo = mentionsResult.mentions[mentionIndex].id;
                  console.log(`Replying to mention #${mentionIndex + 1}:`, tweetIdToReplyTo);
                }
              }
              
              // If no specific tweet ID, try to get latest mention
              if (!tweetIdToReplyTo) {
                const mentionsResult = await twitterClient.getMentions();
                if (mentionsResult.success && mentionsResult.mentions && Array.isArray(mentionsResult.mentions) && mentionsResult.mentions.length > 0) {
                  tweetIdToReplyTo = mentionsResult.mentions[0].id;
                }
              }
              
              if (tweetIdToReplyTo) {
                // Extract just the reply content from the AI response
                let replyContent = response.content;
                
                // Clean up the response to get just the reply content
                replyContent = replyContent
                  .replace(/^(Here's|Here is|I'll post|Posting|Tweet:?|Content:?|Reply:?)\s*/gi, '')
                  .replace(/^(GM|Good morning|Hello|Hey)\s+/gi, '')
                  .replace(/\*\*.*?\*\*/g, '') // Remove bold text
                  .replace(/\[.*?\]/g, '') // Remove brackets
                  .replace(/\(.*?\)/g, '') // Remove parentheses
                  .replace(/---.*?---/g, '') // Remove separator lines
                  .replace(/\n+/g, ' ') // Replace newlines with spaces
                  .replace(/\s+/g, ' ') // Normalize whitespace
                  .trim();
                
                // If content is too long, truncate
                if (replyContent.length > 280) {
                  replyContent = replyContent.substring(0, 280);
                }
                
                const replyResult = await twitterClient.replyToTweet(tweetIdToReplyTo, replyContent);
                if (replyResult.success) {
                  toolResults += `\n\n✅ **Posted:** [View on X](https://twitter.com/seishinzinshape/status/${replyResult.tweetId})`;
                } else {
                  toolResults += `\n\n❌ **Failed to reply:** ${replyResult.error}`;
                  console.error('Reply failed:', replyResult.details);
                }
              } else {
                toolResults += `\n\n❌ **No tweet found to reply to.** Please provide a tweet ID or mention.`;
              }
            }
            
            // If message contains a tweet URL but no reply request, offer to reply
            if (tweetIdInMessage && !currentUserMessage.includes('reply') && !currentUserMessage.includes('respond to')) {
              toolResults += `\n\n🔗 **I detected a tweet link in your message!**\n\nWant me to reply to this tweet? Just say "reply to this tweet" or "respond to this tweet" and I'll post a reply! 🚀`;
            }
            
            // Add Shape Network data only when user explicitly requests it with specific phrases
            if (currentUserMessage.includes('get gasback data') || currentUserMessage.includes('show gasback') || currentUserMessage.includes('gasback stats') || currentUserMessage.includes('gasback information')) {
              const gasbackData = await shapeClient.getGasbackData();
              if (gasbackData.success) {
                additionalData += `\n\n📊 **Gasback Data:**\nTotal Rewards: ${gasbackData.data.totalRewards}\nAverage Reward: ${gasbackData.data.averageReward}\nTotal Users: ${gasbackData.data.totalUsers}`;
              }
            }
            
            if (currentUserMessage.includes('get nft data') || currentUserMessage.includes('show nft') || currentUserMessage.includes('nft stats') || currentUserMessage.includes('nft information') || currentUserMessage.includes('collection stats')) {
              const nftData = await shapeClient.getNFTCollectionAnalytics();
              if (nftData.success) {
                additionalData += `\n\n🎨 **NFT Collections:**\nSeishinZ Floor: ${nftData.data.collections[0].floorPrice}\nVolume: ${nftData.data.collections[0].volume}\nHolders: ${nftData.data.collections[0].holders}`;
              }
            }
            
            if (currentUserMessage.includes('stack') || currentUserMessage.includes('achievement') || currentUserMessage.includes('get stack data')) {
              const stackData = await shapeClient.getStackAchievements();
              if (stackData.success) {
                additionalData += `\n\n🏆 **Stack Achievements:**\n${stackData.data.achievements.length} achievements available\nTop user has ${stackData.data.leaderboard[0].points} points`;
              }
            }
            
            // Send the enhanced response with tool results
            const finalContent = response.content + additionalData + toolResults;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: finalContent })}\n\n`));

            // Log the interaction for learning
            const isTweetPost = currentUserMessage.includes('post') && currentUserMessage.includes('tweet');
            
            // Create interaction record for learning
            const interaction = {
              id: Date.now().toString(),
              user_id: 'anonymous', // You can implement user identification later
              message: currentUserMessage,
              ai_response: finalContent,
              context: {
                topic: extractTopic(currentUserMessage),
                sentiment: analyzeSentiment(currentUserMessage),
                intent: extractIntent(currentUserMessage),
                nft_mentioned: extractNFTMentions(currentUserMessage),
              },
              engagement: {
                likes: 0,
                retweets: 0,
                replies: 0,
                impressions: 0,
              },
              created_at: new Date(),
            };
            
            // Learn from the interaction
            await enhancedLearning.learnFromInteraction(interaction);
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