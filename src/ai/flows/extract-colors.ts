// extract-colors.ts
'use server';

/**
 * @fileOverview Extracts the most prominent colors from an image.
 *
 * - extractColors - A function that handles the color extraction process.
 * - ExtractColorsInput - The input type for the extractColors function.
 * - ExtractColorsOutput - The return type for the extractColors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractColorsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractColorsInput = z.infer<typeof ExtractColorsInputSchema>;

const ExtractColorsOutputSchema = z.object({
  colors: z
    .array(z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/))
    .describe('An array of 5-8 prominent colors in hex format.'),
});
export type ExtractColorsOutput = z.infer<typeof ExtractColorsOutputSchema>;

export async function extractColors(input: ExtractColorsInput): Promise<ExtractColorsOutput> {
  return extractColorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractColorsPrompt',
  input: {schema: ExtractColorsInputSchema},
  output: {schema: ExtractColorsOutputSchema},
  prompt: `You are an AI assistant that extracts the most prominent colors from an image.

You will be given an image and you will respond with an array of 5-8 colors in hex format.

Image: {{media url=photoDataUri}}

Output:`,
});

const extractColorsFlow = ai.defineFlow(
  {
    name: 'extractColorsFlow',
    inputSchema: ExtractColorsInputSchema,
    outputSchema: ExtractColorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
