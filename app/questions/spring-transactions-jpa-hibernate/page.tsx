import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function SpringJpaQuestionPage() {
  return <LibraryShell question={questionBySlug('spring-transactions-jpa-hibernate')!} />;
}
