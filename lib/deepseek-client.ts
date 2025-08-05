// Custom DeepSeek API client for SeishinZ AI Agent
export interface DeepSeekConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface DeepSeekMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DeepSeekResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export class DeepSeekClient {
  private config: DeepSeekConfig;
  private baseUrl: string;

  constructor(config: DeepSeekConfig) {
    this.config = {
      model: 'deepseek-chat',
      maxTokens: 1000,
      temperature: 0.7,
      ...config
    };
    this.baseUrl = config.baseUrl || 'https://api.deepseek.com/v1';
  }

  async chat(messages: DeepSeekMessage[]): Promise<DeepSeekResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage,
      };
    } catch (error) {
      console.error('DeepSeek API error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async streamChat(messages: DeepSeekMessage[], onChunk: (chunk: string) => void): Promise<DeepSeekResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let fullContent = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

      return {
        content: fullContent,
      };
    } catch (error) {
      console.error('DeepSeek streaming error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Helper method to create a system message
  createSystemMessage(content: string): DeepSeekMessage {
    return {
      role: 'system',
      content: content,
    };
  }

  // Helper method to create a user message
  createUserMessage(content: string): DeepSeekMessage {
    return {
      role: 'user',
      content: content,
    };
  }

  // Helper method to create an assistant message
  createAssistantMessage(content: string): DeepSeekMessage {
    return {
      role: 'assistant',
      content: content,
    };
  }
} 