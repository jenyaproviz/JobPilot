import { JobService } from './JobService';
import { JobPilotMCPServer } from './MCPServer';
import { AIJobAnalyzer } from './AIJobAnalyzer';
import type { IJob, IJobSearchQuery } from '../types/index';

export interface IntelligentSearchOptions {
  useAI?: boolean;
  userProfile?: {
    skills: string[];
    experience: string;
    preferences: any;
  };
  optimizeKeywords?: boolean;
}

export class IntelligentJobService extends JobService {
  private mcpServer: JobPilotMCPServer;
  private aiAnalyzer: AIJobAnalyzer;

  constructor() {
    super();
    this.mcpServer = new JobPilotMCPServer();
    this.aiAnalyzer = new AIJobAnalyzer();
    
    console.log('🤖 Intelligent Job Service initialized');
  }

  async startMCPServer(): Promise<void> {
    try {
      await this.mcpServer.start();
      console.log('✅ MCP Server started successfully');
    } catch (error) {
      console.error('❌ Failed to start MCP Server:', error);
    }
  }

  async stopMCPServer(): Promise<void> {
    try {
      await this.mcpServer.stop();
      console.log('🔴 MCP Server stopped');
    } catch (error) {
      console.error('❌ Error stopping MCP Server:', error);
    }
  }

  async intelligentSearchJobs(
    query: IJobSearchQuery, 
    options: IntelligentSearchOptions = {}
  ) {
    const { useAI = true, userProfile, optimizeKeywords = false } = options;

    // First, get regular search results
    const baseResults = await this.searchJobs(query);

    if (!useAI) {
      return baseResults;
    }

    try {
      // Optimize keywords if requested
      let optimizedQuery = query;
      if (optimizeKeywords && query.keywords) {
        const optimization = await this.aiAnalyzer.optimizeSearchKeywords(
          query.keywords,
          baseResults.totalCount
        );
        
        optimizedQuery = {
          ...query,
          keywords: optimization.optimizedKeywords.join(' ')
        };

        // Get results with optimized keywords
        const optimizedResults = await this.searchJobs(optimizedQuery);
        if (optimizedResults.totalCount > baseResults.totalCount) {
          console.log(`🎯 Keywords optimized: ${baseResults.totalCount} → ${optimizedResults.totalCount} results`);
          baseResults.jobs = optimizedResults.jobs;
          baseResults.totalCount = optimizedResults.totalCount;
        }
      }

      // Add AI match scoring if user profile is available
      if (userProfile) {
        const scoredJobs = await Promise.all(
          baseResults.jobs.map(async (job) => {
            try {
              const analysis = await this.aiAnalyzer.analyzeJobMatch(
                job,
                userProfile.skills,
                userProfile.preferences
              );

              return {
                ...job,
                matchScore: analysis.matchScore,
                aiAnalysis: {
                  matchingSkills: analysis.matchingSkills,
                  missingSkills: analysis.missingSkills,
                  recommendations: analysis.recommendations,
                  overallAssessment: analysis.overallAssessment
                }
              };
            } catch (error) {
              console.warn(`Failed to analyze job ${job._id}:`, error);
              return { ...job, matchScore: 50 }; // Default score if analysis fails
            }
          })
        );

        // Sort by AI match score
        scoredJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        
        return {
          ...baseResults,
          jobs: scoredJobs,
          aiEnhanced: true,
          optimization: optimizeKeywords ? {
            originalKeywords: query.keywords,
            optimizedKeywords: optimizedQuery.keywords,
            resultImprovement: baseResults.totalCount
          } : undefined
        };
      }

      return {
        ...baseResults,
        aiEnhanced: false
      };

    } catch (error) {
      console.error('❌ AI enhancement failed, returning base results:', error);
      return {
        ...baseResults,
        aiEnhanced: false,
        aiError: error instanceof Error ? error.message : 'Unknown AI error'
      };
    }
  }

  async getJobRecommendations(userProfile: any, limit: number = 10) {
    try {
      const recommendations = await this.aiAnalyzer.generateJobRecommendations(
        userProfile,
        limit
      );

      return {
        success: true,
        data: recommendations,
        message: `Generated ${recommendations.jobs.length} personalized job recommendations`
      };
    } catch (error) {
      console.error('❌ Failed to generate job recommendations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
        data: { jobs: [], reasoning: [], confidenceScores: [], suggestedSkillImprovements: [] }
      };
    }
  }

