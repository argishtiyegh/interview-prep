'use client';

import { ArrowRight } from 'lucide-react';
import { Callout, CodeBlock, Figure } from '@/components/answer-primitives';
import type { ReadingPage } from '@/lib/reading';

function HashPipeline() {
  return <Figure caption="Simplified example: the hashes and 16-bucket table are chosen for teaching; runtime values can differ.">
    <svg viewBox="0 0 820 260" aria-labelledby="hash-title hash-desc" className="h-auto w-full">
      <title id="hash-title">HashMap bucket selection example</title><desc id="hash-desc">The example key UserId 42 produces hash code 42, remains 42 after hash spreading, and reaches bucket 10 in a table with capacity 16.</desc>
      <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" /></marker></defs>
      {[
        { x: 20, w: 140, eyebrow: 'KEY · ID IS 42', main: 'UserId(42)', color: '#f8fafc' },
        { x: 220, w: 150, eyebrow: 'hashCode() RETURNS', main: 'hash = 42', color: '#ecfeff' },
        { x: 430, w: 160, eyebrow: 'SPREAD THE HASH', main: '42 ^ 0 = 42', color: '#ecfeff' },
        { x: 650, w: 150, eyebrow: 'SELECT BUCKET', main: '15 & 42 = 10', color: '#cffafe' },
      ].map((box, i) => <g key={box.x}><rect x={box.x} y="76" width={box.w} height="105" rx="16" fill={box.color} stroke={i === 3 ? '#06b6d4' : '#cbd5e1'} /><text x={box.x + 18} y="107" fontSize="11" fontWeight="800" letterSpacing="1.2" fill="#64748b">{box.eyebrow}</text><text x={box.x + 18} y="143" fontSize="16" fontWeight="800" fill="#0f172a">{box.main}</text>{i < 3 && <path d={`M${box.x + box.w + 12},128 H${box.x + box.w + 48}`} stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />}</g>)}
      <text x="20" y="220" fontSize="12" fill="#64748b">Result: HashMap searches bucket 10. Another key or table capacity can produce a different bucket.</text>
    </svg>
  </Figure>;
}

function TreeDiagram() {
  const collidingOrderIds = ['12', '28', '44', '60', '76', '92', '108', '124', '140'];

  return <Figure caption="Simplified example with nine different order ID keys deliberately chosen to collide in one bucket. Each number is an order ID key, not a bucket index. In current OpenJDK, a bin is considered for treeification when an insertion makes it exceed eight Nodes and the table has at least 64 buckets. The exact tree shape is an implementation detail.">
    <div className="grid items-center gap-7 sm:grid-cols-[1fr_auto_1fr]">
      <div><p className="mb-3 text-center text-xs font-bold text-slate-600">One bucket · nine colliding order ID Nodes</p><div className="flex flex-wrap items-center justify-center gap-y-1">{collidingOrderIds.map((orderId,i) => <div key={orderId} className="flex items-center"><span className="grid size-8 place-items-center rounded-full border border-amber-400 bg-amber-50 text-[9px] font-bold text-amber-950">{orderId}</span>{i < collidingOrderIds.length - 1 && <ArrowRight className="size-3 shrink-0 text-slate-400" />}</div>)}</div></div>
      <ArrowRight className="mx-auto rotate-90 text-cyan-500 sm:rotate-0" />
      <svg viewBox="0 0 300 205" className="mx-auto w-full max-w-[310px]" aria-label="Simplified balanced tree containing nine colliding order ID keys: 12, 28, 44, 60, 76, 92, 108, 124, and 140"><g stroke="#94a3b8" strokeWidth="2"><path d="M150 28L85 78M150 28l65 50M85 78l-42 50M85 78l42 50M215 78l-42 50M215 78l42 50M43 128l-20 52M257 128l20 52" /></g>{[[150,26,'76'],[85,76,'44'],[215,76,'108'],[43,126,'28'],[127,126,'60'],[173,126,'92'],[257,126,'124'],[23,178,'12'],[277,178,'140']].map(([x,y,orderId],i) => <g key={String(orderId)}><circle cx={Number(x)} cy={Number(y)} r="19" fill={i === 1 || i === 2 ? '#17324d' : '#cffafe'} stroke={i === 1 || i === 2 ? '#17324d' : '#06b6d4'} /><text x={Number(x)} y={Number(y)+4} textAnchor="middle" fontSize="10" fontWeight="800" fill={i === 1 || i === 2 ? 'white' : '#164e63'}>{orderId}</text></g>)}</svg>
    </div>
    <div className="mt-6 grid gap-2 sm:grid-cols-3"><div className="metric"><span>&gt; 8</span><small>Nodes after insertion</small></div><div className="metric"><span>≥ 64</span><small>table capacity</small></div><div className="metric"><span>≤ 6</span><small>untreeify during split</small></div></div>
  </Figure>;
}

