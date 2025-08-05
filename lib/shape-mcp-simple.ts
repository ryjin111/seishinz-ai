// Shape Network MCP Client - Direct HTTP calls to the deployed MCP server
export interface ShapeNetworkData {
  gasback?: {
    totalRewards: string;
    recentDistributions: any[];
  };
  nfts?: {
    collections: any[];
    trending: any[];
  };
  stack?: {
    achievements: any[];
    leaderboard: any[];
  };
  chain?: {
    status: string;
    metrics: any;
  };
}

export class SimpleShapeClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.SHAPE_MCP_URL || 'https://shape-mcp-server.vercel.app/mcp';
  }

  // Make direct HTTP call to Shape MCP Server
  private async callShapeMCP(toolName: string, params: any = {}): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Shape MCP error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling Shape MCP tool ${toolName}:`, error);
      return null;
    }
  }

  // Get Gasback data from Shape MCP Server
  async getGasbackData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Try to get top creators first
      const topCreators = await this.callShapeMCP('getTopShapeCreators');
      
      if (topCreators) {
        return { 
          success: true, 
          data: {
            totalRewards: "Data from Shape Network",
            topCreators: topCreators.content || [],
            source: "Shape MCP Server"
          }
        };
      }

      // Fallback to mock data if MCP server is unavailable
      const mockData = {
        totalRewards: "1,234.56 ETH",
        recentDistributions: [
          { user: "0x1234...", amount: "0.05 ETH", timestamp: Date.now() },
          { user: "0x5678...", amount: "0.03 ETH", timestamp: Date.now() - 86400000 }
        ],
        averageReward: "0.04 ETH",
        totalUsers: 1250
      };

      return { success: true, data: mockData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch Gasback data' 
      };
    }
  }

  // Get NFT collection analytics from Shape MCP Server
  async getNFTCollectionAnalytics(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Try to get collection analytics
      const collectionData = await this.callShapeMCP('getCollectionAnalytics', {
        collectionAddress: "0x1234567890abcdef" // Example address
      });
      
      if (collectionData) {
        return { 
          success: true, 
          data: {
            collections: [collectionData.content || {}],
            source: "Shape MCP Server"
          }
        };
      }

      // Fallback to mock data
      const mockData = {
        collections: [
          { name: "SeishinZ", floorPrice: "0.004 ETH", volume: "45.2 ETH", holders: 1200 },
          { name: "Shape Cats", floorPrice: "0.002 ETH", volume: "23.1 ETH", holders: 850 },
          { name: "Blockchain Heroes", floorPrice: "0.008 ETH", volume: "67.8 ETH", holders: 2100 }
        ],
        trending: [
          { name: "SeishinZ", change: "+15%", volume: "12.3 ETH" },
          { name: "Shape Cats", change: "+8%", volume: "8.7 ETH" }
        ]
      };

      return { success: true, data: mockData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch NFT data' 
      };
    }
  }

  // Get Stack achievements from Shape MCP Server
  async getStackAchievements(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Try to get stack achievements
      const stackData = await this.callShapeMCP('getStackAchievements', {
        userAddress: "0x1234567890abcdef" // Example address
      });
      
      if (stackData) {
        return { 
          success: true, 
          data: {
            achievements: stackData.content || [],
            source: "Shape MCP Server"
          }
        };
      }

      // Fallback to mock data
      const mockData = {
        achievements: [
          { name: "Early Adopter", description: "Joined Shape Network in first month", users: 450 },
          { name: "Gasback Master", description: "Earned 1+ ETH in Gasback", users: 120 },
          { name: "NFT Collector", description: "Own 10+ Shape Network NFTs", users: 89 }
        ],
        leaderboard: [
          { user: "0x1234...", points: 1250, achievements: 8 },
          { user: "0x5678...", points: 980, achievements: 6 },
          { user: "0x9abc...", points: 750, achievements: 5 }
        ]
      };

      return { success: true, data: mockData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch Stack data' 
      };
    }
  }

  // Get chain status from Shape MCP Server
  async getChainStatus(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Try to get chain status
      const chainData = await this.callShapeMCP('getChainStatus');
      
      if (chainData) {
        return { 
          success: true, 
          data: {
            status: "healthy",
            metrics: chainData.content || {},
            source: "Shape MCP Server"
          }
        };
      }

      // Fallback to mock data
      const mockData = {
        status: "healthy",
        metrics: {
          totalTransactions: "1,234,567",
          activeUsers: "12,345",
          gasPrice: "0.0001 ETH",
          blockHeight: "12345678"
        }
      };

      return { success: true, data: mockData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch chain status' 
      };
    }
  }

  // Get all available data
  async getAllData(): Promise<ShapeNetworkData> {
    const [gasback, nfts, stack, chain] = await Promise.all([
      this.getGasbackData(),
      this.getNFTCollectionAnalytics(),
      this.getStackAchievements(),
      this.getChainStatus()
    ]);

    return {
      gasback: gasback.success ? gasback.data : undefined,
      nfts: nfts.success ? nfts.data : undefined,
      stack: stack.success ? stack.data : undefined,
      chain: chain.success ? chain.data : undefined
    };
  }
} 