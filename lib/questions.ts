import { hashMapPages } from '@/components/answers/hash-map-answer';
import { javaCollectionsPages } from '@/components/answers/java-collections-answer';
import type { ReadingPage } from '@/lib/reading';

export const categories = [
  'Collections', 'Design Patterns', 'Databases', 'Threads & Concurrency',
  'System Design', 'JVM', 'Spring',
] as const;

export type Category = (typeof categories)[number];

export interface QuestionEntry {
  title: string;
  slug: string;
  category: Category;
  summary: string;
  updated: string;
  readingTime: string;
  pageCount: number;
  pages: ReadingPage[];
}

export const questions: QuestionEntry[] = [{
  title: 'How HashMap and HashSet Works',
  slug: 'how-java-hashmap-works',
  category: 'Collections',
  summary: 'Buckets, collisions, equality, mutable-key failures, safe key design, and the HashMap inside every HashSet.',
  updated: 'September 2026',
  readingTime: '16 min read',
  pageCount: 8,
  pages: hashMapPages,
}, {
  title: 'Choosing Java Collections and Equality Contracts',
  slug: 'choosing-java-collections',
  category: 'Collections',
  summary: 'Equality contracts, collection selection, map tradeoffs, coding questions, and concurrent updates.',
  updated: 'September 2026',
  readingTime: '39 min read',
  pageCount: 23,
  pages: javaCollectionsPages,
}];

export const questionBySlug = (slug: string) => questions.find((q) => q.slug === slug);
