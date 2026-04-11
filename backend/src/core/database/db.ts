import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env.js";
import * as schema from "./schema.js";

// Supabase appends ?channel_binding=require which postgres.js does not support
function sanitizeConnectionUrl(urlString: string): string {
  const url = new URL(urlString);
  url.searchParams.delete("channel_binding");
  return url.toString();
}

const connectionUrl = sanitizeConnectionUrl(env.DATABASE_URL);

const client = postgres(connectionUrl, {
  ssl: env.NODE_ENV === "production" ? "require" : false,
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export async function checkDbConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
