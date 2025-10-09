import mongoose, { Schema, Document } from 'mongoose';
import { IJob } from '../types/index';

export interface JobDocument extends Omit<IJob, '_id'>, Document {}

const jobSchema = new Schema<JobDocument>({
  title: { type: String, required: true, index: true },
  company: { type: String, required: true, index: true },
  location: { type: String, required: true, index: true },
  salary: { type: String },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  employmentType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    required: true,
    index: true
  },
  experienceLevel: { 
    type: String, 
    enum: ['entry', 'mid', 'senior', 'executive'],
    required: true,
    index: true
  },
  source: { type: String, required: true, index: true },
  originalUrl: { type: String, required: true, unique: true },
  postedDate: { type: Date, required: true, index: true },
  scrapedAt: { type: Date, default: Date.now },
  keywords: [{ type: String, index: true }],
  isActive: { type: Boolean, default: true, index: true },
  matchScore: { type: Number, min: 0, max: 100 }
}, {
  timestamps: true
});

// Compound indexes for efficient searching
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ keywords: 1, location: 1 });
jobSchema.index({ postedDate: -1, isActive: 1 });
jobSchema.index({ source: 1, scrapedAt: -1 });

export const Job = mongoose.model<JobDocument>('Job', jobSchema);