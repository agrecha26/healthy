import Link from "next/link";
import { ArrowRight, Network } from "lucide-react";
export default function NotFound() {
  return <main className="standalone-message"><span className="message-icon"><Network size={40}/></span><p className="eyebrow">A NEW DIRECTION</p><h1>This connection hasn’t been mapped.</h1><p>We couldn’t find that page or topic. There are plenty of other discoveries waiting in the knowledge library.</p><div><Link href="/" className="button button-primary">Back to your dashboard<ArrowRight size={16}/></Link><Link href="/conditions" className="button button-secondary">Browse conditions</Link></div></main>;
}
