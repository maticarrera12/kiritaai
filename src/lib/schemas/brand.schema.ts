import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().min(2, "Required"),
  businessType: z.string().min(1, "Required"),
  industry: z.string().min(1, "Required"),
  targetAudience: z.string().optional(),
  vibe: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
  assets: z.array(z.string()), // ["LOGO", "BRAND_NAME", ...]
  aiBrief: z.string().optional(),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
