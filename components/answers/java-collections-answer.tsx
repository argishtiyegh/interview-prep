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

const defaultEqualsCode = [
  'User first = new User(42, "Ana");',
  'User second = new User(42, "Ana");',
  'User sameObject = first;',
  '',
  'first.equals(second);     // false: separate objects',
  'first.equals(sameObject); // true: both references point to first',
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
  '// Integer key = employee ID; String value = employee name',
  'Map<Integer, String> hash = new HashMap<>();',
  'Map<Integer, String> linked = new LinkedHashMap<>();',
  'Map<Integer, String> sorted = new TreeMap<>();',
  '',
  'for (Map<Integer, String> map : List.of(hash, linked, sorted)) {',
  '    map.put(30, "Cara"); // employee ID 30 → Cara',
  '    map.put(10, "Ana");  // employee ID 10 → Ana',
  '    map.put(20, "Ben");  // employee ID 20 → Ben',
  '}',
  '',
  '// HashMap:       no guaranteed order',
  '// LinkedHashMap iteration: ID 30 → Cara, ID 10 → Ana, ID 20 → Ben',
  '// TreeMap iteration:       ID 10 → Ana, ID 20 → Ben, ID 30 → Cara',
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
  'ConcurrentMap<Long, Product> productCache = new ConcurrentHashMap<>();',
  'long productId = 42;',
  '',
  '// Thread-safe calls, but the pair is not atomic',
  'if (!productCache.containsKey(productId)) {',
  '    productCache.put(productId, loadProduct(productId));',
  '}',
  '',
  '// One atomic per-key operation',
  'Product product = productCache.computeIfAbsent(',
  '        productId, this::loadProduct);',
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
  'String[] array = {"Ana", "Ben"};',
  'List<String> fixedView = Arrays.asList(array);',
  'fixedView.set(0, "Cara"); // array[0] is now "Cara"',
  '// fixedView.add("David"); // UnsupportedOperationException',
  '',
  'List<String> source = new ArrayList<>(List.of("Ana", "Ben"));',
  'List<String> view = Collections.unmodifiableList(source);',
  'List<String> copy = List.copyOf(source);',
  '',
  'source.add("Cara");',
  '// view now includes "Cara"; copy still contains only Ana and Ben',
  '',
  'List<String> immutable = List.of("Ana", "Ben");',
  '// immutable.set(0, "Cara"); // UnsupportedOperationException',
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
      <span className="font-mono text-slate-500">1</span><span className="rounded-lg border border-cyan-200 p-2">containsKey(product ID 42) → false</span><span />
      <span className="font-mono text-slate-500">2</span><span /><span className="rounded-lg border border-amber-200 p-2">containsKey(product ID 42) → false</span>
      <span className="font-mono text-slate-500">3</span><span className="rounded-lg border border-cyan-200 p-2">load product 42</span><span className="rounded-lg border border-amber-200 p-2">load product 42 again</span>
      <span className="font-mono text-slate-500">4</span><span className="rounded-lg border border-cyan-200 p-2">put(42, loaded product)</span><span />
      <span className="font-mono text-slate-500">5</span><span /><span className="rounded-lg border border-amber-200 p-2">put(42, loaded product)</span>
    </div>
  </Figure>;
}

function MapModelsDiagram() {
  const models = [
    ['HashMap', 'bucket array → Node chains or tree bins', 'hash + equals'],
    ['LinkedHashMap', 'HashMap entries + before/after links', 'hash + equals'],
    ['TreeMap', 'balanced red-black search tree', 'compareTo or Comparator'],
    ['ConcurrentHashMap', 'concurrent bucket array + specialized Nodes', 'hash + equals'],
  ];
  return <Figure caption="High-level storage models. The public API guarantees behavior; exact Node layouts and update mechanisms are current OpenJDK implementation details.">
    <div className="grid gap-3 sm:grid-cols-2">
      {models.map(([name, storage, identity]) => <article key={name} className="rounded-xl border border-slate-300 bg-white p-4">
        <h4 className="font-sans text-base font-extrabold text-slate-950">{name}</h4>
        <p className="mt-2 text-sm text-slate-700">{storage}</p>
        <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Key identity: {identity}</p>
      </article>)}
    </div>
  </Figure>;
}

