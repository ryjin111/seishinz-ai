// AI Learning System for SeishinZ Agent
export interface Interaction {
  id: string;
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  action?: 'tweet_posted' | 'reply_sent' | 'data_retrieved' | 'conversation';
  engagement?: {
    likes?: number;
    retweets?: number;
    replies?: number;
    impressions?: number;
  };
  success: boolean;
  error?: string;
  context: {
    topic: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    userIntent: string;
  };
}

export interface LearningMetrics {
  totalInteractions: number;
  successfulTweets: number;
  failedTweets: number;
  averageEngagement: number;
  topPerformingTopics: string[];
  userPreferences: {
    preferredTopics: string[];
    preferredTone: string;
    preferredLength: 'short' | 'medium' | 'long';
  };
  performanceTrends: {
    daily: { date: string; engagement: number }[];
    weekly: { week: string; engagement: number }[];
  };
}

export interface AdaptivePersonality {
  originalTraits: string[];
  currentTraits: string[];
  adaptations: {
    trait: string;
    strength: number; // 0-1
    reason: string;
    timestamp: Date;
  }[];
  userFeedback: {
    positive: string[];
    negative: string[];
    suggestions: string[];
  };
}

export class AILearningSystem {
  private interactions: Interaction[] = [];
  private metrics!: LearningMetrics;
  private adaptivePersonality!: AdaptivePersonality;
  private storageKey = 'seishinz_ai_learning';

  constructor() {
    this.loadData();
  }

  // Log a new interaction
  logInteraction(interaction: Omit<Interaction, 'id' | 'timestamp'>): void {
    const newInteraction: Interaction = {
      ...interaction,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.interactions.push(newInteraction);
    this.updateMetrics();
    this.adaptPersonality(newInteraction);
    this.saveData();
  }

  // Get learning insights
  getInsights(): {
    metrics: LearningMetrics;
    personality: AdaptivePersonality;
    recommendations: string[];
  } {
    return {
      metrics: this.metrics,
      personality: this.adaptivePersonality,
      recommendations: this.generateRecommendations(),
    };
  }

  // Get conversation history for context
  getRecentContext(limit: number = 5): Interaction[] {
    return this.interactions
      .filter(i => i.action === 'conversation')
      .slice(-limit);
  }

  // Get performance analytics
  getPerformanceAnalytics(): {
    tweetSuccessRate: number;
    averageEngagement: number;
    bestPerformingTopics: string[];
    optimalTweetLength: number;
  } {
    const tweets = this.interactions.filter(i => i.action === 'tweet_posted');
    const successfulTweets = tweets.filter(t => t.success);
    
    const avgEngagement = tweets.length > 0 
      ? tweets.reduce((sum, t) => sum + (t.engagement?.likes ?? 0), 0) / tweets.length 
      : 0;

    const topicPerformance = this.analyzeTopicPerformance();
    const optimalLength = this.findOptimalTweetLength();

    return {
      tweetSuccessRate: tweets.length > 0 ? successfulTweets.length / tweets.length : 0,
      averageEngagement: avgEngagement,
      bestPerformingTopics: topicPerformance.slice(0, 3),
      optimalTweetLength: optimalLength,
    };
  }

  // Update engagement for a specific interaction
  updateEngagement(interactionId: string, engagement: Interaction['engagement']): void {
    const interaction = this.interactions.find(i => i.id === interactionId);
    if (interaction) {
      interaction.engagement = engagement;
      this.updateMetrics();
      this.saveData();
    }
  }

  // Add user feedback
  addUserFeedback(feedback: {
    type: 'positive' | 'negative' | 'suggestion';
    content: string;
  }): void {
    switch (feedback.type) {
      case 'positive':
        this.adaptivePersonality.userFeedback.positive.push(feedback.content);
        break;
      case 'negative':
        this.adaptivePersonality.userFeedback.negative.push(feedback.content);
        break;
      case 'suggestion':
        this.adaptivePersonality.userFeedback.suggestions.push(feedback.content);
        break;
    }
    this.saveData();
  }

  // Generate personalized recommendations
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const analytics = this.getPerformanceAnalytics();

    if (analytics.tweetSuccessRate < 0.8) {
      recommendations.push('Consider shorter, more engaging tweet formats');
    }

    if (analytics.averageEngagement < 5) {
      recommendations.push('Include more hashtags and emojis to increase engagement');
    }

    if (this.adaptivePersonality.userFeedback.negative.length > 0) {
      recommendations.push('Review recent negative feedback to improve responses');
    }

    const topTopics = analytics.bestPerformingTopics;
    if (topTopics.length > 0) {
      recommendations.push(`Focus more on topics: ${topTopics.join(', ')}`);
    }

    return recommendations;
  }

  // Analyze which topics perform best
  private analyzeTopicPerformance(): string[] {
    const topicEngagement: Record<string, number> = {};
    
    this.interactions
      .filter(i => i.action === 'tweet_posted' && i.success)
      .forEach(interaction => {
        const topic = interaction.context.topic;
        const engagement = interaction.engagement?.likes ?? 0;
        topicEngagement[topic] = (topicEngagement[topic] || 0) + engagement;
      });

    return Object.entries(topicEngagement)
      .sort(([, a], [, b]) => b - a)
      .map(([topic]) => topic);
  }

