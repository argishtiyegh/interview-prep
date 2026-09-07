'use client';

import { ArrowRight } from 'lucide-react';
import { Callout, CodeBlock, Figure } from '@/components/answer-primitives';
import type { ReadingPage } from '@/lib/reading';

const valueObjectCode = [
  'public final class UserId {',
  '    private final long value;',
  '',
  '    public UserId(long value) {',
  '        this.value = value;',
  '    }',
  '',
  '    @Override',
  '    public boolean equals(Object other) {',
  '        return this == other',
  '                || other instanceof UserId that',
  '                && value == that.value;',
  '    }',
  '',
  '    @Override',
  '    public int hashCode() {',
  '        return Long.hashCode(value);',
  '    }',
  '}',
].join('\n');

const hashFieldsCode = [
  'public final class Product {',
  '    private final long id;',
  '    private String displayName;',
  '',
  '    @Override',
  '    public boolean equals(Object other) {',
  '        return this == other',
  '                || other instanceof Product that',
  '                && id == that.id;',
  '    }',
  '',
  '    @Override',
  '    public int hashCode() {',
  '        return Long.hashCode(id);',
  '    }',
  '}',
].join('\n');

const overloadedEqualsCode = [
  'final class User {',
  '    private final long id;',
  '',
  '    User(long id) { this.id = id; }',
  '',
  '    // Overloads equals; does not override equals(Object)',
  '    public boolean equals(User other) {',
  '        return other != null && id == other.id;',
  '    }',
  '}',
  '',
  'Set<User> users = new HashSet<>();',
  'users.add(new User(7));',
  'users.add(new User(7));',
  '',
  'System.out.println(users.size());',
].join('\n');

const missingHashCodeCode = [
  'final class Ticket {',
  '    private final String number;',
  '',
  '    Ticket(String number) { this.number = number; }',
  '',
  '    @Override',
  '    public boolean equals(Object other) {',
  '        return this == other',
  '                || other instanceof Ticket that',
  '                && number.equals(that.number);',
  '    }',
  '    // hashCode() is missing',
  '}',
  '',
  'Map<Ticket, String> owners = new HashMap<>();',
  'owners.put(new Ticket("A-42"), "Ana");',
  '',
  'System.out.println(owners.get(new Ticket("A-42")));',
].join('\n');

const comparatorCode = [
  'record User(long id, String email) {}',
  '',
  'Comparator<User> byId = Comparator.comparingLong(User::id);',
  'Set<User> users = new TreeSet<>(byId);',
  '',
  'users.add(new User(7, "ana@example.com"));',
  'users.add(new User(7, "sam@example.com"));',
  '',
  'System.out.println(users.size());',
].join('\n');

const dequeCode = [
  'Deque<Job> queue = new ArrayDeque<>();',
  'queue.addLast(firstJob);',
  'queue.addLast(secondJob);',
  'Job next = queue.removeFirst(); // FIFO',
  '',
  'Deque<Action> stack = new ArrayDeque<>();',
  'stack.push(openFile);',
  'stack.push(editFile);',
  'Action undo = stack.pop();      // LIFO',
].join('\n');

const linkedLoopCode = [
  '// Hidden O(n²): every get(i) traverses the linked list',
  'for (int i = 0; i < linkedList.size(); i++) {',
  '    process(linkedList.get(i));',
  '}',
  '',
  '// O(n): follow the iterator once',
  'for (Order order : linkedList) {',
  '    process(order);',
  '}',
].join('\n');

const setCode = [
  'Set<String> processedIds = new HashSet<>();',
  '',
  'if (processedIds.add(message.id())) {',
  '    process(message);',
  '}',
  '',
  'NavigableSet<Integer> scores =',
  '        new TreeSet<>(List.of(55, 72, 88, 91));',
  '',
  'scores.ceiling(80); // 88',
  'scores.floor(80);   // 72',
  'scores.subSet(70, true, 90, true); // [72, 88]',
].join('\n');