  async analyzeJobDetails(jobId: string, userProfile?: any) {
    try {
      const job = await this.getJobById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // Extract deep insights from job description
      const insights = await this.aiAnalyzer.extractJobInsights(job.description);

      let matchAnalysis = null;
      if (userProfile && userProfile.skills) {
        matchAnalysis = await this.aiAnalyzer.analyzeJobMatch(
          job,
          userProfile.skills,
          userProfile.preferences || {}
        );
      }

      return {
        success: true,
        data: {
          job,
          insights,
          matchAnalysis,
          recommendations: matchAnalysis?.recommendations || []
        },
        message: 'Job analysis completed successfully'
      };
    } catch (error) {
      console.error('❌ Job analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Job analysis failed',
        data: null
      };
    }
  }

  async getJobMarketTrends(timeframe: string = 'month', industry?: string) {
    try {
      const trends = await this.aiAnalyzer.predictJobTrends(timeframe, industry);

      return {
        success: true,
        data: trends,
        message: `Job market trends analyzed for ${timeframe} timeframe`
      };
    } catch (error) {
      console.error('❌ Trend analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Trend analysis failed',
        data: null
      };
    }
  }

  async getKeywordSuggestions(currentKeywords: string, jobCount?: number) {
    try {
      const optimization = await this.aiAnalyzer.optimizeSearchKeywords(
        currentKeywords,
        jobCount || 0
      );

      return {
        success: true,
        data: {
          original: currentKeywords,
          suggestions: optimization.optimizedKeywords,
          reasoning: optimization.suggestions,
          trendingSkills: optimization.trendingSkills,
          expectedImprovement: optimization.expectedResultsIncrease
        },
        message: 'Keyword optimization completed'
      };
    } catch (error) {
      console.error('❌ Keyword optimization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Keyword optimization failed',
        data: null
      };
    }
  }

  async enhanceJobScraping(keywords: string, location: string = '', userProfile?: any): Promise<{
    success: boolean;
    totalJobs: number;
    jobsBySite: Record<string, number>;
    aiEnhanced?: boolean;
    insights?: any;
    errors: string[];
  }> {
    // First, perform regular scraping
    const scrapingResults = await this.scrapeJobsFromSites(keywords, location, 50);

    if (!scrapingResults.success || !userProfile) {
      return {
        ...scrapingResults,
        aiEnhanced: false
      };
    }

    try {
      // Get the newly scraped jobs
      const recentJobs = await this.searchJobs({
        keywords,
        location,
        datePosted: 'today',
        limit: 100
      });

      // Analyze the scraped jobs for insights
      const jobInsights = await Promise.all(
        recentJobs.jobs.slice(0, 10).map(async (job) => {
          return await this.aiAnalyzer.extractJobInsights(job.description);
        })
      );

      // Aggregate insights
      const aggregatedInsights = this.aggregateJobInsights(jobInsights);

      // Generate market analysis
      const marketAnalysis = await this.aiAnalyzer.predictJobTrends('week');

      return {
        ...scrapingResults,
        aiEnhanced: true,
        insights: {
          topSkills: aggregatedInsights.topSkills,
          averageExperience: aggregatedInsights.averageExperience,
          remotePercentage: aggregatedInsights.remotePercentage,
          topBenefits: aggregatedInsights.topBenefits,
          marketTrends: marketAnalysis.predictions.slice(0, 5)
        }
      };

    } catch (error) {
      console.error('❌ AI enhancement of scraping failed:', error);
      return {
        ...scrapingResults,
        aiEnhanced: false,
        errors: [...scrapingResults.errors, `AI enhancement failed: ${error}`]
      };
    }
  }

  private aggregateJobInsights(insights: any[]): any {
    const allSkills = insights.flatMap(insight => insight.requiredSkills);
    const skillCounts: Record<string, number> = {};
    
    allSkills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });

    const topSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, frequency: count }));

    const experienceLevels = insights.map(i => i.experienceLevel);
    const averageExperience = this.calculateAverageExperience(experienceLevels);

    const remoteCount = insights.filter(i => i.remoteFriendly).length;
    const remotePercentage = (remoteCount / insights.length) * 100;

    const allBenefits = insights.flatMap(i => i.benefits);
    const benefitCounts: Record<string, number> = {};
    allBenefits.forEach(benefit => {
      benefitCounts[benefit] = (benefitCounts[benefit] || 0) + 1;
    });

    const topBenefits = Object.entries(benefitCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([benefit]) => benefit);

    return {
      topSkills,
      averageExperience,
      remotePercentage,
      topBenefits
    };
  }

  private calculateAverageExperience(levels: string[]): string {
    const levelValues = { entry: 1, mid: 2, senior: 3, executive: 4 };
    const total = levels.reduce((sum, level) => sum + (levelValues[level as keyof typeof levelValues] || 2), 0);
    const average = total / levels.length;
    
    if (average <= 1.5) return 'entry';
    if (average <= 2.5) return 'mid';
    if (average <= 3.5) return 'senior';
    return 'executive';
  }

  async cleanup(): Promise<void> {
    await super.cleanup();
    await this.stopMCPServer();
  }
}