function LinkedHashMapDiagram() {
  return <Figure caption="Example employee map. Every box is one map entry: the number is the employee ID key and the name is the stored value. The same entries belong to the hash structure and the encounter-order chain.">
    <div className="space-y-4 text-center text-sm">
      <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4 text-cyan-950">
        <b>Hash lookup view</b>
        <div className="mt-2 font-mono">bucket[2] → [employee ID 30 | name Cara] → [employee ID 10 | name Ana]</div>
        <div className="mt-1 font-mono">bucket[5] → [employee ID 20 | name Ben]</div>
      </div>
      <div className="text-2xl font-bold text-slate-400">same Entry objects</div>
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
        <b>Encounter-order view</b>
        <div className="mt-2 font-mono">first inserted → [ID 30: Cara] ↔ [ID 10: Ana] ↔ [ID 20: Ben] → last inserted</div>
      </div>
    </div>
  </Figure>;
}

function TreeMapDiagram() {
  return <Figure caption="Simplified employee map: each number is an employee ID key and each name is its value. TreeMap sorts the entries by the numeric ID keys. Every Entry also stores parent, left, right, and color information.">
    <div className="mx-auto max-w-lg text-center text-sm">
      <div className="mx-auto w-28 rounded-full bg-slate-950 p-3 font-bold text-white">30 → Cara</div>
      <div className="mx-auto h-7 w-1/2 border-x-2 border-t-2 border-slate-400" />
      <div className="grid grid-cols-2 gap-16">
        <div className="rounded-full border-2 border-red-700 bg-red-50 p-3 font-bold text-red-950">10 → Ana</div>
        <div className="rounded-full border-2 border-red-700 bg-red-50 p-3 font-bold text-red-950">50 → Elena</div>
      </div>
      <div className="ml-[58%] h-6 w-[30%] border-x-2 border-t-2 border-slate-400" />
      <div className="ml-auto grid w-[42%] grid-cols-2 gap-3">
        <div className="rounded-full bg-slate-950 p-3 font-bold text-white">40 → David</div>
        <div className="rounded-full bg-slate-950 p-3 font-bold text-white">70 → Grace</div>
      </div>
    </div>
  </Figure>;
}

function ConcurrentHashMapDiagram() {
  return <Figure caption="Simplified current OpenJDK update paths. Coordination is localized; the implementation does not put one lock around the whole map.">
    <div className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b className="text-cyan-950">get(key)</b><p className="mt-2 text-sm text-slate-700">Read the table and traverse the selected bin using volatile/atomic visibility. Retrieval normally does not lock.</p></article>
      <article className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><b className="text-emerald-950">put into empty bin</b><p className="mt-2 text-sm text-slate-700">Install the first Node with compare-and-set (CAS). No bin lock is needed when it succeeds.</p></article>
      <article className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b className="text-amber-950">update occupied bin</b><p className="mt-2 text-sm text-slate-700">Coordinate on that bin&apos;s first Node, validate it, then insert, replace, or remove inside that bin.</p></article>
      <article className="rounded-xl border border-violet-300 bg-violet-50 p-4"><b className="text-violet-950">resize</b><p className="mt-2 text-sm text-slate-700">Threads can help transfer bins. A forwarding Node tells readers and writers to continue in the new table.</p></article>
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
  const orderIds = ['Order 101', 'Order 205', 'Order 330'];

  return <Figure caption="Example list of order IDs. Current OpenJDK stores first and last references; every Node stores one element plus links to its previous and next Nodes.">
    <div className="mb-4 flex justify-between rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"><span>first → Order 101 Node</span><span>Order 330 Node ← last</span></div>
    <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
      {orderIds.map((orderId, index) => <div key={orderId} className="contents">
        <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-300 bg-white text-center text-xs">
          <span className="bg-slate-100 p-3 text-slate-500">{index === 0 ? 'null' : 'prev'}</span>
          <strong className="p-3 text-slate-950">{orderId}</strong>
          <span className="bg-slate-100 p-3 text-slate-500">{index === 2 ? 'null' : 'next'}</span>
        </div>
        {index < 2 && <span className="hidden text-center font-bold text-cyan-700 sm:block">⇄</span>}
      </div>)}
    </div>
  </Figure>;
}

