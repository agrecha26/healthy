import { db } from "@/db";
import { knowledgeEntities, knowledgeRelationships } from "@/db/schema";
import { seedLibrary } from "./knowledge-data";
import { sql } from "drizzle-orm";
import type { KnowledgeLibrary } from "./types";

let initialization: Promise<void> | undefined;
export async function ensureLibrary() {
  if (!initialization) {
    initialization = db.transaction(async tx => {
      await tx.execute(sql`select pg_advisory_xact_lock(7814023)`);
      const existing = await tx.select({ id: knowledgeEntities.id }).from(knowledgeEntities).limit(1);
      if (existing.length) return;
      await tx.insert(knowledgeEntities).values(seedLibrary.entities).onConflictDoNothing();
      await tx.insert(knowledgeRelationships).values(seedLibrary.relationships).onConflictDoNothing();
    }).catch(error => {
      initialization = undefined;
      throw error;
    });
  }
  await initialization;
}

export async function getLibrary(): Promise<KnowledgeLibrary> {
  await ensureLibrary();
  const [entities, relationships] = await Promise.all([
    db.select().from(knowledgeEntities).orderBy(knowledgeEntities.name),
    db.select().from(knowledgeRelationships),
  ]);
  return { entities, relationships };
}
