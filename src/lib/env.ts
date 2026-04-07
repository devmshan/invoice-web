import { z } from "zod";

const envSchema = z.object({
  // Notion
  NOTION_API_KEY: z.string().min(1),
  NOTION_DATABASE_ID: z.string().min(1),
  NOTION_ITEMS_DATABASE_ID: z.string().min(1),
  // Auth
  AUTH_SECRET: z.string().min(32),
  ADMIN_EMAIL: z.string().email(),
  // Vercel KV
  KV_REST_API_URL: z.string().url(),
  KV_REST_API_TOKEN: z.string().min(1),
  // Optional
  LOG_LEVEL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
