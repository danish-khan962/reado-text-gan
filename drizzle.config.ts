import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// drizzle-kit runs outside Next.js, so load the env files ourselves
config({ path: ['.env.local', '.env'] })

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
