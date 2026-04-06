import express, { Request, Response } from 'express';
import multer from 'multer';
import { PAGINATION_CONSTANTS } from '../constants/pagination';
import { ResumeParserService } from '../services/ResumeParserService';
import { PersonalizedJobSearchService } from '../services/PersonalizedJobSearchService';
import type { IUserJobProfile } from '../types';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
const resumeParser = new ResumeParserService();
const personalizedJobSearchService = new PersonalizedJobSearchService();

const parseListField = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Fall through to delimiter parsing.
  }

  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

router.post('/personalized-search', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(String(req.body.limit || PAGINATION_CONSTANTS.DEFAULT_RESULTS_PER_PAGE), 10) || PAGINATION_CONSTANTS.DEFAULT_RESULTS_PER_PAGE, PAGINATION_CONSTANTS.MAX_API_RESULTS);
    const page = parseInt(String(req.body.page || PAGINATION_CONSTANTS.DEFAULT_PAGE), 10) || PAGINATION_CONSTANTS.DEFAULT_PAGE;
    const profile: IUserJobProfile = {
      keywords: String(req.body.keywords || '').trim(),
      preferredKeywords: parseListField(req.body.preferredKeywords),
      technicalSkills: parseListField(req.body.technicalSkills),
      languages: parseListField(req.body.languages),
      location: String(req.body.location || '').trim(),
      radiusKm: req.body.radiusKm ? parseInt(String(req.body.radiusKm), 10) : undefined,
      yearsExperience: req.body.yearsExperience ? parseInt(String(req.body.yearsExperience), 10) : undefined
    };

    const resumeInsights = await resumeParser.parseResume(req.file, String(req.body.resumeText || ''));
    const searchResult = await personalizedJobSearchService.search(profile, resumeInsights, limit, page);
    const totalPages = Math.max(1, Math.ceil(searchResult.totalResultsAvailable / limit));

    res.json({
      success: true,
      jobs: searchResult.jobs,
      totalCount: searchResult.totalResultsAvailable,
      totalResultsAvailable: searchResult.totalResultsAvailable,
      maxResultsReturnable: searchResult.maxResultsReturnable,
      currentPage: page,
      totalPages,
      resultsPerPage: limit,
      profileSummary: searchResult.profileSummary,
      resumeInsights: searchResult.resumeInsights,
      filters: {
        keywords: profile.keywords,
        location: profile.location
      },
      message: `Found ${searchResult.totalResultsAvailable.toLocaleString()} personalized matches ranked by your criteria.`,
      searchType: 'personalized',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Personalized job search failed:', error);
    res.status(500).json({
      success: false,
      error: 'Personalized job search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;