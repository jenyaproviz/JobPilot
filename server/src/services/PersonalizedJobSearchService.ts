import { GoogleJobSearchService } from './GoogleJobSearchService';
import type { IResumeInsights, IUserJobProfile } from '../types';

type JobLike = {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string[];
  keywords?: string[];
  experienceLevel?: string;
  employmentType?: string;
  originalUrl?: string;
  source?: string;
  salary?: string;
  postedDate?: string;
  scrapedAt?: Date;
  _id?: string;
};

export class PersonalizedJobSearchService {
  private readonly googleJobSearchService = new GoogleJobSearchService();
  private readonly minimumVisibleMatchScore = 40;

  async search(profile: IUserJobProfile, resumeInsights: IResumeInsights, limit: number, page: number) {
    const normalizedProfile = this.mergeProfile(profile, resumeInsights);
    // Fetch a generous candidate pool so scoring can pick the best ones
    const candidateLimit = Math.max(limit * Math.max(page, 1) * 4, 40);
    const keywords = this.buildSearchKeywords(normalizedProfile);
    const location = normalizedProfile.location || '';
    const searchResult = await this.googleJobSearchService.searchJobs(keywords, location, candidateLimit, 1);
    const scoredJobs = (searchResult.jobs || [])
      .map((job: JobLike) => this.scoreJob(job, normalizedProfile))
      .filter((job) => (job.matchScore || 0) >= this.minimumVisibleMatchScore)
      .sort((left, right) => (right.matchScore || 0) - (left.matchScore || 0));

    const zeroBasedStart = Math.max(page - 1, 0) * limit;
    const pagedJobs = scoredJobs.slice(zeroBasedStart, zeroBasedStart + limit);

    return {
      jobs: pagedJobs,
      totalResultsAvailable: scoredJobs.length,
      maxResultsReturnable: scoredJobs.length,
      profileSummary: normalizedProfile,
      resumeInsights: {
        detectedSkills: resumeInsights.detectedSkills,
        detectedLanguages: resumeInsights.detectedLanguages,
        detectedYearsExperience: resumeInsights.detectedYearsExperience,
        fileName: resumeInsights.fileName
      }
    };
  }

  private mergeProfile(profile: IUserJobProfile, resumeInsights: IResumeInsights): IUserJobProfile {
    const technicalSkills = this.unique([
      ...(profile.technicalSkills || []),
      ...resumeInsights.detectedSkills
    ]);

    const languages = this.unique([
      ...(profile.languages || []),
      ...resumeInsights.detectedLanguages
    ]);

    const preferredKeywords = this.unique([
      ...(profile.preferredKeywords || []),
      ...(profile.keywords ? [profile.keywords] : []),
      ...technicalSkills
    ]);

    return {
      ...profile,
      technicalSkills,
      languages,
      preferredKeywords,
      yearsExperience: profile.yearsExperience ?? resumeInsights.detectedYearsExperience,
      keywords: profile.keywords || preferredKeywords.join(' ')
    };
  }

  private buildSearchKeywords(profile: IUserJobProfile): string {
    const parts = [
      ...(profile.preferredKeywords || []),
      ...(profile.technicalSkills || [])
    ];

    const compact = this.unique(parts)
      .filter(Boolean)
      .slice(0, 8)
      .join(' ')
      .trim();

    return compact || profile.keywords || 'developer jobs';
  }

