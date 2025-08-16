// src/ai/flows/improve-resume.ts
'use server';
/**
 * @fileOverview A flow to improve a resume using AI suggestions.
 *
 * - improveResume - A function that accepts a resume and job description and returns suggestions for improvement.
 * - ImproveResumeInput - The input type for the improveResume function.
 * - ImproveResumeOutput - The return type for the improveResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveResumeInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be improved.'),
  jobDescription: z
    .string()
    .describe('The job description to tailor the resume to.'),
});
export type ImproveResumeInput = z.infer<typeof ImproveResumeInputSchema>;

const ImproveResumeOutputSchema = z.object({
  improvedResume: z
    .string()
    .describe('The improved resume with suggested edits and rewrites.'),
});
export type ImproveResumeOutput = z.infer<typeof ImproveResumeOutputSchema>;

export async function improveResume(input: ImproveResumeInput): Promise<ImproveResumeOutput> {
  return improveResumeFlow(input);
}

const improveResumePrompt = ai.definePrompt({
  name: 'improveResumePrompt',
  input: {schema: ImproveResumeInputSchema},
  output: {schema: ImproveResumeOutputSchema},
  prompt: `You are an expert resume writer. Review the provided resume and job description and provide suggestions to improve the resume to better match the job description. Focus on tailoring the resume to highlight relevant skills and experience.

Resume:
{{resumeText}}

Job Description:
{{jobDescription}}

Improved Resume:
`, 
});

const improveResumeFlow = ai.defineFlow(
  {
    name: 'improveResumeFlow',
    inputSchema: ImproveResumeInputSchema,
    outputSchema: ImproveResumeOutputSchema,
  },
  async input => {
    const {output} = await improveResumePrompt(input);
    return output!;
  }
);
