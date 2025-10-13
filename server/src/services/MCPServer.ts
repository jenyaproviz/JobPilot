import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { JobService } from './JobService.js';
import { PAGINATION_CONSTANTS } from '../constants/pagination';
import type { IJob, IJobSearchQuery } from '../types/index';
import { Job } from '../models/Job';
import { AIJobAnalyzer } from './AIJobAnalyzer';
import { IsraeliJobScraper } from './IsraeliJobScraper';

export class JobPilotMCPServer {
  private server: Server;
  private aiAnalyzer: AIJobAnalyzer;
  private israeliScraper: IsraeliJobScraper;

  constructor() {
    this.server = new Server(
      {
        name: 'jobpilot-israeli-agent',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.aiAnalyzer = new AIJobAnalyzer();
    this.israeliScraper = new IsraeliJobScraper();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_job_match',
            description: 'Analyze how well a job matches user skills and preferences',
            inputSchema: {
              type: 'object',
              properties: {
                jobId: {
                  type: 'string',
                  description: 'The job ID to analyze',
                },
                userSkills: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of user skills and technologies',
                },
                userPreferences: {
                  type: 'object',
                  description: 'User job preferences (location, salary, etc.)',
                },
              },
              required: ['jobId', 'userSkills'],
            },
          },
          {
            name: 'optimize_search_keywords',
            description: 'Optimize job search keywords based on current market trends',
            inputSchema: {
              type: 'object',
              properties: {
                currentKeywords: {
                  type: 'string',
                  description: 'Current search keywords',
                },
                jobCount: {
                  type: 'number',
                  description: 'Current number of results',
                },
                targetIndustry: {
                  type: 'string',
                  description: 'Target industry (optional)',
                },
              },
              required: ['currentKeywords'],
            },
          },
          {
            name: 'generate_job_recommendations',
            description: 'Generate personalized job recommendations based on user profile',
            inputSchema: {
              type: 'object',
              properties: {
                userProfile: {
                  type: 'object',
                  description: 'User skills, experience, and preferences',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of recommendations',
                  default: 10,
                },
              },
              required: ['userProfile'],
            },
          },
          {
            name: 'extract_job_insights',
            description: 'Extract key insights from job descriptions using NLP',
            inputSchema: {
              type: 'object',
              properties: {
                jobDescription: {
                  type: 'string',
                  description: 'Job description text to analyze',
                },
              },
              required: ['jobDescription'],
            },
          },
          {
            name: 'predict_job_trends',
            description: 'Predict job market trends based on current data',
            inputSchema: {
              type: 'object',
              properties: {
                timeframe: {
                  type: 'string',
                  enum: ['week', 'month', 'quarter'],
                  description: 'Prediction timeframe',
                  default: 'month',
                },
                industry: {
                  type: 'string',
                  description: 'Specific industry to analyze (optional)',
                },
              },
            },
          },
          {
            name: 'search_israeli_jobs',
            description: 'Search for jobs on Israeli job sites like AllJobs.co.il and TechIt.co.il',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Job search query (e.g., "developer", "מפתח", "backend")',
                },
                location: {
                  type: 'string',
                  description: 'Location in Israel (e.g., "Tel Aviv", "תל אביב", "Jerusalem")',
                },
                sites: {
                  type: 'array',
                  items: { 
                    type: 'string',
                    enum: ['alljobs', 'techit', 'drushim', 'jobnet', 'all']
                  },
                  description: 'Which Israeli job sites to search',
                  default: ['all'],
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of jobs to return',
                  default: PAGINATION_CONSTANTS.DEFAULT_RESULTS_PER_PAGE,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_israeli_job_details',
            description: 'Get detailed information about a specific job from Israeli job sites',
            inputSchema: {
              type: 'object',
              properties: {
                jobId: {
                  type: 'string',
                  description: 'The job ID or URL',
                },
                site: {
                  type: 'string',
                  enum: ['alljobs', 'techit', 'drushim', 'jobnet'],
                  description: 'Which Israeli job site the job is from',
                },
              },
              required: ['jobId', 'site'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_job_match':
            return await this.handleJobMatchAnalysis(args);
          
          case 'optimize_search_keywords':
            return await this.handleKeywordOptimization(args);
          
          case 'generate_job_recommendations':
            return await this.handleJobRecommendations(args);
          
          case 'extract_job_insights':
            return await this.handleJobInsights(args);
          
          case 'predict_job_trends':
            return await this.handleJobTrendPrediction(args);
          
          case 'search_israeli_jobs':
            return await this.handleIsraeliJobSearch(args);
          
          case 'get_israeli_job_details':
            return await this.handleIsraeliJobDetails(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error}`
        );
      }
    });
  }

  private async handleJobMatchAnalysis(args: any) {
    const { jobId, userSkills, userPreferences } = args;
    
    // Get job from database
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Analyze job match using AI
    const analysis = await this.aiAnalyzer.analyzeJobMatch(
      job.toObject() as IJob,
      userSkills,
      userPreferences
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            matchScore: analysis.matchScore,
            matchingSkills: analysis.matchingSkills,
            missingSkills: analysis.missingSkills,
            recommendations: analysis.recommendations,
            salaryMatch: analysis.salaryMatch,
            locationMatch: analysis.locationMatch,
            overallAssessment: analysis.overallAssessment,
          }, null, 2),
        },
      ],
    };
  }

  private async handleKeywordOptimization(args: any) {
    const { currentKeywords, jobCount, targetIndustry } = args;
    
    const optimization = await this.aiAnalyzer.optimizeSearchKeywords(
      currentKeywords,
      jobCount,
      targetIndustry
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            optimizedKeywords: optimization.optimizedKeywords,
            suggestions: optimization.suggestions,
            expectedResultsIncrease: optimization.expectedResultsIncrease,
            trendingSkills: optimization.trendingSkills,
          }, null, 2),
        },
      ],
    };
  }

  private async handleJobRecommendations(args: any) {
    const { userProfile, limit = 10 } = args;
    
    const recommendations = await this.aiAnalyzer.generateJobRecommendations(
      userProfile,
      limit
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            recommendedJobs: recommendations.jobs,
            reasoning: recommendations.reasoning,
            confidenceScores: recommendations.confidenceScores,
            suggestedSkillImprovements: recommendations.suggestedSkillImprovements,
          }, null, 2),
        },
      ],
    };
  }

  private async handleJobInsights(args: any) {
    const { jobDescription } = args;
    
    const insights = await this.aiAnalyzer.extractJobInsights(jobDescription);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            requiredSkills: insights.requiredSkills,
            preferredSkills: insights.preferredSkills,
            experienceLevel: insights.experienceLevel,
            keyResponsibilities: insights.keyResponsibilities,
            benefits: insights.benefits,
            companySize: insights.companySize,
            remoteFriendly: insights.remoteFriendly,
            salary: insights.salary,
            techStack: insights.techStack,
          }, null, 2),
        },
      ],
    };
  }

  private async handleJobTrendPrediction(args: any) {
    const { timeframe = 'month', industry } = args;
    
    const trends = await this.aiAnalyzer.predictJobTrends(timeframe, industry);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            predictions: trends.predictions,
            growthSectors: trends.growthSectors,
            decliningSkills: trends.decliningSkills,
            emergingSkills: trends.emergingSkills,
            salaryTrends: trends.salaryTrends,
            confidence: trends.confidence,
          }, null, 2),
        },
      ],
    };
  }

  private async handleIsraeliJobSearch(args: any) {
    const { query, location, sites = ['all'], limit = PAGINATION_CONSTANTS.DEFAULT_RESULTS_PER_PAGE } = args;
    
    try {
      console.log(`🔍 Searching Israeli job sites for: "${query}" in ${location || 'all Israel'}`);
      
      // Use the Israeli scraper to search all sites
      const jobs = await this.israeliScraper.searchAllIsraeliSites(query, location, limit);
      
      console.log(`✅ Found ${jobs.length} jobs from Israeli job sites`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              query,
              location: location || 'All Israel',
              totalJobs: jobs.length,
              sites: sites,
              jobs: jobs.map(job => ({
                _id: job._id,
                title: job.title,
                company: job.company,
                location: job.location,
                salary: job.salary,
                description: job.description?.substring(0, 200) + '...',
                employmentType: job.employmentType,
                experienceLevel: job.experienceLevel,
                postedDate: job.postedDate,
                originalUrl: job.originalUrl,
                source: job.source,
                requirements: job.requirements,
                keywords: job.keywords
              }))
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('❌ Error searching Israeli jobs:', error);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to search Israeli job sites',
              message: error instanceof Error ? error.message : String(error),
              query,
              location: location || 'All Israel'
            }, null, 2),
          },
        ],
      };
    }
  }

  private async handleIsraeliJobDetails(args: any) {
    const { jobId, site } = args;
    
    try {
      console.log(`🔍 Getting details for job ${jobId} from ${site}`);
      
      // For now, return basic job details
      // In a full implementation, we would scrape the specific job page
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              jobId,
              site,
              message: 'Job details functionality coming soon',
              suggestion: 'Use search_israeli_jobs to find jobs with basic details'
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to get job details',
              message: error instanceof Error ? error.message : String(error),
              jobId,
              site
            }, null, 2),
          },
        ],
      };
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🤖 JobPilot MCP Server started successfully');
  }

  async stop() {
    await this.server.close();
    console.log('🤖 JobPilot MCP Server stopped');
  }
}