'use client';

import { ArrowRight } from 'lucide-react';
import { Callout, CodeBlock, Figure } from '@/components/answer-primitives';
import type { ReadingPage } from '@/lib/reading';

const unsafeCounterCode = [
  'final class Counter {',
  '    private int value;',
  '    void increment() { value++; }',
  '    int get() { return value; }',
  '}',
  '',
  '// value++ means: read → add 1 → write.',
  '// Two threads can read the same old value and lose one update.',
].join('\n');

const safeClassCode = [
  'final class Inventory {',
  '    private final Map<ProductId, Integer> stock = new HashMap<>();',
  '',
  '    public synchronized boolean reserve(ProductId id, int amount) {',
  '        int available = stock.getOrDefault(id, 0);',
  '        if (available < amount) return false;',
  '        stock.put(id, available - amount);',
  '        return true;',
  '    }',
  '}',
].join('\n');

const raceCode = [
  '// Initial balance = 100',
  'if (balance >= 80) {        // Thread A observes 100',
  '    balance -= 80;',
  '}',
  'if (balance >= 80) {        // Thread B may also observe 100',
  '    balance -= 80;',
  '}',
  '// Check-then-act must be one atomic action.',
].join('\n');

const synchronizedCode = [
  'final class Account {',
  '    private int balance;',
  '',
  '    public synchronized void deposit(int amount) {',
  '        balance += amount;',
  '    }',
  '',
  '    public synchronized boolean withdraw(int amount) {',
  '        if (balance < amount) return false;',
  '        balance -= amount;',
  '        return true;',
  '    }',
  '}',
].join('\n');

const volatileCode = [
  'final class Worker implements Runnable {',
  '    private volatile boolean stopRequested;',
  '',
  '    public void requestStop() { stopRequested = true; }',
  '',
  '    @Override public void run() {',
  '        while (!stopRequested) { doOneUnit(); }',
  '    }',
  '}',
].join('\n');

const atomicCode = [
  'final class Metrics {',
  '    private final AtomicInteger requests = new AtomicInteger();',
  '',
  '    int recordRequest() {',
  '        return requests.incrementAndGet();',
  '    }',
  '}',
  '',
  '// Equivalent conceptual CAS loop:',
  '// read current; compute next; compareAndSet(current, next); retry on loss',
].join('\n');

const happensBeforeCode = [
  'int data;',
  'volatile boolean ready;',
  '',
  '// Thread A',
  'data = 42;',
  'ready = true;       // volatile write releases prior writes',
  '',
  '// Thread B',
  'if (ready) {        // volatile read acquires published writes',
  '    use(data);       // guaranteed to observe 42',
  '}',
].join('\n');

const publicationCode = [
  'final class Configuration {',
  '    private final URI endpoint;',
  '    Configuration(URI endpoint) { this.endpoint = endpoint; }',
  '}',
  '',
  'private volatile Configuration current;',
  '',
  'void reload() {',
  '    current = new Configuration(loadEndpoint());',
  '}',
  '',
  'Configuration snapshot() { return current; }',
].join('\n');

const confinementCode = [
  'void handle(Request request) {',
  '    ArrayList<Item> local = new ArrayList<>();',
  '    // local is confined to this invocation and needs no lock',
  '    local.addAll(parse(request));',
  '    publish(List.copyOf(local)); // publish an immutable snapshot',
  '}',
  '',
  '// ThreadLocal is confinement by thread, not automatic cleanup.',
  'private static final ThreadLocal<Trace> TRACE = new ThreadLocal<>();',
].join('\n');

const mapCode = [
  'Map<String, Session> unsafe = new HashMap<>();',
  'ConcurrentMap<String, Session> sessions = new ConcurrentHashMap<>();',
  '',
  'Session session = sessions.get(token); // nonblocking retrieval',
  'sessions.put(token, refreshed);        // thread-safe update',
  '',
  '// Iteration is weakly consistent: safe during updates,',
  '// but not an atomic snapshot of the whole map.',
].join('\n');

