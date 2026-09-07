import { notFound } from 'next/navigation';
import { LibraryShell } from '@/components/library-shell';
import { questionBySlug, questions } from '@/lib/questions';

export function generateStaticParams() {
  return questions.map(({ slug }) => ({ slug }));
}

export default async function QuestionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const question = questionBySlug(slug);
  if (!question) notFound();
  return <LibraryShell question={question} />;
}