const mapOrderCode = [
  'Map<Integer, String> hash = new HashMap<>();',
  'Map<Integer, String> linked = new LinkedHashMap<>();',
  'Map<Integer, String> sorted = new TreeMap<>();',
  '',
  'for (Map<Integer, String> map : List.of(hash, linked, sorted)) {',
  '    map.put(30, "C");',
  '    map.put(10, "A");',
  '    map.put(20, "B");',
  '}',
  '',
  '// HashMap:       no guaranteed order',
  '// LinkedHashMap: 30, 10, 20',
  '// TreeMap:       10, 20, 30',
].join('\n');

const lruCode = [
  'final class LruMap<K, V> extends LinkedHashMap<K, V> {',
  '    private final int maximumSize;',
  '',
  '    LruMap(int maximumSize) {',
  '        super(16, 0.75f, true); // access order',
  '        this.maximumSize = maximumSize;',
  '    }',
  '',
  '    @Override',
  '    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {',
  '        return size() > maximumSize;',
  '    }',
  '}',
].join('\n');

const rangeCode = [
  'NavigableMap<Instant, Event> events = new TreeMap<>();',
  '',
  'SortedMap<Instant, Event> today = events.subMap(',
  '        startOfDay, true,',
  '        startOfTomorrow, false',
  ');',
].join('\n');

const raceCode = [
  '// Thread-safe calls, but the pair is not atomic',
  'if (!cache.containsKey(key)) {',
  '    cache.put(key, load(key));',
  '}',
  '',
  '// One atomic per-key operation',
  'Value value = cache.computeIfAbsent(key, this::load);',
].join('\n');

const countingCode = [
  'ConcurrentMap<String, Integer> counts = new ConcurrentHashMap<>();',
  'counts.merge(word, 1, Integer::sum);',
  '',
  'ConcurrentMap<String, LongAdder> frequencies =',
  '        new ConcurrentHashMap<>();',
  '',
  'frequencies',
  '        .computeIfAbsent(word, key -> new LongAdder())',
  '        .increment();',
].join('\n');

function DecisionDiagram() {
  const choices = [
    ['Indexed sequence', 'ArrayList'],
    ['Stack or queue', 'ArrayDeque'],
    ['Unique membership', 'HashSet'],
    ['Sorted unique values', 'TreeSet'],
    ['General key lookup', 'HashMap'],
    ['Stable encounter order', 'LinkedHashMap'],
    ['Sorted keys and ranges', 'TreeMap'],
    ['Concurrent key access', 'ConcurrentHashMap'],
  ];
  return <Figure caption="Start with the behavior the program needs, then select the implementation whose guarantees and dominant operations fit it.">
    <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 text-center">
      <p className="text-xs font-extrabold uppercase tracking-[.12em] text-slate-600">Required behavior</p>
      <p className="mt-1 font-bold text-slate-950">Duplicates · order · random access · ranges · ends · concurrency</p>
    </div>
    <div className="py-2 text-center text-2xl font-bold text-cyan-700">↓</div>
    <div className="grid gap-2 sm:grid-cols-2">
      {choices.map(([need, choice]) => <div key={need} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-slate-300 bg-white p-3 text-sm">
        <span className="text-right font-semibold text-slate-600">{need}</span><ArrowRight className="size-4 text-cyan-600" /><strong className="text-slate-950">{choice}</strong>
      </div>)}
    </div>
  </Figure>;
}

