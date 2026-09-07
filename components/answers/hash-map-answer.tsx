'use client';

import { ArrowRight } from 'lucide-react';
import { Callout, CodeBlock, Figure } from '@/components/answer-primitives';
import type { ReadingPage } from '@/lib/reading';

function HashPipeline() {
  return <Figure caption="This is a teaching example: UserId(42) is the key, 42 is the user's ID, hashCode() is assumed to return 42, and the table has 16 buckets.">
    <svg viewBox="0 0 820 260" aria-labelledby="hash-title hash-desc" className="h-auto w-full">
      <title id="hash-title">HashMap bucket selection example</title><desc id="hash-desc">The example key UserId 42 produces hash code 42, remains 42 after hash spreading, and reaches bucket 10 in a table with capacity 16.</desc>
      <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" /></marker></defs>
      {[
        { x: 20, w: 140, eyebrow: 'KEY · ID IS 42', main: 'UserId(42)', color: '#f8fafc' },
        { x: 220, w: 150, eyebrow: 'hashCode() RETURNS', main: 'hash = 42', color: '#ecfeff' },
        { x: 430, w: 160, eyebrow: 'MIX HIGH BITS DOWN', main: '42 ^ 0 = 42', color: '#ecfeff' },
        { x: 650, w: 150, eyebrow: 'SELECT BUCKET', main: '15 & 42 = 10', color: '#cffafe' },
      ].map((box, i) => <g key={box.x}><rect x={box.x} y="76" width={box.w} height="105" rx="16" fill={box.color} stroke={i === 3 ? '#06b6d4' : '#cbd5e1'} /><text x={box.x + 18} y="107" fontSize="11" fontWeight="800" letterSpacing="1.2" fill="#64748b">{box.eyebrow}</text><text x={box.x + 18} y="143" fontSize="16" fontWeight="800" fill="#0f172a">{box.main}</text>{i < 3 && <path d={`M${box.x + box.w + 12},128 H${box.x + box.w + 48}`} stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />}</g>)}
      <text x="20" y="220" fontSize="12" fill="#64748b">Result: HashMap searches bucket 10. Another key or table capacity can produce a different bucket.</text>
    </svg>
  </Figure>;
}

