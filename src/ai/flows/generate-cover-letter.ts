'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating tailored cover letters.
 *
 * - generateCoverLetter - A function that generates a cover letter based on a resume and job description.
 * - GenerateCoverLetterInput - The input type for the generateCoverLetter function.
 * - GenerateCoverLetterOutput - The return type for the generateCoverLetter function.
 */

import {z} from 'genkit';

const GenerateCoverLetterInputSchema = z.object({
  resume: z
    .string()
    .describe("The job seeker's resume text.  This will be parsed for skills and experience."),
  jobDescription: z.string().describe('The job description for the position.'),
});
export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

const GenerateCoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter.'),
});
export type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

