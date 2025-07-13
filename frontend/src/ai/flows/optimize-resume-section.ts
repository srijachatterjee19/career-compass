// src/ai/flows/optimize-resume-section.ts
'use server';
/**
 * @fileOverview A Genkit flow to optimize a specific section of a resume.
 *
 * - optimizeResumeSection - A function that accepts a resume section's title and content,
 *   and optionally a job description, then returns AI-driven suggestions for improvement.
 * - OptimizeResumeSectionInput - The input type for the optimizeResumeSection function.
 * - OptimizeResumeSectionOutput - The return type for the optimizeResumeSection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeResumeSectionInputSchema = z.object({
  sectionTitle: z.string().describe('The title of the resume section (e.g., "Work Experience", "Skills").'),
  sectionContent: z
    .string()
    .describe('The current text content of the resume section to be improved.'),
  jobDescription: z
    .string()
    .optional()
    .describe('The target job description to tailor the resume section to. Highly recommended for best results.'),
});
export type OptimizeResumeSectionInput = z.infer<typeof OptimizeResumeSectionInputSchema>;

const OptimizeResumeSectionOutputSchema = z.object({
  optimizedSectionContent: z
    .string()
    .describe('The AI-optimized version of the resume section content.'),
});
export type OptimizeResumeSectionOutput = z.infer<typeof OptimizeResumeSectionOutputSchema>;

export async function optimizeResumeSection(input: OptimizeResumeSectionInput): Promise<OptimizeResumeSectionOutput> {
  return optimizeResumeSectionFlow(input);
}

const optimizeResumeSectionPrompt = ai.definePrompt({
  name: 'optimizeResumeSectionPrompt',
  model: 'googleai/gemini-2.0-flash', 
  input: {schema: OptimizeResumeSectionInputSchema},
  output: {schema: OptimizeResumeSectionOutputSchema},
  prompt: `You are an expert resume writer and career coach. Your task is to optimize the provided resume section.
Focus on making it more impactful, concise, and tailored to the (optional) job description.
Use action verbs, quantify achievements where possible, and ensure clarity.

Resume Section Title: {{{sectionTitle}}}
Current Section Content:
{{{sectionContent}}}

{{#if jobDescription}}
Target Job Description (for tailoring):
{{{jobDescription}}}
{{/if}}

Based on the above, provide the optimized content for this section. Return only the improved text for the section.
Optimized Section Content:
`,
});

const optimizeResumeSectionFlow = ai.defineFlow(
  {
    name: 'optimizeResumeSectionFlow',
    inputSchema: OptimizeResumeSectionInputSchema,
    outputSchema: OptimizeResumeSectionOutputSchema,
  },
  async input => {
    const {output} = await optimizeResumeSectionPrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate an optimized section. Please try again.');
    }
    return output;
  }
);