  private scoreJob(job: JobLike, profile: IUserJobProfile) {
    // Separate haystacks: structured requirements carry higher signal weight than free text
    const requirementsHaystack = (job.requirements || []).join(' ').toLowerCase();
    const contentHaystack = [job.title, job.company, job.description].join(' ').toLowerCase();
    const fullHaystack = `${requirementsHaystack} ${contentHaystack} ${(job.location || '').toLowerCase()}`;

    const technicalSkills = profile.technicalSkills || [];

    // Skills explicitly listed in job requirements = full (2×) credit
    const skillsInRequirements = technicalSkills.filter((s) => this.matchesTerm(requirementsHaystack, s));
    // Skills found only in description / title = half (1×) credit
    const skillsInContent = technicalSkills.filter(
      (s) => !skillsInRequirements.includes(s) && this.matchesTerm(contentHaystack, s)
    );
    const matchedSkills = [...skillsInRequirements, ...skillsInContent];
    const missingSkills = technicalSkills.filter((s) => !matchedSkills.includes(s)).slice(0, 5);

    let score = 0;

    // === Technical skills: max 60 pts ===
    if (technicalSkills.length > 0) {
      const weightedMatched = skillsInRequirements.length * 2 + skillsInContent.length;
      const weightedMax = technicalSkills.length * 2; // all in requirements = perfect
      score += Math.round((weightedMatched / weightedMax) * 60);
    }

    // === Preferred keywords bonus: max 8 pts ===
    const preferredKeywords = profile.preferredKeywords || [];
    if (preferredKeywords.length > 0) {
      const matchedKw = preferredKeywords.filter((kw) => this.matchesTerm(fullHaystack, kw));
      score += Math.round((matchedKw.length / preferredKeywords.length) * 8);
    }

    // === Language match: max 15 pts ===
    // Israeli market — Hebrew speakers get an automatic bonus (all Israeli jobs require Hebrew)
    const userLanguages = (profile.languages || []).map((l) => l.toLowerCase());
    const speaksHebrew = userLanguages.some((l) => l === 'hebrew' || l === 'עברית');
    let languageScore = 0;
    if (speaksHebrew) {
      languageScore += 10; // implicit — not written in most Hebrew job ads
    }
    // English bonus only if job explicitly mentions it
    const speaksEnglish = userLanguages.some((l) => l === 'english' || l === 'אנגלית');
    if (speaksEnglish && (fullHaystack.includes('english') || fullHaystack.includes('אנגלית'))) {
      languageScore += 5;
    }
    score += Math.min(languageScore, 15);

    // === Location match: max 12 pts ===
    if (profile.location) {
      const jobLocation = (job.location || '').toLowerCase();
      const profileLocation = profile.location.toLowerCase();
      if (
        jobLocation.includes(profileLocation) ||
        profileLocation.includes(jobLocation) ||
        fullHaystack.includes(profileLocation)
      ) {
        score += 12;
      }
    }

    // === Experience level fit: max 12 pts ===
    if (profile.yearsExperience !== undefined) {
      const exp = (job.experienceLevel || '').toLowerCase();
      if (profile.yearsExperience <= 2) {
        if (exp.includes('entry') || exp.includes('junior') || exp.includes('mid')) score += 12;
        else if (exp.includes('senior') || exp.includes('lead')) score -= 8;
      } else if (profile.yearsExperience >= 5) {
        if (exp.includes('senior') || exp.includes('lead')) score += 12;
        else if (exp.includes('mid')) score += 6;
      } else {
        if (exp.includes('mid')) score += 12;
        else if (exp.includes('senior')) score += 6;
        else if (exp.includes('entry') || exp.includes('junior')) score += 4;
      }
    }

    // === Missing skills penalty: max -12 pts (softer penalty) ===
    score -= Math.min(missingSkills.length * 2, 12);

    const matchScore = Math.max(0, Math.min(100, score));

    return {
      ...job,
      matchScore,
      aiAnalysis: {
        matchingSkills: matchedSkills,
        missingSkills,
        recommendations: missingSkills.length > 0
          ? [`Consider emphasizing ${missingSkills.slice(0, 2).join(', ')} in your next search or resume.`]
          : ['Strong skill alignment based on your current criteria.'],
        overallAssessment: matchScore >= 75
          ? 'High match'
          : matchScore >= 50
            ? 'Moderate match'
            : 'Low match'
      }
    };
  }

  private matchesTerm(haystack: string, term: string): boolean {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm) {
      return false;
    }

    if (normalizedTerm.includes(' ')) {
      return haystack.includes(normalizedTerm);
    }

    const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
  }

  private unique(values: string[]): string[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  }
}