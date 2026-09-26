"use client";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Activity, ArrowLeftRight, ArrowUpRight, Bookmark, BookOpen, ChevronRight, CircleHelp, HeartHandshake, House, Info, Menu, Network, Palette, Pill, ShieldCheck, Stethoscope, X } from "lucide-react";
import type { KnowledgeLibrary } from "@/lib/types";
import { DISCLAIMER } from "@/lib/types";
import { ExplorerProvider, useExplorer } from "./explorer-context";
import { BodyIcon, BrandMark } from "./icons";
import { SearchBox } from "./search-box";
import { Dashboard } from "./dashboard";
import { LibraryView } from "./library-view";
import { KnowledgeGraph } from "./knowledge-graph";
import { TopicView } from "./topic-view";
import { ComparisonView } from "./comparison-view";
import { BodySystemsView } from "./body-systems-view";
import { AboutPage, SourcesPage } from "./info-pages";

const navigation = [
  { key: "home", label: "Home", href: "/", icon: House },
  { key: "explore", label: "Explore", href: "/explore", icon: Network },
  { key: "conditions", label: "Conditions", href: "/conditions", icon: Stethoscope },
  { key: "symptoms", label: "Symptoms", href: "/symptoms", icon: Activity },
  { key: "treatments", label: "Treatments", href: "/treatments", icon: Pill },
  { key: "body-systems", label: "Body systems", href: "/body-systems", icon: BodyIcon },
  { key: "compare", label: "Compare", href: "/compare", icon: ArrowLeftRight },
  { key: "sources", label: "Sources", href: "/sources", icon: BookOpen },
  { key: "about", label: "About", href: "/about", icon: Info },
];
const titles: Record<string, string> = { home: "Overview", explore: "Explore connections", conditions: "Condition library", symptoms: "Symptom explorer", treatments: "Treatment explorer", "body-systems": "Body systems", compare: "Compare conditions", sources: "Sources & references", about: "About the explorer", saved: "Saved topics", topic: "Topic overview", search: "Search the library" };
function Shell({ section, topicId, children }: { section: string; topicId?: string; children: ReactNode }) {
  const { library, savedIds } = useExplorer();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [designOption, setDesignOption] = useState<"a" | "b">("a");
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    try {
      if (window.localStorage.getItem("hke-design-option") === "b") setDesignOption("b");
    } catch {
      // Keep Option A as the accessible default if browser storage is unavailable.
    }
  }, []);
  function toggleDesignOption() {
    const next = designOption === "a" ? "b" : "a";
    setDesignOption(next);
    try {
      window.localStorage.setItem("hke-design-option", next);
    } catch {
      // The current session still updates if storage is disabled.
    }
  }
  const entity = library.entities.find(e => e.id === topicId);
  const activeSection = section === "topic" && entity ? entity.kind === "condition" ? "conditions" : entity.kind === "symptom" ? "symptoms" : ["treatment", "medication"].includes(entity.kind) ? "treatments" : entity.kind === "body-system" ? "body-systems" : "explore" : section;
  useEffect(() => {
    if (!mobileOpen) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = sidebar.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
    focusable?.[0]?.focus();
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key === "Tab" && focusable?.length) { const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
    };
    document.addEventListener("keydown", listener);
    return () => { document.body.style.overflow = old; document.removeEventListener("keydown", listener); };
  }, [mobileOpen]);
  return <div className="app-shell" data-design={designOption}><a className="skip-link" href="#main-content">Skip to content</a>{mobileOpen && <button className="sidebar-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`} ref={sidebar} aria-label="Main navigation"><div className="sidebar-brand"><Link href="/" aria-label="Health Atlas home" onClick={() => setMobileOpen(false)}><BrandMark/><span>Health<strong>Atlas<span className="brand-dot">.</span></strong></span></Link><button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={19}/></button></div><div className="sidebar-main"><p className="nav-section-label">YOUR EXPLORER</p><nav>{navigation.map((item, index) => <div key={item.key}>{index === 6 && <div className="nav-divider"/>}<Link href={item.href} className={`nav-item ${activeSection === item.key ? "nav-active" : ""}`} aria-current={activeSection === item.key ? "page" : undefined} onClick={() => setMobileOpen(false)}><item.icon size={19}/><span>{item.label}</span>{item.key === "explore" && <span className="nav-explore-dot"/>}{activeSection === item.key && <span className="active-marker"/>}</Link></div>)}</nav><div className="nav-divider saved-divider"/><Link href="/saved" onClick={() => setMobileOpen(false)} className={`nav-item ${section === "saved" ? "nav-active" : ""}`}><Bookmark size={19}/><span>Saved topics</span>{savedIds.length > 0 && <span className="saved-count">{savedIds.length}</span>}</Link></div><div className="sidebar-bottom"><div className="sidebar-safety"><span className="sidebar-safety-icon"><ShieldCheck size={21}/></span><h3>A space to learn.<br/>Not to self-diagnose.</h3><p>Explore with curiosity. Make health decisions with a professional.</p><Link href="/about">Our approach <ArrowUpRight size={14}/></Link></div><div className="sidebar-signoff"><HeartHandshake size={15}/><span>Learn well. Live informed.</span></div></div></aside>
    <div className="app-workspace"><header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setMobileOpen(true)} aria-expanded={mobileOpen} aria-label="Open navigation"><Menu size={22}/></button><div className="breadcrumbs"><Link href="/" aria-label="Home"><House size={16}/></Link><ChevronRight size={13}/><span>{titles[section] || "Explore"}</span>{entity && <><ChevronRight size={13}/><strong>{entity.name}</strong></>}</div></div><div className="topbar-right"><SearchBox/><button type="button" className="design-option-toggle" role="switch" aria-checked={designOption === "b"} aria-label={designOption === "a" ? "Switch from Option A, HealthMesh, to Option B, Clinical Blue" : "Switch from Option B, Clinical Blue, to Option A, HealthMesh"} title={designOption === "a" ? "Option A · HealthMesh. Click to switch to Option B · Clinical Blue." : "Option B · Clinical Blue. Click to switch to Option A · HealthMesh."} onClick={toggleDesignOption}><Palette size={15}/><span>{designOption === "a" ? "A · HealthMesh" : "B · Clinical Blue"}</span><i aria-hidden="true"/></button><span className="topbar-divider"/><Link href="/about" className="header-safety"><ShieldCheck size={17}/><span>Educational use only</span></Link><Link href="/about#using-the-explorer" className="help-link" aria-label="Help using the explorer"><CircleHelp size={20}/></Link></div></header>
    <main id="main-content" className={`main-content ${section === "explore" ? "main-graph" : ""}`}><Suspense fallback={<div className="page-loading"><div className="loading-orbit"><BrandMark/></div><p>Connecting your knowledge...</p></div>}>{children}</Suspense></main><footer className="persistent-disclaimer"><span><ShieldCheck size={18}/></span><p>{DISCLAIMER}</p><Link href="/about">Learn more <ArrowUpRight size={13}/></Link></footer></div>
  </div>;
}
export function ExplorerApp({ library, section, topicId }: { library: KnowledgeLibrary; section: string; topicId?: string }) {
  return <ExplorerProvider library={library}><Shell section={section} topicId={topicId}>{section === "home" ? <Dashboard/> : section === "explore" ? <KnowledgeGraph/> : section === "topic" && topicId ? <TopicView id={topicId}/> : section === "body-systems" ? <BodySystemsView/> : section === "compare" ? <ComparisonView/> : section === "sources" ? <SourcesPage/> : section === "about" ? <AboutPage/> : <LibraryView section={section}/>}</Shell></ExplorerProvider>;
}
