'use server';
/**
 * @fileOverview An AI flow for generating product descriptions.
 *
 * - generateProductDescription - A function that takes a product name and category to generate a description.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().describe('The category of the product.'),
  descriptionType: z.enum(['short', 'long']).describe('The type of description to generate: a short, catchy one, or a long, detailed one.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are a world-class restaurant menu copywriter. Your task is to generate a compelling product description.

Context:
- Product Name: {{{productName}}}
- Product Category: {{{productCategory}}}
- Description Type: {{{descriptionType}}}

Instructions:
- If the description type is "short", write a single, catchy, and enticing sentence (max 15 words).
- If the description type is "long", write a detailed and mouth-watering paragraph (3-4 sentences) that describes the ingredients, preparation, and taste profile.
- The tone should be appealing and persuasive. Do not use asterisks or other markdown.
`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
