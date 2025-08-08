// Access code system for SeishinZ Agent
// Different access levels with X posting restrictions

export interface AccessCode {
  code: string;
  type: 'nft_holder' | 'restricted' | 'admin' | 'viewer';
  permissions: {
    canPostTweets: boolean;
    canReplyToTweets: boolean;
    canAutoReply: boolean;
    canCheckReplies: boolean;
    canGetData: boolean;
    canUseQuickActions: boolean;
    canUseInterface: boolean;
    maxRepliesPerSession: number;
    maxTweetsPerDay: number;
  };
  description: string;
  expiresAt?: Date;
}

export const ACCESS_CODES: Record<string, AccessCode> = {
  // NFT Holder Access - Full permissions including X posting
  'SHINZ2024': {
    code: 'SHINZ2024',
    type: 'nft_holder',
    permissions: {
      canPostTweets: true,
      canReplyToTweets: true,
      canAutoReply: true,
      canCheckReplies: true,
      canGetData: true,
      canUseQuickActions: true,
      canUseInterface: true,
      maxRepliesPerSession: 10,
      maxTweetsPerDay: 50,
    },
    description: 'NFT Holder Access - Full features including X posting',
  },
  
  // Viewer Access - Can use interface but NO X posting
  'VIEWER2024': {
    code: 'VIEWER2024',
    type: 'viewer',
    permissions: {
      canPostTweets: false,
      canReplyToTweets: false,
      canAutoReply: false,
      canCheckReplies: true,
      canGetData: true,
      canUseQuickActions: false,
      canUseInterface: true,
      maxRepliesPerSession: 0,
      maxTweetsPerDay: 0,
    },
    description: 'Viewer Access - Use interface but cannot post to X',
  },
  
  // Restricted Access - Limited permissions
  'GUEST2024': {
    code: 'GUEST2024',
    type: 'restricted',
    permissions: {
      canPostTweets: false,
      canReplyToTweets: false,
      canAutoReply: false,
      canCheckReplies: true,
      canGetData: true,
      canUseQuickActions: false,
      canUseInterface: true,
      maxRepliesPerSession: 0,
      maxTweetsPerDay: 0,
    },
    description: 'Guest Access - Read-only features, no X posting',
  },
  
  // Admin Access - Unlimited permissions
  'ADMIN2024': {
    code: 'ADMIN2024',
    type: 'admin',
    permissions: {
      canPostTweets: true,
      canReplyToTweets: true,
      canAutoReply: true,
      canCheckReplies: true,
      canGetData: true,
      canUseQuickActions: true,
      canUseInterface: true,
      maxRepliesPerSession: 999,
      maxTweetsPerDay: 999,
    },
    description: 'Admin Access - Unlimited features including X posting',
  },
};

export class AccessCodeManager {
  private static instance: AccessCodeManager;
  private currentAccessCode: AccessCode | null = null;
  private adminBypassEnabled: boolean = false;
  private usageStats: {
    tweetsPosted: number;
    repliesSent: number;
    lastResetDate: string;
  } = {
    tweetsPosted: 0,
    repliesSent: 0,
    lastResetDate: new Date().toDateString(),
  };

  static getInstance(): AccessCodeManager {
    if (!AccessCodeManager.instance) {
      AccessCodeManager.instance = new AccessCodeManager();
    }
    return AccessCodeManager.instance;
  }

  validateAccessCode(code: string): AccessCode | null {
    console.log('Validating access code:', code);
    console.log('Available codes:', Object.keys(ACCESS_CODES));
    const accessCode = ACCESS_CODES[code.toUpperCase()];
    console.log('Found access code:', accessCode);
    if (accessCode) {
      // Check if code has expired
      if (accessCode.expiresAt && new Date() > accessCode.expiresAt) {
        console.log('Access code expired');
        return null;
      }
      return accessCode;
    }
    return null;
  }

  setAccessCode(code: string): boolean {
    const accessCode = this.validateAccessCode(code);
    if (accessCode) {
      this.currentAccessCode = accessCode;
      this.resetDailyUsage();
      return true;
    }
    return false;
  }

  getCurrentAccessCode(): AccessCode | null {
    return this.currentAccessCode;
  }

  hasPermission(permission: keyof AccessCode['permissions']): boolean {
    if (!this.currentAccessCode) {
      return false;
    }
    const value = this.currentAccessCode.permissions[permission];
    return typeof value === 'boolean' ? value : false;
  }

