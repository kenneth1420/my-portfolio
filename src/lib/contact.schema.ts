import { z } from "zod";

/**
 * The contact form's rules, written once and run twice: in the browser for
 * instant feedback, and again in the Server Action, which never trusts what
 * the browser sent.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tell me your name.")
    .max(80, "Keep the name under 80 characters."),
  email: z
    .email("That email address doesn't look right.")
    .max(254, "That email address is too long."),
  subject: z
    .string()
    .trim()
    .min(3, "Add a short subject.")
    .max(120, "Keep the subject under 120 characters."),
  message: z
    .string()
    .trim()
    .min(10, "A sentence or two helps me reply properly.")
    .max(2000, "Keep the message under 2,000 characters."),
});

export type ContactValues = z.infer<typeof contactSchema>;

export type ContactFieldErrors = Partial<Record<keyof ContactValues, string>>;

export type ContactResult =
  | { ok: true; values: ContactValues }
  | { ok: false; message: string; fieldErrors: ContactFieldErrors };