const introCode = `Map<String, Integer> ages = new HashMap<>();

ages.put("John", 30);
ages.put("Anna", 25);

Integer age = ages.get("John");`;

const equalKeysCode = `User first = new User(1, "John");
User second = new User(1, "David");

map.put(first, "old value");
map.put(second, "new value");`;

const contractCode = `@Override
public boolean equals(Object other) {
    if (this == other) {
        return true;
    }

    if (!(other instanceof User user)) {
        return false;
    }

    return id == user.id;
}

@Override
public int hashCode() {
    return Long.hashCode(id);
}`;

const defaultHashCodeCode = `class User {
    long id;
    String name;

    User(long id, String name) {
        this.id = id;
        this.name = name;
    }
    // No equals() or hashCode() override
}

User first  = new User(42, "John");
User second = new User(42, "John");

first == second;           // false: two different objects
first.equals(second);      // false: Object.equals() uses identity
first.hashCode();          // identity-based integer, e.g. 1555009629
second.hashCode();         // usually different, e.g. 41359092`;

const recordHashCodeCode = `record UserId(long id) {}

UserId first  = new UserId(42);
UserId second = new UserId(42);

first.equals(second);              // true
first.hashCode() == second.hashCode(); // true`;

const mutableKeyCode = `User user = new User(10, "John");

Map<User, String> map = new HashMap<>();
map.put(user, "Admin");

user.setId(20);`;

const failedLookupCode = `map.get(user);         // may return null
map.containsKey(user); // may return false
map.remove(user);      // may fail
map.size();            // still 1`;

const safeUserCode = `class User {
    private final long id; // Stable identity

    private String name;
    private String email;

    @Override
    public boolean equals(Object other) {
        return this == other ||
               other instanceof User user &&
               id == user.id;
    }

    @Override
    public int hashCode() {
        return Long.hashCode(id);
    }
}`;

const hashSetCode = `Set<User> users = new HashSet<>();

users.add(user);
user.setId(20);

users.contains(user); // may be false
users.remove(user);   // may fail

users.add(user);
users.size();         // may become 2`;

