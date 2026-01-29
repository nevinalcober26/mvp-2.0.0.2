'use server';
/**
 * @fileOverview An AI flow for generating summaries of operational data.
 *
 * - summarizeData - A function that takes data and a context to generate a summary.
 * - SummarizeDataInput - The input type for the summarizeData function.
 * - SummarizeDataOutput - The return type for the summarizeData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SummarizeDataInputSchema = z.object({
  data: z.string().describe('A JSON string representing the data to be summarized.'),
  context: z.string().describe('The context of the data (e.g., "restaurant orders", "table statuses").'),
});
export type SummarizeDataInput = z.infer<typeof SummarizeDataInputSchema>;

const SummarizeDataOutputSchema = z.object({
  summary: z.string().describe('A concise, insightful summary of the provided data.'),
});
export type SummarizeDataOutput = z.infer<typeof SummarizeDataOutputSchema>;

export async function summarizeData(input: SummarizeDataInput): Promise<SummarizeDataOutput> {
  return summarizeDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDataPrompt',
  input: {schema: SummarizeDataInputSchema},
  output: {schema: SummarizeDataOutputSchema},
  prompt: `You are an expert restaurant operations analyst. Your task is to provide a brief, insightful summary based on the following data regarding {{context}}.

Analyze the key metrics, identify trends or anomalies, and present a concise summary of 1-2 sentences. Focus on actionable insights. For example, mention high revenue, frequent cancellations, or popular tables.

Do not just list the data. Provide a narrative summary.

Data:
{{{data}}}
`,
});

const summarizeDataFlow = ai.defineFlow(
  {
    name: 'summarizeDataFlow',
    inputSchema: SummarizeDataInputSchema,
    outputSchema: SummarizeDataOutputSchema,
  },
  async input => {
    // For very large datasets, you might want to pre-process or sample the data here.
    // For now, we'll pass it directly.
    const {output} = await prompt(input);
    return output!;
  }
);