function TreeDiagram() {
  return <Figure caption="Tree bins are red-black trees in current OpenJDK implementations. Their exact shape is an implementation detail.">
    <div className="grid items-center gap-7 sm:grid-cols-[1fr_auto_1fr]">
      <div><p className="mb-3 text-center text-xs font-bold text-slate-600">Linked bin · eight colliding Nodes</p><div className="flex items-center justify-center">{['K1','K2','K3','K4','K5','K6','K7','K8'].map((k,i) => <div key={k} className="flex items-center"><span className="grid size-8 place-items-center rounded-full border border-amber-400 bg-amber-50 text-[10px] font-bold text-amber-950">{k}</span>{i < 7 && <ArrowRight className="size-3 shrink-0 text-slate-400" />}</div>)}</div></div>
      <ArrowRight className="mx-auto rotate-90 text-cyan-500 sm:rotate-0" />
      <svg viewBox="0 0 300 205" className="mx-auto w-full max-w-[310px]" aria-label="Simplified balanced tree containing K1 through K8"><g stroke="#94a3b8" strokeWidth="2"><path d="M140 32L75 82M140 32l60 50M75 82l-40 48M75 82l35 48M200 82l-35 48M200 82l35 48M235 130l35 48" /></g>{[[140,26,'K4'],[75,80,'K2'],[200,80,'K6'],[35,128,'K1'],[110,128,'K3'],[165,128,'K5'],[235,128,'K7'],[270,176,'K8']].map(([x,y,k],i) => <g key={String(k)}><circle cx={Number(x)} cy={Number(y)} r="20" fill={i === 1 || i === 2 ? '#17324d' : '#cffafe'} stroke={i === 1 || i === 2 ? '#17324d' : '#06b6d4'} /><text x={Number(x)} y={Number(y)+4} textAnchor="middle" fontSize="11" fontWeight="800" fill={i === 1 || i === 2 ? 'white' : '#164e63'}>{k}</text></g>)}</svg>
    </div>
    <div className="mt-6 grid gap-2 sm:grid-cols-3"><div className="metric"><span>8</span><small>treeify threshold</small></div><div className="metric"><span>64</span><small>minimum capacity</small></div><div className="metric"><span>6</span><small>untreeify threshold on split</small></div></div>
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
  return <Figure caption="HashSet delegates element storage to a backing HashMap: each set element becomes a map key and every key points to the same placeholder object.">
    <svg viewBox="0 0 780 260" aria-labelledby="set-title set-desc" className="h-auto w-full">
      <title id="set-title">How HashSet uses HashMap</title><desc id="set-desc">A HashSet add operation becomes a HashMap put operation using the element as key and PRESENT as value.</desc>
      <defs><marker id="set-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#06b6d4" /></marker></defs>
      <rect x="25" y="54" width="205" height="145" rx="18" fill="#f8fafc" stroke="#cbd5e1" />
      <text x="48" y="84" fontSize="11" fontWeight="800" letterSpacing="1.2" fill="#64748b">HASHSET API</text>
      <text x="48" y="128" fontSize="17" fontWeight="800" fill="#0f172a">users.add(user)</text>
      <text x="48" y="158" fontSize="12" fill="#64748b">Is this element already present?</text>
      <path d="M247 127H327" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#set-arrow)" />
      <text x="255" y="112" fontSize="10" fontWeight="800" fill="#0891b2">DELEGATES</text>
      <rect x="348" y="32" width="405" height="190" rx="18" fill="#ecfeff" stroke="#06b6d4" />
      <text x="373" y="65" fontSize="11" fontWeight="800" letterSpacing="1.2" fill="#0e7490">BACKING HASHMAP</text>
      <rect x="374" y="91" width="142" height="82" rx="12" fill="#fff" stroke="#bae6fd" />
      <text x="394" y="118" fontSize="10" fontWeight="800" fill="#64748b">KEY</text><text x="394" y="148" fontSize="16" fontWeight="800" fill="#0f172a">user</text>
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
      <Callout tone="tip" title="Worked example: what does 42 mean?">
        Suppose the key is <code>new UserId(42)</code>, where <code>42</code> is the user&apos;s ID. For this teaching example, assume <code>UserId.hashCode()</code> returns that ID, so the raw hash is <code>42</code>. Because <code>42 &gt;&gt;&gt; 16</code> is <code>0</code>, mixing the high bits does not change this small hash. With 16 buckets, HashMap calculates <code>(16 - 1) &amp; 42</code>, which equals <code>10</code>, so it searches bucket 10.
      </Callout>
      <HashPipeline />
      <Callout title="Why mix the high bits into the low bits?">
        A small table chooses its bucket mainly from the hash&apos;s lowest bits. If useful differences exist only in the upper bits, many keys could otherwise land in the same bucket. OpenJDK calculates <code>h ^ (h &gt;&gt;&gt; 16)</code>: shifting copies the upper 16 bits downward, and XOR mixes them with the lower 16 bits. This is a small distribution improvement, not encryption and not a second call to the key&apos;s <code>hashCode()</code> method.
      </Callout>
      <div className="formula text-left"><code>capacity = 16<br />mask = capacity - 1 = 15<br /><br />15&nbsp; = 00 1111<br />42&nbsp; = 10 1010<br />AND = 00 1010 = 10<br /><br />bucket index = 10</code></div>
      <p><strong>If a normal class does not override <code>hashCode()</code>,</strong> it inherits an identity-based integer from <code>Object</code>; Java does not specify a public formula for that number. Records are different: the compiler provides equality and hashing derived from their components. Page 5 shows both cases in detail.</p>
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
      <p>Different keys can produce the same bucket:</p>
      <CodeBlock label="Condition" code={`key1.hashCode() == key2.hashCode()\nkey1.equals(key2) == false`} />
      <p>This is called a hash collision. Both entries can still exist in the same bucket.</p>
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
      <p>The default initial capacity is <code>16</code>, and the default load factor is <code>0.75</code>.</p>
      <p>When the number of entries exceeds <code>capacity × load factor</code>, the map increases its capacity and redistributes entries across the new bucket array. This is called resizing.</p>
      <p>Average performance is:</p>
      <div className="table-wrap"><table><thead><tr><th>Operation</th><th>Average performance</th></tr></thead><tbody><tr><td><code>put()</code></td><td><b>O(1)</b></td></tr><tr><td><code>get()</code></td><td><b>O(1)</b></td></tr><tr><td><code>remove()</code></td><td><b>O(1)</b></td></tr></tbody></table></div>
      <h3>Important properties</h3>
      <ul><li>Supports one <code>null</code> key and multiple <code>null</code> values.</li><li>Does not preserve insertion order.</li><li>Is not thread-safe.</li><li>Use <code>ConcurrentHashMap</code> for concurrent access.</li><li>Use <code>LinkedHashMap</code> when iteration order matters.</li><li>Use <code>TreeMap</code> when keys must remain sorted.</li></ul>
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
