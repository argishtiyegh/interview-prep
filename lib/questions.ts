import { hashMapPages } from '@/components/answers/hash-map-answer';
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
  pages: ReadingPage[];
}

export const questions: QuestionEntry[] = [{
  title: 'How HashMap and HashSet Works',
  slug: 'how-java-hashmap-works',
  category: 'Collections',
  summary: 'Buckets, collisions, equality, mutable-key failures, safe key design, and the HashMap inside every HashSet.',
  updated: 'September 2026',
  readingTime: '16 min read',
  pages: hashMapPages,
}];

export const questionBySlug = (slug: string) => questions.find((q) => q.slug === slug);
