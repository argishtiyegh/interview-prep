import Link from 'next/link';
import { ArrowRight, BookOpen, Library, Timer } from 'lucide-react';
import { categories, questions } from '@/lib/questions';

export const dynamic = 'force-static';

export default function Home() {
  return <div className="library-home min-h-screen">
    <header className="library-home-header">
      <Link href="/" className="library-home-brand" aria-label="Backend Field Notes home">
        <span className="library-home-mark"><BookOpen /></span>
        <span><strong>Backend Field Notes</strong><small>Java interview library</small></span>
      </Link>
      <span className="library-home-count"><Library /> {questions.length} reviewed chapters</span>
    </header>

    <main className="library-home-main">
      <section className="library-home-intro" aria-labelledby="library-title">
        <p className="eyebrow">Java and backend interview preparation</p>
        <h1 id="library-title">Choose a chapter</h1>
        <p>Open a reviewed topic and study it as a readable book. Each chapter combines concise interview answers, internal implementation details, examples, diagrams, and important edge cases.</p>
      </section>

      <section className="chapter-catalog" aria-label="Available interview chapters">
        {questions.map((question, index) => <Link key={question.slug} href={`/questions/${question.slug}`} className="chapter-card">
          <div className="chapter-card-top"><span>Chapter {index + 1}</span><span>{question.category}</span></div>
          <h2>{question.title}</h2>
          <p>{question.summary}</p>
          <div className="chapter-card-meta"><span><BookOpen /> {question.pageCount} pages</span><span><Timer /> {question.readingTime}</span></div>
          <strong className="chapter-card-action">Start reading <ArrowRight /></strong>
        </Link>)}
      </section>

      <section className="category-catalog" aria-labelledby="category-title">
        <div><p className="eyebrow">Library roadmap</p><h2 id="category-title">Categories</h2></div>
        <div className="category-grid">
          {categories.map((category) => {
            const count = questions.filter((question) => question.category === category).length;
            return <article key={category} className={count ? 'category-card category-card-ready' : 'category-card'}>
              <strong>{category}</strong>
              <span>{count ? `${count} ${count === 1 ? 'chapter' : 'chapters'}` : 'Chapters coming later'}</span>
            </article>;
          })}
        </div>
      </section>
    </main>
  </div>;
}
