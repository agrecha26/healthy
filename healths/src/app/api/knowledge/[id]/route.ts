import { getLibrary } from "@/lib/library";
import { connectionsFor } from "@/lib/types";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const library = await getLibrary();
    const entity = library.entities.find(e => e.id === id);
    if (!entity) return Response.json({ error: "Topic not found." }, { status: 404 });
    return Response.json({ entity, connectedTopics: connectionsFor(library, id), relationships: library.relationships.filter(r => r.sourceId === id || r.targetId === id) });
  } catch {
    return Response.json({ error: "Unable to load this topic. Please try again." }, { status: 503 });
  }
}
