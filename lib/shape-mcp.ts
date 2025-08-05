import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { experimental_createMCPClient } from 'ai';

// Shape Network MCP Client for blockchain data
export class ShapeMCPClient {
  private mcpClient: any;
  private url: string;

  constructor() {
    // Use the Shape MCP server URL from the documentation
    this.url = process.env.SHAPE_MCP_URL || 'https://shape-mcp-server.vercel.app/mcp';
  }

  async initialize() {
    try {
      const url = new URL(this.url);
      this.mcpClient = await experimental_createMCPClient({
        transport: new StreamableHTTPClientTransport(url),
      });
      return { success: true };
    } catch (error) {
      console.error('Error initializing Shape MCP client:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getAvailableTools() {
    try {
      if (!this.mcpClient) {
        await this.initialize();
      }
      const tools = await this.mcpClient.tools();
      return { success: true, tools };
    } catch (error) {
      console.error('Error getting tools:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get Gasback rewards data
  async getGasbackData() {
    try {
      if (!this.mcpClient) {
        await this.initialize();
      }
      // This would use the actual MCP tools from Shape
      const result = await this.mcpClient.callTool('getGasbackRewards', {});
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting Gasback data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get NFT collection analytics
  async getNFTCollectionAnalytics(collectionAddress?: string) {
    try {
      if (!this.mcpClient) {
        await this.initialize();
      }
      const result = await this.mcpClient.callTool('getCollectionAnalytics', {
        collectionAddress: collectionAddress || 'all'
      });
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting NFT analytics:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get Stack achievements
  async getStackAchievements(userAddress?: string) {
    try {
      if (!this.mcpClient) {
        await this.initialize();
      }
      const result = await this.mcpClient.callTool('getStackAchievements', {
        userAddress: userAddress || 'all'
      });
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting Stack achievements:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get chain status
  async getChainStatus() {
    try {
      if (!this.mcpClient) {
        await this.initialize();
      }
      const result = await this.mcpClient.callTool('getChainStatus', {});
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting chain status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async close() {
    try {
      if (this.mcpClient) {
        await this.mcpClient.close();
      }
    } catch (error) {
      console.error('Error closing MCP client:', error);
    }
  }
} 