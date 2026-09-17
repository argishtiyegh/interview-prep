'use client';

import { ArrowRight } from 'lucide-react';
import { Callout, CodeBlock, Figure } from '@/components/answer-primitives';
import type { ReadingPage } from '@/lib/reading';

const safetyCode = [
  'List<OrderId> ids = new ArrayList<>();',
  'ids.add(new OrderId(42));',
  '',
  'OrderId first = ids.get(0); // no cast',
  '// ids.add("wrong");          // compile-time error',
  '',
  'record Page<T>(List<T> items, int total) {}',
  'Page<Customer> customers = customerRepository.findPage();',
].join('\n');

const classMethodCode = [
  'final class Box<T> {',
  '    private T value;',
  '    Box(T value) { this.value = value; }',
  '    T get() { return value; }',
  '}',
  '',
  'static <T> T first(List<T> values) {',
  '    if (values.isEmpty()) throw new NoSuchElementException();',
  '    return values.get(0);',
  '}',
  '',
  'Box<String> box = new Box<>("ready");',
  'Integer number = first(List.of(10, 20));',
].join('\n');

const invarianceCode = [
  'List<Integer> integers = new ArrayList<>();',
  '// List<Number> numbers = integers; // forbidden',
  '',
  '// If it were allowed:',
  '// numbers.add(3.14);',
  '// Integer value = integers.get(0); // would encounter a Double',
  '',
  'List<? extends Number> readable = integers;',
  'Number value = readable.get(0);',
].join('\n');

const extendsCode = [
  'static double sum(List<? extends Number> values) {',
  '    double total = 0;',
  '    for (Number value : values) {',
  '        total += value.doubleValue();',
  '    }',
  '    return total;',
  '}',
  '',
  'sum(List.of(1, 2, 3));       // List<Integer>',
  'sum(List.of(1.5, 2.5));      // List<Double>',
  '// values.add(1);             // exact element type is unknown',
].join('\n');

const superCode = [
  'static void addDefaults(List<? super Integer> target) {',
  '    target.add(0);',
  '    target.add(1);',
  '}',
  '',
  'List<Integer> integers = new ArrayList<>();',
  'List<Number> numbers = new ArrayList<>();',
  'List<Object> objects = new ArrayList<>();',
  '',
  'addDefaults(integers);',
  'addDefaults(numbers);',
  'addDefaults(objects);',
  '',
  'Object first = numbers.get(0); // only Object is guaranteed',
].join('\n');

const pecsCode = [
  'static <T> void copy(',
  '        List<? extends T> source,',
  '        List<? super T> destination) {',
  '    for (T item : source) {',
  '        destination.add(item);',
  '    }',
  '}',
  '',
  'List<Integer> source = List.of(1, 2, 3);',
  'List<Number> destination = new ArrayList<>();',
  'copy(source, destination);',
].join('\n');

const boundsCode = [
  'static <T extends Comparable<? super T>> T max(List<T> values) {',
  '    T winner = values.get(0);',
  '    for (T candidate : values) {',
  '        if (candidate.compareTo(winner) > 0) winner = candidate;',
  '    }',
  '    return winner;',
  '}',
  '',
  'class SortedCache<K extends Comparable<? super K>, V> {',
  '    private final NavigableMap<K, V> values = new TreeMap<>();',
  '}',
  '',
  '// Multiple bounds: <T extends BaseClass & Auditable & Comparable<T>>',
].join('\n');

const erasureCode = [
  '// Source-level generic form',
  'final class Box<T> {',
  '    private T value;',
  '    T get() { return value; }',
  '}',
  '',
  '// Conceptual erased form',
  'final class Box {',
  '    private Object value;',
  '    Object get() { return value; }',
  '}',
  '',
  'String text = (String) box.get(); // compiler inserts the cast',
].join('\n');

