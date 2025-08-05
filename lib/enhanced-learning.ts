// Enhanced Learning System for ShinZ AI
import { shinZDB, UserInteraction, NFTCollection, MarketInsight, LearningMemory, CommunityMember } from './database';

export interface LearningContext {
  userHistory: UserInteraction[];
  collectionKnowledge: NFTCollection[];
  marketInsights: MarketInsight[];
  userPreferences: any;
  recentTrends: any[];
}

export interface LearningRecommendation {
  type: 'nft_analysis' | 'market_insight' | 'user_engagement' | 'content_optimization';
  title: string;
  description: string;
  confidence: number;
  data: any;
}

export class EnhancedLearningSystem {
  private db = shinZDB;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.db.initialize();
  }

  // Learn from user interaction
  async learnFromInteraction(interaction: UserInteraction): Promise<void> {
    // Save the interaction
    await this.db.saveInteraction(interaction);

    // Extract learning insights
    await this.extractInsights(interaction);

    // Update user preferences
    await this.updateUserPreferences(interaction);

    // Learn from engagement patterns
    await this.learnFromEngagement(interaction);
  }

  // Extract insights from interaction
  private async extractInsights(interaction: UserInteraction): Promise<void> {
    const { message, context, engagement } = interaction;

    // Learn about mentioned NFTs
    if (context.nft_mentioned && context.nft_mentioned.length > 0) {
      for (const nftId of context.nft_mentioned) {
        await this.learnAboutNFT(nftId, context.sentiment, engagement);
      }
    }

    // Learn about user sentiment patterns
    await this.learnSentimentPatterns(context.topic, context.sentiment, engagement);

    // Learn about successful response patterns
    if (engagement.likes > 5 || engagement.retweets > 2) {
      await this.learnSuccessfulPatterns(interaction);
    }
  }

  // Learn about specific NFTs
  private async learnAboutNFT(nftId: string, sentiment: string, engagement: any): Promise<void> {
    const memoryKey = `nft_sentiment_${nftId}`;
    const existingMemory = await this.db.getMemory(memoryKey);

    const sentimentScore = sentiment === 'positive' ? 1 : sentiment === 'negative' ? -1 : 0;
    const engagementScore = engagement.likes + engagement.retweets * 2 + engagement.replies * 3;

    if (existingMemory) {
      // Update existing memory
      const currentValue = existingMemory.value;
      const newValue = {
        ...currentValue,
        totalMentions: currentValue.totalMentions + 1,
        averageSentiment: (currentValue.averageSentiment * currentValue.totalMentions + sentimentScore) / (currentValue.totalMentions + 1),
        averageEngagement: (currentValue.averageEngagement * currentValue.totalMentions + engagementScore) / (currentValue.totalMentions + 1),
        lastUpdated: new Date()
      };

      await this.db.saveMemory({
        ...existingMemory,
        value: newValue,
        usage_count: existingMemory.usage_count + 1,
        updated_at: new Date()
      });
    } else {
      // Create new memory
      await this.db.saveMemory({
        id: memoryKey,
        category: 'nft_knowledge',
        key: memoryKey,
        value: {
          nftId,
          totalMentions: 1,
          averageSentiment: sentimentScore,
          averageEngagement: engagementScore,
          firstMention: new Date(),
          lastUpdated: new Date()
        },
        confidence: 0.5,
        usage_count: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  // Learn sentiment patterns
  private async learnSentimentPatterns(topic: string, sentiment: string, engagement: any): Promise<void> {
    const memoryKey = `sentiment_pattern_${topic}`;
    const existingMemory = await this.db.getMemory(memoryKey);

    const engagementScore = engagement.likes + engagement.retweets * 2 + engagement.replies * 3;

    if (existingMemory) {
      const currentValue = existingMemory.value;
      const newValue = {
        ...currentValue,
        [sentiment]: (currentValue[sentiment] || 0) + 1,
        totalEngagement: currentValue.totalEngagement + engagementScore,
        averageEngagement: (currentValue.totalEngagement + engagementScore) / (currentValue.totalEngagement / currentValue.averageEngagement + 1)
      };

      await this.db.saveMemory({
        ...existingMemory,
        value: newValue,
        usage_count: existingMemory.usage_count + 1,
        updated_at: new Date()
      });
    } else {
      await this.db.saveMemory({
        id: memoryKey,
        category: 'market_patterns',
        key: memoryKey,
        value: {
          topic,
          positive: sentiment === 'positive' ? 1 : 0,
          negative: sentiment === 'negative' ? 1 : 0,
          neutral: sentiment === 'neutral' ? 1 : 0,
          totalEngagement: engagementScore,
          averageEngagement: engagementScore
        },
        confidence: 0.5,
        usage_count: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  // Learn successful response patterns
  private async learnSuccessfulPatterns(interaction: UserInteraction): Promise<void> {
    const memoryKey = `successful_pattern_${interaction.context.topic}`;
    const existingMemory = await this.db.getMemory(memoryKey);

    const pattern = {
      responseType: this.categorizeResponse(interaction.ai_response),
      hashtags: this.extractHashtags(interaction.ai_response),
      emojis: this.extractEmojis(interaction.ai_response),
      length: interaction.ai_response.length,
      engagement: interaction.engagement
    };

    if (existingMemory) {
      const currentValue = existingMemory.value;
      currentValue.patterns.push(pattern);
      currentValue.successCount += 1;

      await this.db.saveMemory({
        ...existingMemory,
        value: currentValue,
        usage_count: existingMemory.usage_count + 1,
        updated_at: new Date()
      });
    } else {
      await this.db.saveMemory({
        id: memoryKey,
        category: 'user_preferences',
        key: memoryKey,
        value: {
          topic: interaction.context.topic,
          patterns: [pattern],
          successCount: 1
        },
        confidence: 0.5,
        usage_count: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  // Update user preferences
  private async updateUserPreferences(interaction: UserInteraction): Promise<void> {
    const user = await this.db.getMember(interaction.user_id);
    
    if (user) {
      // Update existing user
      const updatedUser: CommunityMember = {
        ...user,
        interactions: user.interactions + 1,
        last_active: new Date(),
        preferences: {
          ...user.preferences,
          favorite_collections: this.updateFavoriteCollections(user.preferences.favorite_collections, interaction)
        }
      };
      await this.db.saveMember(updatedUser);
    } else {
      // Create new user
      const newUser: CommunityMember = {
        id: interaction.user_id,
        username: `user_${interaction.user_id}`,
        join_date: new Date(),
        engagement_score: this.calculateEngagementScore(interaction.engagement),
        preferences: {
          favorite_collections: interaction.context.nft_mentioned || [],
          trading_style: 'collector',
          risk_tolerance: 'medium'
        },
        interactions: 1,
        last_active: new Date()
      };
      await this.db.saveMember(newUser);
    }
  }

  // Learn from engagement patterns
  private async learnFromEngagement(interaction: UserInteraction): Promise<void> {
    const engagementScore = interaction.engagement.likes + interaction.engagement.retweets * 2 + interaction.engagement.replies * 3;
    
    if (engagementScore > 10) {
      // High engagement - learn what works
      await this.learnHighEngagementPatterns(interaction);
    } else if (engagementScore < 2) {
      // Low engagement - learn what to avoid
      await this.learnLowEngagementPatterns(interaction);
    }
  }

  // Get learning context for AI responses
  async getLearningContext(userId?: string): Promise<LearningContext> {
    const userHistory = userId ? await this.getUserHistory(userId) : [];
    const collectionKnowledge = await this.db.getAllCollections();
    const marketInsights = await this.getRecentInsights();
    const userPreferences = userId ? await this.getUserPreferences(userId) : null;
    const recentTrends = await this.getRecentTrends();

    return {
      userHistory,
      collectionKnowledge,
      marketInsights,
      userPreferences,
      recentTrends
    };
  }

  // Get recommendations based on learning
  async getRecommendations(context: LearningContext): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];

    // Analyze user history for patterns
    const userPatterns = this.analyzeUserPatterns(context.userHistory);
    if (userPatterns) {
      recommendations.push({
        type: 'user_engagement',
        title: 'User Engagement Pattern',
        description: `User responds well to ${userPatterns.preferredStyle} content`,
        confidence: userPatterns.confidence,
        data: userPatterns
      });
    }

    // Analyze collection performance
    const collectionInsights = this.analyzeCollectionPerformance(context.collectionKnowledge);
    if (collectionInsights) {
      recommendations.push({
        type: 'nft_analysis',
        title: 'Collection Performance Insight',
        description: collectionInsights.description,
        confidence: collectionInsights.confidence,
        data: collectionInsights
      });
    }

    // Analyze market trends
    const marketTrends = this.analyzeMarketTrends(context.marketInsights);
    if (marketTrends) {
      recommendations.push({
        type: 'market_insight',
        title: 'Market Trend Analysis',
        description: marketTrends.description,
        confidence: marketTrends.confidence,
        data: marketTrends
      });
    }

    return recommendations;
  }

  // Helper methods
  private categorizeResponse(response: string): string {
    if (response.includes('floor') || response.includes('price')) return 'price_analysis';
    if (response.includes('rare') || response.includes('trait')) return 'trait_analysis';
    if (response.includes('mint') || response.includes('launch')) return 'mint_info';
    if (response.includes('community') || response.includes('holder')) return 'community';
    return 'general';
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#\w+/g;
    return text.match(hashtagRegex) || [];
  }

  private extractEmojis(text: string): string[] {
    // Simple emoji detection - look for common emoji characters
    const emojiPattern = /[🚀💎🔥📈🎯💰👀💪📊🎨🖼️✨📉😤💀💸📄😅💨🌙⭐💩😱]/g;
    return text.match(emojiPattern) || [];
  }

  private updateFavoriteCollections(current: string[], interaction: UserInteraction): string[] {
    const mentioned = interaction.context.nft_mentioned || [];
    const updated = [...current];
    
    mentioned.forEach(nft => {
      if (!updated.includes(nft)) {
        updated.push(nft);
      }
    });

    return updated.slice(0, 10); // Keep top 10
  }

  private calculateEngagementScore(engagement: any): number {
    return engagement.likes + engagement.retweets * 2 + engagement.replies * 3;
  }

  private async getUserHistory(userId: string): Promise<UserInteraction[]> {
    // This would need to be implemented based on your database structure
    return [];
  }

  private async getRecentInsights(): Promise<MarketInsight[]> {
    // This would need to be implemented based on your database structure
    return [];
  }

  private async getUserPreferences(userId: string): Promise<any> {
    const user = await this.db.getMember(userId);
    return user?.preferences || null;
  }

  private async getRecentTrends(): Promise<any[]> {
    // This would need to be implemented based on your database structure
    return [];
  }

  private async learnHighEngagementPatterns(interaction: UserInteraction): Promise<void> {
    const memoryKey = `high_engagement_${interaction.context.topic}`;
    await this.saveEngagementPattern(memoryKey, interaction, 'high');
  }

  private async learnLowEngagementPatterns(interaction: UserInteraction): Promise<void> {
    const memoryKey = `low_engagement_${interaction.context.topic}`;
    await this.saveEngagementPattern(memoryKey, interaction, 'low');
  }

  private async saveEngagementPattern(memoryKey: string, interaction: UserInteraction, type: 'high' | 'low'): Promise<void> {
    const existingMemory = await this.db.getMemory(memoryKey);
    const pattern = {
      response: interaction.ai_response,
      topic: interaction.context.topic,
      engagement: interaction.engagement,
      timestamp: new Date()
    };

    if (existingMemory) {
      const currentValue = existingMemory.value;
      currentValue.patterns.push(pattern);
      currentValue.count += 1;

      await this.db.saveMemory({
        ...existingMemory,
        value: currentValue,
        usage_count: existingMemory.usage_count + 1,
        updated_at: new Date()
      });
    } else {
      await this.db.saveMemory({
        id: memoryKey,
        category: 'user_preferences',
        key: memoryKey,
        value: {
          type,
          patterns: [pattern],
          count: 1
        },
        confidence: 0.5,
        usage_count: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  private analyzeUserPatterns(history: UserInteraction[]): any {
    if (history.length === 0) return null;

    const patterns = {
      preferredTopics: new Map<string, number>(),
      preferredResponseTypes: new Map<string, number>(),
      averageEngagement: 0
    };

    history.forEach(interaction => {
      // Count topics
      const topic = interaction.context.topic;
      patterns.preferredTopics.set(topic, (patterns.preferredTopics.get(topic) || 0) + 1);

      // Count response types
      const responseType = this.categorizeResponse(interaction.ai_response);
      patterns.preferredResponseTypes.set(responseType, (patterns.preferredResponseTypes.get(responseType) || 0) + 1);

      // Calculate average engagement
      patterns.averageEngagement += this.calculateEngagementScore(interaction.engagement);
    });

    patterns.averageEngagement /= history.length;

    return {
      preferredStyle: Array.from(patterns.preferredResponseTypes.entries())
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general',
      confidence: Math.min(history.length / 10, 1), // Higher confidence with more data
      data: patterns
    };
  }

  private analyzeCollectionPerformance(collections: NFTCollection[]): any {
    if (collections.length === 0) return null;

    const topPerformers = collections
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, 5);

    return {
      description: `Top performing collections: ${topPerformers.map(c => c.name).join(', ')}`,
      confidence: 0.8,
      data: topPerformers
    };
  }

  private analyzeMarketTrends(insights: MarketInsight[]): any {
    if (insights.length === 0) return null;

    const recentInsights = insights
      .filter(i => new Date().getTime() - i.created_at.getTime() < 24 * 60 * 60 * 1000) // Last 24 hours
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return {
      description: `Recent market insights: ${recentInsights.map(i => i.title).join(', ')}`,
      confidence: 0.7,
      data: recentInsights
    };
  }
}

export const enhancedLearning = new EnhancedLearningSystem(); 