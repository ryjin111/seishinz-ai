// Database system for ShinZ AI learning and memory
import { createClient } from '@supabase/supabase-js';

export interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  floor_price: number;
  volume_24h: number;
  holders: number;
  total_supply: number;
  description?: string;
  traits?: NFTTrait[];
  created_at: Date;
  updated_at: Date;
}

export interface NFTTrait {
  id: string;
  collection_id: string;
  trait_type: string;
  trait_value: string;
  rarity_percentage: number;
  floor_price?: number;
  count: number;
}

export interface UserInteraction {
  id: string;
  user_id: string;
  message: string;
  ai_response: string;
  context: {
    topic: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    intent: string;
    nft_mentioned?: string[];
  };
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
    impressions: number;
  };
  created_at: Date;
}

export interface MarketInsight {
  id: string;
  collection_id: string;
  insight_type: 'floor_movement' | 'volume_spike' | 'rare_mint' | 'community_event';
  title: string;
  description: string;
  data: any;
  confidence: number;
  created_at: Date;
}

export interface CommunityMember {
  id: string;
  username: string;
  wallet_address?: string;
  join_date: Date;
  engagement_score: number;
  preferences: {
    favorite_collections: string[];
    trading_style: 'flipper' | 'holder' | 'collector';
    risk_tolerance: 'low' | 'medium' | 'high';
  };
  interactions: number;
  last_active: Date;
}

export interface LearningMemory {
  id: string;
  category: 'nft_knowledge' | 'market_patterns' | 'user_preferences' | 'community_insights';
  key: string;
  value: any;
  confidence: number;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface TweetPerformance {
  id: string;
  tweet_id: string;
  content: string;
  hashtags: string[];
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
    impressions: number;
  };
  performance_score: number;
  created_at: Date;
}

export interface GmTweet {
  id: string;
  date: string;
  timestamp: string;
  success: boolean;
  tweet_id?: string;
  content?: string;
  error?: string;
}

class ShinZDatabase {
  private supabase: any;
  private isLocal: boolean;
  private localData!: {
    collections: Map<string, NFTCollection>;
    interactions: UserInteraction[];
    insights: MarketInsight[];
    members: Map<string, CommunityMember>;
    memories: Map<string, LearningMemory>;
    tweets: TweetPerformance[];
    gmTweets: GmTweet[];
  };