const bridgeCode = [
  'class Parent<T> {',
  '    T value() { return null; }',
  '}',
  '',
  'class Child extends Parent<String> {',
  '    @Override String value() { return "child"; }',
  '',
  '    // Conceptual compiler bridge:',
  '    // Object value() { return value(); }',
  '}',
].join('\n');

const rawCode = [
  'List<String> names = new ArrayList<>();',
  'List raw = names;           // legacy raw type',
  'raw.add(42);                // unchecked call warning',
  '',
  'String first = names.get(0);',
  '// ClassCastException appears here, far from the unsafe write',
  '',
  'List<?> unknown = names;    // type-safe unknown element type',
  'Object value = unknown.get(0);',
].join('\n');

const pollutionCode = [
  'static void corrupt(List<String>... groups) {',
  '    Object[] array = groups;       // arrays are reified and covariant',
  '    array[0] = List.of(42);        // runtime array accepts List',
  '    String value = groups[0].get(0); // ClassCastException',
  '}',
  '',
  '@SafeVarargs',
  'static <T> List<T> flatten(List<? extends T>... groups) {',
  '    // Safe only if the method never writes into or exposes groups.',
  '    return Arrays.stream(groups).flatMap(List::stream).toList();',
  '}',
].join('\n');

const restrictionsCode = [
  '// new T();                   // type constructor erased',
  '// new T[10];                 // runtime array element type unavailable',
  '// value instanceof List<String> // parameter not reifiable',
  '// static T shared;           // one static field cannot vary per T',
  '// class Problem extends Exception<T> {} // generic Throwable forbidden',
  '',
  'if (value instanceof List<?> list) {',
  '    Object first = list.get(0);',
  '}',
  '',
  'static <T> T create(Supplier<? extends T> factory) {',
  '    return factory.get();',
  '}',
].join('\n');

const captureCode = [
  'static void reverse(List<?> values) {',
  '    reverseCaptured(values);',
  '}',
  '',
  'private static <T> void reverseCaptured(List<T> values) {',
  '    for (int left = 0, right = values.size() - 1; left < right;',
  '         left++, right--) {',
  '        T value = values.get(left);',
  '        values.set(left, values.get(right));',
  '        values.set(right, value);',
  '    }',
  '}',
].join('\n');

function TypeFlowFigure() {
  return <Figure caption="Generics attach a compile-time relationship to otherwise reusable code. The compiler validates writes and reads, then emits JVM-compatible code through erasure and inserted casts or bridges.">
    <div className="grid gap-3 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
      <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>Source</b><span className="block text-slate-600">List&lt;Order&gt;</span></div><ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" /><div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><b>Compiler</b><span className="block text-slate-600">checks type relationships</span></div><ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" /><div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>Runtime</b><span className="block text-slate-600">mostly erased representation</span></div>
    </div>
  </Figure>;
}

function VarianceFigure() {
  return <Figure caption="Integer is a subtype of Number, but a mutable List<Integer> is not a subtype of List<Number>. Allowing that assignment would permit a Double to enter storage promised to contain only Integer values.">
    <div className="space-y-4 text-center font-sans text-sm"><div className="mx-auto max-w-xs rounded-xl border border-cyan-300 bg-cyan-50 p-3"><b>Number</b><div className="mx-auto mt-3 h-5 w-1/2 border-x-2 border-t-2 border-cyan-600" /><div className="grid grid-cols-2 gap-3"><span className="rounded-lg bg-white p-2">Integer</span><span className="rounded-lg bg-white p-2">Double</span></div></div><div className="rounded-xl border border-rose-300 bg-rose-50 p-4"><b>List&lt;Integer&gt; ✕ List&lt;Number&gt;</b><span className="mt-1 block text-slate-600">generic types are invariant unless a wildcard describes safe variance</span></div></div>
  </Figure>;
}

