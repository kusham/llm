import { z } from 'zod';

export const Label = z.object({
    contact_id: z.string().describe('The unique identifier of the text chunk'),
    // chain_of_thought: z.string().describe("The reasoning process used to evaluate the relevance"),
    relevancy: z
        .number()
        .describe('Relevancy score from 0 to 10, where 10 is most relevant'),
});
export const RerankedResults = z.object({
    labels: z.array(Label).describe('List of labeled and ranked chunks'),
});

export type Label = z.infer<typeof Label>;
export type RerankedResults = z.infer<typeof RerankedResults>;