  constructor() {
    // Check if we have Supabase credentials
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
      this.isLocal = false;
    } else {
      this.isLocal = true;
      this.initializeLocalStorage();
    }
  }

  private initializeLocalStorage() {
    this.localData = {
      collections: new Map(),
      interactions: [],
      insights: [],
      members: new Map(),
      memories: new Map(),
      tweets: [],
      gmTweets: []
    };
  }

  // NFT Collection Management
  async saveCollection(collection: NFTCollection): Promise<void> {
    if (this.isLocal) {
      this.localData.collections.set(collection.id, collection);
      this.saveToLocalStorage('collections', Array.from(this.localData.collections.values()));
    } else {
      await this.supabase
        .from('nft_collections')
        .upsert(collection);
    }
  }

  async getCollection(id: string): Promise<NFTCollection | null> {
    if (this.isLocal) {
      return this.localData.collections.get(id) || null;
    } else {
      const { data, error } = await this.supabase
        .from('nft_collections')
        .select('*')
        .eq('id', id)
        .single();
      
      return error ? null : data;
    }
  }

  async getAllCollections(): Promise<NFTCollection[]> {
    if (this.isLocal) {
      return Array.from(this.localData.collections.values());
    } else {
      const { data, error } = await this.supabase
        .from('nft_collections')
        .select('*')
        .order('updated_at', { ascending: false });
      
      return error ? [] : data;
    }
  }

  // User Interaction Tracking
  async saveInteraction(interaction: UserInteraction): Promise<void> {
    if (this.isLocal) {
      this.localData.interactions.push(interaction);
      this.saveToLocalStorage('interactions', this.localData.interactions);
    } else {
      await this.supabase
        .from('user_interactions')
        .insert(interaction);
    }
  }

  async getRecentInteractions(limit: number = 50): Promise<UserInteraction[]> {
    if (this.isLocal) {
      return this.localData.interactions
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(0, limit);
    } else {
      const { data, error } = await this.supabase
        .from('user_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      return error ? [] : data;
    }
  }

  // Market Insights
  async saveInsight(insight: MarketInsight): Promise<void> {
    if (this.isLocal) {
      this.localData.insights.push(insight);
      this.saveToLocalStorage('insights', this.localData.insights);
    } else {
      await this.supabase
        .from('market_insights')
        .insert(insight);
    }
  }

  async getInsightsByCollection(collectionId: string): Promise<MarketInsight[]> {
    if (this.isLocal) {
      return this.localData.insights.filter(i => i.collection_id === collectionId);
    } else {
      const { data, error } = await this.supabase
        .from('market_insights')
        .select('*')
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false });
      
      return error ? [] : data;
    }
  }

  // Community Member Management
  async saveMember(member: CommunityMember): Promise<void> {
    if (this.isLocal) {
      this.localData.members.set(member.id, member);
      this.saveToLocalStorage('members', Array.from(this.localData.members.values()));
    } else {
      await this.supabase
        .from('community_members')
        .upsert(member);
    }
  }

  async getMember(id: string): Promise<CommunityMember | null> {
    if (this.isLocal) {
      return this.localData.members.get(id) || null;
    } else {
      const { data, error } = await this.supabase
        .from('community_members')
        .select('*')
        .eq('id', id)
        .single();
      
      return error ? null : data;
    }
  }

  // Learning Memory System
  async saveMemory(memory: LearningMemory): Promise<void> {
    if (this.isLocal) {
      this.localData.memories.set(memory.key, memory);
      this.saveToLocalStorage('memories', Array.from(this.localData.memories.values()));
    } else {
      await this.supabase
        .from('learning_memories')
        .upsert(memory);
    }
  }

  async getMemory(key: string): Promise<LearningMemory | null> {
    if (this.isLocal) {
      return this.localData.memories.get(key) || null;
    } else {
      const { data, error } = await this.supabase
        .from('learning_memories')
        .select('*')
        .eq('key', key)
        .single();
      
      return error ? null : data;
    }
  }

  async getMemoriesByCategory(category: string): Promise<LearningMemory[]> {
    if (this.isLocal) {
      return Array.from(this.localData.memories.values())
        .filter(m => m.category === category);
    } else {
      const { data, error } = await this.supabase
        .from('learning_memories')
        .select('*')
        .eq('category', category)
        .order('usage_count', { ascending: false });
      
      return error ? [] : data;
    }
  }

  // Tweet Performance Tracking
  async saveTweetPerformance(tweet: TweetPerformance): Promise<void> {
    if (this.isLocal) {
      this.localData.tweets.push(tweet);
      this.saveToLocalStorage('tweets', this.localData.tweets);
    } else {
      await this.supabase
        .from('tweet_performance')
        .insert(tweet);
    }
  }

  async getTopPerformingTweets(limit: number = 10): Promise<TweetPerformance[]> {
    if (this.isLocal) {
      return this.localData.tweets
        .sort((a, b) => b.performance_score - a.performance_score)
        .slice(0, limit);
    } else {
      const { data, error } = await this.supabase
        .from('tweet_performance')
        .select('*')
        .order('performance_score', { ascending: false })
        .limit(limit);
      
      return error ? [] : data;
    }
  }

  // Analytics and Insights
  async getAnalytics(): Promise<any> {
    const collections = await this.getAllCollections();
    const interactions = await this.getRecentInteractions(1000);
    const tweets = await this.getTopPerformingTweets(50);

    return {
      totalCollections: collections.length,
      totalInteractions: interactions.length,
      averageEngagement: this.calculateAverageEngagement(interactions),
      topCollections: this.getTopCollections(collections),
      popularHashtags: this.getPopularHashtags(tweets),
      userSentiment: this.analyzeUserSentiment(interactions)
    };
  }

  // GM Tweet Management
  async storeGmTweet(gmTweet: GmTweet): Promise<void> {
    if (this.isLocal) {
      this.localData.gmTweets.push(gmTweet);
      this.saveToLocalStorage('gmTweets', this.localData.gmTweets);
    } else {
      await this.supabase
        .from('gm_tweets')
        .insert(gmTweet);
    }
  }

  async getLastGmTweet(): Promise<GmTweet | null> {
    if (this.isLocal) {
      return this.localData.gmTweets
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || null;
    } else {
      const { data, error } = await this.supabase
        .from('gm_tweets')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      
      return error ? null : data;
    }
  }

  async getGmTweetHistory(limit: number = 30): Promise<GmTweet[]> {
    if (this.isLocal) {
      return this.localData.gmTweets
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } else {
      const { data, error } = await this.supabase
        .from('gm_tweets')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      return error ? [] : data;
    }
  }

  private calculateAverageEngagement(interactions: UserInteraction[]): number {
    if (interactions.length === 0) return 0;
    
    const totalEngagement = interactions.reduce((sum, interaction) => {
      return sum + interaction.engagement.likes + interaction.engagement.retweets + interaction.engagement.replies;
    }, 0);
    
    return totalEngagement / interactions.length;
  }

  private getTopCollections(collections: NFTCollection[]): NFTCollection[] {
    return collections
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, 10);
  }

  private getPopularHashtags(tweets: TweetPerformance[]): string[] {
    const hashtagCount: { [key: string]: number } = {};
    
    tweets.forEach(tweet => {
      tweet.hashtags.forEach(hashtag => {
        hashtagCount[hashtag] = (hashtagCount[hashtag] || 0) + 1;
      });
    });
    
    return Object.entries(hashtagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([hashtag]) => hashtag);
  }

  private analyzeUserSentiment(interactions: UserInteraction[]): any {
    const sentimentCount = {
      positive: 0,
      negative: 0,
      neutral: 0
    };
    
    interactions.forEach(interaction => {
      sentimentCount[interaction.context.sentiment]++;
    });
    
    return sentimentCount;
  }

  // Local Storage Helpers
  private saveToLocalStorage(key: string, data: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`shinz_${key}`, JSON.stringify(data));
    }
  }

  private loadFromLocalStorage(key: string): any {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`shinz_${key}`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  // Initialize local data from storage
  async initialize(): Promise<void> {
    if (this.isLocal) {
      const collections = this.loadFromLocalStorage('collections');
      const interactions = this.loadFromLocalStorage('interactions');
      const insights = this.loadFromLocalStorage('insights');
      const members = this.loadFromLocalStorage('members');
      const memories = this.loadFromLocalStorage('memories');
      const tweets = this.loadFromLocalStorage('tweets');
      const gmTweets = this.loadFromLocalStorage('gmTweets');

      if (collections) {
        collections.forEach((c: NFTCollection) => {
          this.localData.collections.set(c.id, c);
        });
      }
      if (interactions) this.localData.interactions = interactions;
      if (insights) this.localData.insights = insights;
      if (members) {
        members.forEach((m: CommunityMember) => {
          this.localData.members.set(m.id, m);
        });
      }
      if (memories) {
        memories.forEach((m: LearningMemory) => {
          this.localData.memories.set(m.key, m);
        });
      }
      if (tweets) this.localData.tweets = tweets;
      if (gmTweets) this.localData.gmTweets = gmTweets;
    }
  }
}

export const shinZDB = new ShinZDatabase(); 