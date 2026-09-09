'use client';

import Link from 'next/link';
import { BookOpen, Library } from 'lucide-react';
import type { QuestionEntry } from '@/lib/questions';
import { BookReader } from '@/components/book-reader';

export function LibraryShell({ question }: { question: QuestionEntry }) {
  return <div className="reader-shell min-h-screen text-slate-900">
    <header className="reader-header">
      <Link href="/" className="library-trigger inline-flex items-center rounded-md border" aria-label="View all interview chapters"><BookOpen className="size-4" /> <span>All chapters</span></Link>

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
