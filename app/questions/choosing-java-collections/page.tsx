import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function JavaCollectionsQuestionPage() {
  return <LibraryShell question={questionBySlug('choosing-java-collections')!} />;
}