const compoundMapCode = [
  'if (!cache.containsKey(key)) {',
  '    cache.put(key, load(key)); // race: another thread may insert here',
  '}',
  '',
  'Value existing = cache.putIfAbsent(key, candidate);',
  '',
  'Value value = cache.computeIfAbsent(key, this::load);',
  '',
  'cache.compute(key, (k, old) -> refresh(k, old));',
].join('\n');

const mapMethodsCode = [
  'cache.putIfAbsent(key, alreadyBuiltValue);',
  '// Insert only when absent; candidate may have been built eagerly.',
  '',
  'cache.computeIfAbsent(key, this::loadValue);',
  '// Derive a value only when the key has no non-null mapping.',
  '',
  'counts.compute(key, (k, old) -> old == null ? 1 : old + 1);',
  '// Recalculate from both key and current value atomically per key.',
  '',
  'counts.merge(key, 1, Integer::sum);',
  '// Combine a supplied value with an existing value.',
].join('\n');

const specialCollectionsCode = [
  'CopyOnWriteArrayList<Listener> listeners = new CopyOnWriteArrayList<>();',
  'for (Listener listener : listeners) listener.onEvent(event);',
  '// Iterator reads a stable array snapshot.',
  '',
  'BlockingQueue<Job> jobs = new ArrayBlockingQueue<>(100);',
  'jobs.put(job);      // producer waits when full',
  'Job next = jobs.take(); // consumer waits when empty',
].join('\n');

const deadlockCode = [
  'synchronized (accountA) {',
  '    synchronized (accountB) { transfer(accountA, accountB); }',
  '}',
  '',
  '// Another thread locks in the opposite order:',
  'synchronized (accountB) {',
  '    synchronized (accountA) { transfer(accountB, accountA); }',
  '}',
].join('\n');

const avoidDeadlockCode = [
  'Account first = a.id().compareTo(b.id()) < 0 ? a : b;',
  'Account second = first == a ? b : a;',
  '',
  'synchronized (first) {',
  '    synchronized (second) {',
  '        performTransfer(a, b, amount);',
  '    }',
  '}',
  '',
  '// ReentrantLock.tryLock(timeout, unit) can support bounded waiting.',
].join('\n');

const springCode = [
  '@Service',
  'final class PricingService {',
  '    private final PriceRepository repository; // safe dependency reference',
  '',
  '    Price quote(ProductId id) {',
  '        BigDecimal subtotal = repository.priceFor(id); // local state',
  '        return new Price(subtotal);',
  '    }',
  '}',
  '',
  '// Unsafe in a singleton: private Order currentOrder;',
].join('\n');

function InterleavingFigure() {
  return <Figure caption="The result depends on timing because read-modify-write is three operations. Mutual exclusion or one atomic read-modify-write operation prevents the lost update."><div className="overflow-x-auto font-sans text-sm"><div className="min-w-[560px] grid grid-cols-3 gap-2 text-center"><b>Step</b><b>Thread A</b><b>Thread B</b><span>1</span><span className="rounded-lg bg-cyan-50 p-2">read 0</span><span>—</span><span>2</span><span>—</span><span className="rounded-lg bg-amber-50 p-2">read 0</span><span>3</span><span className="rounded-lg bg-cyan-50 p-2">write 1</span><span>—</span><span>4</span><span>—</span><span className="rounded-lg bg-amber-50 p-2">write 1</span><b>Result</b><span className="col-span-2 rounded-lg bg-rose-50 p-2">1 instead of 2</span></div></div></Figure>;
}

function SafetyDimensionsFigure() {
  const items = [['ATOMICITY','Does an action happen indivisibly?'],['VISIBILITY','When must another thread observe a write?'],['ORDERING','Which reorderings are forbidden across threads?']];
  return <Figure caption="These are separate guarantees. A correct synchronization strategy must provide the combination required by the invariant."><div className="grid gap-3 font-sans text-sm sm:grid-cols-3">{items.map(([a,b])=><div key={a} className="rounded-xl border border-slate-300 bg-slate-50 p-4"><b className="text-cyan-800">{a}</b><span className="mt-2 block text-slate-600">{b}</span></div>)}</div></Figure>;
}

