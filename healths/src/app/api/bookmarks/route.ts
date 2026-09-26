import { cookies } from "next/headers";
import { db } from "@/db";
import { knowledgeEntities, savedTopics } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { ensureLibrary } from "@/lib/library";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
async function visitor() {
  const jar = await cookies();
  let id = jar.get("hke_visitor")?.value;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    id = randomUUID();
    jar.set("hke_visitor", id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return id;
}
export async function GET() {
  try {
    await ensureLibrary();
    const visitorId = await visitor();
    const rows = await db.select({ entityId: savedTopics.entityId }).from(savedTopics).where(eq(savedTopics.visitorId, visitorId)).orderBy(desc(savedTopics.createdAt));
    return Response.json({ ids: rows.map(r => r.entityId) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Saved topics could not be loaded." }, { status: 503 });
  }
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin && new URL(origin).host !== request.headers.get("host") && new URL(origin).host !== request.headers.get("x-forwarded-host")) return Response.json({ error: "Request origin not permitted." }, { status: 403 });
    const body = await request.json();
    if (!body || typeof body.id !== "string" || body.id.length > 100 || !["save", "remove"].includes(body.action)) return Response.json({ error: "Provide a valid topic and action." }, { status: 400 });
    await ensureLibrary();
    const visitorId = await visitor();
    const [entity] = await db.select({ id: knowledgeEntities.id }).from(knowledgeEntities).where(eq(knowledgeEntities.id, body.id)).limit(1);
    if (!entity) return Response.json({ error: "This topic does not exist." }, { status: 404 });
    if (body.action === "save") await db.insert(savedTopics).values({ visitorId, entityId: entity.id }).onConflictDoNothing();
    else await db.delete(savedTopics).where(and(eq(savedTopics.visitorId, visitorId), eq(savedTopics.entityId, entity.id)));
    return Response.json({ id: entity.id, saved: body.action === "save" });
  } catch (error) {
    if (error instanceof SyntaxError) return Response.json({ error: "Invalid request data." }, { status: 400 });
    console.error("Bookmark update failed", error);
    return Response.json({ error: "Your changes could not be saved. Please try again." }, { status: 503 });
  }
}
