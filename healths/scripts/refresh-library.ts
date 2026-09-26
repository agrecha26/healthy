import "dotenv/config";
import { db, pool } from "@/db";
import { knowledgeEntities, knowledgeRelationships } from "@/db/schema";
import { seedLibrary } from "@/lib/knowledge-data";
import { sql } from "drizzle-orm";

async function refreshLibrary() {
  await db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(7814023)`);
    await tx.insert(knowledgeEntities).values(seedLibrary.entities).onConflictDoUpdate({ target: knowledgeEntities.id, set: { name: sql`excluded.name`, kind: sql`excluded.kind`, description: sql`excluded.description`, bodySystem: sql`excluded.body_system`, details: sql`excluded.details`, sources: sql`excluded.sources` } });
    await tx.insert(knowledgeRelationships).values(seedLibrary.relationships).onConflictDoUpdate({ target: knowledgeRelationships.id, set: { relationship: sql`excluded.relationship`, sourceReference: sql`excluded.source_reference` } });
  });
  console.log(`Refreshed ${seedLibrary.entities.length} topics and ${seedLibrary.relationships.length} cited relationships. Existing bookmarks were preserved.`);
}
refreshLibrary().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
