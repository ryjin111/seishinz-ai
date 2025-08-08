// AI-Powered Scheduler for SeishinZ Agent
import { shinZDB } from './database';
import { SeishinZTwitterClient } from './twitter';
import { accessCodeManager } from './access-codes';

export interface ScheduledTask {
  id: string;
  type: 'gm_tweet' | 'gasback_update' | 'nft_update' | 'community_engagement';
  schedule: string; // cron expression
  lastRun: string | null;
  nextRun: string;
  enabled: boolean;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export class AIScheduler {
  private static instance: AIScheduler;
  private tasks: Map<string, ScheduledTask> = new Map();
  private isRunning: boolean = false;

  static getInstance(): AIScheduler {
    if (!AIScheduler.instance) {
      AIScheduler.instance = new AIScheduler();
    }
    return AIScheduler.instance;
  }

  constructor() {
    this.initializeDefaultTasks();
  }

  private initializeDefaultTasks() {
    // Default GM tweet task
    this.addTask({
      id: 'daily_gm_tweet',
      type: 'gm_tweet',
      schedule: '0 9 * * *', // 9 AM daily
      lastRun: null,
      nextRun: this.calculateNextRun('0 9 * * *'),
      enabled: true,
      description: 'Post daily GM tweet to @ShapeL2 Shapers with seishinz.xyz',
      priority: 'high'
    });

    // Gasback update task
    this.addTask({
      id: 'weekly_gasback_update',
      type: 'gasback_update',
      schedule: '0 10 * * 1', // 10 AM every Monday
      lastRun: null,
      nextRun: this.calculateNextRun('0 10 * * 1'),
      enabled: true,
      description: 'Post weekly Gasback rewards update',
      priority: 'medium'
    });

    // NFT collection update task
    this.addTask({
      id: 'daily_nft_update',
      type: 'nft_update',
      schedule: '0 14 * * *', // 2 PM daily
      lastRun: null,
      nextRun: this.calculateNextRun('0 14 * * *'),
      enabled: true,
      description: 'Post daily NFT collection analytics',
      priority: 'medium'
    });

    // Community engagement task
    this.addTask({
      id: 'community_engagement',
      type: 'community_engagement',
      schedule: '0 */4 * * *', // Every 4 hours
      lastRun: null,
      nextRun: this.calculateNextRun('0 */4 * * *'),
      enabled: true,
      description: 'Check and reply to community mentions',
      priority: 'high'
    });
  }

  addTask(task: ScheduledTask): void {
    this.tasks.set(task.id, task);
  }

  removeTask(taskId: string): boolean {
    return this.tasks.delete(taskId);
  }

  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  updateTask(taskId: string, updates: Partial<ScheduledTask>): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      this.tasks.set(taskId, { ...task, ...updates });
      return true;
    }
    return false;
  }

  async startScheduler(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🤖 AI Scheduler started');
    
    // Check for tasks every minute
    setInterval(async () => {
      await this.checkAndExecuteTasks();
    }, 60000); // 1 minute

    // Initial check
    await this.checkAndExecuteTasks();
  }

  stopScheduler(): void {
    this.isRunning = false;
    console.log('🤖 AI Scheduler stopped');
  }

  private async checkAndExecuteTasks(): Promise<void> {
    const now = new Date();
    
    for (const task of Array.from(this.tasks.values())) {
      if (!task.enabled) continue;
      
      const nextRun = new Date(task.nextRun);
      if (now >= nextRun) {
        await this.executeTask(task);
      }
    }
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    console.log(`🤖 Executing task: ${task.description}`);
    
    try {
      // Enable admin bypass for automated tasks
      accessCodeManager.enableAdminBypass();
      
      switch (task.type) {
        case 'gm_tweet':
          await this.executeGmTweet();
          break;
        case 'gasback_update':
          await this.executeGasbackUpdate();
          break;
        case 'nft_update':
          await this.executeNftUpdate();
          break;
        case 'community_engagement':
          await this.executeCommunityEngagement();
          break;
      }
      
      // Update task status
      this.updateTask(task.id, {
        lastRun: new Date().toISOString(),
        nextRun: this.calculateNextRun(task.schedule)
      });
      
      console.log(`✅ Task completed: ${task.description}`);
      
    } catch (error) {
      console.error(`❌ Task failed: ${task.description}`, error);
    }
  }

  private async executeGmTweet(): Promise<void> {
    const twitterClient = new SeishinZTwitterClient();
    
    // Check if already posted today
    const today = new Date().toDateString();
    const lastGm = await shinZDB.getLastGmTweet();
    
    if (lastGm?.date === today) {
      console.log('GM tweet already posted today');
      return;
    }

    // GM tweet templates
    const templates = [
      "GM Shapers @ShapeL2! ☀️ Ready to hunt some NFT alpha today? Let's find those rare gems 🚀\n\nCheck out seishinz.xyz for the latest drops! 🎨✨",
      "GM @ShapeL2 Shapers! 🌅 Another beautiful day to stack and collect. What's your alpha today? 🔥\n\nDiscover more at seishinz.xyz 🎯",
      "GM Shapers @ShapeL2! 🌟 Time to wake up and smell the NFTs! Ready for some epic finds? 💎\n\nExplore seishinz.xyz for exclusive collections! 🚀",
      "GM @ShapeL2! ☀️ Good morning, alpha hunters! Let's make today legendary with some sick NFT grabs 🏆\n\nVisit seishinz.xyz for the freshest drops! 🎨",
      "GM Shapers @ShapeL2! 🌅 Rise and shine, it's NFT hunting time! Who's ready to find the next big thing? 🔥\n\nCheck seishinz.xyz for the latest! 💫"
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    const result = await twitterClient.postTweet(randomTemplate);
    
    if (result.success) {
      await shinZDB.storeGmTweet({
        id: Date.now().toString(),
        date: today,
        timestamp: new Date().toISOString(),
        success: true,
        tweet_id: result.tweetId,
        content: randomTemplate
      });
    }
  }

  private async executeGasbackUpdate(): Promise<void> {
    // AI will generate gasback update content
    const content = "🔥 **Gasback Rewards Update** 🔥\n\nLatest rewards are live on Shape Network! Stack those points and earn rewards.\n\nCheck your rewards at seishinz.xyz 🎯\n\n#ShapeNetwork #Gasback";
    
    const twitterClient = new SeishinZTwitterClient();
    await twitterClient.postTweet(content);
  }

  private async executeNftUpdate(): Promise<void> {
    // AI will generate NFT update content
    const content = "🎨 **NFT Collection Update** 🎨\n\nLatest floor movements and volume spikes on Shape Network!\n\nDiscover trending collections at seishinz.xyz 📊\n\n#NFTs #ShapeNetwork";
    
    const twitterClient = new SeishinZTwitterClient();
    await twitterClient.postTweet(content);
  }

  private async executeCommunityEngagement(): Promise<void> {
    const twitterClient = new SeishinZTwitterClient();
    const mentions = await twitterClient.getMentions();
    
    if (mentions.success && mentions.mentions && mentions.mentions.length > 0) {
      // Reply to the first few mentions
      const recentMentions = mentions.mentions.slice(0, 3);
      
      for (const mention of recentMentions) {
        const reply = `Thanks for the mention! 🙏 Check out seishinz.xyz for the latest updates! 🚀`;
        await twitterClient.replyToTweet(mention.id, reply);
      }
    }
  }

  private calculateNextRun(cronExpression: string): string {
    // Simple next run calculation (you can use a proper cron library)
    const now = new Date();
    const next = new Date(now);
    
    // For daily tasks, set to next day
    if (cronExpression.includes('0 9 * * *')) {
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0, 0, 0);
    }
    
    return next.toISOString();
  }

  // AI can modify schedules based on engagement patterns
  async optimizeSchedule(): Promise<void> {
    console.log('🤖 AI optimizing schedule based on engagement patterns...');
    
    // Get engagement analytics
    const analytics = await shinZDB.getAnalytics();
    
    // Adjust timing based on when engagement is highest
    // This is where AI learning comes in
  }

  // Get scheduler status
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      totalTasks: this.tasks.size,
      enabledTasks: Array.from(this.tasks.values()).filter(t => t.enabled).length,
      nextTask: this.getNextScheduledTask(),
      tasks: this.getAllTasks()
    };
  }

  private getNextScheduledTask(): ScheduledTask | null {
    const enabledTasks = Array.from(this.tasks.values()).filter(t => t.enabled);
    if (enabledTasks.length === 0) return null;
    
    return enabledTasks.reduce((earliest, task) => {
      const taskTime = new Date(task.nextRun);
      const earliestTime = new Date(earliest.nextRun);
      return taskTime < earliestTime ? task : earliest;
    });
  }
}

export const aiScheduler = AIScheduler.getInstance(); 