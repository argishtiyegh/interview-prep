import { LibraryShell } from '@/components/library-shell';
import { questions } from '@/lib/questions';

export const dynamic = 'force-static';

export default function Home() {
  return <LibraryShell question={questions[0]} />;
}