function ArrayDequeDiagram() {
  const cells = [
    ['0', 'Job 4'], ['1', 'Job 5'], ['2', 'null'], ['3', 'null'],
    ['4', 'null'], ['5', 'Job 1'], ['6', 'Job 2'], ['7', 'Job 3'],
  ];
  return <Figure caption="Example queue of five jobs in a simplified circular array. Logical order starts at head, wraps at the array end, and stops before tail. The numbers above the cells are physical array indexes.">
    <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
      {cells.map(([index, value]) => <div key={index} className={`rounded-lg border p-2 text-center ${value === 'null' ? 'border-dashed border-slate-300 bg-slate-50 text-slate-400' : 'border-cyan-300 bg-cyan-50 text-slate-950'}`}>
        <small className="block font-mono text-[10px] text-slate-500">{index}</small><strong className="text-xs">{value}</strong>
      </div>)}
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm font-bold">
      <span className="rounded-lg bg-cyan-100 p-2 text-cyan-900">head = index 5 → Job 1</span>
      <span className="rounded-lg bg-amber-100 p-2 text-amber-900">tail = 2 → next free slot</span>
    </div>
    <p className="mt-3 text-center text-sm text-slate-600">Queue order: Job 1 → Job 2 → Job 3 → Job 4 → Job 5</p>
  </Figure>;
}