function RaceDiagram() {
  return <Figure caption="Each map call is thread-safe, but another thread can act between the check and the update. Use one atomic map operation for the whole decision.">
    <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-2 text-sm">
      <strong className="text-slate-600">Time</strong><strong className="rounded-lg bg-cyan-50 p-2 text-center text-cyan-900">Thread A</strong><strong className="rounded-lg bg-amber-50 p-2 text-center text-amber-900">Thread B</strong>
      <span className="font-mono text-slate-500">1</span><span className="rounded-lg border border-cyan-200 p-2">containsKey(k) → false</span><span />
      <span className="font-mono text-slate-500">2</span><span /><span className="rounded-lg border border-amber-200 p-2">containsKey(k) → false</span>
      <span className="font-mono text-slate-500">3</span><span className="rounded-lg border border-cyan-200 p-2">load(k)</span><span className="rounded-lg border border-amber-200 p-2">load(k)</span>
      <span className="font-mono text-slate-500">4</span><span className="rounded-lg border border-cyan-200 p-2">put(k, valueA)</span><span />
      <span className="font-mono text-slate-500">5</span><span /><span className="rounded-lg border border-amber-200 p-2">put(k, valueB)</span>
    </div>
  </Figure>;
}

function RoadmapPage() {
  return <div className="article-copy">
    <p>These questions test whether you can connect an API choice to correctness, performance, and production behavior.</p>
    <div className="pitfall-grid">
      <article><span>CONTRACTS</span><h3>Can collections trust the object?</h3><p>Explain logical identity and stable equality.</p></article>
      <article><span>ACCESS PATTERN</span><h3>Did you choose from requirements?</h3><p>Start with duplicates, order, access, and dominant operations.</p></article>
      <article><span>TRADEOFFS</span><h3>Can you compare implementations?</h3><p>Discuss time, memory, ordering, ranges, and concurrency.</p></article>
      <article><span>JUDGMENT</span><h3>Can you handle follow-ups?</h3><p>Recognize weak answers, races, and production consequences.</p></article>
    </div>
    <h3>Fast decision checklist</h3>
    <ol className="step-list">
      <li><b>Values or key-value mappings?</b></li>
      <li><b>Are duplicates allowed?</b></li>
      <li><b>Do you need indexed access or operations at the ends?</b></li>
      <li><b>Must encounter order be predictable or sorted?</b></li>
      <li><b>Do you need range or nearest-element queries?</b></li>
      <li><b>Will multiple threads update it?</b></li>
    </ol>
    <Callout tone="tip" title="Interview habit">Name the required behavior before naming a class. This turns a memorized answer into an engineering decision.</Callout>
  </div>;
}

function SpokenAnswersPage() {
  return <div className="article-copy">
    <h3>Equality contracts</h3>
    <div className="answer-card"><p><code>equals()</code> must be reflexive, symmetric, transitive, and consistent, and a non-null object must not equal <code>null</code>. Equal objects must have equal hash codes, while unequal objects may collide. If I override value-based equality, I override both methods using the same stable fields.</p></div>
    <h3>Lists, sets, and deques</h3>
    <div className="answer-card"><p>I use <code>ArrayList</code> as the normal list, <code>HashSet</code> for unique membership, <code>TreeSet</code> for sorted uniqueness and range queries, and <code>ArrayDeque</code> for a stack or queue. I choose <code>LinkedList</code> only when its linked representation matches a demonstrated access pattern.</p></div>
    <h3>Map implementations</h3>
    <div className="answer-card"><p><code>HashMap</code> is the general-purpose unordered map. <code>LinkedHashMap</code> adds predictable encounter or access order. <code>TreeMap</code> keeps keys sorted and supports navigation. <code>ConcurrentHashMap</code> supports concurrent access and atomic per-key updates without allowing <code>null</code>.</p></div>
  </div>;
}

function EqualsContractPage() {
  return <div className="article-copy">
    <p><code>equals()</code> defines logical equality. For non-null references <code>x</code>, <code>y</code>, and <code>z</code>, it must obey five rules.</p>
    <div className="table-wrap"><table><thead><tr><th>Rule</th><th>Required behavior</th></tr></thead><tbody>
      <tr><td><b>Reflexive</b></td><td><code>x.equals(x)</code> is true.</td></tr>
      <tr><td><b>Symmetric</b></td><td><code>x.equals(y)</code> and <code>y.equals(x)</code> agree.</td></tr>
      <tr><td><b>Transitive</b></td><td>If x equals y and y equals z, x equals z.</td></tr>
      <tr><td><b>Consistent</b></td><td>Repeated calls agree while equality state is unchanged.</td></tr>
      <tr><td><b>Non-null</b></td><td><code>x.equals(null)</code> is false.</td></tr>
    </tbody></table></div>
    <h3><code>==</code> versus <code>equals()</code></h3>
    <p>For references, <code>==</code> asks whether two references point to the same object. <code>equals()</code> asks whether they represent the same logical value. The default <code>Object.equals()</code> also uses identity until a class overrides it.</p>
    <Callout title="Why the rules matter">They make equality an equivalence relation. Collections can group values consistently instead of changing their answer with comparison direction or history.</Callout>
  </div>;
}

