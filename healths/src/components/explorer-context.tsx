"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { KnowledgeLibrary } from "@/lib/types";
import { Check, AlertCircle, X } from "lucide-react";

interface ExplorerContextValue {
  library: KnowledgeLibrary;
  savedIds: string[];
  savesReady: boolean;
  pendingSaves: string[];
  toggleSaved: (id: string) => Promise<void>;
  notify: (message: string, error?: boolean) => void;
}
const ExplorerContext = createContext<ExplorerContextValue | null>(null);
export function ExplorerProvider({ library, children }: { library: KnowledgeLibrary; children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savesReady, setSavesReady] = useState(false);
  const [pendingSaves, setPendingSaves] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; error: boolean } | null>(null);
  const notify = useCallback((message: string, error = false) => setToast({ message, error }), []);
  useEffect(() => {
    let active = true;
    fetch("/api/bookmarks", { cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error("Saved topics are temporarily unavailable.");
      const result = await response.json();
      if (active) setSavedIds(result.ids);
    }).catch(error => { if (active) notify(error.message, true); }).finally(() => { if (active) setSavesReady(true); });
    return () => { active = false; };
  }, [notify]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timeout);
  }, [toast]);
  const toggleSaved = useCallback(async (id: string) => {
    if (pendingSaves.includes(id)) return;
    const wasSaved = savedIds.includes(id);
    setPendingSaves(current => [...current, id]);
    try {
      const response = await fetch("/api/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: wasSaved ? "remove" : "save" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update saved topics.");
      setSavedIds(current => result.saved ? Array.from(new Set([...current, id])) : current.filter(item => item !== id));
      notify(result.saved ? "Topic saved to your collection" : "Topic removed from your collection");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to save. Please try again.", true);
    } finally {
      setPendingSaves(current => current.filter(item => item !== id));
    }
  }, [notify, pendingSaves, savedIds]);
  return <ExplorerContext.Provider value={{ library, savedIds, savesReady, pendingSaves, toggleSaved, notify }}>{children}{toast && <div className={`toast ${toast.error ? "toast-error" : ""}`} role="status">{toast.error ? <AlertCircle size={19} /> : <Check size={19} />}<span>{toast.message}</span><button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={16} /></button></div>}</ExplorerContext.Provider>;
}
export function useExplorer() {
  const context = useContext(ExplorerContext);
  if (!context) throw new Error("ExplorerProvider is required");
  return context;
}
