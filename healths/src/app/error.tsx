"use client";
import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ShieldCheck } from "lucide-react";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Explorer page error", error); }, [error]);
  return <main className="standalone-message"><span className="message-icon"><ShieldCheck size={38}/></span><p className="eyebrow">LET’S RECONNECT</p><h1>A connection needs a moment.</h1><p>We couldn’t load the health knowledge library. Your saved topics are safe. Please try again shortly.</p><div><button className="button button-primary" onClick={reset}><RefreshCw size={16}/>Try again</button><Link href="/" className="button button-secondary">Back to home</Link></div><small>For urgent health concerns, contact a qualified healthcare professional or local emergency services.</small></main>;
}