function HashSetBackingDiagram() {
  return <Figure caption="Example with the set element UserId(42). HashSet stores that element as a key in its backing HashMap; every key points to the same internal PRESENT placeholder object.">
    <svg viewBox="0 0 780 260" aria-labelledby="set-title set-desc" className="h-auto w-full">
      <title id="set-title">How HashSet uses HashMap</title><desc id="set-desc">A HashSet add operation becomes a HashMap put operation using the element as key and PRESENT as value.</desc>
      <defs><marker id="set-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#06b6d4" /></marker></defs>
      <rect x="25" y="54" width="205" height="145" rx="18" fill="#f8fafc" stroke="#cbd5e1" />
      <text x="48" y="84" fontSize="11" fontWeight="800" letterSpacing="1.2" fill="#64748b">HASHSET API</text>
      <text x="48" y="128" fontSize="17" fontWeight="800" fill="#0f172a">users.add(UserId(42))</text>
      <text x="48" y="158" fontSize="12" fill="#64748b">Is this element already present?</text>
      <path d="M247 127H327" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#set-arrow)" />
      <text x="255" y="112" fontSize="10" fontWeight="800" fill="#0891b2">DELEGATES</text>
      <rect x="348" y="32" width="405" height="190" rx="18" fill="#ecfeff" stroke="#06b6d4" />
      <text x="373" y="65" fontSize="11" fontWeight="800" letterSpacing="1.2" fill="#0e7490">BACKING HASHMAP</text>
      <rect x="374" y="91" width="142" height="82" rx="12" fill="#fff" stroke="#bae6fd" />
      <text x="394" y="118" fontSize="10" fontWeight="800" fill="#64748b">MAP KEY / SET ELEMENT</text><text x="394" y="148" fontSize="16" fontWeight="800" fill="#0f172a">UserId(42)</text>
      <path d="M527 132H574" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#set-arrow)" />
      <rect x="594" y="91" width="132" height="82" rx="12" fill="#0f172a" />
      <text x="614" y="118" fontSize="10" fontWeight="800" fill="#94a3b8">VALUE</text><text x="614" y="148" fontSize="16" fontWeight="800" fill="#67e8f9">PRESENT</text>
      <text x="374" y="202" fontSize="12" fill="#475569">hashCode() and equals() operate on the map key.</text>
    </svg>
  </Figure>;
}

function OverviewPage() {
  return <div className="article-copy">
      <p>Java <code>HashMap</code> stores data as key-value pairs:</p>
      <CodeBlock code={introCode} />
      <div className="answer-card"><p><code>HashMap</code> and <code>HashSet</code> use <code>hashCode()</code> to locate a bucket and <code>equals()</code> to locate the exact key or element. Fields involved in those methods must remain stable while the object is stored in the collection.</p></div>
      <h3>Internal structure</h3>
      <p>Internally, <code>HashMap</code> uses an array of buckets. Each stored entry is called a <strong>Node</strong>. A bucket can be empty or contain one or more Nodes, and each Node stores:</p>
      <ul><li>Key</li><li>Value</li><li>Key&apos;s hash</li><li>Reference to the next Node in the same bucket</li></ul>
      <div className="formula"><code>hashCode() → find bucket → equals() → find exact key</code></div>
    </div>;
}

function HashCalculationPage() {
  return <div className="article-copy">
      <Callout tone="tip" title="Follow one key: UserId(42)">
        Here, <code>42</code> is the user&apos;s ID. For this simplified example, assume <code>hashCode()</code> returns <code>42</code>. HashMap spreads that hash and then uses it to select one bucket. The result is bucket <code>10</code>.
      </Callout>
      <HashPipeline />
      <Callout title="What does “spread the hash” mean?">
        HashMap mixes the hash&apos;s upper bits into its lower bits with <code>h ^ (h &gt;&gt;&gt; 16)</code>. This helps distribute keys because a small bucket array mainly uses the lower bits. For the small value <code>42</code>, the shifted part is <code>0</code>, so the spread hash remains <code>42</code>.
      </Callout>
      <div className="formula text-left"><code>bucket count: 16<br />mask: 16 - 1 = 15 = 00 1111<br />spread hash: 42&nbsp;&nbsp;&nbsp; = 10 1010<br />bitwise AND:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = 00 1010 = 10<br /><br />selected bucket: 10</code></div>
      <p>A class that does not override <code>hashCode()</code> inherits an identity-based value from <code>Object</code>. Java does not define its exact formula. Page 5 explains this and record-generated hashes.</p>
    </div>;
}

