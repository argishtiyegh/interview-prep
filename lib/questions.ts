import { hashMapPages } from '@/components/answers/hash-map-answer';
import { javaCollectionsPages } from '@/components/answers/java-collections-answer';
import { javaConcurrencyPages } from '@/components/answers/java-concurrency-answer';
import { javaExecutorsPages } from '@/components/answers/java-executors-answer';
import { javaFundamentalsPages } from '@/components/answers/java-fundamentals-answer';
import { javaGenericsPages } from '@/components/answers/java-generics-answer';
import { javaStreamsPages } from '@/components/answers/java-streams-answer';
import type { ReadingPage } from '@/lib/reading';

export const categories = [
  'Collections', 'Java Fundamentals', 'Design Patterns', 'Databases', 'Threads & Concurrency',
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
}, {
  title: 'Java Streams and Collection Processing',
  slug: 'java-streams-collection-processing',
  category: 'Collections',
  summary: 'Pipeline execution, laziness, transformations, reductions, collectors, correctness, and parallel-stream judgment.',
  updated: 'September 2026',
  readingTime: '34 min read',
  pageCount: 16,
  pages: javaStreamsPages,
}, {
  title: 'Java Fundamentals, Strings, and Object Design',
  slug: 'java-fundamentals-strings-object-design',
  category: 'Java Fundamentals',
  summary: 'Object design, dispatch, values and references, exceptions, immutability, strings, wrappers, Optional, and precise money handling.',
  updated: 'September 2026',
  readingTime: '46 min read',
  pageCount: 22,
  pages: javaFundamentalsPages,
}, {
  title: 'Java Generics and Type Safety',
  slug: 'java-generics-type-safety',
  category: 'Java Fundamentals',
  summary: 'Type parameters, invariance, wildcards, PECS, erasure, raw types, heap pollution, and runtime restrictions.',
  updated: 'September 2026',
  readingTime: '29 min read',
  pageCount: 14,
  pages: javaGenericsPages,
}, {
  title: 'Thread Safety and Concurrency',
  slug: 'java-thread-safety-concurrency',
  category: 'Threads & Concurrency',
  summary: 'Races, the memory model, synchronization, safe publication, concurrent collections, liveness, and Spring singleton safety.',
  updated: 'September 2026',
  readingTime: '43 min read',
  pageCount: 18,
  pages: javaConcurrencyPages,
}, {
  title: 'Executors, Async Programming, and Virtual Threads',
  slug: 'java-executors-async-virtual-threads',
  category: 'Threads & Concurrency',
  summary: 'Thread pools, saturation, CompletableFuture graphs, timeouts, virtual threads, downstream limits, and backpressure.',
  updated: 'September 2026',
  readingTime: '48 min read',
  pageCount: 20,
  pages: javaExecutorsPages,
}];

export const questionBySlug = (slug: string) => questions.find((q) => q.slug === slug);