function WildcardFigure() {
  return <Figure caption="An extends wildcard gives a safe upper reading type but hides the exact writable type. A super wildcard gives a safe lower writable type but reads only as Object.">
    <div className="grid gap-4 font-sans text-sm sm:grid-cols-2"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>? extends Number</b><p className="mt-2 text-slate-700">Could be List&lt;Integer&gt; or List&lt;Double&gt;.</p><strong className="mt-3 block">Read Number ✓ · add value ✕</strong></div><div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>? super Integer</b><p className="mt-2 text-slate-700">Could be List&lt;Integer&gt;, List&lt;Number&gt;, or List&lt;Object&gt;.</p><strong className="mt-3 block">Add Integer ✓ · read Object ✓</strong></div></div>
  </Figure>;
}

function ErasureFigure() {
  return <Figure caption="Erasure preserves binary compatibility with pre-generics libraries. Type arguments guide compilation, while ordinary parameterized instances generally do not carry those arguments as distinct runtime classes.">
    <div className="grid gap-3 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div className="space-y-2"><div className="rounded-lg border border-cyan-300 bg-cyan-50 p-3">Box&lt;String&gt;</div><div className="rounded-lg border border-amber-300 bg-amber-50 p-3">Box&lt;Order&gt;</div></div><ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" /><div className="rounded-xl border border-slate-300 bg-slate-50 p-5"><b>one erased Box class</b><span className="block text-slate-600">Object or leftmost bound</span></div></div>
  </Figure>;
}

function OverviewPage() { return <div className="article-copy"><div className="answer-card"><p>Generics let classes, interfaces, and methods express relationships between types while remaining reusable. They move many failures from runtime casts to compile-time checks, document APIs precisely, and reduce conversion code. Java implements them mainly through type erasure for compatibility with older bytecode and libraries.</p></div><TypeFlowFigure /><CodeBlock code={safetyCode} label="Reusable and type-safe" /><h3>What interviewers test</h3><ul><li>Can you reason about safe reads and writes rather than recite wildcard syntax?</li><li>Can you separate compile-time type information from runtime representation?</li><li>Can you recognize boundaries where unchecked code can corrupt otherwise safe generic code?</li></ul></div>; }

function GenericKindsPage() { return <div className="article-copy"><div className="answer-card"><p>A generic class declares a type parameter for the state and instance API of each parameterized use. A generic method declares its own type parameters for one invocation; it can appear in a generic or non-generic class, and the compiler often infers its type arguments from method arguments and the target type.</p></div><CodeBlock code={classMethodCode} label="Class scope versus method scope" /><h3>Where the type variable is available</h3><ul><li><code>Box&lt;T&gt;</code> makes <code>T</code> available to instance fields, constructors, and instance methods.</li><li><code>static &lt;T&gt; T first(...)</code> introduces a fresh <code>T</code> per invocation.</li><li>A static member cannot use its class’s <code>T</code>, because one static member is shared by every parameterization.</li></ul><Callout title="Type inference is constraint solving">The compiler combines argument types, declared bounds, and the expected result type. Explicit type witnesses such as <code>Collections.&lt;String&gt;emptyList()</code> are rarely necessary.</Callout></div>; }

function InvariancePage() { return <div className="article-copy"><div className="answer-card"><p><code>List&lt;Integer&gt;</code> is not a subtype of <code>List&lt;Number&gt;</code> because Java generics are invariant. If the assignment were legal, code holding the Number view could insert a Double, breaking the Integer list’s guarantee. Wildcards provide restricted views when covariance or contravariance is safe.</p></div><VarianceFigure /><CodeBlock code={invarianceCode} label="Why mutable generic types are invariant" /><Callout tone="tip" title="Arrays behave differently—and pay for it">Arrays are covariant, so <code>Number[] values = new Integer[2]</code> compiles, but an incompatible write throws <code>ArrayStoreException</code> at runtime. Generics reject the analogous mistake at compile time.</Callout></div>; }