function PutGetPage() {
  return <div className="article-copy">
      <h3>How put() works</h3>
      <p>When inserting an entry with <code>map.put(key, value)</code>, <code>HashMap</code>:</p>
      <ol className="step-list"><li><b>Calls the key&apos;s <code>hashCode()</code>.</b></li><li><b>Calculates the bucket index.</b></li><li><b>Searches the Nodes inside the selected bucket.</b><span>For each candidate Node, it checks the stored hash and then compares the key using identity or <code>equals()</code>.</span></li><li><b>Replaces the value if an equal key already exists.</b></li><li><b>Adds a new Node if no equal key exists.</b></li></ol>
      <div className="formula text-left"><code>Same bucket + equals() true&nbsp; → replace the value<br />Same bucket + equals() false → add another entry</code></div>
      <p>Example:</p><CodeBlock code={equalKeysCode} />
      <p>If equality is based on <code>id</code>, the map contains only one entry because both keys are considered equal.</p>
      <h3>How get() works</h3>
      <p>For <code>map.get(key)</code>, <code>HashMap</code>:</p>
      <ol className="step-list"><li><b>Calculates the key&apos;s hash.</b></li><li><b>Finds the corresponding bucket.</b></li><li><b>Searches the Nodes inside that bucket.</b><span>It checks each candidate Node&apos;s stored hash and key until it finds a match.</span></li><li><b>Returns the value belonging to the matching key.</b></li></ol>
      <Callout title="Two responsibilities"><code>hashCode()</code> finds the likely location, while <code>equals()</code> identifies the exact key.</Callout>
    </div>;
}

function CollisionPage() {
  return <div className="article-copy">
      <p>Different keys can produce the same hash and therefore the same bucket. This teaching-only key deliberately uses a poor hash function so the collision is easy to see:</p>
      <CodeBlock label="Illustrative collision" code={`record OrderId(int value) {
    @Override
    public int hashCode() {
        return value % 4; // deliberately weak; do not use in production
    }
}

OrderId firstOrder = new OrderId(12);
OrderId secondOrder = new OrderId(28);

firstOrder.hashCode() == secondOrder.hashCode(); // true: both return 0
firstOrder.equals(secondOrder);                  // false: 12 is not 28`} />
      <p>This is a hash collision. The two order IDs are unequal, so both Nodes can exist in the same bucket.</p>
      <p>Colliding entries are initially organized as a linked list. In Java 8+, a heavily populated bucket may be converted into a red-black tree, improving lookup performance.</p>
      <TreeDiagram />
    </div>;
}

function EqualityPage() {
  return <div className="article-copy">
      <p>If two objects are equal, they must return the same hash code:</p>
      <CodeBlock label="Contract" code={`if (first.equals(second)) {\n    assert first.hashCode() == second.hashCode();\n}`} />
      <p>The reverse is not required. Two unequal objects may have the same hash code.</p>
      <p>Both methods must use the same identity-defining fields:</p>
      <CodeBlock code={contractCode} />
      <div className="pt-4">
        <h3>What happens if hashCode() is not overridden?</h3>
        <p>A normal class inherits <code>Object.hashCode()</code>. Java does <strong>not</strong> define a public formula that calculates this value from the object&apos;s fields or memory address. The JVM provides an identity-based integer that remains consistent for that same object during the current application execution.</p>
        <CodeBlock code={defaultHashCodeCode} />
        <Callout tone="warning" title="Same field values do not mean the same key">
          Because this class also inherits <code>Object.equals()</code>, two separately created <code>User</code> objects are unequal even when both contain <code>id = 42</code> and <code>name = &quot;John&quot;</code>. HashMap can therefore store them as two different keys. The example hash numbers are illustrative; never depend on their exact values or expect them to be identical on another run.
        </Callout>
        <div className="table-wrap"><table><thead><tr><th>Method not overridden</th><th>Default behavior</th></tr></thead><tbody><tr><td><code>Object.equals()</code></td><td>Returns true only when both references point to the same object.</td></tr><tr><td><code>Object.hashCode()</code></td><td>Returns an identity-based integer. Distinct objects should be different when practical, but collisions are still allowed.</td></tr></tbody></table></div>
        <h3>Records are different</h3>
        <p>A record does not simply use these identity defaults. The Java compiler provides <code>equals()</code> and <code>hashCode()</code> implementations derived from all record components unless you declare your own. Two <code>UserId(42)</code> records are therefore equal and must have the same hash code.</p>
        <CodeBlock code={recordHashCodeCode} />
      </div>
    </div>;
}

