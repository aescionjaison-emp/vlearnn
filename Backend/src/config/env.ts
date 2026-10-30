import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().optional().default(""),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  JWT_SECRET: z.string().default("vlearnn_default_jwt_secret_change_in_production_32char"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("VLEARNN Admissions <onboarding@resend.dev>"),
  ADMIN_NOTIFICATION_EMAIL: z.string().email().default("admin@vlearnn.com"),
  WHATSAPP_NUMBER: z.string().default("919876543210"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Environment configuration error:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

