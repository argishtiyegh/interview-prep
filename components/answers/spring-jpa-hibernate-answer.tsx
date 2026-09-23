'use client';

import { createTopicPages, type TopicPageSpec } from '@/components/answers/topic-page';

const specs: TopicPageSpec[] = [
  {
    id: 'transactional-internals', chapter: 'Spring transactions', title: 'How @Transactional works internally',
    answer: 'Spring normally wraps an eligible bean in an AOP proxy. When a caller enters a transactional method through that proxy, a TransactionInterceptor reads the transaction attributes, asks a PlatformTransactionManager to begin or join a transaction, invokes the target, then commits or rolls back according to the outcome.',
    flow: ['Caller enters proxy', 'Interceptor resolves attributes', 'Transaction manager begins/joins', 'Target runs; commit or rollback'],
    sections: [{ title: 'Thread-bound resources', text: 'For imperative transactions, Spring binds the transaction’s resource holder—such as a JDBC Connection or JPA EntityManager—to the current thread. Repository calls participate because they resolve the same bound resource.' }],
    callout: { title: 'The annotation is metadata', text: 'The proxy and transaction manager perform the work. A method call that does not cross the proxy does not trigger proxy advice.', tone: 'info' },
  },
  {
    id: 'transaction-boundaries', chapter: 'Spring transactions', title: 'Where transaction boundaries belong',
    answer: 'Place the transaction around one application use case that must preserve a database invariant. A service method usually coordinates repositories and domain changes, commits once, and returns after the consistent state is durable.',
    sections: [{ title: 'Good boundary qualities', bullets: ['Contains the reads and writes whose correctness depends on one another.', 'Is short enough to avoid unnecessary locks, old snapshots, and pool occupancy.', 'Does not depend on controller serialization or an open web request.', 'Defines retry and idempotency at the use-case level.'] }],
    code: ['@Transactional', 'public Order placeOrder(PlaceOrder command) {', '    Product product = products.getForUpdate(command.productId());', '    product.reserve(command.quantity());', '    return orders.save(Order.place(command, product));', '}'].join('\n'),
  },
  {
    id: 'transaction-self-invocation', chapter: 'Spring transactions', title: 'Why self-invocation prevents transaction creation',
    answer: 'A call such as this.saveLine() invokes the target directly. It does not return through the Spring proxy, so the interceptor never sees @Transactional on saveLine(). The same limitation applies to proxy-based async, caching, retry, and security advice.',
    code: ['void importAll(List<Row> rows) {', '    for (Row row : rows) {', '        saveOne(row); // proxy is bypassed', '    }', '}', '', '@Transactional(propagation = REQUIRES_NEW)', 'public void saveOne(Row row) { /* ... */ }', '', '// Move saveOne to a separate injected bean, or put the', '// transaction on the externally invoked use-case boundary.'].join('\n'),
    callout: { title: 'Visibility still matters', text: 'Use externally invocable non-final methods for proxy advice and verify the proxy strategy. Do not rely on private-method annotations.', tone: 'warning' },
  },
  {
    id: 'propagation', chapter: 'Spring transactions', title: 'What transaction propagation controls',
    answer: 'Propagation describes how a transactional method relates to a transaction already associated with the current call. It does not define database isolation; it defines joining, creating, suspending, requiring, or rejecting a transaction context.',
    comparisons: [
      { title: 'REQUIRED', text: 'Join the current transaction or create one. This is the default and makes nested service calls one atomic unit.' },
      { title: 'SUPPORTS', text: 'Participate if one exists; otherwise run without a transaction.' },
      { title: 'MANDATORY / NEVER', text: 'Require an existing transaction or require the absence of one; useful for explicit contracts.' },
      { title: 'NOT_SUPPORTED', text: 'Suspend the current transaction and run nontransactionally.' },
    ],
  },
  {
    id: 'required-requires-new-nested', chapter: 'Spring transactions', title: 'REQUIRED, REQUIRES_NEW, and NESTED',
    answer: 'REQUIRED shares one physical transaction with its caller. REQUIRES_NEW suspends the outer transaction and starts an independent physical transaction, normally needing another connection. NESTED uses a savepoint inside one physical transaction when the transaction manager and resource support it.',
    comparisons: [
      { title: 'REQUIRED', text: 'Inner rollback-only marks the shared transaction; an outer commit can then fail with UnexpectedRollbackException.' },
      { title: 'REQUIRES_NEW', text: 'Inner commit survives a later outer rollback, but suspension increases pool demand and can deadlock a too-small pool.' },
      { title: 'NESTED', text: 'Rollback to a savepoint can preserve earlier outer work, but the final outer rollback still removes everything.' },
      { title: 'JPA nuance', text: 'Savepoint behavior is commonly associated with DataSourceTransactionManager; do not assume arbitrary JPA operations support NESTED identically.' },
    ],
  },
  {
    id: 'rollback-rules', chapter: 'Spring transactions', title: 'Which exceptions trigger rollback',
    answer: 'By default, Spring marks a transaction for rollback when a RuntimeException or Error escapes the transactional boundary. Checked exceptions normally commit unless rollbackFor is configured. noRollbackFor can override selected runtime failures.',
    code: ['@Transactional(rollbackFor = IOException.class)', 'public void importFile(Path file) throws IOException {', '    // database changes roll back if IOException escapes', '}', '', '// Prefer exception types that express whether the use case failed.', '// Do not add rollbackFor = Exception.class without considering', '// expected business outcomes and retry behavior.'].join('\n'),
    callout: { title: 'Rollback rules see the escaping throwable', text: 'If the method catches an exception and returns normally, the interceptor cannot infer that the operation should roll back.', tone: 'warning' },
  },
  {
    id: 'caught-exception', chapter: 'Spring transactions', title: 'What happens when a transactional exception is caught',
    answer: 'If application code catches a failure and completes normally, Spring normally attempts to commit. If a participating resource or inner transactional call has already marked the transaction rollback-only, commit instead throws UnexpectedRollbackException.',
    code: ['@Transactional', 'public void process(Command command) {', '    try {', '        repository.save(command.toEntity());', '        gateway.validate(command);', '    } catch (ValidationException ex) {', '        // Returning here may commit database work unless rollback-only', '        // was set or the exception is rethrown.', '        TransactionAspectSupport.currentTransactionStatus()', '                .setRollbackOnly();', '    }', '}'].join('\n'),
    sections: [{ title: 'Preferred design', text: 'Distinguish expected business alternatives from failures. Rethrow a failure that should abort, or structure validation before mutation instead of using manual rollback-only as routine control flow.' }],
  },
  {
    id: 'external-calls', chapter: 'Spring transactions', title: 'Why external calls should stay outside database transactions',
    answer: 'A remote HTTP, messaging, or filesystem call can block unpredictably while the transaction retains a database connection, locks, and an MVCC snapshot. The database cannot atomically roll back an already completed external side effect.',
    flow: ['Short database transaction', 'Commit durable intent/outbox', 'Async delivery', 'Retry idempotently'],
    sections: [{ title: 'Safer patterns', bullets: ['Validate and call a side-effect-free dependency before the transaction when consistency permits.', 'Use a transactional outbox to commit data and an event record together.', 'Use idempotency keys and retry delivery after commit.', 'Use compensation only when the business process accepts saga semantics.'] }],
  },
  {
    id: 'persistence-context', chapter: 'JPA state', title: 'What the persistence context is',
    answer: 'A persistence context is an identity map and unit of work managed by an EntityManager. Within it, one database identity maps to one managed Java entity instance. It tracks changes, resolves relationships, queues writes, and flushes SQL before commit or when a query requires synchronization.',
    flow: ['Find entity', 'Identity map returns one managed instance', 'Modify fields', 'Flush computes and executes SQL'],
    sections: [{ title: 'Consequences', bullets: ['Repeated find of the same key can return the same managed object without another select.', 'The context can grow large during batches unless it is cleared.', 'Managed state is not a serialized DTO boundary.', 'Flush synchronizes SQL; commit finalizes the database transaction.'] }],
  },
  {
    id: 'entity-lifecycle', chapter: 'JPA state', title: 'JPA entity lifecycle states',
    answer: 'A new or transient entity is not associated with a persistence context. A managed entity is tracked and participates in dirty checking. A detached entity has identity but is no longer tracked. A removed entity is scheduled for deletion at flush.',
    comparisons: [
      { title: 'New/transient', text: 'Ordinary object without managed persistence identity; persist makes it managed.' },
      { title: 'Managed', text: 'Changes are detected and synchronized; relationships may be lazy proxies or managed collections.' },
      { title: 'Detached', text: 'Changes are ignored unless state is copied into a managed instance through merge or explicit logic.' },
      { title: 'Removed', text: 'Managed but scheduled for DELETE when the context flushes.' },
    ],
    callout: { title: 'merge does not reattach the same object', text: 'merge copies state into a managed instance and returns it. Continue with the returned reference.', tone: 'warning' },
  },
  {
    id: 'dirty-checking', chapter: 'JPA state', title: 'How Hibernate dirty checking works',
    answer: 'Hibernate records a loaded snapshot or enhanced change information for managed entities. At flush it compares relevant state, schedules SQL for changed entities, orders actions, and sends statements to JDBC. No explicit save call is required for a managed entity changed inside a transaction.',
    code: ['@Transactional', 'public void rename(long id, String name) {', '    Customer customer = entityManager.find(Customer.class, id);', '    customer.rename(name);', '    // UPDATE is generated at flush/commit by dirty checking.', '}'].join('\n'),
    sections: [{ title: 'Flush triggers', bullets: ['Transaction commit.', 'Explicit EntityManager.flush().', 'Before a query when FlushMode requires pending changes to become visible.', 'Provider-specific batching and action ordering.'] }],
    callout: { title: 'Flush is not commit', text: 'SQL may reach the database during flush and still be rolled back later.', tone: 'info' },
  },
  {
    id: 'lazy-eager', chapter: 'Fetching', title: 'Lazy and eager loading',
    answer: 'Lazy loading defers relationship data until accessed, typically through a proxy or instrumented collection. Eager loading requires the provider to make the relationship available before the entity becomes detached, but it does not guarantee one SQL join and can still produce multiple queries.',
    comparisons: [
      { title: 'Lazy', text: 'Avoids unused data but can cause hidden SQL, N+1 queries, and failure outside an active persistence context.' },
      { title: 'Eager', text: 'Always pays the fetch cost and can create large graphs or surprising secondary selects.' },
    ],
    callout: { title: 'Fetch per use case', text: 'Keep mappings conservative and select a query-specific fetch plan rather than making associations globally eager.', tone: 'tip' },
  },
  {
    id: 'lazy-initialization', chapter: 'Fetching', title: 'What causes LazyInitializationException',
    answer: 'The exception occurs when code accesses an unfetched lazy proxy or collection after the entity is detached or after its persistence context is closed. The provider no longer has an active context through which to load the relationship.',
    sections: [{ title: 'Correct fixes', bullets: ['Fetch the required data inside the service transaction.', 'Return a DTO projection shaped for the response.', 'Use a fetch join or entity graph for that use case.', 'Do not “fix” it by making everything eager or relying on Open EntityManager in View to hide query boundaries.'] }],
    callout: { title: 'Serialization should not discover the query plan', text: 'A controller serializing an entity graph can trigger unpredictable SQL and cycles. Map to an explicit response model inside the application boundary.', tone: 'warning' },
  },
  {
    id: 'n-plus-one', chapter: 'Fetching', title: 'The N+1 query problem',
    answer: 'N+1 occurs when one query loads N parent rows and later access triggers one additional query per parent. The code looks like normal iteration, but database round trips and repeated execution grow linearly with the result size.',
    flow: ['1 query loads orders', 'Loop accesses customer', 'N lazy selects', 'Latency grows with rows'],
    code: ['List<Order> orders = orderRepository.findRecent(); // 1 query', 'for (Order order : orders) {', '    log.info(order.getCustomer().getName());   // up to N queries', '}'].join('\n'),
    sections: [{ title: 'Detection', bullets: ['Count SQL statements in an integration test.', 'Inspect datasource-proxy/P6Spy logs or Hibernate statistics.', 'Correlate request latency with database call count.', 'Look for repeated SQL differing only by identifier.'] }],
  },
  {
    id: 'fetch-solutions', chapter: 'Fetching', title: 'Fetch joins, entity graphs, projections, and batch fetching',
    answer: 'A fetch join loads selected relationships in the query. An entity graph supplies a reusable fetch plan. A DTO projection selects only response fields. Batch fetching groups several lazy loads into fewer IN queries. Choose from result shape, cardinality, mutability, and pagination needs.',
    comparisons: [
      { title: 'Fetch join', text: 'Good for a bounded to-one or collection graph; multiple to-many joins can multiply rows and complicate pagination.' },
      { title: 'Entity graph', text: 'Separates fetch plan from query text and can vary by use case.' },
      { title: 'Projection', text: 'Best for read APIs that need a known shape and no entity mutation.' },
      { title: 'Batch fetching', text: 'Reduces N selects when lazy traversal is still appropriate; it does not turn the graph into one query.' },
    ],
  },
  {
    id: 'relationships', chapter: 'Mapping', title: 'Mapping bidirectional relationships',
    answer: 'A bidirectional relationship has one owning side that writes the foreign-key association and one inverse side mappedBy the owner. Domain helper methods should keep both in-memory sides synchronized so code and persistence state agree.',
    code: ['@Entity', 'class Order {', '    @OneToMany(mappedBy = "order", cascade = ALL, orphanRemoval = true)', '    private final List<OrderLine> lines = new ArrayList<>();', '', '    void addLine(OrderLine line) {', '        lines.add(line);', '        line.attachTo(this);', '    }', '}'].join('\n'),
    sections: [{ title: 'Serialization and equality', text: 'Do not serialize entity relationships recursively. Avoid equals/hashCode implementations that traverse mutable associations or depend on an identifier that changes from null to assigned.' }],
  },
  {
    id: 'cascade-orphans', chapter: 'Mapping', title: 'Cascade operations and orphan removal',
    answer: 'Cascade propagates EntityManager operations such as persist, merge, remove, refresh, or detach from a parent to related entities. orphanRemoval deletes a child entity when it is removed from the parent association. They model lifecycle ownership, not database ON DELETE behavior.',
    comparisons: [
      { title: 'cascade = PERSIST', text: 'Persisting the aggregate root also persists newly referenced children.' },
      { title: 'cascade = REMOVE', text: 'Removing the parent propagates remove to children; dangerous across shared relationships.' },
      { title: 'orphanRemoval = true', text: 'Removing a child from the managed parent collection schedules deletion of that child.' },
      { title: 'Database cascade', text: 'Foreign-key ON DELETE action executed by the database; persistence-context state and provider caches need consideration.' },
    ],
  },
  {
    id: 'batching', chapter: 'Performance', title: 'JPA batching',
    answer: 'JDBC batching groups compatible insert, update, or delete statements into fewer network round trips. Hibernate can batch only when statement shape and identifier generation allow it. The persistence context must still be flushed and cleared in chunks to prevent unbounded memory growth.',
    code: ['spring.jpa.properties.hibernate.jdbc.batch_size=50', 'spring.jpa.properties.hibernate.order_inserts=true', 'spring.jpa.properties.hibernate.order_updates=true', '', 'for (int i = 0; i < rows.size(); i++) {', '    entityManager.persist(toEntity(rows.get(i)));', '    if ((i + 1) % 50 == 0) {', '        entityManager.flush();', '        entityManager.clear();', '    }', '}'].join('\n'),
    callout: { title: 'Verify at the driver and database', text: 'Hibernate logging can still print individual statements while the JDBC driver batches them. Measure round trips and throughput.', tone: 'info' },
  },
  {
    id: 'jpa-pagination', chapter: 'Performance', title: 'Pagination with JPA and Hibernate',
    answer: 'Page and Slice commonly use OFFSET/LIMIT semantics. Fetch-joining a to-many collection while paginating can multiply rows or force in-memory pagination. Prefer a two-step identifier query, a projection, or keyset pagination for large ordered result sets.',
    code: ['// Keyset-style repository query: stable order includes unique id', 'select o from Order o', 'where (o.createdAt < :createdAt)', '   or (o.createdAt = :createdAt and o.id < :id)', 'order by o.createdAt desc, o.id desc'].join('\n'),
    sections: [{ title: 'Count-query cost', text: 'Page requests often run a second COUNT query. If clients do not need total pages, Slice or cursor responses avoid that cost.' }],
  },
  {
    id: 'jpa-caches', chapter: 'Caching', title: 'First-level and second-level caches',
    answer: 'The first-level cache is the mandatory persistence-context identity map and lasts for that context. A second-level cache is optional, shared across contexts, and stores provider-managed entity or collection state. Query caching is a separate mapping from query keys to result identifiers.',
    comparisons: [
      { title: 'First level', text: 'Always present, transaction/context scoped, guarantees one managed instance per identity.' },
      { title: 'Second level', text: 'Optional and shared; useful for read-mostly data with a clear invalidation and concurrency strategy.' },
      { title: 'Query cache', text: 'Caches result identifiers, then resolves entity state; frequent writes can invalidate it heavily.' },
      { title: 'Application cache', text: 'Caches DTOs or business results under explicit TTL/size semantics; independent from persistence identity.' },
    ],
    callout: { title: 'Caching is a consistency policy', text: 'Measure hit rate, invalidation, staleness tolerance, serialization cost, and memory before enabling it.', tone: 'warning' },
  },
  {
    id: 'modifying-lost-update', chapter: 'Concurrency', title: 'Why @Modifying does not prevent lost updates',
    answer: '@Modifying tells Spring Data that a query performs an update or delete instead of returning entities. It does not add locking, a version predicate, or lost-update detection. Bulk JPQL also bypasses normal entity dirty checking and may leave managed objects stale.',
    code: ['@Modifying(clearAutomatically = true)', '@Query("""', '    update Product p', '       set p.stock = p.stock - :amount', '     where p.id = :id', '       and p.stock >= :amount', '""")', 'int reserve(long id, int amount);', '', '// Check that exactly one row changed. The predicate protects stock.', '// @Modifying itself provides no concurrency guarantee.'].join('\n'),
    callout: { title: 'Bulk updates and persistence context can disagree', text: 'Clear or refresh affected managed entities, and include an explicit version or invariant predicate when correctness requires it.', tone: 'warning' },
  },
  {
    id: 'optimistic-version', chapter: 'Concurrency', title: 'How @Version implements optimistic locking',
    answer: 'A @Version field is included in generated UPDATE and DELETE predicates. Hibernate updates only when the database version still equals the version originally read, then increments it. Zero affected rows means another transaction changed or removed the row, producing an optimistic-lock exception.',
    code: ['@Entity', 'class Product {', '    @Id private Long id;', '    @Version private long version;', '    private int stock;', '}', '', '// Conceptual SQL', 'UPDATE product', 'SET stock = ?, version = version + 1', 'WHERE id = ? AND version = ?;'].join('\n'),
    sections: [{ title: 'Handling conflicts', text: 'Rollback the transaction, map the conflict to a domain/API response or retry the complete command when safe. Never silently overwrite with a stale detached object.' }],
  },
  {
    id: 'pessimistic-jpa', chapter: 'Concurrency', title: 'Requesting pessimistic locking through JPA',
    answer: 'JPA exposes LockModeType.PESSIMISTIC_READ, PESSIMISTIC_WRITE, and PESSIMISTIC_FORCE_INCREMENT. The provider translates them to database locking behavior such as SELECT FOR UPDATE, subject to dialect and database capabilities.',
    code: ['@Lock(LockModeType.PESSIMISTIC_WRITE)', '@Query("select p from Product p where p.id = :id")', 'Optional<Product> findForUpdate(long id);', '', '// Set a lock timeout where supported; handle timeout/deadlock', '// by rolling back and applying a bounded retry policy.'].join('\n'),
    sections: [{ title: 'Use carefully', bullets: ['Acquire locks in a consistent order.', 'Keep the transaction short.', 'Index the lookup predicate.', 'Do not hold the lock while calling remote services.', 'Test actual SQL and timeout behavior on the production database.'] }],
  },
  {
    id: 'hibernate-diagnostics', chapter: 'Diagnostics', title: 'Hibernate and transaction diagnostic toolkit',
    answer: 'Observe SQL count, parameter values in a protected environment, transaction boundaries, pool waits, query plans, batch execution, and Hibernate statistics. Diagnose from a representative request rather than enabling extremely verbose logging across production indefinitely.',
    code: ['# Development or bounded diagnostic window', 'logging.level.org.springframework.transaction=TRACE', 'logging.level.org.hibernate.SQL=DEBUG', 'logging.level.org.hibernate.orm.jdbc.bind=TRACE', 'spring.jpa.properties.hibernate.generate_statistics=true', '', '# Useful production metrics through Actuator', 'curl -s localhost:8080/actuator/metrics/hikaricp.connections.pending', 'curl -s localhost:8080/actuator/metrics/spring.data.repository.invocations', '', '# Inspect the real database plan for repeated/slow SQL', 'EXPLAIN (ANALYZE, BUFFERS) SELECT ...;'].join('\n'), codeLabel: 'Diagnostic configuration and commands',
    callout: { title: 'SQL bind logging can expose secrets', text: 'Use it only in controlled environments or a short approved window, then disable it.', tone: 'warning' },
  },
  {
    id: 'jpa-recap', chapter: 'Interview recap', title: 'Spring transactions and JPA recap',
    answer: 'A senior answer follows the call through the proxy, transaction manager, persistence context, generated SQL, and database concurrency control. It distinguishes Java object state from database state and treats fetching, batching, locking, and caching as use-case-specific policies.',
    sections: [{ title: 'Rapid checks', bullets: ['Transaction advice requires a proxy boundary.', 'REQUIRES_NEW uses an independent transaction and additional resource capacity.', 'Caught exceptions can commit unless rollback is requested.', 'Managed entities are dirty-checked at flush.', 'EAGER does not mean one query.', 'N+1 is a query-count problem solved by an explicit fetch plan.', '@Modifying provides no lost-update protection.', '@Version adds a version predicate and conflict detection.'] }],
    links: [
      { label: 'Spring transaction management', href: 'https://docs.spring.io/spring-framework/reference/data-access/transaction.html' },
      { label: 'Spring Data JPA reference', href: 'https://docs.spring.io/spring-data/jpa/reference/' },
      { label: 'Hibernate ORM user guide', href: 'https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html' },
      { label: 'Jakarta Persistence specification', href: 'https://jakarta.ee/specifications/persistence/' },
    ],
  },
];

export const springJpaHibernatePages = createTopicPages(specs);
