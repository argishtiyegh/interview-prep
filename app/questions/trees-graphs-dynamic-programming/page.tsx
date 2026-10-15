import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function TreesGraphsDynamicProgrammingPage() {
  return <LibraryShell question={questionBySlug('trees-graphs-dynamic-programming')!} />;
}
