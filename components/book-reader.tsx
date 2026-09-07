'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ReadingPage } from '@/lib/reading';

function PageSheet({ page, number, total, duplicate = false }: { page: ReadingPage; number: number; total: number; duplicate?: boolean }) {
  const { Content } = page;
  return <article className="book-page" data-reader-page={number} aria-label={`Page ${number}: ${page.title}`}>
    <div className="book-page-heading">
      <span>{page.chapter}</span><span>{number} / {total}</span>
    </div>
    <h2 tabIndex={-1} data-page-heading={!duplicate ? '' : undefined}>{page.title}</h2>
    <div className="book-page-content"><Content /></div>
    <span className="book-folio" aria-hidden="true">{number}</span>
  </article>;
}

function PageControls({ start, step, total, goTo }: { start: number; step: number; total: number; goTo: (page: number) => void }) {
  const last = step === 2 ? Math.min(start + 1, total) : start;
  return <div className="book-controls">
    <Button variant="outline" size="lg" onClick={() => goTo(Math.max(1, start - step))} disabled={start === 1} aria-label="Go to previous pages"><ArrowLeft /> Previous</Button>
    <div className="book-progress" aria-live="polite"><strong>{step === 2 ? `Pages ${start}–${last} of ${total}` : `Page ${start} of ${total}`}</strong><span>{Math.round((last / total) * 100)}% complete</span></div>
    <Button variant="outline" size="lg" onClick={() => goTo(Math.min(total, start + step))} disabled={last === total} aria-label="Go to next pages">Next <ArrowRight /></Button>
  </div>;
}

export function BookReader({ pages }: { pages: ReadingPage[] }) {
  const [current, setCurrent] = useState(1);
  const spreadStart = Math.floor((current - 1) / 2) * 2 + 1;

  const goTo = useCallback((page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page));
    window.history.pushState({}, '', url);
    setCurrent(page);
  }, []);

  useEffect(() => {
    const readPageFromUrl = () => {
      const requested = Number(new URL(window.location.href).searchParams.get('page') ?? '1');
      setCurrent(Number.isInteger(requested) && requested >= 1 && requested <= pages.length ? requested : 1);
    };
    readPageFromUrl();
    window.addEventListener('popstate', readPageFromUrl);
    return () => window.removeEventListener('popstate', readPageFromUrl);
  }, [pages.length]);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => {
      const layout = window.matchMedia('(min-width: 1280px)').matches ? '.book-desktop' : '.book-mobile';
      document.querySelector<HTMLElement>(`${layout} [data-reader-page] h2`)?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 40);
    return () => window.clearTimeout(focusTimer);
  }, [current]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement;
      if (target.closest('button, a, input, textarea, select, summary, [role="menuitem"], [contenteditable="true"]')) return;
      const wide = window.matchMedia('(min-width: 1280px)').matches;
      const start = wide ? spreadStart : current;
      const step = wide ? 2 : 1;
      if (event.key === 'ArrowLeft' && start > 1) { event.preventDefault(); goTo(Math.max(1, start - step)); }
      if (event.key === 'ArrowRight' && Math.min(start + step - 1, pages.length) < pages.length) { event.preventDefault(); goTo(Math.min(pages.length, start + step)); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current, spreadStart, pages.length, goTo]);

  return <>
    <div className="book-toolbar">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" className="chapter-trigger" />}><BookOpen /> Chapters <ChevronDown /></DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-[min(92vw,360px)] bg-[#fffdf7] p-2">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 py-2 text-slate-600">Jump to a page</DropdownMenuLabel>
            {pages.map((page, index) => <DropdownMenuItem key={page.id} onClick={() => goTo(index + 1)} className="gap-3 px-3 py-2.5 text-slate-800"><span className="chapter-number">{index + 1}</span><span>{page.title}</span></DropdownMenuItem>)}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="hidden text-sm font-medium text-slate-600 sm:block">Use ← and → to turn pages</span>
    </div>

    <div className="book-desktop hidden xl:block">
      <div className="book-spread">
        <PageSheet page={pages[spreadStart - 1]} number={spreadStart} total={pages.length} />
        {pages[spreadStart] ? <PageSheet page={pages[spreadStart]} number={spreadStart + 1} total={pages.length} /> : <div className="book-page book-page-blank" aria-hidden="true" />}
      </div>
      <PageControls start={spreadStart} step={2} total={pages.length} goTo={goTo} />
    </div>

    <div className="book-mobile xl:hidden">
      <PageSheet page={pages[current - 1]} number={current} total={pages.length} duplicate />
      <PageControls start={current} step={1} total={pages.length} goTo={goTo} />
    </div>
  </>;
}