function PrimitiveComparisonFigure() {
  return <Figure caption="synchronized combines mutual exclusion with visibility and ordering around a monitor. volatile publishes one field’s reads and writes without locking. Atomic classes provide atomic operations on individual variables, commonly using compare-and-set."><div className="grid gap-3 font-sans text-sm sm:grid-cols-3"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>synchronized</b><span className="block text-slate-600">multi-step invariant · one lock owner</span></div><div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>volatile</b><span className="block text-slate-600">visibility · ordering · no compound atomicity</span></div><div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><b>AtomicInteger</b><span className="block text-slate-600">single-variable atomic updates</span></div></div></Figure>;
}

function HappensBeforeFigure() {
  return <Figure caption="Happens-before is a guarantee of visibility and ordering, not wall-clock timing. Program order plus a synchronizes-with edge creates a transitive path from the data write to the later data read."><div className="grid gap-3 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center"><div className="rounded-xl border bg-white p-4">A: write data</div><ArrowRight className="mx-auto rotate-90 sm:rotate-0" /><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4">A: volatile write<br />→ B: volatile read</div><ArrowRight className="mx-auto rotate-90 sm:rotate-0" /><div className="rounded-xl border bg-white p-4">B: read data</div></div></Figure>;
}

function MapRaceFigure() {
  return <Figure caption="Each call can be thread-safe while the two-call decision is not. Atomic map methods move the decision and update into one per-key operation."><div className="space-y-3 font-sans text-sm"><div className="grid grid-cols-2 gap-3 text-center"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-3">A: containsKey → false</div><div className="rounded-xl border border-amber-300 bg-amber-50 p-3">B: containsKey → false</div><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-3">A: load + put</div><div className="rounded-xl border border-amber-300 bg-amber-50 p-3">B: load + put</div></div><div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-center"><b>computeIfAbsent: one atomic per-key decision</b></div></div></Figure>;
}

function DeadlockFigure() {
  return <Figure caption="A cycle in the wait-for graph means neither thread can progress. Consistent lock ordering removes the circular-wait condition."><div className="grid gap-3 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center"><div className="rounded-full border border-cyan-300 bg-cyan-50 p-4"><b>Thread A</b><span className="block">holds L1</span></div><ArrowRight className="mx-auto text-rose-600" /><div className="rounded-xl border border-rose-300 bg-rose-50 p-4"><b>waits for L2</b><br />while B holds L2 and waits for L1</div><ArrowRight className="mx-auto rotate-180 text-rose-600" /><div className="rounded-full border border-amber-300 bg-amber-50 p-4"><b>Thread B</b><span className="block">holds L2</span></div></div></Figure>;
}

function OverviewPage(){return <div className="article-copy"><div className="answer-card"><p>A class is thread-safe when it preserves its invariants under every permitted concurrent use without requiring callers to add undocumented coordination. Achieve this by avoiding shared mutable state, confining it, making it immutable, or guarding every related access with one clearly defined synchronization policy.</p></div><SafetyDimensionsFigure/><CodeBlock code={safeClassCode} label="Guard the complete invariant"/><h3>Begin with ownership</h3><ul><li>Which state can multiple threads reach?</li><li>Which fields form one invariant and must change together?</li><li>What lock, atomic operation, immutable snapshot, or concurrent collection owns that invariant?</li></ul><Callout tone="tip" title="Thread-safe is a contract">Document compound operations, iteration semantics, callback behavior, and whether returned objects remain safe after they escape.</Callout></div>}

function RacePage(){return <div className="article-copy"><div className="answer-card"><p>A race condition exists when correctness depends on an unpredictable ordering of concurrent actions. A data race is the narrower Java Memory Model case of conflicting unsynchronized accesses to the same variable. Check-then-act and read-modify-write sequences are common race shapes.</p></div><InterleavingFigure/><CodeBlock code={raceCode} label="Check-then-act race"/><p>Testing may miss a race because the failing interleaving can be rare. Correctness must follow from synchronization and ownership, not from observed timing.</p></div>}

