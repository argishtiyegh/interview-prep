'use client';

import { createTopicPages, type TopicPageSpec } from '@/components/answers/topic-page';

const specs: TopicPageSpec[] = [
  {
    id: 'acid', chapter: 'Transactions', title: 'What ACID means',
    answer: 'Atomicity makes a transaction’s writes succeed or fail as one unit. Consistency means committed state satisfies the database’s declared rules, while application invariants still require correct transaction logic. Isolation controls what concurrent transactions can observe. Durability means acknowledged commits survive the failures covered by the database’s persistence guarantees.',
    comparisons: [
      { title: 'Atomicity', text: 'Rollback hides a partial transaction; it does not combine a database change with an arbitrary external API call.' },
      { title: 'Consistency', text: 'Constraints protect declared invariants. Business rules not encoded in the database remain application responsibilities.' },
      { title: 'Isolation', text: 'Concurrent schedules behave according to the chosen level and database implementation.' },
      { title: 'Durability', text: 'Depends on WAL, fsync, storage, replication policy, and acknowledged commit settings.' },
    ],
  },
  {
    id: 'transaction-mechanics', chapter: 'Transactions', title: 'How a database transaction executes',
    answer: 'A transaction establishes a consistency boundary, runs reads and writes through one database connection, records changes in transactional storage such as a write-ahead log, acquires locks or creates versions as needed, then commits or rolls back. Commit visibility and durability are database-specific.',
    flow: ['BEGIN and snapshot', 'Read/write rows', 'Validate conflicts', 'COMMIT or ROLLBACK'],
    code: ['BEGIN;', 'UPDATE account SET balance = balance - 100 WHERE id = 1;', 'UPDATE account SET balance = balance + 100 WHERE id = 2;', 'COMMIT;'].join('\n'), codeLabel: 'Atomic transfer',
    callout: { title: 'Keep the boundary short', text: 'User think time, network calls, and large batch processing inside a transaction retain locks or old versions and consume a pooled connection.', tone: 'warning' },
  },
  {
    id: 'read-anomalies', chapter: 'Isolation', title: 'Dirty, non-repeatable, and phantom reads',
    answer: 'A dirty read observes data another transaction has not committed. A non-repeatable read returns a different value when the same row is read twice. A phantom occurs when repeating a predicate query returns a changed set of rows because another transaction inserted, deleted, or updated rows matching that predicate.',
    comparisons: [
      { title: 'Dirty read', text: 'T1 reads T2’s uncommitted value; T2 may roll it back.' },
      { title: 'Non-repeatable read', text: 'T1 rereads row 42 and sees T2’s committed update.' },
      { title: 'Phantom', text: 'T1 repeats WHERE status = NEW and sees a new matching row.' },
      { title: 'Serialization anomaly', text: 'Each statement can look valid, but the combined result cannot match any serial transaction order.' },
    ],
  },
  {
    id: 'isolation-levels', chapter: 'Isolation', title: 'The four SQL isolation levels',
    answer: 'The SQL names describe increasingly strong observable guarantees, but engines implement them differently. Read the documentation for the actual database: PostgreSQL maps READ UNCOMMITTED to READ COMMITTED, while other engines may expose different locking or snapshot behavior.',
    comparisons: [
      { title: 'READ UNCOMMITTED', text: 'May permit dirty reads by the SQL model. PostgreSQL treats it as READ COMMITTED.' },
      { title: 'READ COMMITTED', text: 'Each statement sees committed data as of that statement; two statements can see different committed states.' },
      { title: 'REPEATABLE READ', text: 'A stable transaction snapshot in MVCC systems, but exact phantom and write-conflict behavior varies.' },
      { title: 'SERIALIZABLE', text: 'The outcome must be equivalent to some serial order; the database may abort a transaction that must be retried.' },
    ],
    callout: { title: 'Higher isolation is not free', text: 'It may add blocking, conflict detection, retries, or reduced concurrency. Choose it from the invariant you must protect.', tone: 'info' },
  },
  {
    id: 'lost-update', chapter: 'Isolation', title: 'Lost updates and why isolation may not save you',
    answer: 'A lost update occurs when two transactions read the same old value, independently calculate new values, and one later write overwrites the other. Isolation-level names alone do not universally prevent this pattern; the statement form and database conflict rules matter.',
    flow: ['T1 reads 10', 'T2 reads 10', 'T1 writes 11', 'T2 writes 11: one increment lost'],
    code: ['-- Risky read-modify-write in application memory', 'SELECT quantity FROM stock WHERE id = 7; -- both read 10', 'UPDATE stock SET quantity = 11 WHERE id = 7;', '', '-- Atomic database expression', 'UPDATE stock SET quantity = quantity + 1 WHERE id = 7;', '', '-- Optimistic check', 'UPDATE stock SET quantity = 11, version = 4', 'WHERE id = 7 AND version = 3; -- require affected_rows = 1'].join('\n'),
    callout: { title: 'Ask what invariant and statement are used', text: 'Atomic updates, row locks, optimistic versions, and serializable retry loops protect different workflows.', tone: 'tip' },
  },
  {
    id: 'mvcc', chapter: 'Isolation', title: 'How MVCC works',
    answer: 'Multi-version concurrency control keeps multiple logical versions of rows so readers can use a consistent snapshot while writers create newer versions. Visibility rules decide which version a transaction can see. Obsolete versions are reclaimed only after no relevant snapshot needs them.',
    flow: ['Transaction gets snapshot', 'Writer creates new version', 'Readers choose visible version', 'Vacuum/cleanup reclaims obsolete versions'],
    sections: [
      { title: 'Why readers and writers interfere less', text: 'A reader often does not need to block a writer because it can keep reading an older committed version. Conflicting writers still require coordination.' },
      { title: 'Operational consequence', text: 'Long-running transactions retain old snapshots, delay cleanup, increase table/index bloat, and can make queries slower even if they perform no writes.' },
    ],
  },
  {
    id: 'optimistic-pessimistic', chapter: 'Concurrency control', title: 'Optimistic and pessimistic locking',
    answer: 'Optimistic locking allows concurrent work and detects a conflict at update or commit time, usually with a version column. Pessimistic locking acquires a database lock before the protected change, making competitors wait or fail immediately.',
    comparisons: [
      { title: 'Optimistic', text: 'Good when conflicts are uncommon and retrying is acceptable. The update checks the previously read version.' },
      { title: 'Pessimistic', text: 'Good when conflicts are likely or work cannot safely be repeated. SELECT FOR UPDATE holds row locks until transaction end.' },
    ],
    code: ['-- Pessimistic row lock', 'BEGIN;', 'SELECT * FROM inventory WHERE sku = \'A-42\' FOR UPDATE;', 'UPDATE inventory SET available = available - 1 WHERE sku = \'A-42\';', 'COMMIT;'].join('\n'),
    callout: { title: 'A lock does not validate business logic', text: 'After acquiring the lock, recheck the invariant using the locked/current state before writing.', tone: 'warning' },
  },
  {
    id: 'deadlocks', chapter: 'Concurrency control', title: 'How database deadlocks happen',
    answer: 'A deadlock is a cycle of waits: transaction A holds a resource B needs while B holds a resource A needs. The database detects the cycle and aborts a victim so the others can proceed.',
    flow: ['T1 locks account 1', 'T2 locks account 2', 'T1 waits for 2', 'T2 waits for 1: cycle'],
    sections: [{ title: 'Prevention', bullets: ['Lock rows and tables in a consistent order.', 'Keep transactions small and avoid external calls.', 'Index predicates so updates do not lock or scan more rows than intended.', 'Avoid mixing broad batch updates with interactive transactions without coordination.'] }],
  },
  {
    id: 'deadlock-retry', chapter: 'Concurrency control', title: 'Detecting and retrying deadlocks',
    answer: 'Treat a deadlock or serialization failure as a transaction-level failure. Roll back, wait with bounded randomized backoff, then rerun the complete transaction from the beginning using fresh reads. Retrying only the last statement can reuse invalid assumptions.',
    code: ['for (int attempt = 1; attempt <= maxAttempts; attempt++) {', '    try {', '        return transactionTemplate.execute(status -> transfer(command));', '    } catch (DeadlockLoserDataAccessException |', '             CannotSerializeTransactionException ex) {', '        if (attempt == maxAttempts) throw ex;', '        sleep(jitteredBackoff(attempt));', '    }', '}'].join('\n'), codeLabel: 'Bounded whole-transaction retry',
    sections: [{ title: 'Retry safety', bullets: ['Commands need an idempotency strategy.', 'External side effects must not be repeated accidentally.', 'Metrics should distinguish initial failures, successful retries, and exhausted retries.', 'Persistent deadlocks require query and lock-order correction, not infinite retry.'] }],
  },
  {
    id: 'index-internals', chapter: 'Indexes', title: 'How database indexes work',
    answer: 'A B-tree index stores ordered keys in a balanced tree whose leaves point to rows or contain indexed values. Each comparison narrows the search, making equality, range, prefix-ordering, and ordered traversal efficient without scanning every table row.',
    flow: ['Root comparison', 'Internal page', 'Leaf range', 'Row lookup or index-only result'],
    sections: [{ title: 'Other index families', bullets: ['Hash indexes target equality in engines that support them.', 'GIN/inverted indexes map tokens or elements to rows for arrays, text, or JSON-like data.', 'GiST/SP-GiST support extensible spatial or specialized search.', 'BRIN summarizes physical ranges and suits very large naturally ordered tables.'] }],
    callout: { title: 'Indexes are physical data structures', text: 'Their usefulness depends on selectivity, ordering, predicate shape, table layout, statistics, and engine capabilities.', tone: 'info' },
  },
  {
    id: 'index-tradeoffs', chapter: 'Indexes', title: 'When indexes improve or reduce performance',
    answer: 'An index can avoid a scan, satisfy ordering, support joins, enforce uniqueness, or enable an index-only query. Every index also consumes storage and cache, and every insert, delete, or indexed-column update must maintain it.',
    comparisons: [
      { title: 'Helps', text: 'Selective predicates, join keys, ORDER BY with matching order, uniqueness checks, and covering reads.' },
      { title: 'Hurts', text: 'Write amplification, page splits, vacuum work, cache pressure, longer backups, and planner choices based on stale statistics.' },
    ],
    sections: [{ title: 'Why a planner may ignore an index', bullets: ['The query returns a large fraction of the table.', 'A sequential scan is cheaper due to locality.', 'The predicate applies a function or incompatible cast.', 'Statistics estimate low selectivity.', 'The required columns cause many random table lookups.'] }],
  },
  {
    id: 'composite-index', chapter: 'Indexes', title: 'Composite index column order',
    answer: 'In a B-tree composite index, column order determines the sorted key hierarchy. An index on (tenant_id, created_at) efficiently narrows one tenant and then scans a created_at range. A query on created_at alone generally cannot use the leading hierarchy as efficiently.',
    code: ['CREATE INDEX orders_tenant_created_idx', '    ON orders (tenant_id, created_at DESC);', '', '-- Strong match: equality on leading column, range/order next', 'SELECT * FROM orders', 'WHERE tenant_id = 42 AND created_at >= :from', 'ORDER BY created_at DESC LIMIT 50;'].join('\n'),
    sections: [{ title: 'Selection rule', text: 'Order columns from actual query patterns, not a universal “most selective first” slogan. Consider equality predicates, range boundaries, ordering, grouping, included columns, and write cost together.' }],
  },
  {
    id: 'sargability', chapter: 'Indexes', title: 'Sargable predicates and covering indexes',
    answer: 'A predicate is sargable when the engine can use it to search an index rather than calculate a value for every row. Comparing an indexed column directly to a compatible value is usually better than wrapping the column in a function or forcing a type conversion.',
    code: ['-- Often prevents a normal index search', 'WHERE DATE(created_at) = DATE \'2026-09-23\'', '', '-- Searchable range', 'WHERE created_at >= TIMESTAMP \'2026-09-23 00:00:00\'', '  AND created_at <  TIMESTAMP \'2026-09-24 00:00:00\'', '', '-- If the expression is required frequently, consider an expression index.'].join('\n'),
    callout: { title: 'Covering is query-specific', text: 'An index-only plan still depends on visibility metadata and engine behavior. Adding every selected column creates a wide, expensive index.', tone: 'warning' },
  },
  {
    id: 'execution-plans', chapter: 'Query diagnosis', title: 'How to read an execution plan',
    answer: 'Read a plan from the leaf operations toward the root. For each node compare estimated rows with actual rows, examine access method, join algorithm, loops, filters, sorts, memory and disk use, and find where time or row multiplication first becomes large.',
    code: ['EXPLAIN (ANALYZE, BUFFERS, VERBOSE, SETTINGS)', 'SELECT c.id, count(*)', 'FROM customer c', 'JOIN orders o ON o.customer_id = c.id', 'WHERE o.created_at >= now() - interval \'30 days\'', 'GROUP BY c.id;'].join('\n'), codeLabel: 'PostgreSQL plan with runtime evidence',
    sections: [{ title: 'Important signals', bullets: ['Estimated versus actual rows: large error points to statistics or correlated predicates.', 'Actual time multiplied by loops: a cheap inner node repeated many times may dominate.', 'Rows removed by filter: access fetched more data than needed.', 'Buffers and temp I/O: cache misses, broad scans, or spilled sort/hash operations.', 'Join choice: nested loop, hash join, and merge join suit different cardinalities and ordering.'] }],
    callout: { title: 'ANALYZE executes the query', text: 'Use care with write statements and production load. Wrap diagnostic writes in a transaction and roll back only when side effects and triggers are understood.', tone: 'warning' },
  },
  {
    id: 'slow-query', chapter: 'Query diagnosis', title: 'Slow-query investigation runbook',
    answer: 'Capture the exact normalized statement, parameters or selectivity, duration distribution, row counts, wait state, plan, schema, indexes, statistics, and concurrent load. Determine whether time is spent waiting, scanning, joining, sorting, writing, or transferring rows before changing SQL.',
    flow: ['Find representative slow call', 'Capture plan and waits', 'Locate first bad estimate/work', 'Change and measure under load'],
    code: ['# PostgreSQL: enable extension once per database', 'CREATE EXTENSION IF NOT EXISTS pg_stat_statements;', '', 'SELECT queryid, calls, total_exec_time, mean_exec_time, rows, query', 'FROM pg_stat_statements', 'ORDER BY total_exec_time DESC', 'LIMIT 20;', '', 'SELECT pid, state, wait_event_type, wait_event, query_start, query', 'FROM pg_stat_activity', 'WHERE state <> \'idle\';'].join('\n'), codeLabel: 'PostgreSQL workload inspection',
  },
  {
    id: 'connection-pool', chapter: 'Connections', title: 'What causes connection-pool saturation',
    answer: 'A pool saturates when requests acquire connections faster than transactions release them. Causes include slow queries, lock waits, long transactions, connection leaks, oversized request concurrency, database overload, failed connections, and pool size exceeding useful database concurrency.',
    flow: ['Requests arrive', 'Wait for pool', 'Database work', 'Connection returned'],
    sections: [{ title: 'Metrics to correlate', bullets: ['Active, idle, maximum, pending, and acquisition timeout.', 'Transaction and query latency.', 'Database sessions, CPU, I/O, lock waits, and replication pressure.', 'Application request concurrency and queue time.'] }],
    callout: { title: 'A bigger pool can make the database slower', text: 'More simultaneous queries increase contention, memory use, cache churn, and context switching. Size from database capacity and workload measurements.', tone: 'warning' },
  },
  {
    id: 'connection-leaks', chapter: 'Connections', title: 'Connection leaks and long transactions',
    answer: 'A connection leak fails to close or return a connection. A long transaction may return code control slowly while legitimately retaining the connection, locks, and snapshot. Both starve the pool, but their evidence and fixes differ.',
    code: ['# HikariCP diagnostic aid; use a threshold above normal transactions', 'spring.datasource.hikari.leak-detection-threshold=20000', '', '# Pool metrics through Actuator/Micrometer', 'curl -s localhost:8080/actuator/metrics/hikaricp.connections.active', 'curl -s localhost:8080/actuator/metrics/hikaricp.connections.pending'].join('\n'),
    sections: [{ title: 'Prevent and diagnose', bullets: ['Use try-with-resources outside managed frameworks.', 'Keep transaction boundaries at service operations.', 'Set acquisition, statement, lock, idle-in-transaction, and network timeouts deliberately.', 'Capture allocation/leak traces only for investigation because they add overhead.', 'Find open transactions and wait events in the database, not only the application.'] }],
  },
  {
    id: 'pagination', chapter: 'Data access patterns', title: 'Offset and cursor pagination',
    answer: 'Offset pagination skips N rows before returning a page, which becomes expensive at deep offsets and can shift when concurrent writes occur. Cursor or keyset pagination uses the last ordered key as the next boundary, providing stable, index-friendly traversal when ordering is deterministic.',
    comparisons: [
      { title: 'OFFSET/LIMIT', text: 'Simple and supports jumping to page numbers, but deep pages still scan or discard earlier rows and concurrent changes can duplicate or skip results.' },
      { title: 'Keyset/cursor', text: 'Fast forward traversal using an indexed unique ordering; clients receive an opaque continuation token rather than an arbitrary page number.' },
    ],
    code: ['SELECT id, created_at, total', 'FROM orders', 'WHERE (created_at, id) < (:lastCreatedAt, :lastId)', 'ORDER BY created_at DESC, id DESC', 'LIMIT 50;'].join('\n'), codeLabel: 'PostgreSQL keyset page',
    callout: { title: 'The tie-breaker is essential', text: 'created_at alone may contain duplicates. Add a unique stable column such as id to produce a total ordering.', tone: 'tip' },
  },
  {
    id: 'normalization', chapter: 'Data modeling', title: 'Normalization and denormalization',
    answer: 'Normalization separates facts so each has a clear owner, reducing update anomalies and duplicated truth. Denormalization intentionally duplicates or precomputes data to serve measured read patterns, accepting synchronization and correctness costs.',
    comparisons: [
      { title: 'Normalize', text: 'Default for transactional truth: clear constraints, smaller updates, and fewer contradictory copies.' },
      { title: 'Denormalize', text: 'Use for proven read bottlenecks, reporting, search, or distributed ownership with an explicit refresh and repair strategy.' },
    ],
    callout: { title: 'Joins are not evidence of bad design', text: 'Relational databases are built to join. Measure the query and indexing before duplicating business facts.', tone: 'warning' },
  },
  {
    id: 'constraints', chapter: 'Data modeling', title: 'How constraints protect integrity',
    answer: 'Constraints reject invalid state regardless of which application instance, script, migration, or integration writes it. Primary keys identify rows, unique constraints prevent duplicates, foreign keys protect references, NOT NULL requires values, and CHECK enforces row-level predicates.',
    code: ['CREATE TABLE booking (', '    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,', '    room_id bigint NOT NULL REFERENCES room(id),', '    start_at timestamptz NOT NULL,', '    end_at timestamptz NOT NULL,', '    status text NOT NULL CHECK (status IN (\'HELD\', \'CONFIRMED\', \'CANCELLED\')),', '    request_key text NOT NULL UNIQUE,', '    CHECK (end_at > start_at)', ');'].join('\n'),
    sections: [{ title: 'Application validation still matters', text: 'The application provides user-friendly errors and complex business decisions. The database remains the final concurrency-safe gate for invariants it can express.' }],
  },
  {
    id: 'sql-nosql', chapter: 'Architecture', title: 'Choosing SQL or NoSQL',
    answer: 'Choose from consistency, query, relationship, scale, latency, operational, and ownership requirements. SQL databases excel at transactions, constraints, joins, and flexible queries. NoSQL is a family—document, key-value, wide-column, and graph systems make different tradeoffs.',
    comparisons: [
      { title: 'Relational', text: 'Strong shared invariants, multi-row transactions, evolving queries, joins, reporting, and mature tooling.' },
      { title: 'Document', text: 'Aggregate-shaped records and flexible nested schemas when most access stays within one document boundary.' },
      { title: 'Key-value / wide-column', text: 'Known access keys, huge scale, and predictable low-latency operations with limited ad hoc relationships.' },
      { title: 'Graph', text: 'Relationship traversal is the primary query and graph algorithms justify the specialized model.' },
    ],
    callout: { title: '“NoSQL scales” is not a design', text: 'Relational systems also replicate and partition. State the access pattern and required failure semantics.', tone: 'warning' },
  },
  {
    id: 'replication', chapter: 'Scaling', title: 'How replication supports scaling and resilience',
    answer: 'Replication copies a log or changes from a primary to replicas. It improves availability and can distribute reads, but introduces replication lag, failover coordination, consistency choices, and additional operational states.',
    flow: ['Primary commits', 'Log shipped', 'Replica replays', 'Readers observe replica state'],
    sections: [{ title: 'Key semantics', bullets: ['Synchronous acknowledgement reduces data-loss risk but adds write latency.', 'Asynchronous replication can lag and lose the latest acknowledged primary writes during failover.', 'Read-after-write may require the primary, session routing, or a lag-aware consistency mechanism.', 'Failover must prevent split brain and update connection routing safely.'] }],
  },
  {
    id: 'partitioning', chapter: 'Scaling', title: 'Partitioning and sharding',
    answer: 'Table partitioning divides one logical table into child storage units, usually inside one database cluster. Sharding distributes data across independently scaled database nodes. Both require a partition key that matches access patterns and prevents concentrated hot spots.',
    comparisons: [
      { title: 'Table partitioning', text: 'Helps pruning, maintenance, archival, and very large tables; it does not automatically add independent write capacity.' },
      { title: 'Sharding', text: 'Adds horizontal capacity and failure domains, but cross-shard transactions, joins, uniqueness, rebalancing, and routing become harder.' },
    ],
    callout: { title: 'Partition pruning needs compatible predicates', text: 'A partitioned table can still scan many partitions if the query does not constrain the partition key.', tone: 'info' },
  },
  {
    id: 'read-replicas', chapter: 'Scaling', title: 'Using read replicas safely',
    answer: 'Read replicas offload suitable read traffic from the primary. They are unsafe for flows that require the latest committed value unless the architecture handles lag. Routing also cannot fix a primary overloaded by writes, locks, or inefficient transactions.',
    sections: [{ title: 'Suitable reads', bullets: ['Analytics, feeds, search-like browsing, and reports that tolerate bounded staleness.', 'Queries isolated from a just-completed write in the same user workflow.', 'Workloads whose replica query cost does not delay replication replay.'] }, { title: 'Guardrails', bullets: ['Measure replay lag in time and bytes.', 'Define fallback or error behavior when lag exceeds the requirement.', 'Route read-after-write and locking reads to the primary.', 'Test failover and connection-pool behavior.'] }],
  },
  {
    id: 'database-toolkit', chapter: 'Query diagnosis', title: 'Database performance toolkit',
    answer: 'Use database-native evidence first: slow-query statistics, active sessions and waits, execution plans, lock graphs, table and index statistics, transaction age, buffer/cache behavior, replication lag, and connection counts. Application metrics provide the request context that database views lack.',
    code: ['-- Active waits and old transactions (PostgreSQL)', 'SELECT pid, state, xact_start, wait_event_type, wait_event, query', 'FROM pg_stat_activity', 'ORDER BY xact_start NULLS LAST;', '', '-- Blocked and blocking process IDs', 'SELECT pid, pg_blocking_pids(pid), query', 'FROM pg_stat_activity', 'WHERE cardinality(pg_blocking_pids(pid)) > 0;', '', '-- Index usage orientation', 'SELECT relname, seq_scan, idx_scan, n_live_tup', 'FROM pg_stat_user_tables', 'ORDER BY seq_scan DESC;', '', '-- Never run VACUUM FULL or create/drop indexes blindly during an incident.'].join('\n'), codeLabel: 'PostgreSQL diagnostic commands',
    callout: { title: 'Commands are engine-specific', text: 'Use the corresponding performance schema, dynamic views, or query store for MySQL, SQL Server, Oracle, and managed services. Do not transpose PostgreSQL semantics blindly.', tone: 'warning' },
  },
  {
    id: 'database-recap', chapter: 'Interview recap', title: 'SQL and database performance recap',
    answer: 'Strong database answers name the invariant, concurrent schedule, access pattern, and evidence. Isolation, indexes, pools, and replicas are mechanisms with costs; none is a universal performance switch.',
    sections: [{ title: 'Rapid checks', bullets: ['Isolation behavior is database-specific.', 'Lost updates require an atomic statement, lock, version check, or serializable retry strategy.', 'MVCC improves concurrency but long transactions delay cleanup.', 'Read plans by actual rows, loops, waits, and I/O—not node names alone.', 'Pool saturation is usually a symptom of slow release or excess concurrency.', 'Cursor pagination needs a stable unique order.', 'Replicas trade fresher reads for distribution and resilience.'] }],
    links: [
      { label: 'PostgreSQL transaction isolation', href: 'https://www.postgresql.org/docs/current/transaction-iso.html' },
      { label: 'PostgreSQL EXPLAIN', href: 'https://www.postgresql.org/docs/current/using-explain.html' },
      { label: 'PostgreSQL indexes', href: 'https://www.postgresql.org/docs/current/indexes.html' },
      { label: 'PostgreSQL monitoring statistics', href: 'https://www.postgresql.org/docs/current/monitoring-stats.html' },
    ],
  },
];

export const sqlDatabasePerformancePages = createTopicPages(specs);
