"use client";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, Expand, Focus, GitBranch, Grip, Info, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useExplorer } from "./explorer-context";
import { EntityIcon } from "./icons";
import { SearchBox } from "./search-box";
import { KindBadge, PageHeading, SaveButton } from "./ui";
import { connectionsFor, kindColors, kindLabels, type EntityKind, type KnowledgeEntity } from "@/lib/types";

type Point = { x: number; y: number };
type Drag = { id?: string; start: Point; origin: Point; moved: boolean };
const kinds: EntityKind[] = ["condition", "symptom", "treatment", "medication", "risk-factor", "body-system"];
function wrapName(name: string) {
  if (name.length <= 21) return [name];
  const words = name.split(" "); const lines = [""];
  for (const word of words) { const index = lines.length - 1; if ((lines[index] + " " + word).trim().length > 23 && lines[index]) lines.push(word); else lines[index] = (lines[index] + " " + word).trim(); }
  return lines.slice(0, 3);
}
export function KnowledgeGraph() {
  const { library, notify } = useExplorer();
  const params = useSearchParams();
  const requestedId = params.get("topic") || "asthma";
  const initialId = library.entities.some(e => e.id === requestedId) ? requestedId : "asthma";
  const [rootId, setRootId] = useState(initialId);
  const [selectedId, setSelectedId] = useState(initialId);
  const [history, setHistory] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [hiddenKinds, setHiddenKinds] = useState<EntityKind[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [customPositions, setCustomPositions] = useState<Record<string, Point>>({});
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [hideBranches, setHideBranches] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const graphArea = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  useEffect(() => { setRootId(initialId); setSelectedId(initialId); setHistory([]); setExpanded([]); setCustomPositions({}); setPan({ x: 0, y: 0 }); setZoom(1); setHideBranches(false); }, [initialId]);
  const root = library.entities.find(e => e.id === rootId)!;
  const selected = library.entities.find(e => e.id === selectedId) || root;
  const neighbors = connectionsFor(library, rootId);
  const visibleEntities = useMemo(() => {
    const direct = connectionsFor(library, rootId);
    const symptomOrder = ["wheezing", "cough", "chest-tightness"];
    if (rootId === "asthma") direct.sort((a, b) => (symptomOrder.includes(a.id) ? symptomOrder.indexOf(a.id) : 100) - (symptomOrder.includes(b.id) ? symptomOrder.indexOf(b.id) : 100));
    const chosen = kinds.flatMap(kind => direct.filter(e => e.kind === kind).slice(0, kind === "symptom" ? 3 : kind === "condition" ? 1 : kind === "body-system" ? 1 : 2));
    const ids = new Set<string>([rootId]);
    if (!hideBranches) {
      (expanded.includes(rootId) ? direct : chosen).slice(0, 26).forEach(e => ids.add(e.id));
      expanded.filter(id => id !== rootId).forEach(id => connectionsFor(library, id).slice(0, 6).forEach(e => ids.add(e.id)));
    }
    return [...ids].map(id => library.entities.find(e => e.id === id)!).filter(e => e && (e.id === rootId || !hiddenKinds.includes(e.kind)));
  }, [library, rootId, expanded, hiddenKinds, hideBranches]);
  const positions = useMemo(() => {
    const nodes = visibleEntities.filter(e => e.id !== rootId);
    const result: Record<string, Point> = { [rootId]: { x: 450, y: 282 } };
    nodes.forEach((entity, index) => {
      const outer = nodes.length > 14 && index >= 14;
      const count = outer ? nodes.length - 14 : Math.min(nodes.length, 14);
      const angle = (outer ? index - 14 + .5 : index) * Math.PI * 2 / count - Math.PI / 2;
      result[entity.id] = { x: 450 + Math.cos(angle) * (outer ? 385 : nodes.length > 14 ? 235 : 290), y: 282 + Math.sin(angle) * (outer ? 240 : nodes.length > 14 ? 145 : 197) };
    });
    return { ...result, ...customPositions };
  }, [visibleEntities, rootId, customPositions]);
  const visibleIds = new Set(visibleEntities.map(e => e.id));
  const edges = library.relationships.filter(r => visibleIds.has(r.sourceId) && visibleIds.has(r.targetId));
  function centerOn(entity: KnowledgeEntity) {
    if (entity.id !== rootId) setHistory(current => [...current, rootId]);
    setRootId(entity.id); setSelectedId(entity.id); setExpanded([]); setCustomPositions({}); setZoom(1); setPan({ x: 0, y: 0 }); setHideBranches(false); setInspectorOpen(true);
  }
  function back() {
    const id = history[history.length - 1]; if (!id) return;
    setHistory(current => current.slice(0, -1)); setRootId(id); setSelectedId(id); setExpanded([]); setCustomPositions({}); setPan({ x: 0, y: 0 }); setZoom(1); setHideBranches(false);
  }
  function reset() {
    setRootId(initialId); setSelectedId(initialId); setHistory([]); setExpanded([]); setHiddenKinds([]); setCustomPositions({}); setPan({ x: 0, y: 0 }); setZoom(1); setHideBranches(false); setInspectorOpen(true);
  }
  function point(event: PointerEvent<SVGElement>): Point {
    const rect = svg.current!.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * 900 / rect.width, y: (event.clientY - rect.top) * 570 / rect.height };
  }
  function startDrag(event: PointerEvent<SVGElement>, id?: string) {
    if (event.button !== 0) return;
    event.stopPropagation();
    drag.current = { id, start: point(event), origin: id ? positions[id] : pan, moved: false };
    svg.current?.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    const current = point(event); const delta = { x: current.x - drag.current.start.x, y: current.y - drag.current.start.y };
    if (Math.abs(delta.x) + Math.abs(delta.y) > 4) drag.current.moved = true;
    const { id, origin } = drag.current;
    if (id) setCustomPositions(previous => ({ ...previous, [id]: { x: origin.x + delta.x / zoom, y: origin.y + delta.y / zoom } }));
    else setPan({ x: origin.x + delta.x, y: origin.y + delta.y });
  }
  function finish(event: PointerEvent<SVGSVGElement>) {
    if (drag.current?.id && !drag.current.moved) { setSelectedId(drag.current.id); setInspectorOpen(true); }
    drag.current = null;
    if (svg.current?.hasPointerCapture(event.pointerId)) svg.current.releasePointerCapture(event.pointerId);
  }
  const selectedConnections = connectionsFor(library, selected.id);
  return <div className="graph-page page-enter"><PageHeading eyebrow="THE HEALTH KNOWLEDGE GRAPH" title="Follow a connection. Discover something new." description="Every topic is part of a bigger story. Choose a node and see where your curiosity takes you." action={<Link href="/about#using-the-explorer" className="button button-secondary"><Info size={16}/>How it works</Link>} />
    <div className="graph-workspace" ref={graphArea}>
      <div className="graph-toolbar"><div className="graph-breadcrumb"><button className="icon-button" aria-label="Return to previous graph topic" disabled={!history.length} onClick={back}><ArrowLeft size={18}/></button><span className="graph-root-icon"><EntityIcon id={root.id} kind={root.kind} size={21}/></span><strong>{root.name}</strong><ChevronRight size={14}/><span>{neighbors.length} connections</span></div><div className="graph-toolbar-actions"><SearchBox variant="graph" placeholder="Explore another topic..." onSelect={centerOn}/><button className="button button-secondary reset-graph" onClick={reset}><RotateCcw size={15}/><span>Reset graph</span></button></div></div>
      <div className="graph-legend"><span>SHOW CONNECTIONS</span>{kinds.map(kind => <button key={kind} aria-pressed={!hiddenKinds.includes(kind)} className={hiddenKinds.includes(kind) ? "legend-hidden" : ""} onClick={() => setHiddenKinds(current => current.includes(kind) ? current.filter(k => k !== kind) : [...current, kind])}><i style={{ background: kindColors[kind] }}/>{kindLabels[kind]}</button>)}</div>
      <div className={`graph-main ${!inspectorOpen ? "inspector-hidden" : ""}`}><div className="graph-canvas-wrap"><div className="graph-canvas-hint"><Grip size={14}/>Drag to explore · Click a topic to learn</div><svg ref={svg} viewBox="0 0 900 570" className="graph-canvas" aria-label={`Interactive health knowledge graph centered on ${root.name}`} onPointerDown={e => startDrag(e)} onPointerMove={move} onPointerUp={finish} onPointerCancel={() => { drag.current = null; }}><defs><pattern id="graph-dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#dce4e1"/></pattern><filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#254d40" floodOpacity=".07"/></filter></defs><rect width="900" height="570" fill="url(#graph-dots)"/><g transform={`translate(${450 + pan.x} ${282 + pan.y}) scale(${zoom}) translate(-450 -282)`}>
        {edges.map(edge => { const from = positions[edge.sourceId]; const to = positions[edge.targetId]; if (!from || !to) return null; const active = edge.sourceId === selectedId || edge.targetId === selectedId; return <g key={edge.id} className="graph-edge" style={{ pointerEvents: "none" }}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={active ? "#9cbfb3" : "#d6e0db"} strokeWidth={active ? 1.5 : 1}/>{edge.sourceId === rootId && visibleEntities.length < 16 && <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 7} textAnchor="middle" fill="#596f64" fontSize="9">{edge.relationship === "management may include" ? "may be managed with" : edge.relationship}</text>}</g>; })}
        {visibleEntities.map(entity => { const p = positions[entity.id]; const isRoot = entity.id === rootId; const isSelected = entity.id === selectedId; const color = kindColors[entity.kind]; const radius = isRoot ? 51 : 31; return <g key={entity.id} transform={`translate(${p.x} ${p.y})`} className="graph-node" role="button" tabIndex={0} aria-label={`${entity.name}, ${kindLabels[entity.kind]}. Select to learn and expand.`} aria-pressed={isSelected} onPointerDown={e => startDrag(e, entity.id)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(entity.id); setInspectorOpen(true); } }} onDoubleClick={() => centerOn(entity)}>{isSelected && <circle r={radius + 7} fill="none" stroke={color} strokeWidth="2" strokeOpacity=".25"/>}<circle r={radius} fill={isRoot ? color : "white"} stroke={isRoot ? color : `${color}80`} strokeWidth={isSelected ? 2 : 1.5} filter="url(#node-shadow)"/>{!isRoot && <circle r={radius - 6} fill={`${color}10`}/>}<foreignObject x={isRoot ? -19 : -13} y={isRoot ? -27 : -13} width={isRoot ? 38 : 26} height={isRoot ? 38 : 26} style={{ pointerEvents: "none", color: isRoot ? "white" : color }}><EntityIcon id={entity.id} kind={entity.kind} size={isRoot ? 38 : 26}/></foreignObject>{isRoot ? <><text y="23" textAnchor="middle" fill="white" fontSize={entity.name.length > 17 ? 10 : 13} fontWeight="600">{entity.name.length > 25 ? entity.name.slice(0, 23) + "…" : entity.name}</text><text y="77" textAnchor="middle" fill={color} fontSize="10" letterSpacing="1.2">YOUR EXPLORATION</text></> : wrapName(entity.name).map((line, i) => <text key={i} y={49 + i * 15} textAnchor="middle" fill="#3a4a49" fontSize="12" fontWeight="500">{line}</text>)}{expanded.includes(entity.id) && <g transform={`translate(${radius - 2} ${-radius + 3})`}><circle r="8" fill={color}/><path d="M-3 0H3" stroke="white" strokeWidth="1.5"/></g>}</g>; })}
      </g></svg><div className="graph-bottom-controls"><div className="zoom-controls"><button onClick={() => setZoom(current => Math.max(.5, current - .15))} disabled={zoom <= .5} aria-label="Zoom out"><Minus size={17}/></button><span>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom(current => Math.min(1.9, current + .15))} disabled={zoom >= 1.9} aria-label="Zoom in"><Plus size={17}/></button><i/><button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setCustomPositions({}); }} aria-label="Fit graph to view"><Focus size={17}/></button></div><span className="visible-node-count">{visibleEntities.length} topics · {edges.length} connections</span><button className="icon-button fullscreen-button" aria-label="View graph fullscreen" onClick={() => { if (document.fullscreenElement) document.exitFullscreen(); else graphArea.current?.requestFullscreen().catch(() => notify("Fullscreen is not available in this preview.", true)); }}><Maximize2 size={17}/></button></div></div>
      {inspectorOpen && <aside className="graph-inspector"><div className="inspector-top"><span>TOPIC OVERVIEW</span><button className="icon-button" onClick={() => setInspectorOpen(false)} aria-label="Close topic overview"><X size={16}/></button></div><span className={`inspector-icon tone-${selected.kind}`}><EntityIcon id={selected.id} kind={selected.kind} size={32}/></span><KindBadge kind={selected.kind}/><div className="inspector-title"><h2>{selected.name}</h2><SaveButton id={selected.id}/></div><p className="inspector-description">{selected.description}</p><Link href={`/topics/${selected.id}`} className="text-link">Read the full overview <ArrowRight size={14}/></Link><div className="inspector-divider"/><h3><GitBranch size={15}/>{selectedConnections.length} connected topics</h3><div className="inspector-connections">{kinds.filter(k => selectedConnections.some(e => e.kind === k)).map(kind => <div key={kind}><span><i style={{ background: kindColors[kind] }}/>{kindLabels[kind]}{kind === "body-system" ? "s" : "s"}</span><strong>{selectedConnections.filter(e => e.kind === kind).length}</strong></div>)}</div><button className="button button-primary inspector-expand" onClick={() => { setHideBranches(false); setExpanded(current => current.includes(selected.id) ? current.filter(id => id !== selected.id) : [...current, selected.id]); }}>{expanded.includes(selected.id) ? <Minus size={16}/> : <Plus size={16}/>}{expanded.includes(selected.id) ? "Collapse connections" : "Expand connections"}</button>{selected.id !== rootId ? <button className="button button-secondary" onClick={() => centerOn(selected)}><Focus size={16}/>Make this the center</button> : <button className="button button-secondary" onClick={() => setHideBranches(current => !current)}><Expand size={16}/>{hideBranches ? "Show branches" : "Collapse all branches"}</button>}<div className="inspector-source"><ShieldIcon/><span>Reference: <a href={selected.sources[0]?.url} target="_blank" rel="noreferrer">MedlinePlus ↗</a></span></div></aside>}
      </div><div className="graph-workspace-footer"><Info size={14}/><p>A connection is an educational association—not a diagnosis, probability, or proof of causation.</p></div>
    </div><div className="graph-learning-note"><span><GitBranch size={20}/></span><p><strong>There’s more to every connection.</strong> Double-click a node to make it your starting point. Use the back arrow to retrace your discoveries.</p></div>
  </div>;
}
function ShieldIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 3 3 7v6c0 4 9 8 9 8s9-4 9-8V7L12 3Z"/><path d="m8 12 3 3 5-6"/></svg>; }
