'use client';

import { useChat } from 'ai/react';
import { Send, Twitter, TrendingUp, MessageCircle, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import PersonalityDisplay from '@/components/PersonalityDisplay';

export default function SeishinZAgent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/agent',
    maxSteps: 10,
  });

  const [activeTab, setActiveTab] = useState('chat');

  const quickActions = [
    {
      title: 'Post about Gasback',
      description: 'Share latest Gasback rewards data',
      action: 'Create a tweet about the latest Gasback rewards on Shape Network. Include some statistics and encourage users to check their rewards.',
      icon: TrendingUp,
    },
    {
      title: 'NFT Collection Update',
      description: 'Share trending NFT collections',
      action: 'Get the latest NFT collection analytics from Shape Network and create an engaging tweet about trending collections.',
      icon: BarChart3,
    },
    {
      title: 'Engage with Mentions',
      description: 'Check and reply to mentions',
      action: 'Check recent mentions of the SeishinZ account and reply to any relevant ones with helpful information.',
      icon: MessageCircle,
    },
    {
      title: 'Trending Topics',
      description: 'Share crypto trends',
      action: 'Get current trending topics on X and create a tweet about any crypto-related trends, connecting them to Shape Network.',
      icon: Twitter,
    },
  ];

  const handleQuickAction = (action: string) => {
    handleInputChange({ target: { value: action } } as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Twitter className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">SeishinZ X AI Agent</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Intelligent X account management powered by AI and Shape Network data. 
            Post tweets, engage with followers, and share real-time blockchain insights.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chat Interface
            </button>
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'quick'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Quick Actions
            </button>
            <button
              onClick={() => setActiveTab('personality')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'personality'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              AI Personality
            </button>
          </div>
        </div>

        {activeTab === 'chat' ? (
          /* Chat Interface */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Messages */}
            <div className="lg:col-span-2">
              <div className="card h-[600px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.role === 'user' ? 'You' : 'SeishinZ AI'}
                        </div>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                        <div className="text-sm font-medium mb-1">SeishinZ AI</div>
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Thinking...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input Form */}
                <form onSubmit={handleSubmit} className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask me to post a tweet, check mentions, or get Shape Network data..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Capabilities */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-3">AI Capabilities</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Post tweets to SeishinZ account</li>
                  <li>• Reply to mentions and comments</li>
                  <li>• Get Shape Network data (Gasback, NFTs)</li>
                  <li>• Monitor trending topics</li>
                  <li>• Search and analyze tweets</li>
                  <li>• Create data-driven content</li>
                </ul>
              </div>

              {/* Example Prompts */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-3">Example Prompts</h3>
                <div className="space-y-2 text-sm">
                  <button
                    onClick={() => handleInputChange({ target: { value: "Post a tweet about the latest Gasback rewards on Shape Network" } } as any)}
                    className="text-left text-blue-600 hover:text-blue-800 block"
                  >
                    "Post a tweet about the latest Gasback rewards"
                  </button>
                  <button
                    onClick={() => handleInputChange({ target: { value: "Check recent mentions and reply to any relevant ones" } } as any)}
                    className="text-left text-blue-600 hover:text-blue-800 block"
                  >
                    "Check and reply to mentions"
                  </button>
                  <button
                    onClick={() => handleInputChange({ target: { value: "Get trending NFT collections from Shape Network and create a tweet" } } as any)}
                    className="text-left text-blue-600 hover:text-blue-800 block"
                  >
                    "Share trending NFT collections"
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'quick' ? (
          /* Quick Actions */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <action.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    <button
                      onClick={() => handleQuickAction(action.action)}
                      className="btn-primary text-sm"
                    >
                      Execute Action
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Personality Display */
          <div className="max-w-4xl mx-auto">
            <PersonalityDisplay />
          </div>
        )}
      </div>
    </div>
  );
} 