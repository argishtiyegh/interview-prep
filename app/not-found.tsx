import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="eyebrow">404 · Note not found</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">That interview answer is not in the library.</h1>
        <p className="mt-4 leading-7 text-slate-600">The link may be outdated, or this question has not been written yet.</p>
        <Link href="/questions/how-java-hashmap-works" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">
          <ArrowLeft className="size-4" /> Open the HashMap answer
        </Link>
      </div>
    </main>
  );
}
