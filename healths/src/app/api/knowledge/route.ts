import { NextRequest } from "next/server";
import { getLibrary } from "@/lib/library";
import { searchEntities, kindLabels } from "@/lib/types";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const library = await getLibrary();
    const query = (request.nextUrl.searchParams.get("q") || "").slice(0, 120);
    const kind = request.nextUrl.searchParams.get("kind");
    if (kind && !Object.prototype.hasOwnProperty.call(kindLabels, kind)) return Response.json({ error: "Unknown topic category." }, { status: 400 });
    const entities = searchEntities(library.entities, query).filter(e => !kind || e.kind === kind);
    const ids = new Set(entities.map(e => e.id));
    return Response.json({ entities, relationships: library.relationships.filter(r => ids.has(r.sourceId) || ids.has(r.targetId)), total: entities.length });
  } catch (error) {
    console.error("Knowledge library request failed", error);
    return Response.json({ error: "The knowledge library is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
