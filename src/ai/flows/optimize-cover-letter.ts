
'use server';
/**
 * @fileOverview A Genkit flow to optimize an existing cover letter.
 *
 * - optimizeCoverLetter - A function that accepts an existing cover letter,
 *   a job description, and optionally a resume snippet, then returns an AI-driven
 *   improved version of the cover letter.
 * - OptimizeCoverLetterInput - The input type for the optimizeCoverLetter function.
 * - OptimizeCoverLetterOutput - The return type for the optimizeCoverLetter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeCoverLetterInputSchema = z.object({
  currentCoverLetter: z
    .string()
    .describe('The existing draft of the cover letter to be improved.'),
  jobDescription: z
    .string()
    .describe('The target job description to tailor the cover letter to. This is crucial for optimization.'),
  resumeSnippet: z
    .string()
    .optional()
    .describe('A relevant snippet from the resume, if available, to help tailor the cover letter.'),
});
export type OptimizeCoverLetterInput = z.infer<typeof OptimizeCoverLetterInputSchema>;

const OptimizeCoverLetterOutputSchema = z.object({
  optimizedCoverLetter: z
    .string()
    .describe('The AI-optimized version of the cover letter content.'),
});
export type OptimizeCoverLetterOutput = z.infer<typeof OptimizeCoverLetterOutputSchema>;

export async function optimizeCoverLetter(input: OptimizeCoverLetterInput): Promise<OptimizeCoverLetterOutput> {
  return optimizeCoverLetterFlow(input);
}

const optimizeCoverLetterPrompt = ai.definePrompt({
  name: 'optimizeCoverLetterPrompt',
  model: 'googleai/gemini-2.0-flash', 
  input: {schema: OptimizeCoverLetterInputSchema},
  output: {schema: OptimizeCoverLetterOutputSchema},
  prompt: `You are an expert cover letter editor.
Your task is to review the DRAFT cover letter provided, along with the target job description and an optional resume snippet.
Rewrite the DRAFT cover letter to make it more impactful, concise, persuasive, and perfectly tailored to the job description.
Ensure professional tone and highlight how the candidate's experience (from resume snippet if provided) aligns with the job requirements.
Return only the full text of the optimized cover letter.

Target Job Description:
{{{jobDescription}}}

{{#if resumeSnippet}}
Relevant Resume Snippet:
{{{resumeSnippet}}}
{{/if}}

Existing Draft Cover Letter:
{{{currentCoverLetter}}}

Optimized Cover Letter:
`,
});

const optimizeCoverLetterFlow = ai.defineFlow(
  {
    name: 'optimizeCoverLetterFlow',
    inputSchema: OptimizeCoverLetterInputSchema,
    outputSchema: OptimizeCoverLetterOutputSchema,
  },
  async input => {
    const {output} = await optimizeCoverLetterPrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate an optimized cover letter. Please try again.');
    }
    return output;
  }
);
