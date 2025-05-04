import { pgTable, integer, varchar } from "drizzle-orm/pg-core";

export const roomsTable = pgTable("rooms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  voiceChannelId: varchar({ length: 32 }).notNull().unique(),
  textChannelId: varchar({ length: 32 }),
});
