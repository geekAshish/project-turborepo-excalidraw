"use client";

import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be 6+ characters"),
  photo: z
    .any()
    .optional()
    .refine(
      (file) =>
        typeof window === "undefined" || !file || file instanceof FileList,
      "Invalid file input"
    )
    .refine((file) => !file || file.length <= 1, "Only one file allowed"),
});

export type SignupForm = z.infer<typeof signupSchema>;
