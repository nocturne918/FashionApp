import { z } from "zod";

export const OutfitSchema = z.object({
  id: z.number(),
  createdAt: z.string().optional(),
});

export type OutfitDTO = z.infer<typeof OutfitSchema>;