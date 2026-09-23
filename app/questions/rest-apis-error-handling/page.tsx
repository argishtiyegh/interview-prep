import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';

export const dynamic = 'force-static';

export default function RestApiQuestionPage() {
  return <LibraryShell question={questionBySlug('rest-apis-error-handling')!} />;
}
