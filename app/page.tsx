'use client';

import { Send, Twitter, TrendingUp, MessageCircle, BarChart3, Copy, Check, Bot, User, Sparkles, Zap, Brain, Database, Key, Shield, Crown, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import PersonalityDisplay from '@/components/PersonalityDisplay';
import LearningDashboard from '@/components/LearningDashboard';
import { accessCodeManager } from '@/lib/access-codes';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function SeishinZAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(true); // Show immediately
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      timestamp: new Date(),
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
        timestamp: new Date(),
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
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const quickActions = [
    {
      title: 'Post Gasback Tweet',
      description: 'Post a tweet about Gasback rewards',
      action: 'Post a tweet about the latest Gasback rewards on Shape Network',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Post NFT Update',
      description: 'Post about trending NFT collections',
      action: 'Post a tweet about the latest NFT collection analytics from Shape Network',
      icon: BarChart3,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Auto-Reply to First 3',
      description: 'Reply to first 3 people who commented',
      action: 'Auto reply to first 3 mentions with contextual responses',
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Auto-Reply to First 5',
      description: 'Reply to first 5 people who commented',
      action: 'Auto reply to first 5 mentions with contextual responses',
      icon: MessageCircle,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: 'Check Replies',
      description: 'Check recent replies and mentions',
      action: 'Check replies to see recent mentions and replies to your tweets',
      icon: MessageCircle,
      color: 'from-teal-500 to-cyan-600',
    },
  ];

  const handleQuickAction = (action: string) => {
    // Check if user has permission to use quick actions
    if (!accessCodeManager.canPerformAction('useQuickActions')) {
      setAccessError('Access code required to use quick actions. Please enter an access code.');
      setShowAccessModal(true);
      return;
    }
    
    setInput(action);
    setActiveTab('chat');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAccessError('');
    
    if (accessCodeManager.setAccessCode(accessCode)) {
      setShowAccessModal(false);
      setAccessCode('');
      // Add success message to chat
      const currentAccess = accessCodeManager.getCurrentAccessCode();
      if (currentAccess) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🔓 **Access Granted!**\n\n${currentAccess.description}\n\nYou now have access to SeishinZ Agent features!`,
          timestamp: new Date(),
        }]);
      }
    } else {
      setAccessError('Invalid access code. Please try again.');
    }
  };

  const getAccessStatus = () => {
    const currentAccess = accessCodeManager.getCurrentAccessCode();
    const usageStats = accessCodeManager.getUsageStats();
    
    if (!currentAccess) {
      return { status: 'No Access', color: 'text-red-500', icon: Shield };
    }
    
    switch (currentAccess.type) {
      case 'nft_holder':
        return { status: 'NFT Holder', color: 'text-green-500', icon: Crown };
      case 'admin':
        return { status: 'Admin', color: 'text-purple-500', icon: Crown };
      case 'viewer':
        return { status: 'Viewer', color: 'text-blue-500', icon: Eye };
      case 'restricted':
        return { status: 'Guest', color: 'text-yellow-500', icon: Shield };
      default:
        return { status: 'Unknown', color: 'text-gray-500', icon: Shield };
    }
  };

  const AccessStatusDisplay = ({ onShowModal }: { onShowModal: () => void }) => {
    const accessStatus = getAccessStatus();
    const usageStats = accessCodeManager.getUsageStats();
    const StatusIcon = accessStatus.icon;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${accessStatus.color}`} />
          <span className={`text-sm font-medium ${accessStatus.color}`}>
            {accessStatus.status}
          </span>
        </div>
        {usageStats.accessCode !== 'None' && (
          <div className="text-xs text-gray-500 space-y-1">
            <div>Tweets: {usageStats.tweetsPosted}/{usageStats.accessCode === 'ADMIN2024' ? '∞' : usageStats.remainingTweets + usageStats.tweetsPosted}</div>
            <div>Replies: {usageStats.repliesSent}/{usageStats.accessCode === 'ADMIN2024' ? '∞' : usageStats.remainingReplies + usageStats.repliesSent}</div>
          </div>
        )}
        {usageStats.accessCode === 'None' && (
          <button
            onClick={onShowModal}
            className="w-full text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            Enter Access Code
          </button>
        )}
      </div>
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Twitter className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">SeishinZ Agent</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('quick')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'quick'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              Quick Actions
            </button>
            <button
              onClick={() => setActiveTab('personality')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'personality'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Personality
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'learning'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Brain className="w-4 h-4" />
              Learning
            </button>
          </nav>

          {/* Access Status */}
          <div className="p-4 border-t border-gray-200">
            <AccessStatusDisplay 
              onShowModal={() => setShowAccessModal(true)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'chat' ? (
            /* Chat Interface */
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-white">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Twitter className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Welcome to SeishinZ Agent
                      </h2>
                      <p className="text-gray-600 max-w-md">
                        Your NFT-focused AI assistant. Ask me to post tweets, check mentions, or get Shape Network data.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                                         {messages.map((message) => (
                       <div
                         key={message.id}
                         className={`py-6 border-b border-gray-100 ${
                           message.role === 'assistant' ? 'bg-gray-50' : ''
                         }`}
                       >
                         <div className="max-w-3xl mx-auto px-4">
                           <div className="flex gap-4">
                             <div className="flex-shrink-0">
                               {message.role === 'user' ? (
                                 <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                                   <User className="w-4 h-4 text-white" />
                                 </div>
                               ) : (
                                 <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                                   <Bot className="w-4 h-4 text-white" />
                                 </div>
                               )}
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 mb-2">
                                 <span className="font-medium text-gray-900">
                                   {message.role === 'user' ? 'You' : 'SeishinZ Agent'}
                                 </span>
                                 <span className="text-xs text-gray-500">
                                   {formatTime(message.timestamp)}
                                 </span>
                                 {message.role === 'assistant' && (
                                   <button
                                     onClick={() => copyMessage(message.content, message.id)}
                                     className="ml-auto p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                   >
                                     {copiedMessageId === message.id ? (
                                       <Check className="w-4 h-4 text-green-500" />
                                     ) : (
                                       <Copy className="w-4 h-4" />
                                     )}
                                   </button>
                                 )}
                               </div>
                               <div className="prose prose-sm max-w-none">
                                 <div className="whitespace-pre-wrap text-gray-900">
                                   {message.content}
                                 </div>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                                         {isLoading && (
                       <div className="py-6 border-b border-gray-100 bg-gray-50">
                         <div className="max-w-3xl mx-auto px-4">
                           <div className="flex gap-4">
                             <div className="flex-shrink-0">
                               <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                                 <Bot className="w-4 h-4 text-white" />
                               </div>
                             </div>
                             <div className="flex-1">
                               <div className="flex items-center gap-2 mb-2">
                                 <span className="font-medium text-gray-900">
                                   SeishinZ Agent
                                 </span>
                                 <span className="text-xs text-gray-500">
                                   {formatTime(new Date())}
                                 </span>
                               </div>
                               <div className="flex items-center gap-2 text-gray-600">
                                 <div className="flex space-x-1">
                                   <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                   <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                   <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                 </div>
                                 <span className="text-sm">Thinking...</span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 bg-white p-4">
                <div className="max-w-4xl mx-auto">
                  <form onSubmit={handleSubmit} className="relative">
                    <div className="relative">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Message SeishinZ Agent..."
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-500"
                        rows={1}
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Press Enter to send, Shift+Enter for new line
                    </div>
                  </form>
                </div>
              </div>
            </>
          ) : activeTab === 'quick' ? (
            /* Quick Actions */
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h1>
                  <p className="text-gray-600">
                    Execute common tasks with one click
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={() => handleQuickAction(action.action)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                          <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                          <div className="text-xs text-blue-600 font-medium">
                            Click to execute →
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'personality' ? (
            /* Personality Display */
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <div className="max-w-4xl mx-auto">
                <PersonalityDisplay />
              </div>
            </div>
          ) : (
            /* Learning Dashboard */
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <div className="max-w-6xl mx-auto">
                <LearningDashboard />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Access Code Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Access Required</h2>
            </div>
            
            <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Code
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter access code..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              
              {accessError && (
                <div className="text-red-600 text-sm">{accessError}</div>
              )}
              
              <div className="text-xs text-gray-900 space-y-1">
                <div><strong>Contact me @clintmod111 for access codes.</strong></div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enter Code
                </button>
               
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 