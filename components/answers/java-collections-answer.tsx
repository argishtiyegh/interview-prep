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
  'User first = new User(7, "ana@example.com");',
  'User second = new User(7, "sam@example.com");',
  '',
  'System.out.println(first.equals(second));       // false',
  'System.out.println(byId.compare(first, second)); // 0',
  '',
  'users.add(first);',
  'users.add(second);',
  'System.out.println(users.size());                // 1',
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

const linkedHashSetCode = [
  'LinkedHashSet<String> names = new LinkedHashSet<>();',
  'names.add("Ada");',
  'names.add("Ben");',
  'names.add("Cara");',
  'names.add("Ben");  // duplicate: false; Ben does not move',
  '',
  'System.out.println(names); // [Ada, Ben, Cara]',
  '',
  'names.remove("Ben");',
  'names.add("Ben");  // a new insertion at the end',
  'System.out.println(names); // [Ada, Cara, Ben]',
  '',
  '// Java 21+: explicit encounter-order operations',
  'names.addFirst("Ben");',
  'System.out.println(names); // [Ben, Ada, Cara]',
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

const listStorageCode = [
  'List<String> names = new ArrayList<>();',
  'names.add("Ana");',
  'names.add("Sam");',
  'names.add(1, "Lee"); // shifts Sam one position right',
  'names.remove(0);     // shifts later values left',
  '',
  '// Logical result: [Lee, Sam]',
  '// size is 2; internal capacity can be larger',
].join('\n');

const iteratorEditCode = [
  'ListIterator<Task> cursor = tasks.listIterator();',
  '',
  'while (cursor.hasNext()) {',
  '    Task task = cursor.next();',
  '    if (task.isComplete()) {',
  '        cursor.remove(); // O(1) relink after traversal reached it',
  '    }',
  '}',
].join('\n');

const listFactoryCode = [
  'String[] array = {"A", "B"};',
  'List<String> fixedView = Arrays.asList(array);',
  'fixedView.set(0, "X"); // array[0] is now X',
  '// fixedView.add("C");  // UnsupportedOperationException',
  '',
  'List<String> source = new ArrayList<>(List.of("A", "B"));',
  'List<String> view = Collections.unmodifiableList(source);',
  'List<String> copy = List.copyOf(source);',
  '',
  'source.add("C");',
  '// view sees C; copy does not',
  '',
  'List<String> immutable = List.of("A", "B");',
  '// immutable.set(0, "X"); // UnsupportedOperationException',
].join('\n');

const priorityQueueCode = [
  'PriorityQueue<Integer> jobs = new PriorityQueue<>();',
  'jobs.offer(40);',
  'jobs.offer(10);',
  'jobs.offer(30);',
  'jobs.offer(20);',
  '',
  'jobs.peek(); // 10',
  'jobs.poll(); // removes 10',
  '',
  '// Iteration is NOT guaranteed to be: 20, 30, 40',
  'while (!jobs.isEmpty()) {',
  '    process(jobs.poll()); // removal order is sorted by priority',
  '}',
].join('\n');

const blockingQueueCode = [
  'BlockingQueue<Job> jobs = new ArrayBlockingQueue<>(100);',
  '',
  '// Producer waits when the bounded queue is full',
  'jobs.put(job);',
  '',
  '// Consumer waits when the queue is empty',
  'Job next = jobs.take();',
  '',
  '// Timed alternative',
  'boolean accepted = jobs.offer(job, 500, TimeUnit.MILLISECONDS);',
].join('\n');

const copyOnWriteCode = [
  'CopyOnWriteArrayList<Listener> listeners =',
  '        new CopyOnWriteArrayList<>();',
  '',
  'for (Listener listener : listeners) {',
  '    listener.onEvent(event);',
  '    // This iterator sees the snapshot captured when it was created.',
  '}',
  '',
  '// Every mutation copies the backing array.',
  'listeners.add(newListener);',
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

function ArrayListDiagram() {
  const cells = ['Ana', 'Lee', 'Sam', 'null', 'null', 'null', 'null', 'null'];
  return <Figure caption="Simplified current OpenJDK model: size counts stored elements, while capacity is the length of the backing Object array. Unused slots are null.">
    <div className="mb-3 flex justify-between text-xs font-bold uppercase tracking-[.1em] text-slate-600"><span>size = 3</span><span>capacity = 8</span></div>
    <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
      {cells.map((value, index) => <div key={index} className={`rounded-lg border p-2 text-center ${value === 'null' ? 'border-dashed border-slate-300 bg-slate-50 text-slate-400' : 'border-cyan-300 bg-cyan-50 text-slate-950'}`}>
        <small className="block font-mono text-[10px] text-slate-500">{index}</small><strong className="text-xs">{value}</strong>
      </div>)}
    </div>
    <div className="mt-4 rounded-lg bg-slate-100 p-3 text-center text-sm text-slate-700">When full: allocate a larger array → copy references → append the new reference</div>
  </Figure>;
}

function LinkedListDiagram() {
  return <Figure caption="Current OpenJDK model: the list stores first and last references; every Node stores the element plus links to its previous and next Nodes.">
    <div className="mb-4 flex justify-between rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"><span>first → Node A</span><span>Node C ← last</span></div>
    <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
      {['A', 'B', 'C'].map((value, index) => <div key={value} className="contents">
        <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-300 bg-white text-center text-xs">
          <span className="bg-slate-100 p-3 text-slate-500">{index === 0 ? 'null' : 'prev'}</span>
          <strong className="p-3 text-slate-950">{value}</strong>
          <span className="bg-slate-100 p-3 text-slate-500">{index === 2 ? 'null' : 'next'}</span>
        </div>
        {index < 2 && <span className="hidden text-center font-bold text-cyan-700 sm:block">⇄</span>}
      </div>)}
    </div>
  </Figure>;
}

function ArrayDequeDiagram() {
  const cells = [
    ['0', 'D'], ['1', 'E'], ['2', 'null'], ['3', 'null'],
    ['4', 'null'], ['5', 'A'], ['6', 'B'], ['7', 'C'],
  ];
  return <Figure caption="Simplified circular-array model: logical order starts at head, wraps at the array end, and stops before tail. No elements move merely because an index wraps.">
    <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
      {cells.map(([index, value]) => <div key={index} className={`rounded-lg border p-2 text-center ${value === 'null' ? 'border-dashed border-slate-300 bg-slate-50 text-slate-400' : 'border-cyan-300 bg-cyan-50 text-slate-950'}`}>
        <small className="block font-mono text-[10px] text-slate-500">{index}</small><strong className="text-xs">{value}</strong>
      </div>)}
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm font-bold">
      <span className="rounded-lg bg-cyan-100 p-2 text-cyan-900">head = 5 → A</span>
      <span className="rounded-lg bg-amber-100 p-2 text-amber-900">tail = 2 → next free slot</span>
    </div>
    <p className="mt-3 text-center text-sm text-slate-600">Logical order: A → B → C → D → E</p>
  </Figure>;
}

function PriorityQueueDiagram() {
  return <Figure caption="Simplified min-heap: only the smallest element is guaranteed at the root. The backing array is heap-ordered, not fully sorted.">
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto w-16 rounded-full border border-cyan-400 bg-cyan-50 p-3 font-bold text-slate-950">10</div>
      <div className="mx-auto h-5 w-1/2 border-x border-t border-slate-400" />
      <div className="grid grid-cols-2 gap-16">
        <div className="rounded-full border border-slate-300 bg-white p-3 font-bold">20</div>
        <div className="rounded-full border border-slate-300 bg-white p-3 font-bold">30</div>
      </div>
      <div className="ml-[8%] mt-2 w-[34%] rounded-full border border-slate-300 bg-white p-3 font-bold">40</div>
    </div>
    <div className="mt-5 rounded-lg bg-slate-100 p-3 text-center font-mono text-sm text-slate-700">backing array: [10, 20, 30, 40]</div>
  </Figure>;
}

function TreeSetInsertDiagram() {
  return <Figure caption="Simplified insertion path: TreeSet delegates to a TreeMap. A zero comparison finds an existing tree key, so no new Node is created and add() returns false.">
    <div className="grid gap-2 text-center text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
      <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><strong className="block text-slate-950">add(second)</strong><span className="text-slate-600">id 7, different email</span></div>
      <ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" />
      <div className="rounded-xl border border-slate-300 bg-white p-4"><strong className="block text-slate-950">compare(first, second)</strong><span className="text-slate-600">ID-only result = 0</span></div>
      <ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" />
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><strong className="block text-slate-950">Existing key found</strong><span className="text-slate-600">no new Node; add() = false</span></div>
    </div>
  </Figure>;
}

function LinkedHashSetDiagram() {
  return <Figure caption="Simplified current OpenJDK model. Each entry participates in the hash structure and in one doubly linked encounter-order chain; the keys are not stored twice.">
    <svg className="h-auto w-full" viewBox="0 0 780 330" aria-labelledby="linked-hash-set-title linked-hash-set-description">
      <title id="linked-hash-set-title">LinkedHashSet internal structure</title>
      <desc id="linked-hash-set-description">Hash buckets point to entries for lookup. The same Ada, Ben, and Cara entries are connected in insertion order by before and after links.</desc>
      <defs>
        <marker id="lhs-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#0e7490" />
        </marker>
      </defs>

      <text x="20" y="24" fill="#334155" fontSize="14" fontWeight="700">HASH BUCKETS</text>
      {[0, 1, 2, 3].map((bucket, index) => <g key={bucket}>
        <rect x="20" y={38 + index * 42} width="112" height="34" rx="7" fill="#f8fafc" stroke="#94a3b8" />
        <text x="76" y={60 + index * 42} textAnchor="middle" fill="#334155" fontSize="13">bucket[{bucket}]</text>
      </g>)}

      <path d="M132 97 C210 97 340 112 409 132" fill="none" stroke="#0e7490" strokeWidth="2" markerEnd="url(#lhs-arrow)" />
      <path d="M132 139 C152 139 160 139 174 139" fill="none" stroke="#0e7490" strokeWidth="2" markerEnd="url(#lhs-arrow)" />
      <text x="145" y="122" fill="#475569" fontSize="12">bucket lookup</text>

      {[
        { x: 180, key: 'Ada' },
        { x: 390, key: 'Ben' },
        { x: 600, key: 'Cara' },
      ].map(({ x, key }) => <g key={key}>
        <rect x={x} y="110" width="140" height="76" rx="12" fill="#ecfeff" stroke="#0891b2" strokeWidth="2" />
        <text x={x + 70} y="136" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="700">ENTRY / NODE</text>
        <text x={x + 70} y="165" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="700">{key}</text>
      </g>)}

      <path d="M320 127 C430 53 539 53 600 127" fill="none" stroke="#0e7490" strokeWidth="2" strokeDasharray="6 5" markerEnd="url(#lhs-arrow)" />
      <text x="460" y="60" textAnchor="middle" fill="#475569" fontSize="12">same-bucket collision link</text>

      <text x="180" y="230" fill="#334155" fontSize="13" fontWeight="700">eldest</text>
      <path d="M320 214 L390 214" stroke="#b45309" strokeWidth="3" markerStart="url(#lhs-arrow)" markerEnd="url(#lhs-arrow)" />
      <path d="M530 214 L600 214" stroke="#b45309" strokeWidth="3" markerStart="url(#lhs-arrow)" markerEnd="url(#lhs-arrow)" />
      <path d="M250 186 L250 214 L320 214" fill="none" stroke="#b45309" strokeWidth="2" />
      <path d="M460 186 L460 214" fill="none" stroke="#b45309" strokeWidth="2" />
      <path d="M670 186 L670 214 L600 214" fill="none" stroke="#b45309" strokeWidth="2" />
      <text x="740" y="230" textAnchor="end" fill="#334155" fontSize="13" fontWeight="700">youngest</text>
      <text x="460" y="262" textAnchor="middle" fill="#92400e" fontSize="14" fontWeight="700">before / after links define iteration: Ada ↔ Ben ↔ Cara</text>

      <rect x="180" y="282" width="560" height="34" rx="8" fill="#f1f5f9" />
      <text x="460" y="304" textAnchor="middle" fill="#334155" fontSize="13">contains() follows bucket links · iteration follows encounter-order links</text>
    </svg>
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
    <p><strong>Internal-storage headline:</strong> <code>ArrayList</code> uses a resizable array, <code>LinkedList</code> uses doubly linked Nodes, <code>ArrayDeque</code> uses a circular resizable array, <code>HashSet</code> uses hash-map keys, <code>TreeSet</code> uses sorted tree keys, and <code>PriorityQueue</code> uses an array-backed heap.</p>
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
    <div className="faq-list"><details><summary>Show answer</summary><p><strong>For membership inside this <code>TreeSet</code>, the comparator wins.</strong> The set decides that an element already exists when <code>compare(first, second) == 0</code>; it does not use <code>equals()</code> for that decision. Both users have <code>id = 7</code>, so the ID-only comparator returns zero and the second user is rejected. Their record-generated <code>equals()</code> still returns false because the emails differ. The comparator does not change equality elsewhere—it controls uniqueness only inside this sorted set. Keep a set comparator consistent with <code>equals()</code> to avoid this surprising behavior.</p></details></div>
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

function FrameworkPage() {
  return <div className="article-copy">
    <p>The framework separates <strong>behavioral interfaces</strong> from <strong>storage implementations</strong>. Program to the narrowest interface that expresses the requirement.</p>
    <Figure caption="Simplified Java Collections Framework hierarchy. Map belongs to the framework but is not a subtype of Collection because it stores key-value mappings rather than individual elements.">
      <div className="grid gap-3 text-center text-sm">
        <div className="mx-auto rounded-xl border border-slate-300 bg-slate-50 px-6 py-3 font-bold text-slate-950">Iterable</div>
        <div className="text-xl font-bold text-cyan-700">↓</div>
        <div className="grid gap-3 sm:grid-cols-[3fr_1fr]">
          <div className="rounded-xl border-2 border-cyan-300 bg-cyan-50 p-3 font-bold text-cyan-950">Collection</div>
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 font-bold text-amber-950">Map — separate hierarchy</div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {['List', 'Set', 'Queue', 'Deque extends Queue'].map(item => <div key={item} className="rounded-xl border border-slate-300 bg-white p-3 font-bold text-slate-800">{item}</div>)}
        </div>
      </div>
    </Figure>
    <ul>
      <li><b>List:</b> ordered sequence, duplicates allowed, positional access.</li>
      <li><b>Set:</b> no duplicate elements according to its equality or ordering rule.</li>
      <li><b>Queue:</b> elements waiting for processing under a defined removal policy.</li>
      <li><b>Deque:</b> insertion, examination, and removal at both ends.</li>
      <li><b>Map:</b> unique keys associated with values.</li>
    </ul>
    <Callout title="Declaration versus construction"><code>List&lt;Order&gt; orders = new ArrayList&lt;&gt;();</code> exposes list behavior to the caller while keeping the implementation replaceable.</Callout>
  </div>;
}

function ArrayListInternalsPage() {
  return <div className="article-copy">
    <p><code>ArrayList</code> stores element references in a resizable <code>Object[]</code>. It separately tracks the logical <code>size</code>; the array length is the <code>capacity</code>.</p>
    <ArrayListDiagram />
    <h3>What each operation does</h3>
    <ul>
      <li><code>get(i)</code> reads array slot <code>i</code>, so indexed access is O(1).</li>
      <li><code>set(i, value)</code> replaces one reference without changing size.</li>
      <li><code>add(value)</code> writes at <code>elementData[size]</code> when capacity remains.</li>
      <li>When full, append allocates a larger array and copies references. This occasional O(n) copy makes append O(1) amortized.</li>
      <li>Insertion or removal in the middle shifts the later references and is O(n).</li>
    </ul>
    <CodeBlock code={listStorageCode} />
    <Callout tone="tip" title="Size is not capacity"><code>size()</code> reports elements available to callers. Capacity is spare internal storage and is not part of the List API contract.</Callout>
  </div>;
}

function ArrayListDetailsPage() {
  return <div className="article-copy">
    <h3>Growth and memory</h3>
    <p>The Java API guarantees automatic growth and amortized constant-time append but does not specify an exact growth formula. Current OpenJDK code prefers growth of roughly half the old capacity for a non-empty list; treat that number as an implementation detail.</p>
    <p>The array stores references, not inline objects. A <code>List&lt;Integer&gt;</code> therefore holds references to boxed <code>Integer</code> objects rather than primitive <code>int</code> values.</p>
    <h3>Capacity tools</h3>
    <ul>
      <li><code>ensureCapacity(expectedSize)</code> can reduce repeated growth when a large size is known.</li>
      <li><code>trimToSize()</code> can release unused array slots, but calling it repeatedly creates unnecessary copying.</li>
      <li>Clearing or removing elements releases their array references so those objects can become eligible for garbage collection.</li>
    </ul>
    <h3>Interview implications</h3>
    <div className="table-wrap"><table><thead><tr><th>Question</th><th>Strong answer</th></tr></thead><tbody>
      <tr><td>Why is append amortized O(1)?</td><td>Most appends write one slot; occasional growth copies all existing references.</td></tr>
      <tr><td>Why is middle removal O(n)?</td><td>Later references must shift left to close the gap.</td></tr>
      <tr><td>Why can it beat LinkedList iteration?</td><td>References are stored contiguously with fewer objects and better cache locality.</td></tr>
    </tbody></table></div>
  </div>;
}

function LinkedListInternalsPage() {
  return <div className="article-copy">
    <p>Current OpenJDK <code>LinkedList</code> keeps <code>first</code>, <code>last</code>, and <code>size</code>. Every Node contains the element reference plus <code>prev</code> and <code>next</code> references.</p>
    <LinkedListDiagram />
    <h3>Traversal before modification</h3>
    <p>To reach index <code>i</code>, the implementation starts from the nearer end and follows links. That is still O(n). Once a Node is known, insertion or removal rewires neighboring links in O(1).</p>
    <CodeBlock code={iteratorEditCode} />
    <h3>Tradeoffs</h3>
    <ul>
      <li>O(1) operations at the first and last Nodes.</li>
      <li>O(n) indexed access and value search.</li>
      <li>A separate Node allocation and two link references per element.</li>
      <li>Poorer cache locality because Nodes may be scattered in memory.</li>
    </ul>
    <Callout tone="warning" title="Do not repeat get(i)">An indexed loop repeatedly traverses the list and can turn one pass into O(n²). Iterate through Nodes once instead.</Callout>
  </div>;
}

function ArrayDequeInternalsPage() {
  return <div className="article-copy">
    <p><code>ArrayDeque</code> stores references in a resizable array and tracks the logical front and next tail position. Current OpenJDK uses circular indexing so either end can cross the physical array boundary.</p>
    <ArrayDequeDiagram />
    <ul>
      <li><code>addFirst()</code> moves <code>head</code> backward and writes the element.</li>
      <li><code>addLast()</code> writes at <code>tail</code> and moves <code>tail</code> forward.</li>
      <li><code>pollFirst()</code> clears the head slot and advances <code>head</code>.</li>
      <li><code>pollLast()</code> moves <code>tail</code> backward and clears that slot.</li>
      <li>Growth occasionally allocates and copies, so end operations are amortized O(1).</li>
      <li>Removing a value from the middle requires searching and shifting part of the array.</li>
    </ul>
    <Callout title="Why null is forbidden">Methods such as <code>peek()</code> and <code>poll()</code> use <code>null</code> to represent an empty deque. Prohibiting null elements keeps that result unambiguous.</Callout>
  </div>;
}

function ListVariantsPage() {
  return <div className="article-copy">
    <h3>Views, fixed size, and unmodifiable lists</h3>
    <CodeBlock code={listFactoryCode} />
    <div className="table-wrap"><table><thead><tr><th>Creation</th><th>What it means</th></tr></thead><tbody>
      <tr><td><code>Arrays.asList(array)</code></td><td>Fixed-size List view backed by the array. <code>set()</code> works; size-changing methods do not.</td></tr>
      <tr><td><code>Collections.unmodifiableList(source)</code></td><td>Read-only wrapper view. Mutations made through the original source remain visible.</td></tr>
      <tr><td><code>List.copyOf(source)</code></td><td>Unmodifiable shallow copy of the current element references.</td></tr>
      <tr><td><code>List.of(...)</code></td><td>Unmodifiable list that rejects null elements.</td></tr>
    </tbody></table></div>
    <Callout tone="warning" title="Unmodifiable is not deeply immutable">An element inside an unmodifiable list can still change unless the element itself is immutable.</Callout>
    <h3>Legacy choices</h3>
    <p><code>Vector</code> is a synchronized legacy resizable array. <code>Stack</code> extends it and exposes an old stack API. For new code, prefer <code>ArrayList</code> for an ordinary list, explicit synchronization or a concurrent collection when needed, and <code>ArrayDeque</code> for a stack.</p>
  </div>;
}

function SetInternalsPage() {
  return <div className="article-copy">
    <p>Set implementations share the no-duplicates abstraction but enforce it through different backing structures.</p>
    <div className="table-wrap"><table><thead><tr><th>Set</th><th>Internal model</th><th>What defines a duplicate</th><th>Order</th></tr></thead><tbody>
      <tr><td><b>HashSet</b></td><td>HashMap-backed entries: elements are keys mapped to one placeholder</td><td>Hash then <code>equals()</code></td><td>Unspecified</td></tr>
      <tr><td><b>LinkedHashSet</b></td><td>The same hash-based idea, with <code>before</code>/<code>after</code> links on entries</td><td>Hash then <code>equals()</code></td><td>Insertion order</td></tr>
      <tr><td><b>TreeSet</b></td><td>Navigable tree map keys</td><td>Comparison result zero</td><td>Sorted</td></tr>
      <tr><td><b>EnumSet</b></td><td>Bit vector keyed by enum ordinal</td><td>Same enum constant</td><td>Enum declaration order</td></tr>
    </tbody></table></div>
    <h3>How LinkedHashSet preserves insertion order</h3>
    <Callout tone="tip" title="Does LinkedHashSet store elements only in a doubly linked list?"><strong>No.</strong> Like <code>HashSet</code>, it uses elements as keys in a hash-based backing structure and maps them to one shared placeholder value. Its entries additionally carry <code>before</code> and <code>after</code> links. One entry therefore belongs to two structures at the same time: a hash bucket for fast lookup and the doubly linked encounter-order chain for predictable iteration.</Callout>
    <p><code>LinkedHashSet</code> combines the membership behavior of a hash set with a doubly linked list running through every entry. The hash structure answers <em>“is this element present?”</em>; the linked chain answers <em>“which element comes next during iteration?”</em></p>
    <LinkedHashSetDiagram />
    <ol className="step-list">
      <li><b>Hash and find the bucket.</b><span><code>hashCode()</code> selects the bucket, then <code>equals()</code> checks matching entries.</span></li>
      <li><b>Reject an existing element.</b><span>If an equal entry exists, ordinary <code>add()</code> returns <code>false</code>. It creates no Node and does not change its position.</span></li>
      <li><b>Link a new entry at the end.</b><span>If it is new, the entry joins the hash structure and its <code>before</code>/<code>after</code> links connect it after the youngest entry.</span></li>
      <li><b>Iterate through the linked chain.</b><span>The iterator starts with the eldest entry and follows encounter-order links, independent of bucket positions.</span></li>
    </ol>
    <CodeBlock code={linkedHashSetCode} />
    <Callout title="Why are the extra links added?"><code>HashSet</code> can place elements wherever their hashes lead, so bucket layout and resizing make iteration order unspecified. <code>LinkedHashSet</code> adds the order links specifically to preserve a stable encounter order while keeping average O(1) hash lookup. The tradeoff is extra memory per entry and a little more work when entries are inserted or removed.</Callout>
    <div className="table-wrap"><table><thead><tr><th>Operation</th><th>Effect on encounter order</th></tr></thead><tbody>
      <tr><td><code>add(newElement)</code></td><td>Places the new entry at the end.</td></tr>
      <tr><td><code>add(existingElement)</code></td><td>Keeps the existing position; returns <code>false</code>.</td></tr>
      <tr><td><code>remove(e)</code>, then <code>add(e)</code></td><td>Creates a new insertion at the end.</td></tr>
      <tr><td><code>contains(e)</code></td><td>Does not move the entry. LinkedHashSet has no access-order mode.</td></tr>
      <tr><td><code>addFirst(e)</code> / <code>addLast(e)</code></td><td>Since Java 21, explicitly adds or relocates an element at that end.</td></tr>
    </tbody></table></div>
    <Callout title="Performance tradeoff">Basic <code>add</code>, <code>contains</code>, and <code>remove</code> remain O(1) on average with well-distributed hashes. Maintaining two extra order links costs memory and a little update work. Iteration is O(size), regardless of unused hash-table capacity.</Callout>
    <h3>EnumSet as bits</h3>
    <p>For enum values, a bit can represent whether each constant is present. This is compact and makes basic and bulk operations very fast.</p>
    <div className="formula text-left"><code>enum Permission: READ WRITE DELETE ADMIN<br />stored bits:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1&nbsp;&nbsp;&nbsp; 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1<br />set contains:&nbsp;&nbsp; READ, WRITE, ADMIN</code></div>
    <Callout title="Choose the guarantee">Use <code>HashSet</code> for ordinary membership, <code>LinkedHashSet</code> for encounter order, <code>TreeSet</code> for sorting and ranges, and <code>EnumSet</code> for constants from one enum type.</Callout>
  </div>;
}

function PriorityQueuePage() {
  return <div className="article-copy">
    <p><code>PriorityQueue</code> is a priority heap. Its head is the least element under natural ordering or the supplied comparator; it is not a FIFO queue.</p>
    <PriorityQueueDiagram />
    <CodeBlock code={priorityQueueCode} />
    <div className="table-wrap"><table><thead><tr><th>Operation</th><th>Cost</th><th>Reason</th></tr></thead><tbody>
      <tr><td><code>peek()</code></td><td>O(1)</td><td>Read the root.</td></tr>
      <tr><td><code>offer()</code></td><td>O(log n)</td><td>Append, then sift upward.</td></tr>
      <tr><td><code>poll()</code></td><td>O(log n)</td><td>Move the last value to the root, then sift downward.</td></tr>
      <tr><td><code>contains(value)</code></td><td>O(n)</td><td>The heap is not globally sorted for arbitrary search.</td></tr>
    </tbody></table></div>
    <Callout tone="warning" title="Iteration is not priority order">Only repeated removal guarantees priority order. The iterator exposes heap storage in an unspecified traversal order.</Callout>
  </div>;
}

function ConcurrentCollectionsPage() {
  return <div className="article-copy">
    <h3>CopyOnWriteArrayList</h3>
    <p>Every mutation creates and publishes a fresh backing array. Iterators keep a snapshot reference and never observe later writes.</p>
    <CodeBlock code={copyOnWriteCode} />
    <p>This is excellent for small, read-mostly collections such as listener lists. It is expensive for frequent writes or large arrays.</p>
    <h3>Concurrent and blocking queues</h3>
    <div className="table-wrap"><table><thead><tr><th>Queue</th><th>Internal idea</th><th>Use</th></tr></thead><tbody>
      <tr><td><b>ConcurrentLinkedQueue</b></td><td>Non-blocking linked Nodes</td><td>Scalable concurrent FIFO without backpressure.</td></tr>
      <tr><td><b>ArrayBlockingQueue</b></td><td>Fixed bounded array</td><td>Producer-consumer flow with explicit capacity.</td></tr>
      <tr><td><b>LinkedBlockingQueue</b></td><td>Linked Nodes, optionally bounded</td><td>Blocking producer-consumer flow.</td></tr>
      <tr><td><b>SynchronousQueue</b></td><td>No stored capacity; direct handoff</td><td>Each producer waits for a consumer.</td></tr>
      <tr><td><b>PriorityBlockingQueue</b></td><td>Thread-safe priority heap</td><td>Blocking retrieval by priority; logically unbounded.</td></tr>
    </tbody></table></div>
    <CodeBlock code={blockingQueueCode} />
    <Callout tone="tip" title="Backpressure is a design choice">A bounded blocking queue limits memory growth and can slow producers when consumers fall behind. An unbounded queue avoids blocking producers but can accumulate work.</Callout>
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
    <p>Both classes implement <code>Set</code>, so both represent collections with no duplicates. They differ in how they decide sameness and what additional behavior they maintain.</p>
    <div className="table-wrap"><table><thead><tr><th>Property</th><th>HashSet</th><th>TreeSet</th></tr></thead><tbody>
      <tr><td>Matching</td><td><code>hashCode()</code>, then <code>equals()</code></td><td><code>compareTo()</code> or comparator</td></tr>
      <tr><td>Basic operations</td><td>O(1) average</td><td>O(log n)</td></tr>
      <tr><td>Order</td><td>Unspecified</td><td>Sorted</td></tr>
      <tr><td>Ranges/neighbors</td><td>No</td><td>Yes</td></tr>
      <tr><td>Element requirement</td><td>Correct equality and useful hash</td><td>Mutually comparable or a comparator</td></tr>
      <tr><td>Null</td><td>Allows one null</td><td>Natural ordering rejects null; a comparator may define support</td></tr>
      <tr><td>Best use</td><td>Fast membership and deduplication</td><td>Sorted uniqueness, ranges, floor/ceiling</td></tr>
    </tbody></table></div>
    <CodeBlock code={setCode} />
    <h3>What sorted uniqueness, ranges, and neighbors mean</h3>
    <p><strong>Sorted uniqueness</strong> means the set keeps at most one element for each comparison result of zero and continuously maintains the remaining elements in sorted order. With scores <code>[55, 72, 88, 91]</code>, iteration always follows that numeric order.</p>
    <p>A <strong>range</strong> is a live view of one ordered portion of the set. For example, <code>subSet(70, true, 90, true)</code> selects values from 70 through 90, including both boundaries, and returns <code>[72, 88]</code>. <code>headSet()</code> selects values below a boundary; <code>tailSet()</code> selects values above one.</p>
    <p><strong>Neighbors</strong> are the closest stored elements around a requested value, even when that exact value is absent:</p>
    <div className="table-wrap"><table><thead><tr><th>Query for 80</th><th>Meaning</th><th>Result</th></tr></thead><tbody>
      <tr><td><code>floor(80)</code></td><td>Greatest value ≤ 80</td><td><code>72</code></td></tr>
      <tr><td><code>ceiling(80)</code></td><td>Smallest value ≥ 80</td><td><code>88</code></td></tr>
      <tr><td><code>lower(80)</code></td><td>Greatest value strictly &lt; 80</td><td><code>72</code></td></tr>
      <tr><td><code>higher(80)</code></td><td>Smallest value strictly &gt; 80</td><td><code>88</code></td></tr>
    </tbody></table></div>
    <Callout title="Why this matters">These operations are useful for time windows, price bands, ranking thresholds, scheduling, and finding the closest available value. A HashSet cannot answer them directly because it does not maintain order.</Callout>
    <h3>How TreeSet prevents duplicates internally</h3>
    <p><code>TreeSet</code> is backed by a navigable tree map. The set element is stored as a map key with one shared placeholder value. During <code>add(element)</code>, the tree compares the new element while walking from the root.</p>
    <TreeSetInsertDiagram />
    <p>If comparison is less than or greater than zero, insertion continues to the left or right subtree. If comparison is zero, an equivalent tree key already exists: no second tree Node is created, the size does not change, and <code>add()</code> returns false.</p>
    <Callout tone="warning" title="TreeSet uniqueness is ordering-based">A comparator returning zero means duplicate <em>inside that TreeSet</em>, even if <code>equals()</code> returns false. The comparator does not change equality elsewhere.</Callout>
    <Callout tone="tip" title="When sorting once is enough">If you mainly need fast membership and only occasionally need ordered output, a <code>HashSet</code> plus a sorted snapshot may be better than maintaining tree order after every update.</Callout>
  </div>;
}

function ComparatorBehaviorPage() {
  return <div className="article-copy">
    <p>A comparator always produces an ordering result, but the collection decides what that result means.</p>
    <div className="table-wrap"><table><thead><tr><th>Where comparator is used</th><th>Meaning of compare(a, b) == 0</th><th>Are duplicates removed?</th></tr></thead><tbody>
      <tr><td><b>TreeSet</b></td><td>The same set position</td><td>Yes. The second element is rejected.</td></tr>
      <tr><td><b>TreeMap</b></td><td>The same map key</td><td>No second key; putting replaces the value.</td></tr>
      <tr><td><b>PriorityQueue</b></td><td>The same priority</td><td>No. Both elements may remain; tie removal order is arbitrary.</td></tr>
      <tr><td><b>List.sort()</b></td><td>Equal position in the ordering</td><td>No. Both list elements remain.</td></tr>
      <tr><td><b>HashSet / HashMap</b></td><td>No comparator is supplied to their public constructors</td><td>Duplicates are determined by hash and <code>equals()</code>.</td></tr>
    </tbody></table></div>
    <h3>TreeMap follows the same key rule</h3>
    <div className="formula text-left"><code>compare(existingKey, newKey) == 0<br />→ same TreeMap key<br />→ keep the key position and replace its value</code></div>
    <h3>PriorityQueue keeps ties</h3>
    <p>A priority queue uses comparison to choose which element reaches the head. Two tasks with the same priority can both be stored. Comparison zero means tied priority, not set equality.</p>
    <Callout title="A subtle HashMap detail">Current OpenJDK can use comparable ordering to arrange colliding keys inside a tree bin. That ordering helps navigation only; HashMap key uniqueness still follows its hash-and-equality rules.</Callout>
    <Callout tone="tip" title="Interview answer">Comparator “wins over equals” only in sorted sets and sorted maps when they decide element or key identity. In sorting and priority queues, comparison controls order while duplicates remain.</Callout>
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
      <details><summary>How does ArrayList store values and grow?</summary><p>It stores element references in a resizable array and tracks size separately from capacity. Indexed access reads one slot. Most appends write one slot; when full, it allocates a larger array and copies references, making append O(1) amortized.</p></details>
      <details><summary>Why can an indexed LinkedList loop be O(n²)?</summary><p>Every <code>get(i)</code> traverses Nodes from the nearer end. Repeating that traversal for all indices accumulates quadratic work; use an iterator or enhanced for-loop to traverse once.</p></details>
      <details><summary>When is TreeSet better than HashSet?</summary><p>When continuously sorted values, ranges, or neighbor queries justify O(log n). Mention that comparison result zero defines duplicates.</p></details>
      <details><summary>Does a comparator remove duplicates in every collection?</summary><p>No. <code>TreeSet</code> rejects a second element and <code>TreeMap</code> replaces the value when comparison is zero. <code>PriorityQueue</code> and a sorted List keep both values; comparison controls their order only.</p></details>
      <details><summary>Does iterating PriorityQueue return sorted order?</summary><p>No. Only repeated <code>poll()</code> follows priority order. Its iterator exposes heap storage in an unspecified traversal order.</p></details>
      <details><summary>Is containsKey() followed by put() safe on ConcurrentHashMap?</summary><p>The calls are safe separately, but the compound decision races. Use putIfAbsent, compute, computeIfAbsent, or merge.</p></details>
    </div>
    <h3>Senior differentiators</h3>
    <ul>
      <li>State the complete equality contracts rather than only saying “override both methods.”</li>
      <li>Include traversal cost when discussing linked-list insertion.</li>
      <li>Explain how comparison zero has different meanings across collections.</li>
      <li>Distinguish thread-safe calls from atomic multi-step workflows.</li>
    </ul>
  </div>;
}

function RecapPage() {
  return <div className="article-copy">
    <h3>Daily selection matrix</h3>
    <div className="formula text-left"><code>Indexed sequence&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → ArrayList<br />Stack or queue ends&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → ArrayDeque<br />Retrieve by priority&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → PriorityQueue<br />Unique membership&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → HashSet<br />Sorted unique values&nbsp;&nbsp;&nbsp;&nbsp; → TreeSet<br /><br />General key lookup&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → HashMap<br />Stable encounter order&nbsp;&nbsp; → LinkedHashMap<br />Sorted keys and ranges&nbsp;&nbsp; → TreeMap<br />Concurrent key access&nbsp;&nbsp;&nbsp;&nbsp; → ConcurrentHashMap<br />Bounded producer-consumer → ArrayBlockingQueue</code></div>
    <div className="answer-card"><p><strong>Memory hook:</strong> Correct equality makes collections trustworthy. Access pattern selects the collection. Ordering, sorting, and concurrency select the map.</p></div>
    <div className="sources">
      <p className="eyebrow">Primary references</p>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html" target="_blank" rel="noreferrer">Object equality and hashCode <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/doc-files/coll-overview.html" target="_blank" rel="noreferrer">Collections Framework overview <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html" target="_blank" rel="noreferrer">ArrayList API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedList.html" target="_blank" rel="noreferrer">LinkedList API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html" target="_blank" rel="noreferrer">ArrayDeque API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html" target="_blank" rel="noreferrer">TreeSet API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashSet.html" target="_blank" rel="noreferrer">LinkedHashSet API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html" target="_blank" rel="noreferrer">PriorityQueue API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/EnumSet.html" target="_blank" rel="noreferrer">EnumSet API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashMap.html" target="_blank" rel="noreferrer">LinkedHashMap API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeMap.html" target="_blank" rel="noreferrer">TreeMap API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CopyOnWriteArrayList.html" target="_blank" rel="noreferrer">CopyOnWriteArrayList API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/BlockingQueue.html" target="_blank" rel="noreferrer">BlockingQueue API <ArrowRight /></a>
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
  { id: 'framework', chapter: 'Framework', title: 'How the Collections Framework is organized', Content: FrameworkPage },
  { id: 'choosing-collections', chapter: 'Collection choice', title: 'How to choose a collection', Content: ChooseCollectionPage },
  { id: 'arraylist-internals', chapter: 'List internals', title: 'How ArrayList stores values', Content: ArrayListInternalsPage },
  { id: 'arraylist-growth', chapter: 'List internals', title: 'ArrayList growth and memory', Content: ArrayListDetailsPage },
  { id: 'linkedlist-internals', chapter: 'List internals', title: 'How LinkedList stores values', Content: LinkedListInternalsPage },
  { id: 'arraydeque-internals', chapter: 'Deque internals', title: 'How ArrayDeque stores values', Content: ArrayDequeInternalsPage },
  { id: 'list-variants', chapter: 'List variants', title: 'List views, copies, and legacy types', Content: ListVariantsPage },
  { id: 'lists-and-deques', chapter: 'Collection choice', title: 'ArrayList, LinkedList, and ArrayDeque', Content: ListsDequePage },
  { id: 'set-internals', chapter: 'Set internals', title: 'How Set implementations store values', Content: SetInternalsPage },
  { id: 'sets', chapter: 'Collection choice', title: 'HashSet and TreeSet', Content: SetsPage },
  { id: 'comparator-behavior', chapter: 'Ordering', title: 'How Comparator behaves across collections', Content: ComparatorBehaviorPage },
  { id: 'priority-queue', chapter: 'Queue internals', title: 'How PriorityQueue works internally', Content: PriorityQueuePage },
  { id: 'concurrent-collections', chapter: 'Concurrency', title: 'Concurrent and blocking collections', Content: ConcurrentCollectionsPage },
  { id: 'map-comparison', chapter: 'Map choice', title: 'Comparing the main Map implementations', Content: MapComparisonPage },
  { id: 'ordered-maps', chapter: 'Map choice', title: 'Ordering, LRU behavior, and ranges', Content: OrderedMapsPage },
  { id: 'concurrent-maps', chapter: 'Concurrency', title: 'ConcurrentHashMap and atomic updates', Content: ConcurrentMapPage },
  { id: 'mock-interview', chapter: 'Daily review', title: 'Progressive mock interview', Content: MockInterviewPage },
  { id: 'recap', chapter: 'Daily review', title: 'Daily selection recap', Content: RecapPage },
];