function MutableKeysPage() {
  return <div className="article-copy">
      <h3>Mutable keys</h3>
      <p>A <code>HashMap</code> does not automatically move an entry when its key changes.</p>
      <CodeBlock code={mutableKeyCode} />
      <p>If <code>id</code> participates in <code>hashCode()</code>, changing it may produce a different bucket:</p>
      <div className="formula text-left"><code>Insertion: id=10 → bucket 4<br />Lookup:&nbsp;&nbsp;&nbsp; id=20 → bucket 9</code></div>
      <p>The entry is physically still in bucket 4, but the lookup searches bucket 9:</p>
      <CodeBlock code={failedLookupCode} />
      <p>Reinserting the mutated key can even create another internal entry:</p>
      <CodeBlock code={`map.put(user, "Manager");\nmap.size(); // may become 2`} />
      <h3>Production consequences</h3>
      <ul><li><b>Cache failures:</b> Lookups fail, causing unnecessary database or external API calls.</li><li><b>Memory growth and duplicates:</b> Removal may fail, and reinsertion can create duplicate entries.</li></ul>
      <h3>Safe design</h3>
      <p>The object itself may be mutable, but the fields used in <code>equals()</code> and <code>hashCode()</code> must remain stable while it is used as a key.</p>
      <CodeBlock code={safeUserCode} />
      <p>Changing <code>name</code> or <code>email</code> is safe because these fields do not determine the key&apos;s hash or equality.</p>
      <p>An even safer design is a separate immutable key:</p>
      <CodeBlock code={`public record UserKey(long id) {}\n\nMap<UserKey, User> users = new HashMap<>();\nusers.put(new UserKey(user.getId()), user);`} />
      <p>Mutable objects are generally safe as map values:</p>
      <CodeBlock code={`Map<Long, User> users = new HashMap<>();\nusers.put(user.getId(), user);\n\nuser.setName("David"); // Does not affect the map structure`} />
    </div>;
}

function HashSetPage() {
  return <div className="article-copy">
      <p><code>HashSet</code> is internally backed by a <code>HashMap</code>. Set elements are stored as map keys with a constant placeholder value.</p>
      <p>Conceptually, <code>set.add(user)</code> works like <code>map.put(user, PRESENT)</code>.</p>
      <HashSetBackingDiagram />
      <div className="formula text-left"><code>hashCode() → find bucket<br />equals()&nbsp;&nbsp;&nbsp; → check whether the element already exists</code></div>
      <p>The same mutable-key problem applies to <code>HashSet</code> elements:</p>
      <CodeBlock code={hashSetCode} />
      <Callout tone="warning" title="The same stability rule applies">Fields participating in <code>equals()</code> and <code>hashCode()</code> must remain unchanged while an object is stored in a <code>HashSet</code>.</Callout>
    </div>;
}