function EqualityDesignPage() {
  return <div className="article-copy">
    <p>A final value type is straightforward because a subclass cannot add new equality-relevant state.</p>
    <CodeBlock code={valueObjectCode} />
    <p>A record is shorter when every component defines the value:</p>
    <CodeBlock code={'public record UserId(long value) {}'} />
    <h3><code>instanceof</code> or <code>getClass()</code>?</h3>
    <ul>
      <li><code>instanceof</code> can support compatible types, but subclasses that add value state can break symmetry or transitivity.</li>
      <li><code>getClass()</code> restricts equality to exactly the same runtime class.</li>
      <li>For open hierarchies with new value state, prefer composition or final value types.</li>
    </ul>
    <Callout tone="warning" title="The overloading trap"><code>equals(User)</code> does not override <code>equals(Object)</code>. Add <code>@Override</code> and use the exact signature so the compiler catches the mistake.</Callout>
  </div>;
}

function HashContractPage() {
  return <div className="article-copy">
    <p><code>hashCode()</code> narrows a hash-table search to a bucket. It does not prove equality.</p>
    <ol className="step-list">
      <li><b>Stable during one execution.</b><span>Repeated calls agree while equality-relevant information is unchanged.</span></li>
      <li><b>Equal means same hash.</b><span>If <code>x.equals(y)</code>, both objects must return the same hash.</span></li>
      <li><b>Same hash does not mean equal.</b><span>Unequal values may collide.</span></li>
    </ol>
    <div className="formula text-left"><code>equals() true&nbsp;&nbsp; → same hash code<br />same hash code&nbsp; ↛ equals() true</code></div>
    <h3>Use the same identity fields</h3>
    <CodeBlock code={hashFieldsCode} />
    <p>Only <code>id</code> defines equality, so only <code>id</code> contributes to the hash.</p>
    <Callout tone="warning" title="Mutable identity">Changing a field used by both methods while an object is a map key or set element can make lookup and removal search the wrong bucket.</Callout>
  </div>;
}

function EqualityExercisesPage() {
  return <div className="article-copy">
    <p>Answer each question before opening the explanation.</p>
    <h3>Why does the set keep both users?</h3>
    <CodeBlock code={overloadedEqualsCode} />
    <div className="faq-list"><details><summary>Show answer</summary><p>The output is <code>2</code>. The class overloads rather than overrides equality, and it inherits identity hashing. Use <code>equals(Object)</code>, add <code>@Override</code>, and implement the matching hash.</p></details></div>
    <h3>Why can lookup return null?</h3>
    <CodeBlock code={missingHashCodeCode} />
    <div className="faq-list"><details><summary>Show answer</summary><p>Equal tickets normally receive different identity-based hashes, so lookup can search a different bucket and never call <code>equals()</code>. Override <code>hashCode()</code> using <code>number</code>.</p></details></div>
    <h3>Why does the sorted set keep one value?</h3>
    <CodeBlock code={comparatorCode} />
    <div className="faq-list"><details><summary>Show answer</summary><p>The output is <code>1</code>. For <code>TreeSet</code>, comparison result zero means the same set position. The comparator ignores email, although record equality includes it. The ordering is inconsistent with equality.</p></details></div>
  </div>;
}

