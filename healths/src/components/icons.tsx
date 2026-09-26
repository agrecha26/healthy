import { Activity, Brain, Bone, HeartPulse, Droplets, ShieldPlus, Flower2, Stethoscope, Pill, Sparkles, Wind } from "lucide-react";
import type { EntityKind } from "@/lib/types";

export function BrandMark({ small = false }: { small?: boolean }) {
  return <svg width={small ? 30 : 40} height={small ? 30 : 40} viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#16867d"/><path d="M12 12L28 28M28 12L12 28M12 12H28V28H12V12Z" stroke="#a4d8cd" strokeWidth="1.5"/><path d="M20 12V28M12 20H28" stroke="white" strokeWidth="4" strokeLinecap="round"/><circle cx="12" cy="12" r="3" fill="#d3eee5"/><circle cx="28" cy="12" r="3" fill="#d3eee5"/><circle cx="12" cy="28" r="3" fill="#d3eee5"/><circle cx="28" cy="28" r="3" fill="#d3eee5"/><circle cx="20" cy="20" r="4" fill="white"/></svg>;
}

export function Lungs({ size = 24, className = "", strokeWidth = 1.6 }: { size?: number; className?: string; strokeWidth?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M14 5v9l-4 4m8-13v9l4 4M14 10h4M14 7h4"/><path d="M12 10c-2.4-2.5-4.7 1.2-6.4 4.3C3.7 17.8 2.5 22.6 4.4 26c1.1 2 6.4-.4 8.6-2.4V13m7-3c2.4-2.5 4.7 1.2 6.4 4.3 1.9 3.5 3.1 8.3 1.2 11.7-1.1 2-6.4-.4-8.6-2.4V13"/><path d="M10 18l-2 4m2-4-4 1m16-1 2 4m-2-4 4 1"/></svg>;
}

export function BodyIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 28 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><circle cx="14" cy="5" r="3.2"/><path d="M10 10h8l5 8a1.6 1.6 0 0 1-2.6 1.7L18 16v5l1 8a1.6 1.6 0 0 1-3.2.3L14 22l-1.8 7.3A1.6 1.6 0 0 1 9 29l1-8v-5l-2.4 3.7A1.6 1.6 0 0 1 5 18l5-8Z"/></svg>;
}

export function EntityIcon({ id = "", kind = "condition", size = 22, className = "" }: { id?: string; kind?: EntityKind; size?: number; className?: string }) {
  const props = { size, className, strokeWidth: 1.7 };
  if (["respiratory", "asthma", "copd", "pneumonia", "influenza", "sleep-apnea"].includes(id)) return <Lungs {...props} />;
  if (["cardiovascular", "hypertension", "coronary-artery-disease", "chest-pain"].includes(id)) return <HeartPulse {...props} />;
  if (["nervous", "migraine", "headache", "depression", "anxiety-disorders"].includes(id)) return <Brain {...props} />;
  if (["type-2-diabetes", "endocrine", "urinary", "iron-deficiency-anemia"].includes(id)) return <Droplets {...props} />;
  if (["musculoskeletal", "osteoarthritis", "osteoporosis"].includes(id)) return <Bone {...props} />;
  if (id === "immune") return <ShieldPlus {...props} />;
  if (id === "allergens" || id === "allergic-rhinitis") return <Flower2 {...props} />;
  if (["wheezing", "shortness-of-breath"].includes(id)) return <Wind {...props} />;
  if (kind === "body-system") return <BodyIcon {...props} />;
  if (kind === "treatment" || kind === "medication") return <Pill {...props} />;
  if (kind === "symptom") return <Activity {...props} />;
  if (kind === "risk-factor") return <Sparkles {...props} />;
  return <Stethoscope {...props} />;
}