function PerformancePage() {
  return <div className="article-copy">
      <p>With well-distributed hash codes, both collections provide constant-time basic operations on average:</p>
      <div className="table-wrap"><table><thead><tr><th>Purpose</th><th>HashMap</th><th>HashSet</th><th>Average</th></tr></thead><tbody><tr><td>Find</td><td><code>get(key)</code> or <code>containsKey(key)</code></td><td><code>contains(element)</code></td><td><b>O(1)</b></td></tr><tr><td>Insert</td><td><code>put(key, value)</code></td><td><code>add(element)</code></td><td><b>O(1)</b> amortized</td></tr><tr><td>Delete</td><td><code>remove(key)</code></td><td><code>remove(element)</code></td><td><b>O(1)</b></td></tr></tbody></table></div>
      <Callout title="What O(1) amortized means">Most <code>put()</code> and <code>add()</code> calls are constant-time. Occasionally, one call triggers an <b>O(n)</b> resize and moves many entries. When that rare cost is spread across all the cheap insertions, the average cost per insertion is still <b>O(1)</b>. It does not mean every individual insertion is constant-time.</Callout>
      <Callout title="Why HashSet has no get() or put()"><code>HashSet</code> stores only elements. Its <code>add()</code>, <code>contains()</code>, and <code>remove()</code> operations use the equivalent key operations on its backing <code>HashMap</code>.</Callout>
      <h3>Resizing and collisions</h3>
      <p>The default capacity is <code>16</code> and the default load factor is <code>0.75</code>. Crossing <code>capacity × load factor</code> triggers an <b>O(n)</b> resize, but it happens occasionally, so insertion remains <b>O(1) amortized</b>. HashSet has the same cost because its backing HashMap also resizes.</p>
      <p>Heavy collisions require searching multiple Nodes in one bucket and make operations slower. Current OpenJDK implementations can convert a large bin into a tree, often reducing collision-heavy searches toward <b>O(log n)</b>; ordinary well-distributed access remains <b>O(1)</b> on average.</p>
      <p>Iterating either collection costs <b>O(size + capacity)</b>, because iteration also crosses empty buckets. An unnecessarily large initial capacity can therefore waste memory and slow iteration.</p>
      <h3>Important properties</h3>
      <ul><li>HashMap supports one <code>null</code> key; HashSet supports one <code>null</code> element.</li><li>Neither collection preserves insertion order or provides thread safety.</li><li>Use <code>ConcurrentHashMap</code> for concurrent map access.</li><li>Use linked variants when insertion-order iteration matters.</li></ul>
      <div className="answer-card mt-8"><p><strong>The central idea:</strong> <code>HashMap</code> and <code>HashSet</code> use <code>hashCode()</code> to locate a bucket and <code>equals()</code> to locate the exact key or element. Fields involved in those methods must remain stable while the object is stored in the collection.</p></div>
      <div className="sources"><p className="eyebrow">Primary references</p><a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode()" target="_blank" rel="noreferrer">Java SE 25 Object equality and hashCode documentation <ArrowRight /></a><a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Record.html" target="_blank" rel="noreferrer">Java SE 25 Record documentation <ArrowRight /></a><a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html" target="_blank" rel="noreferrer">Java SE 25 HashMap API documentation <ArrowRight /></a><a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html" target="_blank" rel="noreferrer">Java SE 25 HashSet API documentation <ArrowRight /></a><a href="https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/HashMap.java" target="_blank" rel="noreferrer">OpenJDK 25 HashMap source <ArrowRight /></a></div>
    </div>;
}

export const hashMapPages: ReadingPage[] = [
  { id: 'overview', chapter: 'Foundations', title: 'HashMap overview and internal structure', Content: OverviewPage },
  { id: 'hash-calculation', chapter: 'Foundations', title: 'Hash calculation and bucket selection', Content: HashCalculationPage },
  { id: 'put-get', chapter: 'Core operations', title: 'How put() and get() work', Content: PutGetPage },
  { id: 'collisions', chapter: 'Core operations', title: 'Collisions and tree bins', Content: CollisionPage },
  { id: 'equality-contract', chapter: 'Correctness', title: 'The equals() and hashCode() contract', Content: EqualityPage },
  { id: 'mutable-keys', chapter: 'Correctness', title: 'Mutable keys and safe design', Content: MutableKeysPage },
  { id: 'hashset', chapter: 'HashSet', title: 'How HashSet works', Content: HashSetPage },
  { id: 'performance', chapter: 'Performance', title: 'Resizing, performance, and recap', Content: PerformancePage },
];
