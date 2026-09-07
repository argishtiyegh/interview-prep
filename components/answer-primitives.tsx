'use client';

import { useState, type ReactNode } from 'react';
import { Check, Clipboard, Info, Lightbulb, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return <section id={id} className="scroll-mt-24 pt-16"><p className="eyebrow">{eyebrow}</p><h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-.025em] text-slate-950 sm:text-4xl">{title}</h2><div className="article-copy mt-7">{children}</div></section>;
}

export function Callout({ tone = 'info', title, children }: { tone?: 'info'|'warning'|'tip'; title: string; children: ReactNode }) {
  const Icon = tone === 'warning' ? TriangleAlert : tone === 'tip' ? Lightbulb : Info;
  return <aside className={`callout callout-${tone}`}><Icon className="mt-0.5 size-5 shrink-0" /><div><strong className="block text-base text-slate-950">{title}</strong><div className="mt-1.5 text-[15px] leading-7 text-slate-700">{children}</div></div></aside>;
}

export function CodeBlock({ code, label = 'Java' }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const highlighted = code.split(/(\b(?:new|var|class|record|public|private|final|int|return|if|else|null|true|false|extends|implements|static|void)\b|"[^"]*"|\/\/.*$)/gm);
  return <div className="code-shell not-prose">
    <div className="code-bar"><span>{label}</span><Button variant="ghost" size="sm" onClick={copy} aria-label="Copy code">{copied ? <Check /> : <Clipboard />}{copied ? 'Copied' : 'Copy'}</Button></div>
    <pre><code>{highlighted.map((part, i) => <span key={i} className={part.startsWith('//') ? 'tok-comment' : part.startsWith('"') ? 'tok-string' : /^(new|var|class|record|public|private|final|int|return|if|else|null|true|false|extends|implements|static|void)$/.test(part) ? 'tok-keyword' : undefined}>{part}</span>)}</code></pre>
  </div>;
}

export function Figure({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-slate-300 bg-white"><div className="p-5 sm:p-7">{children}</div><figcaption className="border-t border-slate-200 bg-slate-50 px-5 py-3.5 text-[13px] font-medium leading-6 text-slate-700"><strong className="text-slate-950">Simplified model.</strong> {caption}</figcaption></figure>;
}
