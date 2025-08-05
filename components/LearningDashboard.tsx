'use client';

import { useState, useEffect } from 'react';
import { AILearningSystem } from '@/lib/ai-learning';
import { TrendingUp, MessageCircle, Target, Brain, BarChart3, Lightbulb } from 'lucide-react';

export default function LearningDashboard() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const learningSystem = new AILearningSystem();
    const data = learningSystem.getInsights();
    setInsights(data);
    setLoading(false);
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

  if (!insights || insights.metrics.totalInteractions === 0) {
    return (
      <div className="card">
        <div className="text-center p-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Learning Data Yet</h3>
          <p className="text-gray-600">
            Start interacting with the AI to see learning insights and performance analytics.
          </p>
        </div>
      </div>
    );
  }

  const { metrics, personality, recommendations } = insights;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Interactions</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalInteractions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalInteractions > 0 
                  ? Math.round((metrics.successfulTweets / metrics.totalInteractions) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(metrics.averageEngagement)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tweets Posted</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.successfulTweets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Topics */}
      {metrics.topPerformingTopics.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Performing Topics
          </h3>
          <div className="space-y-2">
            {metrics.topPerformingTopics.map((topic: string, index: number) => (
              <div key={topic} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium capitalize">{topic}</span>
                <span className="text-sm text-gray-600">#{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personality Adaptations */}
      {personality.adaptations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Personality Adaptations
          </h3>
          <div className="space-y-3">
            {personality.adaptations.slice(-5).map((adaptation: any, index: number) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{adaptation.trait}</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(adaptation.strength * 100)}% strength
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{adaptation.reason}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(adaptation.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Preferences */}
      {metrics.userPreferences.preferredTopics.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">User Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Preferred Topics</h4>
              <div className="flex flex-wrap gap-2">
                {metrics.userPreferences.preferredTopics.map((topic: string) => (
                  <span key={topic} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Communication Style</h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Tone: <span className="font-medium capitalize">{metrics.userPreferences.preferredTone}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Length: <span className="font-medium capitalize">{metrics.userPreferences.preferredLength}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            AI Recommendations
          </h3>
          <div className="space-y-2">
            {recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded">
                <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Trends */}
      {metrics.performanceTrends.daily.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Performance</h3>
          <div className="space-y-2">
            {metrics.performanceTrends.daily.slice(-7).map((day: any) => (
              <div key={day.date} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString()}
                </span>
                <span className="font-medium">{day.engagement} engagement</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 