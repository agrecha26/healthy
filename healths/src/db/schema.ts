import { pgTable, text, jsonb, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import type { EntityKind, EntityDetails, Source } from "@/lib/types";

export const knowledgeEntities = pgTable("knowledge_entities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  kind: text("kind").$type<EntityKind>().notNull(),
  description: text("description").notNull(),
  bodySystem: text("body_system"),
  details: jsonb("details").$type<EntityDetails>().notNull().default({}),
  sources: jsonb("sources").$type<Source[]>().notNull().default([]),
}, table => [index("entity_kind_index").on(table.kind)]);

export const knowledgeRelationships = pgTable("knowledge_relationships", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").notNull().references(() => knowledgeEntities.id, { onDelete: "cascade" }),
  targetId: text("target_id").notNull().references(() => knowledgeEntities.id, { onDelete: "cascade" }),
  relationship: text("relationship").notNull(),
  sourceReference: text("source_reference").notNull(),
}, table => [index("relationship_source_index").on(table.sourceId), index("relationship_target_index").on(table.targetId)]);

export const savedTopics = pgTable("saved_topics", {
  visitorId: text("visitor_id").notNull(),
  entityId: text("entity_id").notNull().references(() => knowledgeEntities.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, table => [primaryKey({ columns: [table.visitorId, table.entityId] })]);