function DimensionsPage(){return <div className="article-copy"><div className="answer-card"><p>Atomicity means an operation cannot be observed half-completed. Visibility means one thread is guaranteed to observe another thread’s writes. Ordering means the memory model constrains which operations may appear reordered to other threads. A mechanism can provide some guarantees without providing all of them.</p></div><SafetyDimensionsFigure/><CodeBlock code={unsafeCounterCode} label="One expression, three actions"/><Callout title="No torn int does not make count++ atomic">An ordinary int read or write is atomic, but the whole read-add-write sequence is not one atomic action.</Callout></div>}

function SynchronizedPage(){return <div className="article-copy"><div className="answer-card"><p><code>synchronized</code> acquires an object monitor. Only one thread can hold that monitor at a time, so a block can protect a multi-field invariant. Releasing the monitor publishes prior writes; a later acquisition of the same monitor observes them. Monitor release is automatic even when an exception exits the block.</p></div><CodeBlock code={synchronizedCode} label="Mutual exclusion around an invariant"/><h3>Lock discipline matters</h3><ul><li>Every access to guarded state must use the same monitor.</li><li>Keep critical sections small, but never split one invariant across separately locked steps.</li><li>A synchronized instance method locks <code>this</code>; a static synchronized method locks the Class object.</li><li>Avoid calling unknown external code while holding a lock.</li></ul></div>}

function VolatilePage(){return <div className="article-copy"><div className="answer-card"><p><code>volatile</code> gives reads and writes of one field visibility and ordering guarantees. A write happens-before a subsequent read of that field. It works well for independent state flags or safely replacing an immutable snapshot, but it does not make a multi-step invariant or read-modify-write expression atomic.</p></div><PrimitiveComparisonFigure/><CodeBlock code={volatileCode} label="Visibility flag"/><Callout tone="warning" title="volatile protects the publication, not the object’s later mutation">Publishing a mutable object reference through a volatile field does not make unsynchronized mutations inside that object safe.</Callout></div>}

function AtomicsPage(){return <div className="article-copy"><div className="answer-card"><p><code>volatile int count</code> is insufficient for <code>count++</code> because increment reads, computes, and writes; another thread can interleave between those actions. <code>AtomicInteger.incrementAndGet()</code> performs one atomic update, commonly through a compare-and-set loop that retries if another thread changed the value first.</p></div><CodeBlock code={atomicCode} label="Atomic read-modify-write"/><h3>Choose the scope correctly</h3><p>Atomic classes are excellent for an independent counter, sequence, or reference transition. They do not automatically preserve an invariant spanning several atomic variables. Use a lock, immutable state held in one <code>AtomicReference</code>, or another higher-level design for multi-field transitions.</p><Callout title="Contention still has a cost">Lock-free means system-wide progress is possible; it does not mean every operation is wait-free or free of retries. High-contention statistics may benefit from <code>LongAdder</code> when an instantaneous exact total is unnecessary.</Callout></div>}

function HappensBeforePage(){return <div className="article-copy"><div className="answer-card"><p>Happens-before is the Java Memory Model relation that guarantees one action’s effects are visible to and ordered before another action. Important edges include monitor unlock-to-later-lock, volatile write-to-later-read, <code>Thread.start()</code>, successful <code>Thread.join()</code>, final-field construction rules, and concurrency-library handoffs.</p></div><HappensBeforeFigure/><CodeBlock code={happensBeforeCode} label="Transitive publication"/><p>If two conflicting accesses are not ordered by happens-before, the program has a data race. Real-time order alone is not enough to create the guarantee.</p></div>}

