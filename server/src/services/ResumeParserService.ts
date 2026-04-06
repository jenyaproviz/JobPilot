import path from 'path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import type { IResumeInsights } from '../types';

const KNOWN_SKILLS = [
  'react',
  'typescript',
  'javascript',
  'python',
  'node.js',
  'node',
  'next.js',
  'next',
  'redux',
  'sql',
  'mongodb',
  'postgresql',
  'docker',
  'aws',
  'azure',
  'git',
  'express',
  'java',
  'c#'
];

const KNOWN_LANGUAGES = ['english', 'hebrew', 'russian', 'arabic'];

export class ResumeParserService {
  async parseResume(file?: Express.Multer.File | null, resumeText?: string): Promise<IResumeInsights> {
    const extractedText = await this.extractText(file, resumeText);
    const normalizedText = this.normalizeText(extractedText);

    return {
      text: normalizedText,
      detectedSkills: this.detectTerms(normalizedText, KNOWN_SKILLS),
      detectedLanguages: this.detectTerms(normalizedText, KNOWN_LANGUAGES),
      detectedYearsExperience: this.extractYearsExperience(normalizedText),
      fileName: file?.originalname
    };
  }

  private async extractText(file?: Express.Multer.File | null, resumeText?: string): Promise<string> {
    if (resumeText && resumeText.trim()) {
      return resumeText;
    }

    if (!file) {
      return '';
    }

    const extension = path.extname(file.originalname || '').toLowerCase();
    const mimeType = (file.mimetype || '').toLowerCase();

    if (mimeType.startsWith('text/') || ['.txt', '.md', '.json'].includes(extension)) {
      return file.buffer.toString('utf8');
    }

    if (mimeType === 'application/pdf' || extension === '.pdf') {
      const parser = new PDFParse({ data: file.buffer });
      const parsed = await parser.getText();
      return parsed.text || '';
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      extension === '.docx'
    ) {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      return parsed.value || '';
    }

    return file.buffer.toString('utf8');
  }

  private normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  private detectTerms(text: string, dictionary: string[]): string[] {
    const haystack = text.toLowerCase();
    return dictionary.filter((entry) => {
      const escaped = entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
    });
  }

  private extractYearsExperience(text: string): number | undefined {
    const matches = [...text.matchAll(/(\d{1,2})\+?\s+years?/gi)];
    if (matches.length === 0) {
      return undefined;
    }

    return matches
      .map((match) => parseInt(match[1], 10))
      .filter((value) => !Number.isNaN(value))
      .sort((left, right) => right - left)[0];
  }
}