import { getLibrary } from "@/lib/library";
import { ExplorerApp } from "@/components/explorer-app";
export const dynamic = "force-dynamic";
export default async function HomePage() {
  const library = await getLibrary();
  return <ExplorerApp library={library} section="home" />;
}