function PublicationPage(){return <div className="article-copy"><div className="answer-card"><p>Safe publication ensures another thread cannot observe a reference without also observing the object’s initialized state. Publish through a static initializer, a volatile field, an atomic or concurrent collection, a properly locked field, or another API whose contract creates a happens-before edge. Do not let <code>this</code> escape during construction.</p></div><CodeBlock code={publicationCode} label="Publish an immutable snapshot"/><h3>Final fields help, but do not solve every escape</h3><p>When construction completes normally and the object is not leaked early, final fields receive special visibility guarantees. Mutable objects reachable through final references still require their own safe mutation strategy.</p><Callout tone="warning" title="A constructor return is not universal publication">Another thread needs a defined handoff. Assigning the new object to an ordinary shared field without synchronization can leave the read unordered.</Callout></div>}

function ConfinementPage(){return <div className="article-copy"><div className="answer-card"><p>Thread confinement keeps mutable state reachable by only one thread, removing the need for synchronization around that state. Local variables are naturally confined unless their references escape. Event-loop ownership, actor-style queues, and carefully managed ThreadLocal state are other forms.</p></div><CodeBlock code={confinementCode} label="Mutate locally, publish immutably"/><h3>Shared mutable state multiplies coordination</h3><p>Every alias that can mutate shared data must obey the same protocol. Reducing aliases, publishing immutable values, or sending messages through queues often produces simpler correctness than adding locks around a widely shared graph.</p><Callout title="ThreadLocal and pools">Pool threads are reused, so values can leak between requests unless they are cleared in a <code>finally</code> block. Virtual threads change the scaling cost but not the semantic cleanup requirement.</Callout></div>}

function ConcurrentMapPage(){return <div className="article-copy"><div className="answer-card"><p><code>HashMap</code> is not safe for concurrent structural updates. <code>ConcurrentHashMap</code> provides thread-safe operations, nonblocking retrievals, high expected update concurrency, per-key atomic methods, and weakly consistent iteration. It rejects null keys and values so null can reliably mean “no mapping.”</p></div><CodeBlock code={mapCode} label="Concurrent map semantics"/><h3>How current implementations scale</h3><p>Modern OpenJDK implementations use a bucket table with volatile/CAS coordination and localized locking for contended updates; collision lists may become tree bins. Treat those mechanics as version-specific. The API guarantee is concurrent retrieval, thread-safe updates, and specified per-key atomic operations—not an atomic whole-map snapshot.</p><Callout title="Weakly consistent iteration">An iterator can proceed while updates occur and may reflect some of them. It does not throw <code>ConcurrentModificationException</code> and should not be used when a transactionally consistent snapshot is required.</Callout></div>}

function CompoundMapPage(){return <div className="article-copy"><div className="answer-card"><p><code>containsKey()</code> followed by <code>put()</code> is not atomic because another thread can change the map between the calls. This remains true even when each call is individually thread-safe. Use one atomic compound method that expresses the complete per-key decision.</p></div><MapRaceFigure/><CodeBlock code={compoundMapCode} label="Move the decision into the map"/><Callout tone="warning" title="Mapping functions must be suitable for map coordination">Keep them short and avoid recursive updates to the same key. Under contention, understand the method contract before relying on exactly-once side effects.</Callout></div>}

function MapMethodsPage(){return <div className="article-copy"><div className="answer-card"><p>Use <code>putIfAbsent()</code> when a candidate value already exists and should be installed only if absent. Use <code>computeIfAbsent()</code> to derive a missing value from the key. Use <code>compute()</code> when the result depends on both the key and current value, including replacement or removal. Use <code>merge()</code> for combine-or-insert updates.</p></div><CodeBlock code={mapMethodsCode} label="Choose the atomic intent"/><h3>Null semantics matter</h3><p>For maps that allow null, compute methods often treat a null mapping like absence, and returning null can remove or avoid a mapping. <code>ConcurrentHashMap</code> rejects null keys and values, which removes that ambiguity from ordinary reads.</p><Callout tone="tip" title="For frequency maps">A common scalable pattern is <code>map.computeIfAbsent(key, k -&gt; new LongAdder()).increment()</code>. The map installs the counter atomically per key; the counter handles frequent increments.</Callout></div>}

