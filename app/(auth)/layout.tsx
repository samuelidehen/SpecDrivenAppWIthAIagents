import { FileText, History, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: History,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-base">
      <div className="relative hidden w-1/2 flex-col overflow-hidden border-r border-surface-border px-16 py-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 0%, var(--accent-primary-dim), transparent 60%), radial-gradient(ellipse 70% 50% at 100% 100%, var(--accent-ai-text), transparent 45%)",
            opacity: 0.16,
          }}
        />

        <div className="relative flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-brand" />
          <span className="text-base font-bold text-copy-primary">
            Ghost AI
          </span>
        </div>

        <div className="relative flex flex-1 flex-col justify-center">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-copy-primary">
            Design systems at the speed of thought.
          </h1>
          <p className="mt-4 text-lg text-copy-secondary">
            Describe your architecture in plain English. Ghost AI maps it to a
            shared canvas your whole team can refine in real time.
          </p>

          <ul className="mt-10 space-y-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-brand">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-copy-primary">
                    {title}
                  </p>
                  <p className="text-sm text-copy-muted">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-copy-faint">
          © {new Date().getFullYear()} Ghost AI. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        {children}
      </div>
    </div>
  );
}