  canPerformAction(action: 'postTweet' | 'replyToTweet' | 'autoReply' | 'checkReplies' | 'getData' | 'useQuickActions' | 'useInterface'): boolean {
    // Admin bypass for development/testing
    if (this.adminBypassEnabled) {
      return true;
    }
    
    if (!this.currentAccessCode) {
      return false;
    }

    switch (action) {
      case 'postTweet':
        return this.currentAccessCode.permissions.canPostTweets && 
               this.usageStats.tweetsPosted < this.currentAccessCode.permissions.maxTweetsPerDay;
      case 'replyToTweet':
        return this.currentAccessCode.permissions.canReplyToTweets;
      case 'autoReply':
        return this.currentAccessCode.permissions.canAutoReply && 
               this.usageStats.repliesSent < this.currentAccessCode.permissions.maxRepliesPerSession;
      case 'checkReplies':
        return this.currentAccessCode.permissions.canCheckReplies;
      case 'getData':
        return this.currentAccessCode.permissions.canGetData;
      case 'useQuickActions':
        return this.currentAccessCode.permissions.canUseQuickActions;
      case 'useInterface':
        return this.currentAccessCode.permissions.canUseInterface;
      default:
        return false;
    }
  }

  recordAction(action: 'postTweet' | 'replyToTweet' | 'autoReply'): void {
    if (action === 'postTweet') {
      this.usageStats.tweetsPosted++;
    } else if (action === 'replyToTweet' || action === 'autoReply') {
      this.usageStats.repliesSent++;
    }
  }

  getUsageStats() {
    return {
      ...this.usageStats,
      accessCode: this.currentAccessCode?.code || 'None',
      accessType: this.currentAccessCode?.type || 'None',
      remainingTweets: this.currentAccessCode ? 
        Math.max(0, this.currentAccessCode.permissions.maxTweetsPerDay - this.usageStats.tweetsPosted) : 0,
      remainingReplies: this.currentAccessCode ? 
        Math.max(0, this.currentAccessCode.permissions.maxRepliesPerSession - this.usageStats.repliesSent) : 0,
    };
  }

  private resetDailyUsage(): void {
    const today = new Date().toDateString();
    if (this.usageStats.lastResetDate !== today) {
      this.usageStats.tweetsPosted = 0;
      this.usageStats.repliesSent = 0;
      this.usageStats.lastResetDate = today;
    }
  }

  getAccessCodeInfo(code: string): string {
    const accessCode = ACCESS_CODES[code.toUpperCase()];
    if (!accessCode) {
      return 'Invalid access code';
    }

    return `${accessCode.description}\n\nPermissions:\n` +
           `• Use Interface: ${accessCode.permissions.canUseInterface ? '✅' : '❌'}\n` +
           `• Post to X: ${accessCode.permissions.canPostTweets ? '✅' : '❌'}\n` +
           `• Reply to Tweets: ${accessCode.permissions.canReplyToTweets ? '✅' : '❌'}\n` +
           `• Auto Reply: ${accessCode.permissions.canAutoReply ? '✅' : '❌'}\n` +
           `• Check Replies: ${accessCode.permissions.canCheckReplies ? '✅' : '❌'}\n` +
           `• Get Data: ${accessCode.permissions.canGetData ? '✅' : '❌'}\n` +
           `• Quick Actions: ${accessCode.permissions.canUseQuickActions ? '✅' : '❌'}\n` +
           `• Max Tweets/Day: ${accessCode.permissions.maxTweetsPerDay}\n` +
           `• Max Replies/Session: ${accessCode.permissions.maxRepliesPerSession}`;
  }

  getAvailableAccessCodes(): string[] {
    return Object.keys(ACCESS_CODES);
  }

  enableAdminBypass(): void {
    this.adminBypassEnabled = true;
  }

  disableAdminBypass(): void {
    this.adminBypassEnabled = false;
  }

  isAdminBypassEnabled(): boolean {
    return this.adminBypassEnabled;
  }

  getRestrictionMessage(): string {
    // Check if admin bypass is enabled
    if (this.isAdminBypassEnabled()) {
      return '🔓 **Admin Bypass Active**\n\nAll features are enabled for development/testing.';
    }
    
    if (!this.currentAccessCode) {
      return '🔒 **Access Required**\n\nPlease enter an access code to use SeishinZ Agent.\n\nContact the administrator for access codes.';
    }

    if (!this.currentAccessCode.permissions.canPostTweets) {
      return '🔒 **X Posting Restricted**\n\nYour access code does not allow posting to X. You can still:\n• Use the chat interface\n• Check replies and mentions\n• Get Shape Network data\n• View AI personality and learning\n\nContact the administrator to upgrade your access level.';
    }

    return '';
  }
}

export const accessCodeManager = AccessCodeManager.getInstance(); 