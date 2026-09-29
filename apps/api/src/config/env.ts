import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    CLIENT_URL: z.url(),
    MONGODB_URI: z.string().startsWith('mongodb', 'Must be a MongoDB connection string'),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_TTL_MINUTES: z.coerce.number().int().positive().default(15),
    JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
    GROQ_API_KEY: z.string().min(1),
    GROQ_MODEL: z.string().min(1),
  })
  .refine((e) => e.JWT_ACCESS_SECRET !== e.JWT_REFRESH_SECRET, {
    message: 'Access and refresh secrets must differ',
    path: ['JWT_REFRESH_SECRET'],
  });

function loadEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // console, not the logger: the logger itself depends on env
    console.error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
export const isProduction = env.NODE_ENV === 'production';
