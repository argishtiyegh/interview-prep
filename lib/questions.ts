import { hashMapPages } from '@/components/answers/hash-map-answer';
import { javaCollectionsPages } from '@/components/answers/java-collections-answer';
import { javaConcurrencyPages } from '@/components/answers/java-concurrency-answer';
import { javaExecutorsPages } from '@/components/answers/java-executors-answer';
import { javaFundamentalsPages } from '@/components/answers/java-fundamentals-answer';
import { javaGenericsPages } from '@/components/answers/java-generics-answer';
import { jvmMemoryPerformancePages } from '@/components/answers/jvm-memory-performance-answer';
import { restApiPages } from '@/components/answers/rest-api-answer';
import { springBootPages } from '@/components/answers/spring-boot-answer';
import { springJpaHibernatePages } from '@/components/answers/spring-jpa-hibernate-answer';
import { sqlDatabasePerformancePages } from '@/components/answers/sql-database-performance-answer';
import { javaStreamsPages } from '@/components/answers/java-streams-answer';
import { architectureMicroservicesPages } from '@/components/answers/architecture-microservices-answer';
import { architecturePatternsPages } from '@/components/answers/architecture-patterns-answer';
import { cachingPages } from '@/components/answers/caching-answer';
import { cloudDeploymentPages } from '@/components/answers/cloud-deployment-answer';
import { distributedSystemsPages } from '@/components/answers/distributed-systems-answer';
import { messagingEventDrivenPages } from '@/components/answers/messaging-event-driven-answer';
import { networkingSecurityPages } from '@/components/answers/networking-security-answer';
import { productionObservabilityPages } from '@/components/answers/production-observability-answer';
import { testingPages } from '@/components/answers/testing-answer';
import type { ReadingPage } from '@/lib/reading';

export const categories = [
  'Collections', 'Java Fundamentals', 'Design Patterns', 'Databases', 'Threads & Concurrency',
  'System Design', 'JVM', 'Spring', 'Operations', 'Testing', 'Security & Networking',
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
}, {
  title: 'JVM, Memory, and Performance',
  slug: 'jvm-memory-performance',
  category: 'JVM',
  summary: 'Memory areas, allocation, garbage collection, leaks, JIT, containers, collectors, and production diagnostic tools.',
  updated: 'September 2026',
  readingTime: '62 min read',
  pageCount: 28,
  pages: jvmMemoryPerformancePages,
}, {
  title: 'Spring and Spring Boot',
  slug: 'spring-and-spring-boot',
  category: 'Spring',
  summary: 'IoC, bean lifecycles, proxies, MVC request flow, configuration, operations, web-stack choices, and Boot 4 migration.',
  updated: 'September 2026',
  readingTime: '45 min read',
  pageCount: 20,
  pages: springBootPages,
}, {
  title: 'SQL, Transactions, and Database Performance',
  slug: 'sql-transactions-database-performance',
  category: 'Databases',
  summary: 'ACID, isolation, MVCC, locking, indexes, execution plans, pooling, pagination, integrity, and scaling.',
  updated: 'September 2026',
  readingTime: '60 min read',
  pageCount: 26,
  pages: sqlDatabasePerformancePages,
}, {
  title: 'Spring Transactions, JPA, and Hibernate',
  slug: 'spring-transactions-jpa-hibernate',
  category: 'Spring',
  summary: 'Transaction proxies, propagation, persistence contexts, fetching, mappings, batching, caches, and locking.',
  updated: 'September 2026',
  readingTime: '58 min read',
  pageCount: 25,
  pages: springJpaHibernatePages,
}, {
  title: 'REST APIs and Error Handling',
  slug: 'rest-apis-error-handling',
  category: 'System Design',
  summary: 'HTTP semantics, validation, Problem Details, pagination, compatibility, deadlines, idempotency, and resilience.',
  updated: 'September 2026',
  readingTime: '40 min read',
  pageCount: 17,
  pages: restApiPages,
}, {
  title: 'Architecture, Microservices, and Scalability',
  slug: 'architecture-microservices-scalability',
  category: 'System Design',
  summary: 'Architecture boundaries, communication, scaling, data ownership, CQRS, gateways, consistency, and migration judgment.',
  updated: 'September 2026', readingTime: '43 min read', pageCount: 13, pages: architectureMicroservicesPages,
}, {
  title: 'Distributed Systems and Resilience',
  slug: 'distributed-systems-resilience',
  category: 'System Design',
  summary: 'Partial failure, deadlines, retries, idempotency, isolation, sagas, tracing, duplicates, and recovery.',
  updated: 'September 2026', readingTime: '36 min read', pageCount: 12, pages: distributedSystemsPages,
}, {
  title: 'Messaging and Event-Driven Systems',
  slug: 'messaging-event-driven-systems',
  category: 'System Design',
  summary: 'Delivery semantics, ordering, consumer groups, retries, DLQs, schema evolution, outbox, and broker choice.',
  updated: 'September 2026', readingTime: '32 min read', pageCount: 10, pages: messagingEventDrivenPages,
}, {
  title: 'Caching Strategies and Reliability',
  slug: 'caching-strategies-reliability',
  category: 'System Design',
  summary: 'Cache-aside, consistency, stampedes, stale data, outages, eviction, key design, and caching judgment.',
  updated: 'September 2026', readingTime: '28 min read', pageCount: 10, pages: cachingPages,
}, {
  title: 'Production Troubleshooting and Observability',
  slug: 'production-troubleshooting-observability',
  category: 'Operations',
  summary: 'Concrete incident workflows, exact metrics and commands, tool interpretation, likely causes, mitigation, and SLO-based alerting.',
  updated: 'September 2026', readingTime: '60 min read', pageCount: 20, pages: productionObservabilityPages,
}, {
  title: 'Software Testing Strategy',
  slug: 'software-testing-strategy',
  category: 'Testing',
  summary: 'Test levels, mocking, Testcontainers, transactions, resilience, concurrency, contracts, and load testing.',
  updated: 'September 2026', readingTime: '31 min read', pageCount: 10, pages: testingPages,
}, {
  title: 'Networking and Application Security',
  slug: 'networking-application-security',
  category: 'Security & Networking',
  summary: 'HTTP networking, pooling, proxies, identity, browser security, application threats, and secret management.',
  updated: 'September 2026', readingTime: '35 min read', pageCount: 11, pages: networkingSecurityPages,
}, {
  title: 'Docker, Kubernetes, Cloud, and CI/CD',
  slug: 'docker-kubernetes-cloud-cicd',
  category: 'Operations',
  summary: 'Images, Java containers, Kubernetes workloads, probes, scaling, deployment safety, IaC, and supply-chain security.',
  updated: 'September 2026', readingTime: '48 min read', pageCount: 14, pages: cloudDeploymentPages,
}, {
  title: 'Architecture Principles and Design Patterns',
  slug: 'architecture-principles-design-patterns',
  category: 'Design Patterns',
  summary: 'SOLID, architecture styles, domain modeling, Java patterns, coupling, decisions, debt, and safe refactoring.',
  updated: 'September 2026', readingTime: '37 min read', pageCount: 12, pages: architecturePatternsPages,
}];

export const questionBySlug = (slug: string) => questions.find((q) => q.slug === slug);
