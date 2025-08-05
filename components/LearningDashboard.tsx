'use client';

import { useState, useEffect } from 'react';
import { shinZDB } from '@/lib/database';
import { enhancedLearning } from '@/lib/enhanced-learning';
import { TrendingUp, MessageCircle, Target, Brain, BarChart3, Lightbulb, Database, Users, Hash, Zap } from 'lucide-react';

export default function LearningDashboard() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        // Initialize the database
        await shinZDB.initialize();
        
        // Get analytics from the database
        const analytics = await shinZDB.getAnalytics();
        
        // Get learning context and recommendations
        const learningContext = await enhancedLearning.getLearningContext();
        const recommendations = await enhancedLearning.getRecommendations(learningContext);
        
        // Get recent interactions
        const recentInteractions = await shinZDB.getRecentInteractions(10);
        
        // Get top performing tweets
        const topTweets = await shinZDB.getTopPerformingTweets(5);
        
        // Get memories by category
        const nftKnowledge = await shinZDB.getMemoriesByCategory('nft_knowledge');
        const marketPatterns = await shinZDB.getMemoriesByCategory('market_patterns');
        const userPreferences = await shinZDB.getMemoriesByCategory('user_preferences');
        
        const data = {
          analytics,
          recommendations,
          recentInteractions,
          topTweets,
          memories: {
            nftKnowledge,
            marketPatterns,
            userPreferences
          }
        };
        
        setInsights(data);
      } catch (error) {
        console.error('Error loading insights:', error);
        setInsights(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading learning insights...</span>
        </div>
      </div>
    );
  }

  if (!insights || insights.analytics.totalInteractions === 0) {
    return (
      <div className="card">
        <div className="text-center p-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Learning Data Yet</h3>
          <p className="text-gray-600">
            Start interacting with ShinZ to see learning insights and performance analytics.
          </p>
        </div>
      </div>
    );
  }

  const { analytics, recommendations, recentInteractions, topTweets, memories } = insights;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Interactions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalInteractions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(analytics.averageEngagement)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Collections Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalCollections}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Recent Interactions</p>
              <p className="text-2xl font-bold text-gray-900">{recentInteractions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Collections */}
      {analytics.topCollections && analytics.topCollections.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Performing Collections
          </h3>
          <div className="space-y-2">
            {analytics.topCollections.slice(0, 5).map((collection: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">{collection.name}</span>
                <span className="text-xs text-gray-500">{collection.volume_24h} ETH</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            AI Learning Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec: any, index: number) => (
              <div key={index} className="border-l-4 border-green-200 pl-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm text-gray-900">{rec.title}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    {Math.round(rec.confidence * 100)}%
                  </span>
                </div>
                <p className="text-xs text-gray-600">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NFT Knowledge */}
      {memories.nftKnowledge && memories.nftKnowledge.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            NFT Knowledge Base
          </h3>
          <div className="space-y-2">
            {memories.nftKnowledge.slice(0, 5).map((memory: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {memory.value.nftId || 'Unknown NFT'}
                  </span>
                  <p className="text-xs text-gray-500">
                    {memory.value.totalMentions} mentions, {Math.round(memory.value.averageSentiment * 100)}% sentiment
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(memory.confidence * 100)}% confidence
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Patterns */}
      {memories.marketPatterns && memories.marketPatterns.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Market Pattern Recognition
          </h3>
          <div className="space-y-2">
            {memories.marketPatterns.slice(0, 5).map((memory: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {memory.value.topic || 'Unknown Topic'}
                  </span>
                  <p className="text-xs text-gray-500">
                    Avg engagement: {Math.round(memory.value.averageEngagement)}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(memory.confidence * 100)}% confidence
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Preferences */}
      {memories.userPreferences && memories.userPreferences.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            User Preference Learning
          </h3>
          <div className="space-y-2">
            {memories.userPreferences.slice(0, 5).map((memory: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {memory.value.topic || 'Unknown Topic'}
                  </span>
                  <p className="text-xs text-gray-500">
                    {memory.value.successCount || 0} successful patterns
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(memory.confidence * 100)}% confidence
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Interactions */}
      {recentInteractions && recentInteractions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Recent Interactions
          </h3>
          <div className="space-y-2">
            {recentInteractions.slice(0, 5).map((interaction: any, index: number) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {interaction.context.topic}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    interaction.context.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    interaction.context.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {interaction.context.sentiment}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {interaction.message.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Hashtags */}
      {analytics.popularHashtags && analytics.popularHashtags.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Popular Hashtags
          </h3>
          <div className="flex flex-wrap gap-2">
            {analytics.popularHashtags.map((hashtag: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {hashtag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 