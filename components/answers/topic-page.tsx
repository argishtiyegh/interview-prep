'use client';

import { ArrowRight } from 'lucide-react';
import { Callout, CodeBlock, Figure } from '@/components/answer-primitives';
import type { ReadingPage } from '@/lib/reading';

export interface TopicSection {
  title: string;
  text?: string;
  bullets?: string[];
}

export interface TopicPageSpec {
  id: string;
  chapter: string;
  title: string;
  answer: string;
  sections?: TopicSection[];
  flow?: string[];
  flowCaption?: string;
  comparisons?: Array<{ title: string; text: string }>;
  code?: string;
  codeLabel?: string;
  callout?: { title: string; text: string; tone?: 'info' | 'warning' | 'tip' };
  links?: Array<{ label: string; href: string }>;
}

function TopicPage({ spec }: { spec: TopicPageSpec }) {
  return <div className="article-copy">
    <div className="answer-card"><p>{spec.answer}</p></div>
    {spec.flow && <Figure caption={spec.flowCaption ?? 'Follow the sequence from left to right; each stage explains a distinct responsibility.'}>
      <div className="grid gap-3 font-sans text-sm sm:grid-cols-2 lg:grid-cols-4">
        {spec.flow.map((step, index) => <div key={step} className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 p-4">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-900">{index + 1}</span>
          <span className="font-semibold text-slate-800">{step}</span>
          {index < spec.flow!.length - 1 && <ArrowRight className="ml-auto hidden size-4 text-cyan-700 lg:block" />}
        </div>)}
      </div>
    </Figure>}
    {spec.comparisons && <div className="grid gap-4 sm:grid-cols-2">
      {spec.comparisons.map((item) => <section key={item.title} className="rounded-2xl border border-slate-300 bg-slate-50 p-5">
        <h3 className="mt-0 text-xl">{item.title}</h3><p className="mb-0">{item.text}</p>
      </section>)}
    </div>}
    {spec.sections?.map((section) => <section key={section.title}>
      <h3>{section.title}</h3>
      {section.text && <p>{section.text}</p>}
      {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
    </section>)}
    {spec.code && <CodeBlock code={spec.code} label={spec.codeLabel ?? 'Example'} />}
    {spec.callout && <Callout title={spec.callout.title} tone={spec.callout.tone}>{spec.callout.text}</Callout>}
    {spec.links && <div className="sources"><p className="eyebrow">Primary references</p>{spec.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <ArrowRight /></a>)}</div>}
  </div>;
}

export function createTopicPages(specs: TopicPageSpec[]): ReadingPage[] {
  return specs.map((spec) => ({
    id: spec.id,
    chapter: spec.chapter,
    title: spec.title,
    Content: function TopicPageContent() { return <TopicPage spec={spec} />; },
  }));
}
