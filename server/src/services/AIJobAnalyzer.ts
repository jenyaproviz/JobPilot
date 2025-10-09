import natural from 'natural';
import compromise from 'compromise';
import { Job } from '../models/Job';
import type { IJob } from '../types/index';

export interface JobMatchAnalysis {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  salaryMatch: 'below' | 'within' | 'above' | 'unknown';
  locationMatch: boolean;
  overallAssessment: string;
}

export interface KeywordOptimization {
  optimizedKeywords: string[];
  suggestions: string[];
  expectedResultsIncrease: number;
  trendingSkills: string[];
}

export interface JobRecommendations {
  jobs: Array<IJob & { matchScore: number; reasoning: string; }>;
  reasoning: string[];
  confidenceScores: number[];
  suggestedSkillImprovements: string[];
}

export interface JobInsights {
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  keyResponsibilities: string[];
  benefits: string[];
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  remoteFriendly: boolean;
  salary: { min?: number; max?: number; currency?: string; };
  techStack: string[];
}

export interface JobTrends {
  predictions: Array<{ skill: string; trend: 'rising' | 'stable' | 'declining'; confidence: number; }>;
  growthSectors: string[];
  decliningSkills: string[];
  emergingSkills: string[];
  salaryTrends: Array<{ role: string; averageSalary: number; growth: number; }>;
  confidence: number;
}

export class AIJobAnalyzer {
  private stemmer: any;
  private sentiment: any;
  private tokenizer: any;

  constructor() {
    // Initialize NLP tools
    this.stemmer = natural.PorterStemmer;
    // Initialize sentiment analyzer (simplified without negation handling)
    this.sentiment = null; // We'll use a simpler approach for sentiment
    this.tokenizer = new natural.WordTokenizer();
    
    console.log('🧠 AI Job Analyzer initialized');
  }

  async analyzeJobMatch(job: IJob, userSkills: string[], userPreferences: any): Promise<JobMatchAnalysis> {
    // Normalize skills for comparison
    const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase().trim());
    const jobRequirements = job.requirements || [];
    const jobKeywords = job.keywords || [];
    
    // If no requirements/keywords, extract from description
    let jobSkills = [
      ...jobRequirements.map(req => req.toLowerCase().trim()),
      ...jobKeywords.map(kw => kw.toLowerCase().trim())
    ];
    
    if (jobSkills.length === 0 && job.description) {
      const insights = await this.extractJobInsights(job.description);
      jobSkills = insights.requiredSkills.map(skill => skill.toLowerCase().trim());
    }

