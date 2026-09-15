import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function JavaFundamentalsQuestionPage() {
  return <LibraryShell question={questionBySlug('java-fundamentals-strings-object-design')!} />;
}