function ExtendsPage() { return <div className="article-copy"><div className="answer-card"><p><code>? extends T</code> means “some specific but unknown subtype of T.” You may safely read values as <code>T</code>, but you cannot add a non-null value because the actual list might require a narrower subtype than the value you chose.</p></div><WildcardFigure /><CodeBlock code={extendsCode} label="A producer view" /><h3>Why writes are rejected</h3><p>Inside <code>sum()</code>, <code>values</code> could be a <code>List&lt;Integer&gt;</code>. Adding a Double would be unsafe. It could also be a <code>List&lt;Double&gt;</code>, making an Integer unsafe. The compiler does not know the captured wildcard type, so no concrete Number value is valid for every possibility.</p></div>; }

function SuperPage() { return <div className="article-copy"><div className="answer-card"><p><code>? super T</code> means “some specific but unknown supertype of T.” You may safely add <code>T</code> values because every possible target accepts them. Reads are only guaranteed as <code>Object</code> because the actual container might be typed as any wider supertype.</p></div><CodeBlock code={superCode} label="A consumer view" /><h3>The boundary is asymmetric</h3><ul><li>A <code>List&lt;? super Integer&gt;</code> can consume Integer and its subtypes.</li><li>It might really be <code>List&lt;Object&gt;</code>, so reading cannot promise Number or Integer.</li><li>The wildcard restricts what this reference may do; it does not change the underlying list.</li></ul></div>; }

function PecsPage() { return <div className="article-copy"><div className="answer-card"><p>PECS means Producer Extends, Consumer Super. If a parameter only supplies T values, use <code>? extends T</code>. If it receives T values, use <code>? super T</code>. If the same structure must both accept and return the exact T, use <code>T</code> without a wildcard.</p></div><CodeBlock code={pecsCode} label="Flexible copy API" /><h3>Apply PECS to each parameter</h3><p>The source produces values for the method, so it extends T. The destination consumes values from the method, so it is super T. This allows Integer input to be copied into Number or Object output without weakening either collection’s own element guarantee.</p><Callout tone="warning" title="PECS is guidance, not decoration">Do not add wildcards to return types without a reason. A wildcard return often transfers capture complexity to every caller.</Callout></div>; }

function BoundsPage() { return <div className="article-copy"><div className="answer-card"><p>A bounded type parameter limits the types that may replace a type variable and makes the bound’s operations available inside the generic implementation. An upper bound uses <code>extends</code> for both classes and interfaces. Multiple bounds use <code>&amp;</code>, with a class bound first when present.</p></div><CodeBlock code={boundsCode} label="Bounds expose required behavior" /><h3>Why <code>Comparable&lt;? super T&gt;</code>?</h3><p>A type may inherit comparison from a superclass. The lower-bounded wildcard accepts a comparator contract for T itself or one of its supertypes, making the bound more reusable than <code>Comparable&lt;T&gt;</code>.</p><Callout title="A bound is part of the API contract">Choose the weakest capability the algorithm needs. Overly specific bounds reject valid callers and couple the implementation to unnecessary types.</Callout></div>; }

function ErasurePage() { return <div className="article-copy"><div className="answer-card"><p>Type erasure is the compiler translation that removes most type arguments from emitted runtime types. An unbounded type variable becomes <code>Object</code>; a bounded variable becomes its leftmost bound. The compiler inserts casts at reads and may generate bridge methods to preserve overriding after erasure.</p></div><ErasureFigure /><CodeBlock code={erasureCode} label="Conceptual erasure" /><h3>What remains at runtime</h3><p>Class files retain generic signature metadata for reflection and tools, but an ordinary object is not a distinct <code>ArrayList&lt;String&gt;</code> runtime class. Runtime checks therefore cannot generally ask which concrete type argument created it.</p></div>; }