function TreeSetInsertDiagram() {
  return <Figure caption="Simplified insertion path: TreeSet delegates to a TreeMap. A zero comparison finds an existing tree key, so no new Node is created and add() returns false.">
    <div className="grid gap-2 text-center text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
      <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><strong className="block text-slate-950">add Sam</strong><span className="text-slate-600">id 7 · sam@example.com</span></div>
      <ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" />
      <div className="rounded-xl border border-slate-300 bg-white p-4"><strong className="block text-slate-950">Compare with stored Ana</strong><span className="text-slate-600">both IDs are 7 → result 0</span></div>
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

function SpokenAnswersPage() {
  return <div className="article-copy">
    <h3>Equality contracts</h3>
    <div className="answer-card"><p><code>equals()</code> must be reflexive, symmetric, transitive, and consistent, and a non-null object must not equal <code>null</code>. Equal objects must have equal hash codes, while unequal objects may collide. If I override value-based equality, I override both methods using the same stable fields.</p></div>
    <h3>Lists, sets, and deques</h3>
    <div className="answer-card"><p>I use <code>ArrayList</code> as the normal list, <code>HashSet</code> for unique membership, <code>TreeSet</code> for sorted uniqueness and range queries, and <code>ArrayDeque</code> for a stack or queue. I choose <code>LinkedList</code> only when its linked representation matches a demonstrated access pattern.</p></div>
    <p><strong>Internal-storage headline:</strong> <code>ArrayList</code> uses a resizable array, <code>LinkedList</code> uses doubly linked Nodes, <code>ArrayDeque</code> uses a circular resizable array, <code>HashSet</code> uses hash-map keys, and <code>TreeSet</code> uses sorted tree keys.</p>
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
      <tr><td><b>Consistent</b></td><td>Repeatedly calling <code>x.equals(y)</code> must return the same result as long as the fields used for equality in <code>x</code> and <code>y</code> do not change.</td></tr>
      <tr><td><b>Non-null</b></td><td><code>x.equals(null)</code> is false.</td></tr>
    </tbody></table></div>
    <h3><code>==</code> versus <code>equals()</code></h3>
    <p>For references, <code>==</code> asks whether two references point to the same object. This is called <b>object identity</b>: two references have the same identity when they point to the exact same object in memory. <code>equals()</code> asks whether they represent the same logical value. The default <code>Object.equals()</code> also uses identity until a class overrides it.</p>
    <p><code>Object</code> cannot know which fields should define logical identity for every possible class, so its default <code>equals()</code> implementation compares object references, conceptually <code>return this == other</code>. A class must override the method to say that matching fields—such as the same user ID—make two separate objects logically equal.</p>
    <CodeBlock label="Default identity equality" code={defaultEqualsCode} />
    <p><code>hashCode()</code> does not participate in the equality decision. Hash-based collections use it first to choose a bucket and then call <code>equals()</code> to identify the matching object.</p>
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
    <h3>How HashSet iteration works</h3>
    <p><code>HashSet</code> iterates through its backing hash table rather than remembering when elements were added. It scans bucket indexes and, for every non-empty bucket, follows the Nodes stored in that bucket.</p>
    <p>Suppose an employee-name set receives <code>Cara</code>, then <code>Ana</code>, then <code>Ben</code>. This reduced-capacity example uses illustrative bucket positions:</p>
    <div className="formula text-left"><code>insertion sequence: Cara → Ana → Ben<br /><br />bucket[0] → empty<br />bucket[1] → Ben<br />bucket[2] → empty<br />bucket[3] → Cara → Ana&nbsp;&nbsp; (two colliding Nodes)</code></div>
    <ol className="step-list">
      <li><b>Scan bucket 0.</b><span>It is empty, so return nothing.</span></li>
      <li><b>Scan bucket 1.</b><span>Return <code>Ben</code>, then follow that bucket&apos;s Node chain until it ends.</span></li>
      <li><b>Scan bucket 2.</b><span>It is empty, so continue.</span></li>
      <li><b>Scan bucket 3.</b><span>Return <code>Cara</code>, then follow the next collision Node and return <code>Ana</code>.</span></li>
    </ol>
    <div className="answer-card"><p>The illustrative iteration is therefore <code>Ben, Cara, Ana</code>, although insertion was <code>Cara, Ana, Ben</code>. This exact order is not guaranteed: hashes, capacity, collisions, resizing, and implementation details can change it.</p></div>
    <Callout tone="warning" title="Iteration cost"><code>HashSet</code> iteration can inspect empty buckets as well as stored entries, so its cost is proportional to backing capacity plus size. Choosing an unnecessarily large initial capacity can make iteration slower.</Callout>
    <h3>How LinkedHashSet preserves insertion order</h3>
    <Callout tone="tip" title="Does LinkedHashSet store elements only in a doubly linked list?"><strong>No.</strong> Like <code>HashSet</code>, it uses elements as keys in a hash-based backing structure and maps them to one shared placeholder value. Its entries additionally carry <code>before</code> and <code>after</code> links. One entry therefore belongs to two structures at the same time: a hash bucket for fast lookup and the doubly linked encounter-order chain for predictable iteration.</Callout>
    <p><code>LinkedHashSet</code> combines the membership behavior of a hash set with a doubly linked list running through every entry. The hash structure answers <em>“is this element present?”</em>; the linked chain answers <em>“which element comes next during iteration?”</em></p>
    <LinkedHashSetDiagram />
    <h3>How iteration works</h3>
    <p>Suppose the program adds employee names <code>Cara</code>, then <code>Ana</code>, then <code>Ben</code>. Their hashes may place the entries in unrelated buckets, but their encounter-order links still record the original sequence:</p>
    <div className="formula text-left"><code>possible hash structure:<br />bucket[1] → Ben<br />bucket[3] → Cara<br />bucket[6] → Ana<br /><br />encounter-order chain:<br />first inserted → Cara ↔ Ana ↔ Ben → last inserted</code></div>
    <p>The iterator does not scan those buckets. It starts with the eldest entry, returns its element, and repeatedly follows the entry&apos;s <code>after</code> link:</p>
    <ol className="step-list">
      <li><b>Return Cara.</b><span>Follow <code>Cara.after</code> to <code>Ana</code>.</span></li>
      <li><b>Return Ana.</b><span>Follow <code>Ana.after</code> to <code>Ben</code>.</span></li>
      <li><b>Return Ben.</b><span><code>Ben.after</code> reaches the end, so iteration stops.</span></li>
    </ol>
    <Callout title="Two structures, two jobs"><code>contains(&quot;Ana&quot;)</code> and <code>remove(&quot;Ana&quot;)</code> use hashing to find Ana&apos;s entry. <code>iterator()</code>, <code>forEach()</code>, and an ordered sequential <code>stream()</code> follow the insertion-order links.</Callout>
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
    <p><code>TreeSet</code> is backed by a navigable tree map. The set element is stored as a map key with one shared placeholder value. In current OpenJDK, those keys are organized as the same self-balancing red-black tree used by <code>TreeMap</code>. During <code>add(element)</code>, the tree compares the new element while walking from the root.</p>
    <TreeSetInsertDiagram />
    <p>If comparison is less than or greater than zero, insertion continues to the left or right subtree. If comparison is zero, an equivalent tree key already exists: no second tree Node is created, the size does not change, and <code>add()</code> returns false.</p>
    <Callout tone="warning" title="TreeSet uniqueness is ordering-based">A comparator returning zero means duplicate <em>inside that TreeSet</em>, even if <code>equals()</code> returns false. The comparator does not change equality elsewhere.</Callout>
    <Callout tone="tip" title="When sorting once is enough">If you mainly need fast membership and only occasionally need ordered output, a <code>HashSet</code> plus a sorted snapshot may be better than maintaining tree order after every update.</Callout>
  </div>;
}

function MapComparisonPage() {
  return <div className="article-copy">
    <p>All four implementations satisfy the <code>Map</code> abstraction, but they organize entries differently to provide different guarantees.</p>
    <MapModelsDiagram />
    <div className="table-wrap"><table><thead><tr><th>Map</th><th>Internal organization</th><th>Order</th><th>Basic cost</th></tr></thead><tbody>
      <tr><td><b>HashMap</b></td><td>Bucket array; collision Nodes can become tree bins</td><td>None guaranteed</td><td>O(1) average</td></tr>
      <tr><td><b>LinkedHashMap</b></td><td>HashMap-style entries plus one doubly linked order chain</td><td>Insertion or access order</td><td>O(1) average</td></tr>
      <tr><td><b>TreeMap</b></td><td>Balanced red-black tree of key-value entries</td><td>Sorted by keys</td><td>O(log n)</td></tr>
      <tr><td><b>ConcurrentHashMap</b></td><td>Concurrent bucket array with list/tree bins and specialized control Nodes</td><td>None guaranteed</td><td>O(1) expected</td></tr>
    </tbody></table></div>
    <div className="table-wrap"><table><thead><tr><th>Map</th><th>Nulls</th><th>Thread safety</th><th>Best fit</th></tr></thead><tbody>
      <tr><td><b>HashMap</b></td><td>One null key; null values</td><td>No</td><td>General single-threaded lookup</td></tr>
      <tr><td><b>LinkedHashMap</b></td><td>One null key; null values</td><td>No</td><td>Predictable iteration or simple access-order policy</td></tr>
      <tr><td><b>TreeMap</b></td><td>Natural ordering rejects null keys; null values allowed</td><td>No</td><td>Sorted traversal, ranges, and nearest keys</td></tr>
      <tr><td><b>ConcurrentHashMap</b></td><td>No null keys or values</td><td>Yes</td><td>Shared maps with concurrent reads and updates</td></tr>
    </tbody></table></div>
    <h3>HashMap or LinkedHashMap?</h3>
    <p>Use <code>HashMap</code> when the program only needs fast key lookup and iteration order has no meaning. It stores less ordering metadata, and callers must not depend on the order they happen to observe.</p>
    <p>Use <code>LinkedHashMap</code> when iteration must be predictable. Common reasons include displaying records in the order received, producing deterministic reports or serialized output, preserving first-seen order while deduplicating by key, and implementing a small access-order policy such as least-recently-used eviction.</p>
    <Callout title="The requirement that changes the choice">If a test, API response, report, or processing rule must visit <code>A → B → C</code> because the entries arrived in that order, order is part of the required behavior and <code>LinkedHashMap</code> is appropriate. If only <code>map.get(key)</code> matters, prefer <code>HashMap</code>.</Callout>
    <p>The tradeoff is that each <code>LinkedHashMap</code> entry maintains extra <code>before</code> and <code>after</code> links. Basic lookup remains O(1) on average, but the order chain uses extra memory and must be updated when entries change.</p>
    <Callout tone="tip" title="Interview answer">Choose <code>HashMap</code> for ordinary lookup, <code>LinkedHashMap</code> when encounter order matters, <code>TreeMap</code> when key order enables queries, and <code>ConcurrentHashMap</code> when multiple threads share mutable mappings.</Callout>
  </div>;
}

function MapOperationsPage() {
  return <div className="article-copy">
    <h3>How the same operation follows a different path</h3>
    <div className="grid gap-3">
      <article className="rounded-xl border border-slate-300 bg-white p-4"><h4 className="font-sans font-extrabold text-slate-950">HashMap</h4><ul className="mt-2 text-sm"><li><b>get:</b> hash → bucket → equality search.</li><li><b>put:</b> insert a Node or replace the equal key&apos;s value.</li><li><b>remove:</b> unlink the matching bucket Node.</li></ul></article>
      <article className="rounded-xl border border-slate-300 bg-white p-4"><h4 className="font-sans font-extrabold text-slate-950">LinkedHashMap</h4><ul className="mt-2 text-sm"><li><b>get:</b> use hash lookup; access order may also move the entry.</li><li><b>put:</b> update the hash structure and order links.</li><li><b>remove:</b> unlink from both the bin and order chain.</li></ul></article>
      <article className="rounded-xl border border-slate-300 bg-white p-4"><h4 className="font-sans font-extrabold text-slate-950">TreeMap</h4><ul className="mt-2 text-sm"><li><b>get:</b> compare keys while descending the tree.</li><li><b>put:</b> replace at comparison zero or add and rebalance.</li><li><b>remove:</b> delete the Entry and rebalance.</li></ul></article>
      <article className="rounded-xl border border-slate-300 bg-white p-4"><h4 className="font-sans font-extrabold text-slate-950">ConcurrentHashMap</h4><ul className="mt-2 text-sm"><li><b>get:</b> traverse a hash bin, normally without locking.</li><li><b>put:</b> CAS an empty bin or coordinate an occupied bin.</li><li><b>remove:</b> coordinate the affected bin.</li></ul></article>
    </div>
    <h3>Key identity is still decisive</h3>
    <ul>
      <li><code>HashMap</code>, <code>LinkedHashMap</code>, and <code>ConcurrentHashMap</code> narrow by hash and confirm key identity with <code>equals()</code>.</li>
      <li><code>TreeMap</code> uses natural ordering or its comparator. Comparison result zero means the same map key and a later <code>put()</code> replaces that key&apos;s value.</li>
    </ul>
    <CodeBlock code={mapOrderCode} />
    <Callout title="Updating is not adding another key">Every Map keeps unique keys. A <code>put()</code> that finds its existing key replaces the associated value and returns the previous value; <code>size</code> does not increase.</Callout>
  </div>;
}

function LinkedHashMapInternalsPage() {
  return <div className="article-copy">
    <p><code>LinkedHashMap</code> extends the hash-table model with <code>head</code>, <code>tail</code>, and <code>before</code>/<code>after</code> links on each entry. The key and value still live in that same entry.</p>
    <LinkedHashMapDiagram />
    <ol className="step-list">
      <li><b>Lookup by hash.</b><span><code>get(key)</code> selects a bucket and searches by key equality, like HashMap.</span></li>
      <li><b>Link new entries.</b><span>In insertion-order mode, a new entry becomes the tail. Replacing an existing value does not normally move its key.</span></li>
      <li><b>Iterate through order links.</b><span>Iteration starts at <code>head</code> and follows <code>after</code>, so resizing the bucket array does not destroy encounter order.</span></li>
      <li><b>Unlink twice on removal.</b><span>The entry leaves its hash bin and its neighbors&apos; order links are joined together.</span></li>
    </ol>
    <Callout title="Insertion order versus access order">The default preserves insertion order. With <code>accessOrder=true</code>, successful accesses such as <code>get()</code> move that entry to the tail, producing least-recently-used to most-recently-used order.</Callout>
    <h3>A small access-order map</h3>
    <CodeBlock code={lruCode} />
    <Callout tone="warning" title="A demonstration, not a complete cache">This map is not thread-safe and has no expiration, loading, size-by-weight policy, or cache metrics.</Callout>
  </div>;
}

function TreeMapInternalsPage() {
  return <div className="article-copy">
    <p><code>TreeMap</code> stores entries in a red-black tree. It compares the requested key with the current Node and moves left for a smaller result or right for a larger result.</p>
    <h3>What “red-black tree” means</h3>
    <p>A red-black tree is a self-balancing binary search tree. Every Node has a key, value, left child, right child, parent, and a red-or-black marker. The colors are bookkeeping used to prevent the tree from becoming a long one-sided chain.</p>
    <ul>
      <li>The root is black, and a red Node cannot have a red child.</li>
      <li>Every path from a Node to an empty descendant contains the same number of black Nodes.</li>
      <li>After insertion or removal, the tree uses recoloring and small pointer rearrangements called rotations to restore those rules.</li>
    </ul>
    <p>These rules do not make both sides perfectly equal. They keep the longest path within a bounded multiple of the shortest path, so the tree height remains O(log n) and searches avoid degrading into a full linear scan.</p>
    <TreeMapDiagram />
    <ul>
      <li><code>get(40)</code>: compare with 30, move right to 50, then left to 40.</li>
      <li><code>put()</code>: follow the same comparison path. Result zero replaces the value; otherwise add a leaf and rebalance.</li>
      <li><code>remove()</code>: delete the matching Entry and use rotations/recoloring when required to restore tree invariants.</li>
      <li>Balanced height keeps <code>get</code>, <code>put</code>, and <code>remove</code> at O(log n).</li>
    </ul>
    <Callout tone="warning" title="Comparison defines key identity">If the comparator returns zero for two keys that <code>equals()</code> considers different, TreeMap still treats them as one key position and replaces the value.</Callout>
    <h3>Navigation and live range views</h3>
    <CodeBlock code={rangeCode} />
    <p><code>floorEntry</code>, <code>ceilingEntry</code>, <code>lowerEntry</code>, and <code>higherEntry</code> find neighboring keys. <code>subMap</code>, <code>headMap</code>, and <code>tailMap</code> return backed views: changes in the view affect the original map and must stay inside the view&apos;s boundaries.</p>
    <Callout title="Why pay O(log n)?">TreeMap is valuable when sorting, nearest-key lookup, or range traversal is part of the workload. If the only requirement is exact-key lookup, HashMap is usually simpler and faster on average.</Callout>
  </div>;
}

function ConcurrentHashMapInternalsPage() {
  return <div className="article-copy">
    <p><code>ConcurrentHashMap</code> is a concurrent hash table designed so reads can proceed while updates occur. The API promises thread-safe operations; the details below describe current OpenJDK.</p>
    <ConcurrentHashMapDiagram />
    <h3>What its bins can contain</h3>
    <ul>
      <li><b>Ordinary Nodes:</b> hash, key, value, and <code>next</code> links for common bins.</li>
      <li><b>Tree bins:</b> balanced trees limit long collision searches.</li>
      <li><b>Forwarding Nodes:</b> temporary markers that redirect operations to a new table during resize.</li>
      <li><b>Reservation Nodes:</b> temporary placeholders used by computations such as <code>computeIfAbsent()</code>.</li>
    </ul>
    <h3>Concurrency consequences</h3>
    <p>Reads are normally nonblocking. Updates to different bins can progress independently, while competing updates to the same occupied bin may wait for one another. During resizing, multiple threads can help transfer different groups of bins.</p>
    <Callout title="Why null is forbidden"><code>get(key) == null</code> must unambiguously mean “no mapping” during concurrent activity. Therefore ConcurrentHashMap rejects both null keys and null values.</Callout>
    <p>Iterators are <strong>weakly consistent</strong>: they do not throw <code>ConcurrentModificationException</code>, may observe some concurrent changes, and are not a frozen snapshot.</p>
  </div>;
}

function AtomicMapUpdatesPage() {
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
    <Callout title="Choose the operation from the rule"><code>putIfAbsent</code> expresses “initialize only.” <code>computeIfAbsent</code> expresses “create when missing.” <code>compute</code> expresses “derive from current mapping.” <code>merge</code> expresses “combine an incoming value.”</Callout>
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
      <details><summary>How does LinkedHashMap keep order without losing fast lookup?</summary><p>The same entries participate in hash bins for average O(1) lookup and in a doubly linked encounter-order chain for iteration.</p></details>
      <details><summary>Why does TreeMap use comparison instead of equals?</summary><p>Its search-tree position is determined by natural ordering or a comparator. Comparison zero therefore means the same key position and a later value replaces the previous one.</p></details>
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
    <div className="formula text-left"><code>Indexed sequence&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → ArrayList<br />Stack or queue ends&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → ArrayDeque<br />Unique membership&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → HashSet<br />Sorted unique values&nbsp;&nbsp;&nbsp;&nbsp; → TreeSet<br /><br />General key lookup&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → HashMap<br />Stable encounter order&nbsp;&nbsp; → LinkedHashMap<br />Sorted keys and ranges&nbsp;&nbsp; → TreeMap<br />Concurrent key access&nbsp;&nbsp;&nbsp;&nbsp; → ConcurrentHashMap</code></div>
    <div className="answer-card"><p><strong>Memory hook:</strong> Correct equality makes collections trustworthy. Access pattern selects the collection. Ordering, sorting, and concurrency select the map.</p></div>
    <div className="sources">
      <p className="eyebrow">Primary references</p>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html" target="_blank" rel="noreferrer">Object equality and hashCode <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/doc-files/coll-overview.html" target="_blank" rel="noreferrer">Collections Framework overview <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html" target="_blank" rel="noreferrer">ArrayList API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedList.html" target="_blank" rel="noreferrer">LinkedList API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html" target="_blank" rel="noreferrer">ArrayDeque API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html" target="_blank" rel="noreferrer">TreeSet API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html" target="_blank" rel="noreferrer">HashSet API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashSet.html" target="_blank" rel="noreferrer">LinkedHashSet API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/EnumSet.html" target="_blank" rel="noreferrer">EnumSet API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashMap.html" target="_blank" rel="noreferrer">LinkedHashMap API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeMap.html" target="_blank" rel="noreferrer">TreeMap API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html" target="_blank" rel="noreferrer">ConcurrentHashMap API <ArrowRight /></a>
      <a href="https://github.com/openjdk/jdk25u/blob/master/src/java.base/share/classes/java/util/LinkedHashMap.java" target="_blank" rel="noreferrer">OpenJDK 25 LinkedHashMap source <ArrowRight /></a>
      <a href="https://github.com/openjdk/jdk25u/blob/master/src/java.base/share/classes/java/util/TreeMap.java" target="_blank" rel="noreferrer">OpenJDK 25 TreeMap source <ArrowRight /></a>
      <a href="https://github.com/openjdk/jdk25u/blob/master/src/java.base/share/classes/java/util/concurrent/ConcurrentHashMap.java" target="_blank" rel="noreferrer">OpenJDK 25 ConcurrentHashMap source <ArrowRight /></a>
    </div>
  </div>;
}

export const javaCollectionsPages: ReadingPage[] = [
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
  { id: 'map-comparison', chapter: 'Map choice', title: 'Comparing the main Map implementations', Content: MapComparisonPage },
  { id: 'map-operations', chapter: 'Map internals', title: 'How Map operations differ internally', Content: MapOperationsPage },
  { id: 'linkedhashmap-internals', chapter: 'Map internals', title: 'How LinkedHashMap works internally', Content: LinkedHashMapInternalsPage },
  { id: 'treemap-internals', chapter: 'Map internals', title: 'How TreeMap works internally', Content: TreeMapInternalsPage },
  { id: 'concurrenthashmap-internals', chapter: 'Map internals', title: 'How ConcurrentHashMap works internally', Content: ConcurrentHashMapInternalsPage },
  { id: 'atomic-map-updates', chapter: 'Concurrency', title: 'Atomic updates with ConcurrentHashMap', Content: AtomicMapUpdatesPage },
  { id: 'mock-interview', chapter: 'Daily review', title: 'Progressive mock interview', Content: MockInterviewPage },
  { id: 'recap', chapter: 'Daily review', title: 'Daily selection recap', Content: RecapPage },
];
