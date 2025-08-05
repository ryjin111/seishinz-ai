// Behavior tracking and adaptation system for SeishinZ AI
export interface InteractionLog {
  timestamp: Date;
  type: 'tweet' | 'reply' | 'mention' | 'search' | 'data_query';
  context: string;
  content: string;
  userFeedback?: 'positive' | 'negative' | 'neutral';
  engagement?: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

export interface BehaviorMetrics {
  totalInteractions: number;
  averageEngagement: number;
  preferredTopics: Record<string, number>;
  responsePatterns: Record<string, number>;
  timeOfDayActivity: Record<string, number>;
  userSentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export class BehaviorTracker {
  private interactions: InteractionLog[] = [];
  private personality: any;

  constructor(personality: any) {
    this.personality = personality;
  }

  // Log an interaction
  logInteraction(log: Omit<InteractionLog, 'timestamp'>) {
    const interaction: InteractionLog = {
      ...log,
      timestamp: new Date()
    };
    
    this.interactions.push(interaction);
    this.updateBehaviorMetrics();
  }

  // Get behavior metrics
  getBehaviorMetrics(): BehaviorMetrics {
    const totalInteractions = this.interactions.length;
    
    // Calculate average engagement
    const engagementScores = this.interactions
      .filter(i => i.engagement)
      .map(i => (i.engagement!.likes + i.engagement!.retweets * 2 + i.engagement!.replies * 3) / 6);
    
    const averageEngagement = engagementScores.length > 0 
      ? engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length 
      : 0;

    // Analyze preferred topics
    const topicCounts: Record<string, number> = {};
    this.interactions.forEach(interaction => {
      const topics = this.extractTopics(interaction.content);
      topics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    // Analyze response patterns
    const responsePatterns: Record<string, number> = {};
    this.interactions.forEach(interaction => {
      const pattern = this.analyzeResponsePattern(interaction.content);
      responsePatterns[pattern] = (responsePatterns[pattern] || 0) + 1;
    });

    // Analyze time of day activity
    const timeOfDayActivity: Record<string, number> = {};
    this.interactions.forEach(interaction => {
      const hour = interaction.timestamp.getHours();
      const timeSlot = this.getTimeSlot(hour);
      timeOfDayActivity[timeSlot] = (timeOfDayActivity[timeSlot] || 0) + 1;
    });

    // Analyze user sentiment
    const userSentiment = {
      positive: this.interactions.filter(i => i.userFeedback === 'positive').length,
      negative: this.interactions.filter(i => i.userFeedback === 'negative').length,
      neutral: this.interactions.filter(i => i.userFeedback === 'neutral').length
    };

    return {
      totalInteractions,
      averageEngagement,
      preferredTopics: topicCounts,
      responsePatterns,
      timeOfDayActivity,
      userSentiment
    };
  }

  // Extract topics from content
  private extractTopics(content: string): string[] {
    const topics = [];
    
    if (content.toLowerCase().includes('gasback')) topics.push('gasback');
    if (content.toLowerCase().includes('nft')) topics.push('nfts');
    if (content.toLowerCase().includes('blockchain')) topics.push('blockchain');
    if (content.toLowerCase().includes('shape')) topics.push('shape_network');
    if (content.toLowerCase().includes('community')) topics.push('community');
    if (content.toLowerCase().includes('crypto')) topics.push('crypto');
    if (content.toLowerCase().includes('defi')) topics.push('defi');
    if (content.toLowerCase().includes('trend')) topics.push('trends');
    
    return topics;
  }

  // Analyze response pattern
  private analyzeResponsePattern(content: string): string {
    if (content.includes('?')) return 'question';
    if (content.includes('!')) return 'enthusiastic';
    if (content.includes('data') || content.includes('stats')) return 'data_driven';
    if (content.includes('community') || content.includes('team')) return 'community_focused';
    if (content.includes('learn') || content.includes('education')) return 'educational';
    return 'informative';
  }

  // Get time slot
  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  // Update behavior metrics
  private updateBehaviorMetrics() {
    // This could trigger personality adaptations based on metrics
    const metrics = this.getBehaviorMetrics();
    
    // Example: Adapt personality based on engagement
    if (metrics.averageEngagement > 10) {
      // High engagement - maintain current personality
      console.log('High engagement detected - maintaining personality');
    } else if (metrics.averageEngagement < 3) {
      // Low engagement - consider adapting
      console.log('Low engagement detected - considering personality adaptation');
    }
  }

  // Get personality adaptation suggestions
  getAdaptationSuggestions(): string[] {
    const metrics = this.getBehaviorMetrics();
    const suggestions: string[] = [];

    // Analyze engagement patterns
    if (metrics.averageEngagement < 3) {
      suggestions.push('Consider more engaging content formats');
      suggestions.push('Increase use of questions and calls-to-action');
    }

    // Analyze topic preferences
    const topTopics = Object.entries(metrics.preferredTopics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    if (topTopics.length > 0) {
      suggestions.push(`Focus more on: ${topTopics.join(', ')}`);
    }

    // Analyze response patterns
    const topPatterns = Object.entries(metrics.responsePatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([pattern]) => pattern);

    if (topPatterns.includes('data_driven')) {
      suggestions.push('Data-driven content performs well - continue this approach');
    }

    if (topPatterns.includes('community_focused')) {
      suggestions.push('Community-focused content resonates - maintain this tone');
    }

    return suggestions;
  }

  // Get recent activity summary
  getRecentActivitySummary(hours: number = 24): string {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentInteractions = this.interactions.filter(i => i.timestamp > cutoff);
    
    const summary = {
      total: recentInteractions.length,
      tweets: recentInteractions.filter(i => i.type === 'tweet').length,
      replies: recentInteractions.filter(i => i.type === 'reply').length,
      mentions: recentInteractions.filter(i => i.type === 'mention').length,
      averageEngagement: 0
    };

    const engagementScores = recentInteractions
      .filter(i => i.engagement)
      .map(i => (i.engagement!.likes + i.engagement!.retweets * 2 + i.engagement!.replies * 3) / 6);
    
    if (engagementScores.length > 0) {
      summary.averageEngagement = engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length;
    }

    return `In the last ${hours} hours: ${summary.total} interactions (${summary.tweets} tweets, ${summary.replies} replies, ${summary.mentions} mentions) with ${summary.averageEngagement.toFixed(1)} avg engagement`;
  }
} 