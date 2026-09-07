import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function HashMapQuestionPage() {
  return <LibraryShell question={questionBySlug('how-java-hashmap-works')!} />;
}
