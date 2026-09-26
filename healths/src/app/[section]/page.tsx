import { notFound } from "next/navigation";
import { getLibrary } from "@/lib/library";
import { ExplorerApp } from "@/components/explorer-app";
export const dynamic = "force-dynamic";
const sections = ["explore", "conditions", "symptoms", "treatments", "body-systems", "compare", "sources", "about", "saved", "search"];
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  const library = await getLibrary();
  return <ExplorerApp library={library} section={section} />;
}
