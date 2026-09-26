"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { useExplorer } from "./explorer-context";
import { EntityIcon } from "./icons";
import { kindLabels, searchEntities, type KnowledgeEntity } from "@/lib/types";

export function SearchBox({ variant = "header", placeholder = "Search health topics...", onSelect }: { variant?: "hero" | "header" | "graph"; placeholder?: string; onSelect?: (entity: KnowledgeEntity) => void }) {
  const { library } = useExplorer();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const container = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const matches = query.trim() ? searchEntities(library.entities, query).slice(0, 6) : ["asthma", "type-2-diabetes", "headache", "respiratory"].map(id => library.entities.find(e => e.id === id)!).filter(Boolean);
  useEffect(() => {
    const click = (event: MouseEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); };
    const key = (event: KeyboardEvent) => {
      if (variant === "header" && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); input.current?.focus(); setOpen(true); }
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", click); document.removeEventListener("keydown", key); };
  }, [variant]);
  function choose(entity: KnowledgeEntity) {
    setOpen(false); setQuery(""); setActive(-1);
    if (onSelect) onSelect(entity); else router.push(`/topics/${entity.id}`);
  }
  function allResults() { setOpen(false); router.push(`/search?q=${encodeURIComponent(query)}`); }
  return <div className={`search-box search-${variant}`} ref={container}>
    <Search size={variant === "hero" ? 21 : 17} className="search-icon" />
    <input ref={input} aria-label={placeholder} placeholder={placeholder} value={query} role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={active >= 0 && matches[active] ? `${listId}-${matches[active].id}` : undefined} autoComplete="off" onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value.slice(0, 120)); setOpen(true); setActive(-1); }} onKeyDown={event => {
      if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActive(current => Math.min(current + 1, matches.length - 1)); }
      if (event.key === "ArrowUp") { event.preventDefault(); setActive(current => Math.max(current - 1, 0)); }
      if (event.key === "Enter") { event.preventDefault(); if (active >= 0 && matches[active]) choose(matches[active]); else if (query.trim()) allResults(); }
    }} />
    {query && <button className="search-clear" onClick={() => { setQuery(""); input.current?.focus(); }} aria-label="Clear search"><X size={16} /></button>}
    {variant === "hero" ? <button className="search-submit" aria-label="Search health knowledge" onClick={() => { if (query.trim()) allResults(); else { input.current?.focus(); setOpen(true); } }}><ArrowRight size={18}/></button> : !query && <kbd>⌘ K</kbd>}
    {open && <div className="search-results" id={listId} role="listbox" aria-label="Suggested health topics">
      <p className="search-results-label">{query.trim() ? "MATCHING HEALTH TOPICS" : "A FEW PLACES TO START"}</p>
      {matches.length ? matches.map((entity, index) => <button role="option" aria-selected={index === active} id={`${listId}-${entity.id}`} key={entity.id} className={`search-result ${index === active ? "is-active" : ""}`} onClick={() => choose(entity)} onMouseEnter={() => setActive(index)}><span className={`result-icon tone-${entity.kind}`}><EntityIcon id={entity.id} kind={entity.kind} size={19} /></span><span className="result-name">{entity.name}</span><span className={`kind-badge kind-${entity.kind}`}>{kindLabels[entity.kind]}</span><ArrowRight size={14} /></button>) : <div className="search-empty">No matching topics yet.<br /><span>Try a shorter term, such as “heart” or “pain”.</span></div>}
      {query.trim() && <button className="search-all" onClick={allResults}>See all results for “{query}” <ArrowRight size={15} /></button>}
    </div>}
  </div>;
}
