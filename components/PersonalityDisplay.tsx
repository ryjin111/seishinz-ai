'use client';

import { SEISHINZ_PERSONALITY } from '@/lib/ai-personality';
import { Brain, Heart, Zap, Target, Users, TrendingUp } from 'lucide-react';

export default function PersonalityDisplay() {
  const personality = SEISHINZ_PERSONALITY;

  const traitIcons = {
    "Analytical yet approachable": Brain,
    "Community-focused": Users,
    "Data-driven": Target,
    "Innovation-minded": Zap,
    "Patient and helpful": Heart,
    "Slightly nerdy but cool": Brain,
    "Optimistic about blockchain": TrendingUp,
    "Detail-oriented": Target,
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold">SeishinZ AI Personality</h3>
      </div>

      {/* Personality Overview */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Character Profile</h4>
        <p className="text-sm text-gray-600 mb-3">
          {personality.name} - {personality.role}
        </p>
        
        {/* Communication Style */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <h5 className="font-medium text-blue-900 mb-2">Communication Style</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium text-gray-900">Tone:</span> <span className="text-gray-700">{personality.communicationStyle.tone}</span></div>
            <div><span className="font-medium text-gray-900">Formality:</span> <span className="text-gray-700">{personality.communicationStyle.formality}</span></div>
            <div><span className="font-medium text-gray-900">Humor:</span> <span className="text-gray-700">{personality.communicationStyle.humor}</span></div>
            <div><span className="font-medium text-gray-900">Enthusiasm:</span> <span className="text-gray-700">{personality.communicationStyle.enthusiasm}</span></div>
          </div>
        </div>
      </div>

      {/* Personality Traits */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Core Traits</h4>
        <div className="grid grid-cols-1 gap-2">
          {personality.traits.map((trait, index) => {
            const IconComponent = traitIcons[trait as keyof typeof traitIcons] || Brain;
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <IconComponent className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">{trait}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Behavior Patterns */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Behavior Patterns</h4>
        <div className="space-y-3">
          {personality.behaviorPatterns.map((pattern, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-3">
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-medium text-sm text-gray-900">{pattern.name}</h5>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  pattern.frequency === 'always' ? 'bg-green-100 text-green-800' :
                  pattern.frequency === 'frequent' ? 'bg-blue-100 text-blue-800' :
                  pattern.frequency === 'occasional' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {pattern.frequency}
                </span>
              </div>
              <p className="text-xs text-gray-600">{pattern.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emoji Usage */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Favorite Emojis</h4>
        <div className="flex flex-wrap gap-2">
          {personality.emojiUsage.preferred.map((emoji, index) => (
            <span key={index} className="text-2xl">{emoji}</span>
          ))}
        </div>
      </div>

      {/* Hashtag Strategy */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Core Hashtags</h4>
        <div className="flex flex-wrap gap-2">
          {personality.hashtagStrategy.core.map((hashtag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {hashtag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 