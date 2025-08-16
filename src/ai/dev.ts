
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-cover-letter.ts';
import '@/ai/flows/improve-resume.ts';
import '@/ai/flows/optimize-resume-section.ts';
import '@/ai/flows/optimize-cover-letter.ts'; // Added new flow