function ChooseCollectionPage() {
  return <div className="article-copy">
    <p>Choose the interface from the required behavior, then the implementation from the dominant operations.</p>
    <DecisionDiagram />
    <h3>Complexity vocabulary</h3>
    <div className="table-wrap"><table><thead><tr><th>Notation</th><th>Plain meaning</th></tr></thead><tbody>
      <tr><td><b>O(1)</b></td><td>Work does not grow with collection size, within the stated assumptions.</td></tr>
      <tr><td><b>O(log n)</b></td><td>Work grows slowly because each step discards much of the search space.</td></tr>
      <tr><td><b>O(n)</b></td><td>Work can grow in direct proportion to the number of elements.</td></tr>
      <tr><td><b>O(1) amortized</b></td><td>Most calls are cheap; an occasional resize is expensive, but its cost averages out across many calls.</td></tr>
    </tbody></table></div>
    <Callout title="Big-O is not a stopwatch">Allocation, memory layout, cache locality, hash distribution, and collection size also affect real performance.</Callout>
  </div>;
}

function ListsDequePage() {
  return <div className="article-copy">
    <div className="table-wrap"><table><thead><tr><th>Operation</th><th>ArrayList</th><th>LinkedList</th><th>ArrayDeque</th></tr></thead><tbody>
      <tr><td>Indexed get</td><td>O(1)</td><td>O(n)</td><td>Not supported</td></tr>
      <tr><td>Add at end</td><td>O(1) amortized</td><td>O(1)</td><td>O(1) amortized</td></tr>
      <tr><td>Add/remove at front</td><td>O(n)</td><td>O(1)</td><td>O(1) amortized</td></tr>
      <tr><td>Arbitrary index edit</td><td>O(n) shifting</td><td>O(n) to find</td><td>Not supported</td></tr>
      <tr><td>Typical role</td><td>General list</td><td>Iterator-positioned edits</td><td>Stack or queue</td></tr>
    </tbody></table></div>
    <h3>The LinkedList nuance</h3>
    <p>Relinking is O(1) only after the position is known. An indexed method must first traverse the list. A repeatedly indexed loop can therefore become O(n²).</p>
    <CodeBlock code={linkedLoopCode} />
    <h3>ArrayDeque for both ends</h3>
    <p>The API defines a resizable-array deque; current OpenJDK uses a circular array. It prohibits <code>null</code> and normally avoids the node overhead of <code>LinkedList</code>.</p>
    <CodeBlock code={dequeCode} />
  </div>;
}

function SetsPage() {
  return <div className="article-copy">
    <div className="table-wrap"><table><thead><tr><th>Property</th><th>HashSet</th><th>TreeSet</th></tr></thead><tbody>
      <tr><td>Matching</td><td><code>hashCode()</code>, then <code>equals()</code></td><td><code>compareTo()</code> or comparator</td></tr>
      <tr><td>Basic operations</td><td>O(1) average</td><td>O(log n)</td></tr>
      <tr><td>Order</td><td>Unspecified</td><td>Sorted</td></tr>
      <tr><td>Ranges/neighbors</td><td>No</td><td>Yes</td></tr>
      <tr><td>Typical use</td><td>Fast membership</td><td>Continuously sorted set</td></tr>
    </tbody></table></div>
    <CodeBlock code={setCode} />
    <h3>The senior-level distinction</h3>
    <p><code>TreeSet</code> considers two elements duplicates when their comparison returns zero. If that disagrees with <code>equals()</code>, the set can reject an object that equality considers different. The same issue applies to <code>TreeMap</code> keys.</p>
    <Callout tone="tip" title="When sorting once is enough">If you mainly need fast membership and only occasionally need ordered output, a <code>HashSet</code> plus a sorted snapshot may be better than maintaining tree order after every update.</Callout>
  </div>;
}

