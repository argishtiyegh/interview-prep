import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function JvmMemoryPerformanceQuestionPage() {
  return <LibraryShell question={questionBySlug('jvm-memory-performance')!} />;
}
