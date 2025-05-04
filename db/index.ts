import { drizzle } from "drizzle-orm/node-postgres";
import "jsr:@std/dotenv/load";

export const db = drizzle(Deno.env.get("DATABASE_URL")!);
