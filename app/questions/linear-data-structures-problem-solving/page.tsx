import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function LinearDataStructuresPage() {
  return <LibraryShell question={questionBySlug('linear-data-structures-problem-solving')!} />;
}
