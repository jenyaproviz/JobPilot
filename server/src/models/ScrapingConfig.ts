import mongoose, { Schema, Document } from 'mongoose';
import { IScrapingConfig } from '../types/index';

export interface ScrapingConfigDocument extends Omit<IScrapingConfig, '_id'>, Document {}

const selectorsSchema = new Schema({
  jobCard: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String },
  description: { type: String },
  link: { type: String, required: true },
  postedDate: { type: String }
});

const scrapingConfigSchema = new Schema<ScrapingConfigDocument>({
  siteName: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  baseUrl: { type: String, required: true },
  searchUrl: { type: String, required: true },
  selectors: { type: selectorsSchema, required: true },
  isActive: { type: Boolean, default: true, index: true },
  rateLimit: { type: Number, default: 10 }, // requests per minute
  lastScraped: { type: Date }
}, {
  timestamps: true
});

export const ScrapingConfig = mongoose.model<ScrapingConfigDocument>('ScrapingConfig', scrapingConfigSchema);