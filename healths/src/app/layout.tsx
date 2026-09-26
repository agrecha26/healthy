import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./refinements.css";
import "./option-b.css";

export const metadata: Metadata = {
  title: { default: "Health Atlas — A clearer picture of health", template: "%s | Health Atlas" },
  description: "Explore how symptoms, conditions, treatments, and body systems are connected. An educational health knowledge graph grounded in reliable references—not a diagnostic tool.",
  applicationName: "Health Atlas",
  icons: { icon: "/icon.svg" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#16867d" };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
