'use client';

import Link from 'next/link';
import { ChevronDown, Code2, Library, Menu } from 'lucide-react';
import { categories, questions, type QuestionEntry } from '@/lib/questions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { BookReader } from '@/components/book-reader';

function Brand() {
  return <Link href="/" className="flex items-center gap-3" aria-label="Backend Field Notes home">
    <span className="grid size-9 place-items-center rounded-xl bg-cyan-400 text-slate-950 shadow-[0_6px_16px_rgba(34,211,238,.24)]"><Code2 className="size-5" /></span>
    <span><strong className="block text-base tracking-[-.02em] text-white">Backend Field Notes</strong><small className="block text-[11px] font-bold uppercase tracking-[.12em] text-slate-400">Interview Library</small></span>
  </Link>;
}

function LibraryNav({ currentSlug }: { currentSlug: string }) {
  return <nav className="space-y-1" aria-label="Question categories">
    {categories.map((category) => {
      const items = questions.filter((q) => q.category === category);
      return <Collapsible key={category} defaultOpen={category === 'Collections'}>
        <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left text-[15px] font-semibold text-slate-200 hover:bg-white/10 hover:text-white">
          <span>{category}</span>
          <span className="flex items-center gap-2"><span className="text-xs tabular-nums text-slate-400">{items.length || '—'}</span><ChevronDown className="size-3.5 text-slate-400 transition-transform group-data-[panel-open]:rotate-180" /></span>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-3 border-l border-slate-800 pl-3">
          {items.length ? items.map((item) => <Link key={item.slug} href={`/questions/${item.slug}`} aria-current={item.slug === currentSlug ? 'page' : undefined} className={`my-1 block rounded-lg px-3 py-2.5 text-sm leading-5 ${item.slug === currentSlug ? 'bg-cyan-400/15 font-semibold text-cyan-200 ring-1 ring-inset ring-cyan-400/30' : 'text-slate-400 hover:text-white'}`}>{item.title}</Link>) : <span className="block px-3 py-2 text-[13px] italic text-slate-500">Answers coming later</span>}
        </CollapsibleContent>
      </Collapsible>;
    })}
  </nav>;
}

export function LibraryShell({ question }: { question: QuestionEntry }) {
  return <div className="reader-shell min-h-screen text-slate-900">
    <header className="reader-header">
      <Sheet>
        <SheetTrigger render={<Button variant="outline" className="library-trigger" aria-label="Open interview library" />}><Menu /> <span>Library</span></SheetTrigger>
        <SheetContent side="left" className="w-[min(90vw,370px)] border-slate-700 bg-[#17324d] p-0 text-white">
          <SheetHeader className="border-b border-white/15 p-5"><SheetTitle><Brand /></SheetTitle><SheetDescription className="mt-2 text-sm text-slate-300">Browse categories and reviewed questions.</SheetDescription></SheetHeader>
          <div className="overflow-y-auto p-4"><p className="mb-3 px-2 text-[11px] font-extrabold uppercase tracking-[.14em] text-slate-400">Topics</p><LibraryNav currentSlug={question.slug} /></div>
        </SheetContent>
      </Sheet>

      <div className="reader-title">
        <span>{question.category}</span>
        <strong>{question.title}</strong>
      </div>
      <div className="reader-meta"><Library className="size-4" /><span className="hidden sm:inline">{question.readingTime}</span><span className="hidden md:inline">· Updated {question.updated}</span></div>
    </header>

    <main className="reader-stage">
      <BookReader pages={question.pages} />
    </main>
  </div>;
}
