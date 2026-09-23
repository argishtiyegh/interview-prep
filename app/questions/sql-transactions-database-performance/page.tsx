import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function SqlDatabaseQuestionPage() {
  return <LibraryShell question={questionBySlug('sql-transactions-database-performance')!} />;
}
