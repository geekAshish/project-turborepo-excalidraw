import { email, z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
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

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(10).max(30),
});
