import { TwitterApi } from 'twitter-api-v2';

// Twitter API client for SeishinZ account
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
      const tweet = await this.client.v2.tweet(content);
      return { success: true, tweetId: tweet.data.id, text: tweet.data.text };
    } catch (error) {
      console.error('Error posting tweet:', error);
      return { success: false, error: error.message };
    }
  }

  // Reply to a tweet
  async replyToTweet(tweetId: string, content: string) {
    try {
      const reply = await this.client.v2.reply(content, tweetId);
      return { success: true, tweetId: reply.data.id, text: reply.data.text };
    } catch (error) {
      console.error('Error replying to tweet:', error);
      return { success: false, error: error.message };
    }
  }

  // Like a tweet
  async likeTweet(tweetId: string) {
    try {
      await this.client.v2.like(process.env.TWITTER_USER_ID!, tweetId);
      return { success: true };
    } catch (error) {
      console.error('Error liking tweet:', error);
      return { success: false, error: error.message };
    }
  }

  // Retweet
  async retweet(tweetId: string) {
    try {
      await this.client.v2.retweet(process.env.TWITTER_USER_ID!, tweetId);
      return { success: true };
    } catch (error) {
      console.error('Error retweeting:', error);
      return { success: false, error: error.message };
    }
  }

  // Get mentions
  async getMentions() {
    try {
      const mentions = await this.client.v2.userMentionTimeline(process.env.TWITTER_USER_ID!);
      return { success: true, mentions: mentions.data };
    } catch (error) {
      console.error('Error getting mentions:', error);
      return { success: false, error: error.message };
    }
  }

  // Get trending topics
  async getTrendingTopics(woeid: number = 1) { // 1 = worldwide
    try {
      const trends = await this.client.v1.trendsPlace(woeid);
      return { success: true, trends: trends[0].trends };
    } catch (error) {
      console.error('Error getting trends:', error);
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
    }
  }
} 