function SpecialCollectionsPage(){return <div className="article-copy"><div className="answer-card"><p>Use <code>CopyOnWriteArrayList</code> when reads and traversals vastly outnumber writes and snapshot iteration is desirable; every mutation copies the backing array. Use a <code>BlockingQueue</code> for producer-consumer handoff when producers or consumers should wait for capacity or data.</p></div><CodeBlock code={specialCollectionsCode} label="Different collection tradeoffs"/><div className="grid gap-3 sm:grid-cols-2"><article className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><h3 className="mt-0">Copy on write</h3><p>Excellent for listener registries and rarely changed routing tables. Expensive for frequent mutation or large arrays.</p></article><article className="rounded-xl border border-amber-300 bg-amber-50 p-4"><h3 className="mt-0">Blocking queue</h3><p>Coordinates producers and consumers. A bounded queue also limits buffered work and can create backpressure.</p></article></div></div>}

function DeadlockPage(){return <div className="article-copy"><div className="answer-card"><p>Deadlock occurs when threads wait forever in a cycle of resources. The classic necessary conditions are mutual exclusion, hold-and-wait, no forced preemption, and circular wait. Nested locks acquired in inconsistent order commonly create the cycle.</p></div><DeadlockFigure/><CodeBlock code={deadlockCode} label="Opposite lock order"/><p>Removing any required condition prevents this deadlock shape. In application code, consistent global lock ordering and avoiding external calls while holding locks are especially effective.</p></div>}

function LivenessPage(){return <div className="article-copy"><div className="answer-card"><p>Deadlock means participants are blocked in a wait cycle. Livelock means they remain active but repeatedly react in ways that prevent progress. Starvation means one participant is continually denied CPU time, a lock, or another resource while others progress.</p></div><h3>Recognize the symptoms</h3><ul><li><b>Deadlock:</b> stable blocked stacks and a lock cycle.</li><li><b>Livelock:</b> high activity or repeated retries with no completed work.</li><li><b>Starvation:</b> long-tail tasks never acquire a contended unfair resource.</li></ul><Callout title="Retries need a policy">Randomized or exponential backoff can break synchronized livelock. Fair locks may reduce starvation but can lower throughput; first reduce contention and keep critical sections bounded.</Callout><Callout tone="warning" title="Busy is not progress">CPU utilization and thread activity are operational signals, not evidence that requests are completing.</Callout></div>}

function DetectionPage(){return <div className="article-copy"><div className="answer-card"><p>Detect Java deadlocks with thread dumps from <code>jcmd Thread.print</code>, <code>jstack</code>, JMX <code>ThreadMXBean.findDeadlockedThreads()</code>, or JDK Flight Recorder. Inspect which locks each thread owns and awaits. Prevent recurrence by correcting ownership and lock ordering rather than adding random sleeps.</p></div><CodeBlock code={avoidDeadlockCode} label="One global lock order"/><h3>Production investigation</h3><ol className="step-list"><li><b>Capture several dumps.</b><span>Separate a stable wait cycle from a slow operation.</span></li><li><b>Find the owners.</b><span>Follow monitor or ownable-synchronizer identifiers.</span></li><li><b>Map stacks to one invariant.</b><span>Identify why both locks were needed.</span></li><li><b>Redesign the protocol.</b><span>Order, coarsen, split ownership, time-bound acquisition, or remove shared mutation.</span></li></ol></div>}

function SpringPage(){return <div className="article-copy"><div className="answer-card"><p>No. Spring singleton scope creates one bean instance per application context; it does not serialize method calls or make mutable fields safe. Many request threads may call the same service concurrently. Design singleton services as stateless objects with final dependencies, or explicitly coordinate any shared mutable state.</p></div><CodeBlock code={springCode} label="Stateless singleton service"/><h3>Common hazards</h3><ul><li>Request-specific data stored in instance fields.</li><li>Non-thread-safe formatters, builders, or collections reused across calls.</li><li>Check-then-act cache logic around otherwise concurrent components.</li><li>Assuming a transactional proxy makes in-memory fields thread-safe.</li></ul><Callout title="Scope and thread safety answer different questions">Bean scope controls instance lifetime and identity. Thread safety controls correctness under concurrent access.</Callout></div>}