  // Find optimal tweet length based on engagement
  private findOptimalTweetLength(): number {
    const tweets = this.interactions.filter(i => i.action === 'tweet_posted' && i.success);
    
    const lengthGroups: Record<string, number[]> = {
      short: [], // 0-100
      medium: [], // 101-200
      long: [], // 201-280
    };

    tweets.forEach(tweet => {
      const length = tweet.aiResponse.length;
      const engagement = tweet.engagement?.likes || 0;
      
      if (length <= 100) lengthGroups.short.push(engagement);
      else if (length <= 200) lengthGroups.medium.push(engagement);
      else lengthGroups.long.push(engagement);
    });

    const averages = {
      short: lengthGroups.short.length > 0 ? lengthGroups.short.reduce((a, b) => a + b, 0) / lengthGroups.short.length : 0,
      medium: lengthGroups.medium.length > 0 ? lengthGroups.medium.reduce((a, b) => a + b, 0) / lengthGroups.medium.length : 0,
      long: lengthGroups.long.length > 0 ? lengthGroups.long.reduce((a, b) => a + b, 0) / lengthGroups.long.length : 0,
    };

    if (averages.short > averages.medium && averages.short > averages.long) return 80;
    if (averages.medium > averages.short && averages.medium > averages.long) return 150;
    return 200;
  }

  // Adapt personality based on interactions
  private adaptPersonality(interaction: Interaction): void {
    // Analyze sentiment and engagement
    const isPositive = interaction.context.sentiment === 'positive';
    const hasGoodEngagement = interaction.engagement && (interaction.engagement.likes ?? 0) > 5;

    if (isPositive && hasGoodEngagement) {
      // Strengthen positive traits
      this.adaptivePersonality.adaptations.push({
        trait: 'enthusiasm',
        strength: 0.8,
        reason: 'Positive engagement with enthusiastic content',
        timestamp: new Date(),
      });
    }

    // Update user preferences based on topics
    if (!this.metrics.userPreferences.preferredTopics.includes(interaction.context.topic)) {
      this.metrics.userPreferences.preferredTopics.push(interaction.context.topic);
    }
  }

  // Update metrics based on current interactions
  private updateMetrics(): void {
    const tweets = this.interactions.filter(i => i.action === 'tweet_posted');
    const successfulTweets = tweets.filter(t => t.success);
    
    this.metrics = {
      totalInteractions: this.interactions.length,
      successfulTweets: successfulTweets.length,
      failedTweets: tweets.length - successfulTweets.length,
      averageEngagement: this.calculateAverageEngagement(),
      topPerformingTopics: this.analyzeTopicPerformance(),
      userPreferences: this.metrics.userPreferences,
      performanceTrends: this.calculatePerformanceTrends(),
    };
  }

  private calculateAverageEngagement(): number {
    const tweets = this.interactions.filter(i => i.action === 'tweet_posted');
    if (tweets.length === 0) return 0;
    
    const totalEngagement = tweets.reduce((sum, tweet) => {
      return sum + (tweet.engagement?.likes || 0) + (tweet.engagement?.retweets || 0);
    }, 0);
    
    return totalEngagement / tweets.length;
  }

  private calculatePerformanceTrends(): LearningMetrics['performanceTrends'] {
    // Group interactions by date
    const dailyData: Record<string, number> = {};
    const weeklyData: Record<string, number> = {};

    this.interactions
      .filter(i => i.action === 'tweet_posted')
      .forEach(interaction => {
        const date = interaction.timestamp.toISOString().split('T')[0];
        const week = this.getWeekNumber(interaction.timestamp);
        const engagement = interaction.engagement?.likes || 0;
        
        dailyData[date] = (dailyData[date] || 0) + engagement;
        weeklyData[week] = (weeklyData[week] || 0) + engagement;
      });

    return {
      daily: Object.entries(dailyData).map(([date, engagement]) => ({ date, engagement })),
      weekly: Object.entries(weeklyData).map(([week, engagement]) => ({ week, engagement })),
    };
  }

  private getWeekNumber(date: Date): string {
    const year = date.getFullYear();
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week}`;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Persist data to localStorage
  private saveData(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify({
        interactions: this.interactions,
        metrics: this.metrics,
        adaptivePersonality: this.adaptivePersonality,
      }));
    }
  }

  // Load data from localStorage
  private loadData(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.interactions = data.interactions.map((i: any) => ({
          ...i,
          timestamp: new Date(i.timestamp),
        }));
        this.metrics = data.metrics;
        this.adaptivePersonality = data.adaptivePersonality;
      }
    }

    // Initialize if no data exists
    if (!this.metrics) {
      this.metrics = {
        totalInteractions: 0,
        successfulTweets: 0,
        failedTweets: 0,
        averageEngagement: 0,
        topPerformingTopics: [],
        userPreferences: {
          preferredTopics: [],
          preferredTone: 'friendly',
          preferredLength: 'medium',
        },
        performanceTrends: { daily: [], weekly: [] },
      };
    }

    if (!this.adaptivePersonality) {
      this.adaptivePersonality = {
        originalTraits: ['enthusiastic', 'helpful', 'data-driven'],
        currentTraits: ['enthusiastic', 'helpful', 'data-driven'],
        adaptations: [],
        userFeedback: { positive: [], negative: [], suggestions: [] },
      };
    }
  }
} 