function MapComparisonPage() {
  return <div className="article-copy">
    <div className="table-wrap"><table><thead><tr><th>Map</th><th>Order</th><th>Basic cost</th><th>Null keys</th><th>Thread-safe</th></tr></thead><tbody>
      <tr><td><b>HashMap</b></td><td>None guaranteed</td><td>O(1) average</td><td>One</td><td>No</td></tr>
      <tr><td><b>LinkedHashMap</b></td><td>Insertion or access</td><td>O(1) average</td><td>One</td><td>No</td></tr>
      <tr><td><b>TreeMap</b></td><td>Sorted keys</td><td>O(log n)</td><td>Depends on ordering; natural order rejects</td><td>No</td></tr>
      <tr><td><b>ConcurrentHashMap</b></td><td>None guaranteed</td><td>O(1) expected</td><td>None</td><td>Yes</td></tr>
    </tbody></table></div>
    <CodeBlock code={mapOrderCode} />
    <ul>
      <li><code>HashMap</code>: general single-threaded lookup without ordering requirements.</li>
      <li><code>LinkedHashMap</code>: predictable encounter order with extra links per entry.</li>
      <li><code>TreeMap</code>: sorted, navigable keys and range views.</li>
      <li><code>ConcurrentHashMap</code>: concurrent access and atomic per-key operations; no <code>null</code> keys or values.</li>
    </ul>
  </div>;
}

function OrderedMapsPage() {
  return <div className="article-copy">
    <h3>Access-ordered LinkedHashMap</h3>
    <p>The default is insertion order. An access-ordered instance moves accessed entries from least-recently to most-recently used, which supports a simple LRU-style policy.</p>
    <CodeBlock code={lruCode} />
    <Callout tone="warning" title="A demonstration, not a complete cache">This map is not thread-safe and has no expiration, loading, size-by-weight policy, or cache metrics.</Callout>
    <h3>TreeMap ranges</h3>
    <CodeBlock code={rangeCode} />
    <p>A <code>HashMap</code> cannot directly provide this ordered range view. Frequent range and nearest-key operations justify the O(log n) tree cost.</p>
    <Callout title="Comparator contract">Comparison result zero determines key identity inside a sorted map. Keep ordering consistent with the intended equality of keys.</Callout>
  </div>;
}

function ConcurrentMapPage() {
  return <div className="article-copy">
    <p><code>ConcurrentHashMap</code> makes its operations thread-safe, but separate calls do not become one atomic workflow.</p>
    <CodeBlock code={raceCode} />
    <RaceDiagram />
    <h3>Choose the atomic operation that matches the intent</h3>
    <ul>
      <li><code>putIfAbsent()</code>: install a prepared value only when missing.</li>
      <li><code>computeIfAbsent()</code>: create a value atomically when missing.</li>
      <li><code>compute()</code>: derive the mapping from the current state.</li>
      <li><code>merge()</code>: combine an incoming value with an existing one.</li>
    </ul>
    <CodeBlock code={countingCode} />
    <Callout tone="warning" title="Keep computations short">A concurrent-map computation can block competing updates for the affected area. Its function should be small and must not recursively update the same map.</Callout>
    <p>Its iterators are <strong>weakly consistent</strong>: they do not throw <code>ConcurrentModificationException</code>, may reflect some concurrent updates, and are not a frozen snapshot.</p>
  </div>;
}

function MockInterviewPage() {
  return <div className="article-copy">
    <h3>Progressive mock interview</h3>
    <div className="faq-list">
      <details><summary>What contracts must equals() and hashCode() follow?</summary><p>State all five equality rules, then say equal objects require equal hashes, collisions are allowed, and equality fields must remain stable while used in hash collections.</p></details>
      <details><summary>Would you use LinkedList for frequent insertion?</summary><p>Ask where insertion happens. Relinking is O(1) only once positioned; finding an arbitrary index is O(n). Prefer ArrayList for most lists and ArrayDeque for queues.</p></details>
      <details><summary>When is TreeSet better than HashSet?</summary><p>When continuously sorted values, ranges, or neighbor queries justify O(log n). Mention that comparison result zero defines duplicates.</p></details>
      <details><summary>Is containsKey() followed by put() safe on ConcurrentHashMap?</summary><p>The calls are safe separately, but the compound decision races. Use putIfAbsent, compute, computeIfAbsent, or merge.</p></details>
    </div>
    <h3>Senior differentiators</h3>
    <ul>
      <li>State the complete equality contracts rather than only saying “override both methods.”</li>
      <li>Include traversal cost when discussing linked-list insertion.</li>
      <li>Mention comparator consistency for sorted sets and maps.</li>
      <li>Distinguish thread-safe calls from atomic multi-step workflows.</li>
    </ul>
  </div>;
}