function RecapPage(){return <div className="article-copy"><div className="answer-card"><p>Senior concurrency reasoning begins with the invariant and ownership model. Then select the smallest mechanism that establishes the required atomicity and happens-before edges. Prefer immutable values, confinement, task handoff, and library concurrency primitives over ad hoc flag-and-lock protocols.</p></div><h3>Rapid senior interview</h3><div className="faq-list"><details><summary>Why is volatile count++ unsafe?</summary><p>Volatile makes individual reads and writes visible, but another thread can interleave during the read-add-write sequence.</p></details><details><summary>What does happens-before guarantee?</summary><p>If A happens-before B, B observes A’s effects in the ordering required by the Java Memory Model.</p></details><details><summary>Why is ConcurrentHashMap iteration not a snapshot?</summary><p>Its iterators are weakly consistent so updates can proceed concurrently; traversal may reflect some concurrent changes.</p></details><details><summary>How do you make check-then-put atomic?</summary><p>Use the per-key compound operation that expresses the intent, such as putIfAbsent or computeIfAbsent.</p></details><details><summary>Is a Spring singleton safe?</summary><p>Only if its implementation is safe under concurrent calls. Singleton scope itself provides no synchronization.</p></details></div><div className="sources"><p className="eyebrow">Primary references</p><a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html" target="_blank" rel="noreferrer">JLS 17: threads, locks, and the memory model <ArrowRight /></a><a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/package-summary.html" target="_blank" rel="noreferrer">java.util.concurrent overview and memory effects <ArrowRight /></a><a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html" target="_blank" rel="noreferrer">ConcurrentHashMap contract <ArrowRight /></a></div></div>}

export const javaConcurrencyPages: ReadingPage[] = [
  {id:'thread-safety',chapter:'Correctness model',title:'What makes a class thread-safe?',Content:OverviewPage},
  {id:'race-conditions',chapter:'Correctness model',title:'Race conditions and lost updates',Content:RacePage},
  {id:'safety-dimensions',chapter:'Memory model',title:'Atomicity, visibility, and ordering',Content:DimensionsPage},
  {id:'synchronized',chapter:'Coordination',title:'How synchronized works',Content:SynchronizedPage},
  {id:'volatile',chapter:'Coordination',title:'How volatile works',Content:VolatilePage},
  {id:'atomic-classes',chapter:'Coordination',title:'Atomic classes and count++',Content:AtomicsPage},
  {id:'happens-before',chapter:'Memory model',title:'The happens-before relationship',Content:HappensBeforePage},
  {id:'safe-publication',chapter:'Memory model',title:'Safe publication',Content:PublicationPage},
  {id:'confinement',chapter:'State ownership',title:'Thread confinement and shared state',Content:ConfinementPage},
  {id:'concurrent-hash-map',chapter:'Concurrent collections',title:'ConcurrentHashMap versus HashMap',Content:ConcurrentMapPage},
  {id:'compound-map-operations',chapter:'Concurrent collections',title:'Why containsKey() then put() races',Content:CompoundMapPage},
  {id:'atomic-map-methods',chapter:'Concurrent collections',title:'putIfAbsent(), compute(), and merge()',Content:MapMethodsPage},
  {id:'special-collections',chapter:'Concurrent collections',title:'CopyOnWriteArrayList and BlockingQueue',Content:SpecialCollectionsPage},
  {id:'deadlock',chapter:'Liveness',title:'How deadlock forms',Content:DeadlockPage},
  {id:'livelock-starvation',chapter:'Liveness',title:'Deadlock, livelock, and starvation',Content:LivenessPage},
  {id:'deadlock-detection',chapter:'Liveness',title:'Detecting and preventing deadlock',Content:DetectionPage},
  {id:'spring-singletons',chapter:'Framework reality',title:'Spring singleton thread safety',Content:SpringPage},
  {id:'concurrency-recap',chapter:'Interview recap',title:'Concurrency mock interview and recap',Content:RecapPage},
];
