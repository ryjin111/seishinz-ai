import { TwitterApi } from 'twitter-api-v2';

// Twitter API client for SeishinZ account
export interface MentionsResult {
  success: boolean;
  mentions?: any[];
  error?: string;
}

export class SeishinZTwitterClient {
  private client: TwitterApi;

  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
  }

  // Post a tweet
  async postTweet(content: string) {
    try {
      console.log('Attempting to post tweet:', content.substring(0, 50) + '...');
      console.log('Twitter client initialized:', !!this.client);
      
      const tweet = await this.client.v2.tweet(content);
      console.log('Tweet posted successfully:', tweet.data.id);
      return { success: true, tweetId: tweet.data.id, text: tweet.data.text };
    } catch (error) {
      console.error('Error posting tweet:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        status: (error as any)?.status,
        data: (error as any)?.data
      });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: (error as any)?.data || error
      };
    }
  }

  // Reply to a tweet
  async replyToTweet(tweetId: string, content: string) {
    try {
      console.log('Attempting to reply to tweet:', tweetId);
      console.log('Reply content:', content.substring(0, 50) + '...');
      
      const reply = await this.client.v2.reply(content, tweetId);
      console.log('Reply posted successfully:', reply.data.id);
      return { success: true, tweetId: reply.data.id, text: reply.data.text };
    } catch (error) {
      console.error('Error replying to tweet:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        status: (error as any)?.status,
        data: (error as any)?.data
      });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: (error as any)?.data || error
      };
    }
  }

  // Like a tweet
  async likeTweet(tweetId: string) {
    try {
      await this.client.v2.like(process.env.TWITTER_USER_ID!, tweetId);
      return { success: true };
    } catch (error) {
      console.error('Error liking tweet:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Retweet
  async retweet(tweetId: string) {
    try {
      await this.client.v2.retweet(process.env.TWITTER_USER_ID!, tweetId);
      return { success: true };
    } catch (error) {
      console.error('Error retweeting:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get mentions
  async getMentions(): Promise<MentionsResult> {
    try {
      const mentions = await this.client.v2.userMentionTimeline(process.env.TWITTER_USER_ID!);
      return { success: true, mentions: mentions.data || [] };
    } catch (error) {
      console.error('Error getting mentions:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get trending topics
  async getTrendingTopics(woeid: number = 1) { // 1 = worldwide
    try {
      const trends = await this.client.v1.trendsByPlace(woeid);
      return { success: true, trends: trends[0].trends };
    } catch (error) {
      console.error('Error getting trends:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Search tweets
  async searchTweets(query: string, maxResults: number = 10) {
    try {
      const tweets = await this.client.v2.search(query, {
        max_results: maxResults,
        'tweet.fields': ['author_id', 'created_at', 'public_metrics'],
      });
      return { success: true, tweets: tweets.data };
    } catch (error) {
      console.error('Error searching tweets:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
} 