function RecapPage() {
  return <div className="article-copy">
    <h3>Daily selection matrix</h3>
    <div className="formula text-left"><code>Indexed sequence&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → ArrayList<br />Stack or queue&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → ArrayDeque<br />Unique membership&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → HashSet<br />Sorted unique values&nbsp;&nbsp;&nbsp;&nbsp; → TreeSet<br /><br />General key lookup&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → HashMap<br />Stable encounter order&nbsp;&nbsp; → LinkedHashMap<br />Sorted keys and ranges&nbsp;&nbsp; → TreeMap<br />Concurrent key access&nbsp;&nbsp;&nbsp;&nbsp; → ConcurrentHashMap</code></div>
    <div className="answer-card"><p><strong>Memory hook:</strong> Correct equality makes collections trustworthy. Access pattern selects the collection. Ordering, sorting, and concurrency select the map.</p></div>
    <div className="sources">
      <p className="eyebrow">Primary references</p>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html" target="_blank" rel="noreferrer">Object equality and hashCode <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/doc-files/coll-overview.html" target="_blank" rel="noreferrer">Collections Framework overview <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html" target="_blank" rel="noreferrer">ArrayList API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html" target="_blank" rel="noreferrer">ArrayDeque API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html" target="_blank" rel="noreferrer">TreeSet API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashMap.html" target="_blank" rel="noreferrer">LinkedHashMap API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeMap.html" target="_blank" rel="noreferrer">TreeMap API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html" target="_blank" rel="noreferrer">ConcurrentHashMap API <ArrowRight /></a>
    </div>
  </div>;
}

export const javaCollectionsPages: ReadingPage[] = [
  { id: 'interview-roadmap', chapter: 'Interview roadmap', title: 'What interviewers are testing', Content: RoadmapPage },
  { id: 'spoken-answers', chapter: 'Interview roadmap', title: 'Three concise interview answers', Content: SpokenAnswersPage },
  { id: 'equals-contract', chapter: 'Equality', title: 'The complete equals() contract', Content: EqualsContractPage },
  { id: 'equality-design', chapter: 'Equality', title: 'Designing equality safely', Content: EqualityDesignPage },
  { id: 'hash-contract', chapter: 'Equality', title: 'The complete hashCode() contract', Content: HashContractPage },
  { id: 'equality-exercises', chapter: 'Practice', title: 'Equality coding questions', Content: EqualityExercisesPage },
  { id: 'choosing-collections', chapter: 'Collection choice', title: 'How to choose a collection', Content: ChooseCollectionPage },
  { id: 'lists-and-deques', chapter: 'Collection choice', title: 'ArrayList, LinkedList, and ArrayDeque', Content: ListsDequePage },
  { id: 'sets', chapter: 'Collection choice', title: 'HashSet and TreeSet', Content: SetsPage },
  { id: 'map-comparison', chapter: 'Map choice', title: 'Comparing the main Map implementations', Content: MapComparisonPage },
  { id: 'ordered-maps', chapter: 'Map choice', title: 'Ordering, LRU behavior, and ranges', Content: OrderedMapsPage },
  { id: 'concurrent-maps', chapter: 'Concurrency', title: 'ConcurrentHashMap and atomic updates', Content: ConcurrentMapPage },
  { id: 'mock-interview', chapter: 'Daily review', title: 'Progressive mock interview', Content: MockInterviewPage },
  { id: 'recap', chapter: 'Daily review', title: 'Daily selection recap', Content: RecapPage },
];
