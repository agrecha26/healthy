"use client";
import Link from "next/link";
import { ArrowRight, Bookmark, Check, ExternalLink, GitBranch, Info, LoaderCircle, SearchX, ShieldCheck, TriangleAlert } from "lucide-react";
import { connectionCount, kindLabels, type KnowledgeEntity, type EntityKind, type Source } from "@/lib/types";
import { EntityIcon } from "./icons";
import { useExplorer } from "./explorer-context";
import type { ReactNode } from "react";

export function KindBadge({ kind }: { kind: EntityKind }) { return <span className={`kind-badge kind-${kind}`}>{kindLabels[kind]}</span>; }
export function SaveButton({ id, labeled = false }: { id: string; labeled?: boolean }) {
  const { savedIds, savesReady, pendingSaves, toggleSaved } = useExplorer();
  const saved = savedIds.includes(id);
  const pending = pendingSaves.includes(id);
  return <button className={`${labeled ? "button button-secondary" : "icon-button save-button"} ${saved ? "is-saved" : ""}`} aria-label={saved ? "Remove saved topic" : "Save topic"} aria-pressed={saved} disabled={!savesReady || pending} onClick={() => toggleSaved(id)} title={saved ? "Remove saved topic" : "Save topic"}>{pending ? <LoaderCircle size={17} className="spinning" /> : saved ? <Bookmark size={17} fill="currentColor" /> : <Bookmark size={17} />}{labeled && (saved ? "Topic saved" : "Save topic")}</button>;
}
export function TopicCard({ entity }: { entity: KnowledgeEntity }) {
  const { library } = useExplorer();
  const bodySystem = library.entities.find(e => e.id === entity.bodySystem);
  return <article className="topic-card"><div className="topic-card-top"><span className={`topic-icon tone-${entity.kind}`}><EntityIcon id={entity.id} kind={entity.kind} size={25} /></span><SaveButton id={entity.id} /></div><KindBadge kind={entity.kind} /><h3><Link href={`/topics/${entity.id}`}>{entity.name}</Link></h3><p>{entity.description}</p>{bodySystem && <span className="topic-system">{bodySystem.name}</span>}<div className="topic-card-footer"><Link href={`/explore?topic=${entity.id}`}><GitBranch size={14} />{connectionCount(library, entity.id)} connections</Link><Link href={`/topics/${entity.id}`} aria-label={`Read about ${entity.name}`}><ArrowRight size={17} /></Link></div></article>;
}
export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p className="page-description">{description}</p></div>{action}</div>;
}
export function SectionHeading({ title, subtitle, href, linkLabel = "View all" }: { title: string; subtitle?: string; href?: string; linkLabel?: string }) {
  return <div className="section-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{href && <Link href={href} className="text-link">{linkLabel}<ArrowRight size={15} /></Link>}</div>;
}
export function SafetyNote({ children, urgent = false, compact = false }: { children: ReactNode; urgent?: boolean; compact?: boolean }) {
  return <div className={`safety-note ${urgent ? "safety-urgent" : ""} ${compact ? "safety-compact" : ""}`}>{urgent ? <TriangleAlert size={19} /> : <Info size={18} />}<div>{children}</div></div>;
}
export function SourceReferences({ sources }: { sources: Source[] }) {
  return <div className="source-references">{sources.map(source => <a href={source.url} target="_blank" rel="noreferrer noopener" className="source-reference" key={source.url}><span className="source-check"><ShieldCheck size={20} /></span><span><strong>{source.title}</strong><small>{source.organization}</small></span><ExternalLink size={16} /></a>)}<p className="source-caption">These independent references support further reading. Listing a source does not imply endorsement or clinical review of this platform.</p></div>;
}
export function EmptyState({ title = "No topics found", description = "Try a different search or reset your filters.", action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div className="empty-state"><span><SearchX size={31} /></span><h2>{title}</h2><p>{description}</p>{action}</div>;
}
export function SharedChip({ children }: { children: ReactNode }) { return <span className="shared-chip"><Check size={12} />{children}</span>; }
