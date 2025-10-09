import mongoose, { Schema, Document } from 'mongoose';
import { IUser, IUserPreferences, ISearchHistory } from '../types/index';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const userPreferencesSchema = new Schema<IUserPreferences>({
  keywords: [{ type: String }],
  locations: [{ type: String }],
  salaryRange: {
    min: { type: Number },
    max: { type: Number }
  },
  employmentTypes: [{ type: String }],
  experienceLevels: [{ type: String }],
  companySizes: [{ type: String }],
  industries: [{ type: String }],
  remoteWork: { type: Boolean, default: false }
});

const searchHistorySchema = new Schema<ISearchHistory>({
  query: { type: String, required: true },
  filters: { type: Schema.Types.Mixed },
  resultsCount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new Schema<UserDocument>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  preferences: { 
    type: userPreferencesSchema,
    default: () => ({
      keywords: [],
      locations: [],
      salaryRange: {},
      employmentTypes: ['full-time'],
      experienceLevels: ['mid'],
      companySizes: [],
      industries: [],
      remoteWork: false
    })
  },
  savedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
  searchHistory: [searchHistorySchema]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'preferences.keywords': 1 });

export const User = mongoose.model<UserDocument>('User', userSchema);