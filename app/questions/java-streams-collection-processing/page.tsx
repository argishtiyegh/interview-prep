import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function JavaStreamsQuestionPage() {
  return <LibraryShell question={questionBySlug('java-streams-collection-processing')!} />;
}
