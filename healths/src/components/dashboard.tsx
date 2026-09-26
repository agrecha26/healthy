"use client";
import Link from "next/link";
import Image from "next/image";
import { Activity, ArrowRight, ArrowUpRight, BookOpen, CircleHelp, GitBranch, Network, Pill, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { useExplorer } from "./explorer-context";
import { BodyIcon, EntityIcon, Lungs } from "./icons";
import { SearchBox } from "./search-box";
import { SectionHeading, SaveButton } from "./ui";
import { connectionCount } from "@/lib/types";

function HeroNetwork() {
  return <div className="hero-network" aria-label="Preview of asthma's health connections">
    <svg className="network-lines" viewBox="0 0 480 320" fill="none" aria-hidden="true"><defs><pattern id="hero-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.8" fill="#b9d5cb" opacity=".6" /></pattern></defs><rect width="480" height="320" fill="url(#hero-dots)"/><circle cx="240" cy="156" r="101" stroke="#cfe0d8" strokeDasharray="3 6"/><circle cx="240" cy="156" r="154" stroke="#dbe7e0" strokeDasharray="3 6"/><path d="M240 156L105 71M240 156L333 45M240 156L402 153M240 156L302 267M240 156L93 250" stroke="#a7c4ba" strokeWidth="1.5"/><circle cx="172" cy="113" r="3" fill="#bbcbba"/><circle cx="288" cy="99" r="3" fill="#c7bdce"/><circle cx="334" cy="154" r="3" fill="#a1bacd"/><circle cx="272" cy="215" r="3" fill="#a9c4ce"/><circle cx="171" cy="200" r="3" fill="#cdbf9f"/><text x="127" y="102" className="connection-label" transform="rotate(32 127 102)">may involve</text><text x="293" y="213" className="connection-label" transform="rotate(61 293 213)">managed with</text><circle cx="393" cy="64" r="4" fill="#d3e4d4"/><circle cx="174" cy="37" r="3" fill="#cfddd2"/><circle cx="198" cy="285" r="4" fill="#d3e2d8"/></svg>
    <Link href="/explore?topic=asthma" className="hero-center-node"><Lungs size={38} strokeWidth={1.45} /><strong>Asthma</strong><span>CONDITION</span></Link>
    <Link href="/topics/wheezing" className="hero-small-node node-wheezing"><span className="node-orb orb-amber"><EntityIcon id="wheezing" kind="symptom" size={24} /></span><strong>Wheezing</strong><small>Symptom</small></Link>
    <Link href="/topics/allergens" className="hero-small-node node-allergens"><span className="node-orb orb-rose"><EntityIcon id="allergens" kind="risk-factor" size={24} /></span><strong>Allergens</strong><small>Risk factor</small></Link>
    <Link href="/topics/respiratory" className="hero-small-node node-respiratory"><span className="node-orb orb-purple"><Lungs size={26} /></span><strong>Respiratory system</strong><small>Body system</small></Link>
    <Link href="/topics/inhaler-therapy" className="hero-small-node node-medicines"><span className="node-orb orb-blue"><Pill size={23} strokeWidth={1.6} /></span><strong>Inhaled medicines</strong><small>Treatment</small></Link>
    <Link href="/topics/chest-tightness" className="hero-small-node node-chest"><span className="node-orb orb-amber"><Activity size={23} strokeWidth={1.6} /></span><strong>Chest tightness</strong><small>Symptom</small></Link>
    <span className="network-caption"><span /> A little curiosity. A world of connections.</span>
  </div>;
}

export function Dashboard() {
  const { library } = useExplorer();
  const count = (k: string) => library.entities.filter(e => e.kind === k).length;
  const quickLinks = [
    { title: "Conditions", description: "Understand the bigger picture", href: "/conditions", count: count("condition"), icon: Stethoscope, tone: "teal" },
    { title: "Symptoms", description: "Discover possible connections", href: "/symptoms", count: count("symptom"), icon: Activity, tone: "amber" },
    { title: "Treatments", description: "Learn how care can help", href: "/treatments", count: count("treatment") + count("medication"), icon: Pill, tone: "blue" },
    { title: "Body systems", description: "Get to know the human body", href: "/body-systems", count: count("body-system"), icon: BodyIcon, tone: "purple" },
  ];
  const popular = [
    { id: "asthma", image: "lungs", label: "Respiratory", tone: "mint", description: "Understanding your airways and what affects them." },
    { id: "type-2-diabetes", image: "diabetes", label: "Endocrine", tone: "peach", description: "The connections behind blood sugar and insulin." },
    { id: "hypertension", image: "heart", label: "Cardiovascular", tone: "lavender", description: "A closer look at blood pressure and heart health." },
    { id: "migraine", image: "brain", label: "Nervous system", tone: "sky", description: "More than a headache. Explore the full picture." },
  ];
  return <div className="dashboard page-enter">
    <div className="dashboard-heading"><div><h1>Your health knowledge hub</h1><p>A little understanding can open up a whole new perspective.</p></div><span className="educational-pill"><span className="status-dot" /> Curiosity is a healthy habit</span></div>
    <section className="home-hero">
      <div className="hero-copy"><span className="hero-eyebrow"><Network size={13} /> KNOWLEDGE, CONNECTED.</span><h2>See the bigger<br />picture of <span>health.</span></h2><p>Explore how symptoms, conditions, and<br className="desktop-break" /> treatments are connected.</p><SearchBox variant="hero" placeholder="Search conditions, symptoms, treatments..." /><div className="try-search"><span>A place to start:</span><Link href="/topics/asthma">Asthma</Link><Link href="/topics/headache">Headache</Link><Link href="/topics/type-2-diabetes">Diabetes</Link></div></div>
      <HeroNetwork />
    </section>
    <div className="quick-links">{quickLinks.map(item => <Link className="quick-card" href={item.href} key={item.title}><span className={`quick-icon icon-${item.tone}`}><item.icon size={23} /></span><span className="quick-copy"><strong>{item.title}</strong><small>{item.count} topics to explore</small></span><ArrowUpRight size={17} /></Link>)}</div>
    <section className="popular-section"><SectionHeading title="Popular topics" subtitle="A few starting points for your next discovery." href="/conditions" linkLabel="Browse all topics" /><div className="popular-grid">{popular.map(item => {
      const entity = library.entities.find(e => e.id === item.id)!;
      return <article className="popular-card" key={item.id}><Link href={`/topics/${item.id}`} className={`popular-art art-${item.tone}`} aria-label={`Learn about ${entity.name}`}><Image src={`/images/${item.image}.png`} alt="" fill sizes="(max-width: 600px) 45vw, (max-width: 1000px) 36vw, 22vw" /><span className="art-system">{item.label}</span><span className="art-arrow"><ArrowUpRight size={16} /></span></Link><div className="popular-card-body"><div className="popular-card-title"><h3><Link href={`/topics/${item.id}`}>{entity.name}</Link></h3><SaveButton id={item.id} /></div><p>{item.description}</p><Link href={`/explore?topic=${item.id}`} className="popular-connections"><GitBranch size={13} />{connectionCount(library, item.id)} connections<span>Explore <ArrowRight size={13} /></span></Link></div></article>;
    })}</div></section>
    <section className="graph-invitation"><div className="invitation-art"><Network size={40} strokeWidth={1.3} /><span /><span /><span /></div><div><span className="eyebrow">FOLLOW YOUR CURIOSITY</span><h2>One topic. So many connections.</h2><p>Go beyond the definition with our interactive health knowledge graph.</p></div><Link href="/explore" className="button button-primary">Explore health connections <ArrowUpRight size={17} /></Link></section>
    <section className="knowledge-numbers"><SectionHeading title="A growing world of knowledge" subtitle="Real topics. Meaningful relationships. A more connected understanding." /><div className="stats-grid">{[
      { label: "Conditions", value: count("condition"), icon: Stethoscope, tone: "teal" }, { label: "Symptoms", value: count("symptom"), icon: Activity, tone: "amber" }, { label: "Treatments & medicines", value: count("treatment") + count("medication"), icon: Pill, tone: "blue" }, { label: "Connections", value: library.relationships.length, icon: GitBranch, tone: "teal" }, { label: "Body systems", value: count("body-system"), icon: BodyIcon, tone: "purple" },
    ].map(stat => <div className="stat-card" key={stat.label}><span className={`stat-icon icon-${stat.tone}`}><stat.icon size={19} /></span><strong>{stat.value}</strong><span>{stat.label}</span><div className={`stat-bar bar-${stat.tone}`}><i /></div></div>)}</div></section>
    <div className="trusted-strip"><span><ShieldCheck size={19} /><span>Good knowledge starts<br /><strong>with reliable sources.</strong></span></span><div className="source-wordmarks"><a href="https://medlineplus.gov/" target="_blank" rel="noreferrer">Medline<span>Plus</span></a><a href="https://www.nih.gov/" target="_blank" rel="noreferrer" className="nih-mark">NIH <ArrowRight size={17} /></a><a href="https://www.who.int/" target="_blank" rel="noreferrer">WHO</a><a href="https://www.cdc.gov/" target="_blank" rel="noreferrer" className="cdc-mark">CDC</a></div><Link href="/sources" className="text-link">Our sources <ArrowRight size={14} /></Link></div>
    <div className="home-helper"><BookOpen size={15} /><span>Made for learning, not self-diagnosis.</span><Link href="/about"><CircleHelp size={14} /> How to use this explorer</Link><Sparkles size={14} className="helper-sparkle" /></div>
  </div>;
}
