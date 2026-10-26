import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const Env = createEnv({
  server: {
    CRON_SECRET: z.string(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    SUPABASE_SECRET_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  },
  runtimeEnv: {
    CRON_SECRET: process.env.CRON_SECRET,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  },
});
