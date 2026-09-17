import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function JavaGenericsQuestionPage() {
  return <LibraryShell question={questionBySlug('java-generics-type-safety')!} />;
}
