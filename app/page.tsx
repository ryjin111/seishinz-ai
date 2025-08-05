'use client';

import { Send, Twitter, TrendingUp, MessageCircle, BarChart3 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import PersonalityDisplay from '@/components/PersonalityDisplay';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function SeishinZAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages(prev => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsLoading(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: parsed.content }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const quickActions = [
    {
      title: 'Post Gasback Tweet',
      description: 'Post a tweet about Gasback rewards',
      action: 'Post a tweet about the latest Gasback rewards on Shape Network',
      icon: TrendingUp,
    },
    {
      title: 'Post NFT Update',
      description: 'Post about trending NFT collections',
      action: 'Post a tweet about the latest NFT collection analytics from Shape Network',
      icon: BarChart3,
    },
    {
      title: 'Reply to Mentions',
      description: 'Check and reply to mentions',
      action: 'Check recent mentions and reply to any relevant ones',
      icon: MessageCircle,
    },
    {
      title: 'Post Trending Topics',
      description: 'Post about crypto trends',
      action: 'Post a tweet about current crypto trends on X',
      icon: Twitter,
    },
  ];

  const handleQuickAction = (action: string) => {
    setInput(action);
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
                  <div ref={messagesEndRef} />
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                    onClick={() => setInput("Post a tweet about the latest Gasback rewards on Shape Network")}
                    className="text-left text-blue-600 hover:text-blue-800 block"
                  >
                    "Post a tweet about the latest Gasback rewards"
                  </button>
                  <button
                    onClick={() => setInput("Post a tweet about trending NFT collections from Shape Network")}
                    className="text-left text-blue-600 hover:text-blue-800 block"
                  >
                    "Post a tweet about trending NFT collections"
                  </button>
                  <button
                    onClick={() => setInput("Post a tweet about current crypto trends on X")}
                    className="text-left text-blue-600 hover:text-blue-800 block"
                  >
                    "Post a tweet about crypto trends"
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