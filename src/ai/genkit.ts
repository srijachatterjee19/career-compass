import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

export const ai = genkit({
  plugins: [ vertexAI(),],
  model: 'vertexai/gemini-1.5-flash-001', // or another Vertex AI model you want to use
});
