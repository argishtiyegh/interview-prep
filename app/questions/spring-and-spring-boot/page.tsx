import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function SpringBootQuestionPage() {
  return <LibraryShell question={questionBySlug('spring-and-spring-boot')!} />;
}