function BridgesPage() { return <div className="article-copy"><div className="answer-card"><p>Erasure can make an overriding method’s erased signature differ from its parent’s. The compiler may emit a synthetic bridge method with the erased parent signature; that bridge casts or delegates to the strongly typed override so normal polymorphism still works.</p></div><CodeBlock code={bridgeCode} label="Why bridge methods exist" /><h3>Why this appears in interviews and stack traces</h3><ul><li>Reflection may expose a method marked synthetic and bridge.</li><li>A <code>ClassCastException</code> can arise inside a bridge when unchecked code supplied the wrong runtime value.</li><li>Bridge generation preserves binary polymorphism; it is not a second method you write.</li></ul><Callout title="Erasure is a translation strategy">Source-level generic guarantees are real compiler guarantees even when the JVM executes an erased representation.</Callout></div>; }

function RawTypesPage() { return <div className="article-copy"><div className="answer-card"><p>A raw type uses a generic declaration without type arguments, such as <code>List</code> instead of <code>List&lt;String&gt;</code>. Raw types exist for compatibility with pre-generics code, but they disable important checks and introduce unchecked warnings. <code>List&lt;?&gt;</code> is the type-safe way to represent a list whose element type is unknown.</p></div><CodeBlock code={rawCode} label="Raw type boundary" /><h3>Why the failure appears late</h3><p>The unsafe raw write stores an Integer into the same object referenced as <code>List&lt;String&gt;</code>. The JVM does not reject that write because the element argument was erased. The compiler-inserted cast fails only when typed code reads the value.</p><Callout tone="warning" title="Treat unchecked warnings as boundary defects">Isolate legacy interaction, validate or copy data at the boundary, and keep the rest of the application warning-free.</Callout></div>; }

function HeapPollutionPage() { return <div className="article-copy"><div className="answer-card"><p>Heap pollution occurs when a variable of a parameterized type refers to an object that does not satisfy that parameterized contract. Raw types, unchecked casts, and generic varargs are common causes. The unsafe operation may succeed and corrupt the heap; a compiler-inserted cast fails later.</p></div><CodeBlock code={pollutionCode} label="Generic varargs hazard" /><h3>Why generic arrays are dangerous</h3><p>Arrays know and check their component class at runtime, while <code>List&lt;String&gt;</code> and <code>List&lt;Integer&gt;</code> erase to the same List class. A varargs parameter is an array, so combining it with non-reifiable element types can open a path to pollution.</p><Callout title="@SafeVarargs is a programmer promise">Use it only when the method does not write incompatible values into the varargs array and does not expose the array where another caller could do so. It suppresses a warning; it does not add a runtime check.</Callout></div>; }

function RestrictionsPage() { return <div className="article-copy"><div className="answer-card"><p>Because T’s concrete argument is usually unavailable at runtime, generic code cannot directly construct <code>new T()</code>, create <code>new T[]</code>, test <code>instanceof List&lt;String&gt;</code>, use a class type parameter in static state, or declare generic Throwable subclasses. APIs solve these limits by accepting factories, class tokens, or reifiable array constructors.</p></div><CodeBlock code={restrictionsCode} label="Erasure-driven restrictions" /><h3>Reifiable versus non-reifiable</h3><p>A reifiable type has enough runtime information for relevant checks—for example, a non-generic class, raw type, primitive, array of a reifiable component, or unbounded wildcard such as <code>List&lt;?&gt;</code>. <code>List&lt;String&gt;</code> is non-reifiable.</p><Callout tone="tip" title="Pass the missing runtime capability explicitly">Use <code>Supplier&lt;T&gt;</code> to construct values, <code>Class&lt;T&gt;</code> for reflective type tokens, or <code>IntFunction&lt;T[]&gt;</code> when an API must create an array.</Callout></div>; }

function CapturePage() { return <div className="article-copy"><div className="answer-card"><p>Wildcard capture is the compiler’s treatment of one unknown wildcard as one consistent temporary type. A helper method can name that captured type with <code>T</code>, allowing values read from the same list to be written back safely even though callers do not know the element type.</p></div><CodeBlock code={captureCode} label="Capture the unknown type once"/><h3>Why <code>List&lt;?&gt;</code> can still be rearranged</h3><p>The public method cannot add an arbitrary external value. The helper only moves values that already came from that exact list, so every write has the captured element type. This technique resolves “capture of ?” compiler errors without weakening the API to a raw type or unchecked cast.</p><Callout tone="tip" title="Relate positions with T">Use a type parameter when two or more argument or return positions must share one type. Use a wildcard when the exact type does not need to be named or related elsewhere.</Callout></div>; }

