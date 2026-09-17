import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function JavaConcurrencyQuestionPage() {
  return <LibraryShell question={questionBySlug('java-thread-safety-concurrency')!} />;
}