    // Find skill matches
    const matchingSkills = normalizedUserSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.includes(skill) || 
        skill.includes(jobSkill) ||
        this.calculateSimilarity(skill, jobSkill) > 0.7
      )
    );

    // Find missing critical skills
    const criticalSkills = this.extractCriticalSkills(job.description, job.requirements);
    const missingSkills = criticalSkills.filter(skill => 
      !normalizedUserSkills.some(userSkill => 
        userSkill.includes(skill.toLowerCase()) || 
        this.calculateSimilarity(userSkill, skill.toLowerCase()) > 0.7
      )
    );

    // Calculate match score (0-100)
    const skillsMatchRatio = matchingSkills.length / Math.max(criticalSkills.length, 1);
    const experienceMatch = this.calculateExperienceMatch(job.experienceLevel, userPreferences.experienceLevel || 'mid');
    const locationMatch = this.calculateLocationMatch(job.location, userPreferences.locations || []);
    
    const matchScore = Math.round(
      (skillsMatchRatio * 60) + 
      (experienceMatch * 25) + 
      (locationMatch ? 15 : 0)
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(matchScore, missingSkills, job);

    // Salary match analysis
    const salaryMatch = this.analyzeSalaryMatch(job.salary, userPreferences.salaryRange);

    // Overall assessment
    const overallAssessment = this.generateOverallAssessment(matchScore, matchingSkills, missingSkills);

    return {
      matchScore: Math.min(100, matchScore),
      matchingSkills,
      missingSkills,
      recommendations,
      salaryMatch,
      locationMatch,
      overallAssessment
    };
  }

  async optimizeSearchKeywords(currentKeywords: string, jobCount: number, targetIndustry?: string): Promise<KeywordOptimization> {
    // Analyze current keyword effectiveness
    const currentTokens = this.tokenizer.tokenize(currentKeywords.toLowerCase());
    const stemmedTokens = currentTokens.map((token: string) => this.stemmer.stem(token));

    // Get trending skills from recent job postings
    const trendingSkills = await this.getTrendingSkills(targetIndustry);
    
    // Generate keyword suggestions
    const suggestions = [];
    
    if (jobCount < 10) {
      suggestions.push('Consider using broader terms or synonyms');
      suggestions.push('Remove very specific technology versions (e.g., "React 18" → "React")');
    } else if (jobCount > 1000) {
      suggestions.push('Add more specific qualifiers to narrow results');
      suggestions.push('Include seniority level (Senior, Junior, Mid-level)');
    }

    // Suggest trending additions
    const relevantTrending = trendingSkills.filter(skill => 
      !currentTokens.includes(skill.toLowerCase())
    ).slice(0, 3);

    const optimizedKeywords = [
      ...currentTokens,
      ...relevantTrending
    ].filter((keyword, index, array) => array.indexOf(keyword) === index);

    const expectedIncrease = this.calculateExpectedIncrease(currentKeywords, optimizedKeywords);

    return {
      optimizedKeywords,
      suggestions: [
        ...suggestions,
        ...relevantTrending.map(skill => `Consider adding "${skill}" - trending skill`),
      ],
      expectedResultsIncrease: expectedIncrease,
      trendingSkills: relevantTrending
    };
  }

  async generateJobRecommendations(userProfile: any, limit: number = 10): Promise<JobRecommendations> {
    const { skills = [], experience = 'mid', preferences = {} } = userProfile;

    // Build intelligent query based on user profile
    const skillsQuery = skills.map((skill: string) => ({ 
      $or: [
        { requirements: { $regex: skill, $options: 'i' } },
        { description: { $regex: skill, $options: 'i' } },
        { keywords: { $in: [skill.toLowerCase()] } }
      ]
    }));

    const matchingJobs = await Job.find({
      $and: [
        { isActive: true },
        { experienceLevel: experience },
        ...(skillsQuery.length > 0 ? [{ $or: skillsQuery }] : [])
      ]
    }).limit(limit * 2).lean() as unknown as IJob[];

    // Score and rank jobs
    const scoredJobs = await Promise.all(
      matchingJobs.map(async (job) => {
        const analysis = await this.analyzeJobMatch(job, skills, preferences);
        return {
          ...job,
          matchScore: analysis.matchScore,
          reasoning: this.generateJobRecommendationReason(job, analysis)
        };
      })
    );

    // Sort by match score and take top results
    const topJobs = scoredJobs
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    // Generate overall reasoning
    const reasoning = [
      `Found ${topJobs.length} highly matching positions`,
      `Based on your skills: ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? '...' : ''}`,
      `Targeting ${experience} level positions`,
    ];

    // Suggest skill improvements
    const allMissingSkills = scoredJobs.flatMap(job => 
      job.requirements.filter(req => 
        !skills.some((skill: string) => 
          skill.toLowerCase().includes(req.toLowerCase())
        )
      )
    );

    const skillCounts = allMissingSkills.reduce((acc: any, skill: string) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

    const suggestedSkillImprovements = Object.entries(skillCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([skill]) => skill);

    return {
      jobs: topJobs,
      reasoning,
      confidenceScores: topJobs.map(job => job.matchScore / 100),
      suggestedSkillImprovements
    };
  }

  async extractJobInsights(jobDescription: string): Promise<JobInsights> {
    const doc = compromise(jobDescription);
    
    // Extract skills using NLP patterns
    const skillPatterns = [
      /(?:experience with|knowledge of|proficient in|skilled in|expertise in)\s+([^,.;]+)/gi,
      /(?:required|must have|need)\s*:?\s*([^,.;]+)/gi,
      /\b([A-Z][a-z]+(?:\.[a-z]{2,4})?|[A-Z]{2,})\b/g // Technologies/frameworks
    ];

    let requiredSkills: string[] = [];
    skillPatterns.forEach(pattern => {
      const matches = jobDescription.match(pattern);
      if (matches) {
        requiredSkills.push(...matches);
      }
    });

    // Clean and deduplicate skills
    requiredSkills = this.cleanSkillsList(requiredSkills);

    // Extract experience level
    const experienceLevel = this.extractExperienceLevel(jobDescription);

    // Extract responsibilities
    const responsibilities = this.extractResponsibilities(jobDescription);

    // Extract benefits
    const benefits = this.extractBenefits(jobDescription);

    // Determine company size
    const companySize = this.determineCompanySize(jobDescription);

    // Check remote friendliness
    const remoteFriendly = /remote|work from home|distributed|telecommute/i.test(jobDescription);

    // Extract salary information
    const salary = this.extractSalaryInfo(jobDescription);

    // Extract tech stack
    const techStack = this.extractTechStack(jobDescription);

    return {
      requiredSkills: requiredSkills.slice(0, 10),
      preferredSkills: requiredSkills.slice(10, 15),
      experienceLevel,
      keyResponsibilities: responsibilities,
      benefits,
      companySize,
      remoteFriendly,
      salary,
      techStack
    };
  }

  async predictJobTrends(timeframe: string, industry?: string): Promise<JobTrends> {
    // Analyze recent job postings for trends
    const recentJobs = await Job.find({
      isActive: true,
      scrapedAt: { 
        $gte: new Date(Date.now() - this.getTimeframeMs(timeframe)) 
      }
    }).lean() as unknown as IJob[];

    // Analyze skill frequency trends
    const skillCounts = this.analyzeSkillTrends(recentJobs);
    
    // Generate predictions
    const predictions = Object.entries(skillCounts)
      .map(([skill, count]) => ({
        skill,
        trend: this.predictSkillTrend(skill, count, recentJobs.length) as 'rising' | 'stable' | 'declining',
        confidence: Math.random() * 0.3 + 0.7 // Simplified confidence calculation
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20);

    // Identify growth sectors
    const growthSectors = this.identifyGrowthSectors(recentJobs);

    // Find emerging skills
    const emergingSkills = predictions
      .filter(p => p.trend === 'rising')
      .map(p => p.skill)
      .slice(0, 10);

    // Find declining skills
    const decliningSkills = predictions
      .filter(p => p.trend === 'declining')
      .map(p => p.skill)
      .slice(0, 5);

    // Calculate salary trends (simplified)
    const salaryTrends = this.calculateSalaryTrends(recentJobs);

    return {
      predictions,
      growthSectors,
      decliningSkills,
      emergingSkills,
      salaryTrends,
      confidence: 0.75 // Overall confidence score
    };
  }

  // Helper methods
  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity
    const set1 = new Set(str1.split(''));
    const set2 = new Set(str2.split(''));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  private extractCriticalSkills(description: string, requirements: string[]): string[] {
    const technicalTerms = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C#',
      'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes',
      'Git', 'HTML', 'CSS', 'Vue.js', 'Angular', 'Express', 'REST API', 'GraphQL'
    ];

    const foundSkills = technicalTerms.filter(skill => 
      description.toLowerCase().includes(skill.toLowerCase()) ||
      requirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))
    );

    return [...new Set([...foundSkills, ...requirements.slice(0, 5)])];
  }

  private calculateExperienceMatch(jobLevel: string, userLevel: string): number {
    const levels = ['entry', 'mid', 'senior', 'executive'];
    const jobLevelIndex = levels.indexOf(jobLevel);
    const userLevelIndex = levels.indexOf(userLevel);
    
    if (jobLevelIndex === -1 || userLevelIndex === -1) return 0.5;
    
    const diff = Math.abs(jobLevelIndex - userLevelIndex);
    return Math.max(0, 1 - (diff * 0.3));
  }

  private calculateLocationMatch(jobLocation: string, userLocations: string[]): boolean {
    if (!userLocations.length) return true;
    
    const jobLoc = jobLocation.toLowerCase();
    return userLocations.some(loc => 
      jobLoc.includes(loc.toLowerCase()) || 
      loc.toLowerCase().includes(jobLoc) ||
      jobLoc.includes('remote') ||
      loc.toLowerCase().includes('remote')
    );
  }

  private generateRecommendations(matchScore: number, missingSkills: string[], job: IJob): string[] {
    const recommendations = [];

    if (matchScore >= 80) {
      recommendations.push('Excellent match! Consider applying immediately.');
    } else if (matchScore >= 60) {
      recommendations.push('Good match. Review the requirements carefully before applying.');
    } else if (matchScore >= 40) {
      recommendations.push('Partial match. Consider if you can learn missing skills quickly.');
    } else {
      recommendations.push('Lower match. May require significant skill development.');
    }

    if (missingSkills.length > 0) {
      recommendations.push(`Consider learning: ${missingSkills.slice(0, 3).join(', ')}`);
    }

    if (job.employmentType === 'contract') {
      recommendations.push('Contract position - ensure you\'re comfortable with temporary work.');
    }

    return recommendations;
  }

  private analyzeSalaryMatch(jobSalary?: string, userSalaryRange?: { min?: number; max?: number; }): 'below' | 'within' | 'above' | 'unknown' {
    if (!jobSalary || !userSalaryRange) return 'unknown';

    // Simple salary extraction (would be more sophisticated in production)
    const salaryNumbers = jobSalary.match(/\d+/g);
    if (!salaryNumbers) return 'unknown';

    const jobSalaryNum = parseInt(salaryNumbers[0]);
    
    if (userSalaryRange.max && jobSalaryNum > userSalaryRange.max) return 'above';
    if (userSalaryRange.min && jobSalaryNum < userSalaryRange.min) return 'below';
    
    return 'within';
  }

  private generateOverallAssessment(matchScore: number, matchingSkills: string[], missingSkills: string[]): string {
    if (matchScore >= 80) {
      return `Excellent match (${matchScore}%). You have ${matchingSkills.length} matching skills and only ${missingSkills.length} gaps to address.`;
    } else if (matchScore >= 60) {
      return `Good match (${matchScore}%). Strong foundation with ${matchingSkills.length} relevant skills, some areas for improvement.`;
    } else if (matchScore >= 40) {
      return `Moderate match (${matchScore}%). You have ${matchingSkills.length} relevant skills but may need to develop ${missingSkills.length} additional areas.`;
    } else {
      return `Lower match (${matchScore}%). Significant skill gap to bridge, but could be a growth opportunity.`;
    }
  }

  // Additional helper methods would continue here...
  private async getTrendingSkills(industry?: string): Promise<string[]> {
    // Simplified trending skills - in production, this would analyze recent job data
    const trendingSkills = [
      'TypeScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
      'GraphQL', 'Next.js', 'Tailwind CSS', 'MongoDB', 'PostgreSQL'
    ];
    return trendingSkills.slice(0, 5);
  }

  private calculateExpectedIncrease(current: string, optimized: string[]): number {
    // Simplified calculation - estimate 10-30% increase
    return Math.floor(Math.random() * 20) + 10;
  }

  private generateJobRecommendationReason(job: IJob, analysis: JobMatchAnalysis): string {
    return `${analysis.matchScore}% match - ${analysis.matchingSkills.length} matching skills, ${job.company} in ${job.location}`;
  }

  private cleanSkillsList(skills: string[]): string[] {
    return [...new Set(skills)]
      .map(skill => skill.trim())
      .filter(skill => skill.length > 2 && skill.length < 30)
      .slice(0, 20);
  }

  private extractExperienceLevel(description: string): 'entry' | 'mid' | 'senior' | 'executive' {
    const text = description.toLowerCase();
    if (text.includes('senior') || text.includes('lead')) return 'senior';
    if (text.includes('junior') || text.includes('entry')) return 'entry';
    if (text.includes('executive') || text.includes('director')) return 'executive';
    return 'mid';
  }

  private extractResponsibilities(description: string): string[] {
    // Extract bullet points or numbered lists
    const responsibilities = description
      .split(/[•\-\*\n\r]/)
      .map(item => item.trim())
      .filter(item => item.length > 20 && item.length < 200)
      .slice(0, 5);
    
    return responsibilities;
  }

  private extractBenefits(description: string): string[] {
    const benefitKeywords = ['health', 'dental', 'vision', '401k', 'vacation', 'remote', 'flexible', 'bonus'];
    const benefits: string[] = [];
    
    benefitKeywords.forEach(keyword => {
      if (description.toLowerCase().includes(keyword)) {
        benefits.push(keyword);
      }
    });
    
    return benefits;
  }

  private determineCompanySize(description: string): 'startup' | 'small' | 'medium' | 'large' | 'enterprise' {
    const text = description.toLowerCase();
    if (text.includes('startup') || text.includes('early stage')) return 'startup';
    if (text.includes('enterprise') || text.includes('fortune')) return 'enterprise';
    if (text.includes('small') || text.includes('10-50')) return 'small';
    if (text.includes('large') || text.includes('1000+')) return 'large';
    return 'medium';
  }

  private extractSalaryInfo(description: string): { min?: number; max?: number; currency?: string; } {
    const salaryMatch = description.match(/\$(\d{2,3}),?(\d{3})\s*-\s*\$(\d{2,3}),?(\d{3})/);
    if (salaryMatch) {
      return {
        min: parseInt(salaryMatch[1] + salaryMatch[2]),
        max: parseInt(salaryMatch[3] + salaryMatch[4]),
        currency: 'USD'
      };
    }
    return {};
  }

  private extractTechStack(description: string): string[] {
    const techTerms = [
      'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'JavaScript',
      'TypeScript', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL'
    ];
    
    return techTerms.filter(tech => 
      description.toLowerCase().includes(tech.toLowerCase())
    );
  }

  private getTimeframeMs(timeframe: string): number {
    const timeframes = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      quarter: 90 * 24 * 60 * 60 * 1000
    };
    return timeframes[timeframe as keyof typeof timeframes] || timeframes.month;
  }

  private analyzeSkillTrends(jobs: IJob[]): Record<string, number> {
    const skillCounts: Record<string, number> = {};
    
    jobs.forEach(job => {
      [...job.requirements, ...job.keywords].forEach(skill => {
        const normalizedSkill = skill.toLowerCase().trim();
        skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
      });
    });
    
    return skillCounts;
  }

  private predictSkillTrend(skill: string, count: number, totalJobs: number): string {
    const frequency = count / totalJobs;
    if (frequency > 0.3) return 'rising';
    if (frequency > 0.1) return 'stable';
    return 'declining';
  }

  private identifyGrowthSectors(jobs: IJob[]): string[] {
    // Simplified sector identification
    const sectors = ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'AI/ML'];
    return sectors.slice(0, 3);
  }

  private calculateSalaryTrends(jobs: IJob[]): Array<{ role: string; averageSalary: number; growth: number; }> {
    // Simplified salary trend calculation
    return [
      { role: 'Software Engineer', averageSalary: 95000, growth: 8.5 },
      { role: 'DevOps Engineer', averageSalary: 110000, growth: 12.3 },
      { role: 'Product Manager', averageSalary: 125000, growth: 6.7 }
    ];
  }
}