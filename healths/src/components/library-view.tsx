"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Bookmark, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { useExplorer } from "./explorer-context";
import { connectionCount, connectionsFor, kindLabels, searchEntities, type EntityKind } from "@/lib/types";
import { EmptyState, PageHeading, SafetyNote, TopicCard } from "./ui";

const descriptions: Record<string, { title: string; description: string; eyebrow: string }> = {
  conditions: { title: "A little understanding goes a long way.", description: "Explore medical conditions, learn what connects them, and build a clearer picture of health.", eyebrow: "THE CONDITION LIBRARY" },
  symptoms: { title: "Understand the signals. Explore the connections.", description: "Learn about symptoms and the many different factors and conditions they can be associated with.", eyebrow: "THE SYMPTOM EXPLORER" },
  treatments: { title: "Discover the science behind care.", description: "Explore treatment approaches and medication categories, their general roles, and important safety information.", eyebrow: "THE TREATMENT EXPLORER" },
  saved: { title: "Your collection of discoveries.", description: "Pick up where your curiosity left off. Your saved topics are private to this browser.", eyebrow: "SAVED TOPICS" },
  search: { title: "Follow your curiosity.", description: "Search across conditions, symptoms, treatments, medications, body systems, and risk factors.", eyebrow: "UNIVERSAL SEARCH" },
};

export function LibraryView({ section }: { section: string }) {
  const { library, savedIds, savesReady } = useExplorer();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [filter, setFilter] = useState<EntityKind | "all">("all");
  const [system, setSystem] = useState("all");
  const [sort, setSort] = useState("az");
  const [view, setView] = useState("grid");
  const [letter, setLetter] = useState("All");
  useEffect(() => { setQuery(params.get("q") || ""); setFilter("all"); setSystem("all"); setLetter("All"); }, [section, params]);
  const config = descriptions[section] || descriptions.search;
  const base = useMemo(() => library.entities.filter(entity => section === "conditions" ? entity.kind === "condition" : section === "symptoms" ? entity.kind === "symptom" : section === "treatments" ? ["treatment", "medication"].includes(entity.kind) : section === "saved" ? savedIds.includes(entity.id) : true), [library.entities, section, savedIds]);
  const results = searchEntities(base, query).filter(entity => (filter === "all" || entity.kind === filter) && (system === "all" || entity.bodySystem === system || (["treatment", "medication", "risk-factor"].includes(entity.kind) && connectionsFor(library, entity.id, "condition").some(condition => condition.bodySystem === system))) && (letter === "All" || entity.name.toUpperCase().startsWith(letter))).sort((a, b) => sort === "connections" ? connectionCount(library, b.id) - connectionCount(library, a.id) : query ? 0 : a.name.localeCompare(b.name));
  const categories: (EntityKind | "all")[] = section === "treatments" ? ["all", "treatment", "medication"] : ["search", "saved"].includes(section) ? ["all", "condition", "symptom", "treatment", "medication", "body-system", "risk-factor"] : [];
  function reset() { setQuery(""); setFilter("all"); setSystem("all"); setLetter("All"); }
  return <div className="library-page page-enter"><PageHeading {...config} action={<span className="page-count"><Bookmark size={16} />{base.length} topics</span>} />
    {section === "symptoms" && <SafetyNote>A symptom can have many possible causes. This information is educational and does not provide a diagnosis. <strong>For sudden or severe symptoms, seek immediate medical care.</strong></SafetyNote>}
    {section === "treatments" && <SafetyNote>Treatment decisions should be made with a qualified healthcare professional. This explorer does not provide prescriptions or dosage recommendations.</SafetyNote>}
    {categories.length > 0 && <div className="filter-tabs" role="group" aria-label="Topic type">{categories.map(kind => <button className={filter === kind ? "active" : ""} onClick={() => setFilter(kind)} key={kind}>{kind === "all" ? "All topics" : kindLabels[kind]}<span>{kind === "all" ? base.length : base.filter(e => e.kind === kind).length}</span></button>)}</div>}
    <div className="library-controls"><div className="filter-search"><Search size={18} /><input aria-label="Filter topics" placeholder={`Search ${section === "saved" ? "your saved topics" : section === "search" ? "all health topics" : section}...`} value={query} onChange={e => { setQuery(e.target.value); setLetter("All"); }} />{query && <button onClick={() => setQuery("")} aria-label="Clear filter"><X size={16} /></button>}</div><div className="filter-select"><SlidersHorizontal size={15} /><select aria-label="Filter by body system" value={system} onChange={e => setSystem(e.target.value)}><option value="all">All body systems</option>{library.entities.filter(e => e.kind === "body-system").map(e => <option value={e.id} key={e.id}>{e.name}</option>)}</select></div><select className="sort-select" aria-label="Sort topics" value={sort} onChange={e => setSort(e.target.value)}><option value="az">Name: A–Z</option><option value="connections">Most connected</option></select></div>
    {section === "conditions" && <div className="alphabet-filter" aria-label="Filter by first letter">{["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map(item => <button key={item} className={letter === item ? "active" : ""} onClick={() => { setLetter(item); setQuery(""); }} disabled={item !== "All" && !base.some(e => e.name.startsWith(item))}>{item}</button>)}</div>}
    <div className="results-toolbar"><p><strong>{results.length}</strong> {results.length === 1 ? "topic" : "topics"}{query && <> matching <strong>“{query}”</strong></>}{system !== "all" && <> in {library.entities.find(e => e.id === system)?.name.toLowerCase()}</>}</p><div className="view-switch"><button aria-label="Grid view" aria-pressed={view === "grid"} className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}><LayoutGrid size={16} /></button><button aria-label="List view" aria-pressed={view === "list"} className={view === "list" ? "active" : ""} onClick={() => setView("list")}><List size={17} /></button></div></div>
    {section === "saved" && !savesReady ? <div className="topic-grid" aria-label="Loading saved topics">{[1, 2, 3].map(n => <div className="skeleton-card" key={n} />)}</div> : results.length ? <div className={`topic-grid ${view === "list" ? "topic-list" : ""}`}>{results.map(entity => <TopicCard entity={entity} key={entity.id} />)}</div> : <EmptyState title={section === "saved" && !base.length ? "Your next discovery belongs here." : "No topics match just yet."} description={section === "saved" && !base.length ? "Use the bookmark icon on any topic to create your own learning collection. No account needed." : "Try another keyword, a different body system, or reset your filters."} action={section === "saved" && !base.length ? <Link href="/conditions" className="button button-primary">Discover a topic <ArrowRight size={16} /></Link> : <button className="button button-secondary" onClick={reset}>Reset filters</button>} />}
    <p className="library-footnote">Connections describe general educational associations, not individual probabilities or a diagnosis.</p>
  </div>;
}
