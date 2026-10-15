import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function AlgorithmsComplexityPage() {
  return <LibraryShell question={questionBySlug('algorithms-complexity-searching-sorting')!} />;
}
