import { notFound } from "next/navigation";
import { getLibrary } from "@/lib/library";
import { ExplorerApp } from "@/components/explorer-app";
export const dynamic = "force-dynamic";
export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const library = await getLibrary();
  if (!library.entities.some(e => e.id === id)) notFound();
  return <ExplorerApp library={library} section="topic" topicId={id} />;
}
