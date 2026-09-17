import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function JavaExecutorsQuestionPage() {
  return <LibraryShell question={questionBySlug('java-executors-async-virtual-threads')!} />;
}
