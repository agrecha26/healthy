"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftRight, ArrowUpRight, Check, GitCompareArrows, Network } from "lucide-react";
import { useExplorer } from "./explorer-context";
import { connectionsFor, type EntityKind, type KnowledgeEntity } from "@/lib/types";
import { EntityIcon } from "./icons";
import { PageHeading, SafetyNote, SharedChip } from "./ui";

export function ComparisonView() {
  const { library } = useExplorer();
  const params = useSearchParams();
  const conditions = library.entities.filter(e => e.kind === "condition");
  const first = conditions.some(e => e.id === params.get("a")) ? params.get("a")! : "asthma";
  const secondParam = params.get("b");
  const initialSecond = secondParam && secondParam !== first && conditions.some(e => e.id === secondParam) ? secondParam : first === "copd" ? "asthma" : "copd";
  const [aId, setAId] = useState(first);
  const [bId, setBId] = useState(initialSecond);
  const a = conditions.find(e => e.id === aId)!;
  const b = conditions.find(e => e.id === bId)!;
  const relatedA = connectionsFor(library, aId);
  const relatedB = connectionsFor(library, bId);
  const sharedIds = new Set(relatedA.filter(e => relatedB.some(other => other.id === e.id)).map(e => e.id));
  const shared = library.entities.filter(e => sharedIds.has(e.id) && ["symptom", "risk-factor", "body-system", "treatment", "medication"].includes(e.kind));
  function chips(id: string, kind: EntityKind | "care") {
    const entries = connectionsFor(library, id).filter(e => kind === "care" ? ["treatment", "medication"].includes(e.kind) : e.kind === kind);
    return entries.length ? <div className="compare-chips">{entries.map(e => <Link className={sharedIds.has(e.id) ? "comparison-chip shared" : "comparison-chip"} key={e.id} href={`/topics/${e.id}`}>{sharedIds.has(e.id) && <Check size={12}/>} {e.name}</Link>)}</div> : <p className="muted">Often no noticeable symptoms; assessment does not rely on symptoms alone.</p>;
  }
  const rows: { label: string; content: (entity: KnowledgeEntity) => React.ReactNode }[] = [
    { label: "Overview", content: e => <p>{e.description}</p> },
    { label: "Common symptoms", content: e => chips(e.id, "symptom") },
    { label: "Risk factors & influences", content: e => chips(e.id, "risk-factor") },
    { label: "Body system", content: e => chips(e.id, "body-system") },
    { label: "Diagnosis overview", content: e => <p>{e.details.diagnosis}</p> },
    { label: "Treatment approaches", content: e => chips(e.id, "care") },
    { label: "Further reading", content: e => <a className="text-link" href={e.sources[0].url} target="_blank" rel="noreferrer">{e.sources[0].organization.split(" · ")[0]} <ArrowUpRight size={15}/></a> },
  ];
  return <div className="comparison-page page-enter"><PageHeading eyebrow="THE CONDITION COMPARISON" title="Two conditions. A clearer perspective." description="Discover similarities and differences without making assumptions about your own health."/>
    <div className="comparison-selectors"><label><span>FIRST CONDITION</span><div><EntityIcon id={aId} size={24}/><select value={aId} aria-label="First condition" onChange={e => setAId(e.target.value)}>{conditions.map(e => <option disabled={e.id === bId} value={e.id} key={e.id}>{e.name}</option>)}</select></div></label><button className="swap-button" aria-label="Swap conditions" onClick={() => { setAId(bId); setBId(aId); }}><ArrowLeftRight size={20}/></button><label><span>SECOND CONDITION</span><div><EntityIcon id={bId} size={24}/><select value={bId} aria-label="Second condition" onChange={e => setBId(e.target.value)}>{conditions.map(e => <option disabled={e.id === aId} value={e.id} key={e.id}>{e.name}</option>)}</select></div></label></div>
    <div className="shared-summary"><span className="shared-summary-icon"><GitCompareArrows size={24}/></span><div><h2>{shared.length ? `${shared.length} shared connections` : "Different topics, useful context"}</h2><p>{shared.length ? "Shared characteristics are highlighted in teal. A shared connection does not make two conditions equivalent." : "This sample library does not show shared connections for this pair. That does not imply they can be distinguished without an assessment."}</p><div className="shared-summary-chips">{shared.slice(0, 5).map(e => <SharedChip key={e.id}>{e.name}</SharedChip>)}{shared.length > 5 && <span className="shared-more">+{shared.length - 5} more below</span>}</div></div></div>
    <div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th>Explore the differences</th>{[a, b].map(e => <th key={e.id}><span className="compare-condition-icon"><EntityIcon id={e.id} size={28}/></span><h2>{e.name}</h2><Link href={`/topics/${e.id}`}>Read full overview <ArrowUpRight size={13}/></Link></th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.content(a)}</td><td>{row.content(b)}</td></tr>)}</tbody></table></div><SafetyNote>This comparison is for education, not self-diagnosis. Similar symptoms can have different causes, and treatment decisions depend on a professional assessment.</SafetyNote><div className="compare-next"><Network size={22}/><div><h3>Keep connecting the dots.</h3><p>See these conditions in the context of the wider knowledge graph.</p></div><Link href={`/explore?topic=${aId}`} className="button button-primary">Explore {a.name}<ArrowUpRight size={16}/></Link></div>
  </div>;
}
