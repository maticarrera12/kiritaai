import { z } from "zod";

export const waitlistSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(2).max(50).optional(),
  referral: z.string().optional(),
});
