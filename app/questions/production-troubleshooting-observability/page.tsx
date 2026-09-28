import { LibraryShell } from '@/components/library-shell';
import { questionBySlug } from '@/lib/questions';
export const dynamic = 'force-static';
export default function Page(){return <LibraryShell question={questionBySlug('production-troubleshooting-observability')!}/>;}