function InterviewPage() { return <div className="article-copy"><div className="answer-card"><p>Strong generic design starts from data flow: identify which types must remain equal, which parameters only produce values, which only consume them, and which runtime operations require reifiable information. Use type parameters to relate positions, wildcards for flexible views, bounds for required capabilities, and unchecked operations only at contained, validated boundaries.</p></div><h3>Rapid senior interview</h3><div className="faq-list"><details><summary>Why is List&lt;Integer&gt; not a List&lt;Number&gt;?</summary><p>Because a Number view could insert a Double and break the Integer guarantee. Mutable generic types are invariant.</p></details><details><summary>What does extends prevent?</summary><p>It hides the exact subtype, so concrete writes are unsafe. It still permits reading through the upper bound.</p></details><details><summary>What does erasure change?</summary><p>The compiler replaces type variables with Object or their leftmost bound, inserts casts, and may emit bridges. Generic signature metadata may remain, but instances generally do not carry distinct parameterized runtime classes.</p></details><details><summary>Raw type or unbounded wildcard?</summary><p>A raw type disables checks for legacy compatibility. <code>List&lt;?&gt;</code> keeps type safety while admitting an unknown element type.</p></details><details><summary>Where does heap pollution fail?</summary><p>Often not at the unsafe write. It usually fails later at an inserted cast in code that trusted the parameterized contract.</p></details></div><div className="sources"><p className="eyebrow">Primary references</p><a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html" target="_blank" rel="noreferrer">JLS 4: types, parameterized types, and erasure <ArrowRight /></a><a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html" target="_blank" rel="noreferrer">JLS 5: conversions and unchecked operations <ArrowRight /></a><a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html" target="_blank" rel="noreferrer">JLS 8: generic classes and methods <ArrowRight /></a></div></div>; }

export const javaGenericsPages: ReadingPage[] = [
  { id: 'generics-roadmap', chapter: 'Type safety', title: 'Why Java generics are useful', Content: OverviewPage },
  { id: 'generic-kinds', chapter: 'Type parameters', title: 'Generic classes and generic methods', Content: GenericKindsPage },
  { id: 'invariance', chapter: 'Variance', title: 'Why generic collections are invariant', Content: InvariancePage },
  { id: 'extends-wildcard', chapter: 'Variance', title: '? extends T: a producer view', Content: ExtendsPage },
  { id: 'super-wildcard', chapter: 'Variance', title: '? super T: a consumer view', Content: SuperPage },
  { id: 'pecs', chapter: 'Variance', title: 'PECS and flexible API design', Content: PecsPage },
  { id: 'bounded-parameters', chapter: 'Bounds', title: 'Bounded type parameters', Content: BoundsPage },
  { id: 'type-erasure', chapter: 'Runtime model', title: 'How type erasure works', Content: ErasurePage },
  { id: 'bridge-methods', chapter: 'Runtime model', title: 'Erasure, overriding, and bridge methods', Content: BridgesPage },
  { id: 'raw-types', chapter: 'Unsafe boundaries', title: 'Raw types and unchecked code', Content: RawTypesPage },
  { id: 'heap-pollution', chapter: 'Unsafe boundaries', title: 'Heap pollution and generic varargs', Content: HeapPollutionPage },
  { id: 'erasure-restrictions', chapter: 'Runtime model', title: 'Restrictions caused by type erasure', Content: RestrictionsPage },
  { id: 'wildcard-capture', chapter: 'API design', title: 'Wildcard capture and helper methods', Content: CapturePage },
  { id: 'generics-interview', chapter: 'Interview recap', title: 'Generics mock interview', Content: InterviewPage },
];
