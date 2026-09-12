'use client';

import { ArrowRight } from 'lucide-react';
import { Callout, CodeBlock, Figure } from '@/components/answer-primitives';
import type { ReadingPage } from '@/lib/reading';

const firstPipelineCode = [
  'List<Order> largePaidOrders = orders.stream()',
  '        .filter(Order::isPaid)',
  '        .filter(order -> order.total().compareTo(new BigDecimal("100")) > 0)',
  '        .sorted(Comparator.comparing(Order::createdAt))',
  '        .toList();',
].join('\n');

const streamSourcesCode = [
  'orders.stream();                    // Collection source',
  'Arrays.stream(orderArray);          // array source',
  'Stream.of(first, second);           // explicit elements',
  'IntStream.range(0, 10);             // primitive range',
  'Stream.iterate(1, n -> n + 1);      // potentially unbounded',
  '',
  'try (Stream<String> lines = Files.lines(path)) {',
  '    long errors = lines.filter(line -> line.contains("ERROR")).count();',
  '}',
].join('\n');

const fusedPipelineCode = [
  'Optional<String> firstMatch = names.stream()',
  '        .filter(name -> name.length() >= 4)',
  '        .map(String::toUpperCase)',
  '        .findFirst();',
  '',
  '// Conceptual traversal:',
  '// "Li"   → filter rejects; map is not called',
  '// "Ana"  → filter rejects; map is not called',
  '// "Maya" → filter passes → "MAYA" → findFirst stops',
].join('\n');

const lazyCode = [
  'Stream<Integer> pipeline = Stream.iterate(1, n -> n + 1)',
  '        .filter(n -> n % 7 == 0)',
  '        .map(n -> n * n)',
  '        .limit(3);',
  '',
  '// No source traversal has happened yet.',
  'List<Integer> result = pipeline.toList();',
  '// [49, 196, 441] — traversal stops after three results',
].join('\n');

const orderCode = [
  'List<Integer> source = List.of(3, 1, 2);',
  '',
  'source.stream().map(n -> n * 10).toList();',
  '// [30, 10, 20] — List encounter order is retained',
  '',
  'source.parallelStream().forEach(System.out::println);',
  '// print order is not guaranteed',
  '',
  'source.parallelStream().forEachOrdered(System.out::println);',
  '// prints 3, 1, 2',
].join('\n');

const mapFlatMapCode = [
  'List<String> customerNames = orders.stream()',
  '        .map(order -> order.customer().name())',
  '        .toList();',
  '',
  'List<Product> products = orders.stream()',
  '        .flatMap(order -> order.items().stream())',
  '        .map(LineItem::product)',
  '        .distinct()',
  '        .toList();',
].join('\n');

const primitiveCode = [
  'int totalUnits = orders.stream()',
  '        .flatMap(order -> order.items().stream())',
  '        .mapToInt(LineItem::quantity)',
  '        .sum();',
  '',
  'Optional<Order> largest = orders.stream()',
  '        .max(Comparator.comparing(Order::total));',
  '',
  'List<String> cleanNames = rawNames.stream()',
  '        .filter(Objects::nonNull)',
  '        .map(String::trim)',
  '        .toList();',
].join('\n');

const reduceCode = [
  'BigDecimal revenue = orders.stream()',
  '        .map(Order::total)',
  '        .reduce(BigDecimal.ZERO, BigDecimal::add);',
  '',
  'Optional<BigDecimal> largestTotal = orders.stream()',
  '        .map(Order::total)',
  '        .reduce(BigDecimal::max);',
  '',
  '// Wrong for parallel reduction: subtraction is not associative',
  'int unstable = numbers.parallelStream()',
  '        .reduce(0, (left, right) -> left - right);',
].join('\n');

const collectCode = [
  'List<String> customerNames = orders.stream()',
  '        .map(order -> order.customer().name())',
  '        .collect(Collectors.toCollection(ArrayList::new));',
  '',
  '// Conceptual collector functions:',
  '// supplier:    ArrayList::new',
  '// accumulator: List::add',
  '// combiner:    List::addAll',
  '// finisher:    identity — return the accumulated list',
].join('\n');

const resultCollectionCode = [
  'List<Order> snapshot = orders.stream().toList();',
  '// unmodifiable result',
  '',
  'ArrayList<Order> editable = orders.stream()',
  '        .collect(Collectors.toCollection(ArrayList::new));',
  '',
  'LinkedHashSet<String> uniqueInEncounterOrder = orders.stream()',
  '        .map(order -> order.customer().email())',
  '        .collect(Collectors.toCollection(LinkedHashSet::new));',
  '',
  'String labels = orders.stream()',
  '        .map(Order::number)',
  '        .collect(Collectors.joining(", "));',
].join('\n');

const groupingCode = [
  'Map<Status, List<Order>> byStatus = orders.stream()',
  '        .collect(Collectors.groupingBy(Order::status));',
  '',
  'Map<Status, Long> countByStatus = orders.stream()',
  '        .collect(Collectors.groupingBy(',
  '                Order::status,',
  '                Collectors.counting()));',
  '',
  'Map<Status, BigDecimal> revenueByStatus = orders.stream()',
  '        .collect(Collectors.groupingBy(',
  '                Order::status,',
  '                LinkedHashMap::new,',
  '                Collectors.reducing(',
  '                        BigDecimal.ZERO,',
  '                        Order::total,',
  '                        BigDecimal::add)));',
].join('\n');

const partitionMapCode = [
  'Map<Boolean, List<Order>> paymentPartition = orders.stream()',
  '        .collect(Collectors.partitioningBy(Order::isPaid));',
  '',
  'Map<Long, BigDecimal> revenueByCustomer = orders.stream()',
  '        .collect(Collectors.toMap(',
  '                order -> order.customer().id(),',
  '                Order::total,',
  '                BigDecimal::add,       // merge duplicate customer IDs',
  '                LinkedHashMap::new));  // retain first key encounter order',
].join('\n');

const duplicateKeyCode = [
  'record User(long id, String email) {}',
  '',
  'List<User> users = List.of(',
  '        new User(7, "ana@work.example"),',
  '        new User(7, "ana@home.example"));',
  '',
  '// Throws IllegalStateException: both elements produce key 7',
  'users.stream().collect(Collectors.toMap(User::id, User::email));',
  '',
  '// Explicit policy: keep the first email',
  'users.stream().collect(Collectors.toMap(',
  '        User::id, User::email, (first, ignored) -> first));',
].join('\n');

const sharedStateCode = [
  'List<Order> paid = new ArrayList<>();',
  '',
  '// Broken under parallel execution: concurrent ArrayList mutation',
  'orders.parallelStream()',
  '        .filter(Order::isPaid)',
  '        .forEach(paid::add);',
  '',
  '// Express the result as a reduction instead',
  'List<Order> safe = orders.parallelStream()',
  '        .filter(Order::isPaid)',
  '        .toList();',
].join('\n');

const reuseCode = [
  'Stream<Order> paid = orders.stream().filter(Order::isPaid);',
  '',
  'long count = paid.count();',
  'List<Order> again = paid.toList(); // IllegalStateException',
  '',
  '// Create a fresh stream for every traversal',
  'Supplier<Stream<Order>> paidOrders =',
  '        () -> orders.stream().filter(Order::isPaid);',
  '',
  'long freshCount = paidOrders.get().count();',
  'List<Order> freshList = paidOrders.get().toList();',
].join('\n');

const parallelCode = [
  'long totalUnits = orders.parallelStream()',
  '        .filter(Order::isPaid)',
  '        .flatMapToInt(order -> order.items().stream()',
  '                .mapToInt(LineItem::quantity))',
  '        .asLongStream()',
  '        .sum();',
  '',
  '// Measure against the sequential form with realistic data.',
  '// Parallel execution is a request, not a speed guarantee.',
].join('\n');

const loopCode = [
  '// A loop clearly expresses indexed comparison and early exit',
  'for (int i = 1; i < readings.size(); i++) {',
  '    if (readings.get(i) < readings.get(i - 1)) {',
  '        return i; // first out-of-order position',
  '    }',
  '}',
  'return -1;',
  '',
  '// A stream is clearer for a filter-map-reduce query',
  'BigDecimal paidRevenue = orders.stream()',
  '        .filter(Order::isPaid)',
  '        .map(Order::total)',
  '        .reduce(BigDecimal.ZERO, BigDecimal::add);',
].join('\n');

function PipelineDiagram() {
  const stages = [
    ['SOURCE', 'List<Order>'],
    ['FILTER', 'paid only'],
    ['MAP', 'extract total'],
    ['TERMINAL', 'sum'],
  ];
  return <Figure caption="A pipeline describes how elements travel from a source to a result. Intermediate stages do not store a second copy of the collection.">
    <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center">
      {stages.map(([label, detail], index) => <div key={label} className="contents">
        <div className={`rounded-xl border p-4 text-center ${index === stages.length - 1 ? 'border-emerald-300 bg-emerald-50' : 'border-cyan-300 bg-cyan-50'}`}>
          <span className="block text-xs font-extrabold tracking-[.12em] text-slate-600">{label}</span>
          <strong className="mt-1 block text-slate-950">{detail}</strong>
        </div>
        {index < stages.length - 1 && <ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" aria-hidden="true" />}
      </div>)}
    </div>
  </Figure>;
}

function LifecycleDiagram() {
  return <Figure caption="The stream is reusable only as a description before execution. The terminal operation performs the traversal and consumes that pipeline.">
    <div className="space-y-3 font-sans text-sm">
      <div className="rounded-xl border border-slate-300 bg-slate-50 p-4"><b className="text-slate-950">1 · Source</b><span className="ml-2 text-slate-600">Collection, array, generator, file, or another data provider</span></div>
      <div className="ml-6 border-l-2 border-dashed border-cyan-500 pl-5">
        <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b className="text-slate-950">2 · Build stages</b><span className="ml-2 text-slate-600">filter → map → sorted</span></div>
        <p className="my-2 text-center font-bold text-cyan-800">No traversal yet</p>
      </div>
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><b className="text-slate-950">3 · Terminal operation</b><span className="ml-2 text-slate-600">toList starts traversal and produces the result</span></div>
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b className="text-slate-950">4 · Consumed</b><span className="ml-2 text-slate-600">Create a fresh stream to traverse the source again</span></div>
    </div>
  </Figure>;
}

function FusedTraversalDiagram() {
  const rows = [
    ['Li', 'reject', '—', 'continue'],
    ['Ana', 'reject', '—', 'continue'],
    ['Maya', 'pass', 'MAYA', 'stop'],
  ];
  return <Figure caption="Stateless operations are commonly fused. Each source element moves through the stages before traversal requests another element; findFirst stops as soon as it has a result.">
    <div className="overflow-x-auto font-sans text-sm">
      <div className="min-w-[560px] space-y-2">
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-extrabold uppercase tracking-[.1em] text-slate-600"><span>Source</span><span>filter length ≥ 4</span><span>map uppercase</span><span>findFirst</span></div>
        {rows.map(([source, filter, map, terminal]) => <div key={source} className="grid grid-cols-4 gap-2 text-center">
          <span className="rounded-lg border border-slate-300 bg-white p-3 font-bold">{source}</span>
          <span className={`rounded-lg border p-3 ${filter === 'pass' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>{filter}</span>
          <span className="rounded-lg border border-cyan-300 bg-cyan-50 p-3">{map}</span>
          <span className={`rounded-lg border p-3 font-bold ${terminal === 'stop' ? 'border-amber-300 bg-amber-50' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>{terminal}</span>
        </div>)}
      </div>
    </div>
  </Figure>;
}

function OperationKindsDiagram() {
  const kinds = [
    ['STATELESS', 'filter · map · peek', 'Processes one element without remembering earlier elements'],
    ['STATEFUL', 'sorted · distinct', 'May buffer or remember elements before producing output'],
    ['SHORT-CIRCUIT', 'limit · findFirst · anyMatch', 'May finish without visiting the whole source'],
    ['TERMINAL', 'toList · reduce · collect', 'Starts traversal and produces the result'],
  ];
  return <Figure caption="These categories explain memory use and when a pipeline can stop. An operation can belong to more than one behavioral category.">
    <div className="grid gap-3 sm:grid-cols-2">
      {kinds.map(([kind, examples, meaning]) => <article key={kind} className="rounded-xl border border-slate-300 bg-slate-50 p-4 font-sans">
        <span className="text-xs font-extrabold tracking-[.12em] text-cyan-800">{kind}</span>
        <strong className="mt-1 block text-slate-950">{examples}</strong>
        <p className="mt-2 text-sm leading-6 text-slate-600">{meaning}</p>
      </article>)}
    </div>
  </Figure>;
}

function MapFlatMapDiagram() {
  return <Figure caption="map preserves the outer element count. flatMap replaces each outer element with zero or more inner elements and joins those inner sequences into one stream.">
    <div className="grid gap-5 font-sans sm:grid-cols-2">
      <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4">
        <b className="text-slate-950">map: one → one</b>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-sm"><span className="rounded-lg bg-white p-3">Order 101</span><ArrowRight className="text-cyan-700" /><span className="rounded-lg bg-white p-3">Ana</span></div>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-sm"><span className="rounded-lg bg-white p-3">Order 205</span><ArrowRight className="text-cyan-700" /><span className="rounded-lg bg-white p-3">Ben</span></div>
      </div>
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <b className="text-slate-950">flatMap: one → many → flat</b>
        <div className="mt-4 text-center text-sm"><span className="rounded-lg bg-white p-3">Order 101: [Book, Pen]</span><div className="my-2 font-bold text-amber-700">↓ flatten</div><span className="rounded-lg bg-white p-3">Book · Pen · Cable</span></div>
        <div className="mt-3 text-center text-sm"><span className="rounded-lg bg-white p-3">Order 205: [Cable]</span></div>
      </div>
    </div>
  </Figure>;
}

function ReductionDiagram() {
  return <Figure caption="A parallel reduction can accumulate partitions independently and combine their partial results. Associativity ensures regrouping does not change the answer.">
    <div className="grid gap-3 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div className="space-y-3"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4">[1, 2] → <b>3</b></div><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4">[3, 4] → <b>7</b></div></div>
      <div className="text-2xl font-bold text-cyan-700">→</div>
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6"><span className="block text-xs font-bold text-slate-600">COMBINE</span><strong className="text-2xl text-slate-950">3 + 7 = 10</strong></div>
    </div>
  </Figure>;
}

function CollectorDiagram() {
  const stages = [
    ['Supplier', 'creates containers'],
    ['Accumulator', 'adds each element'],
    ['Combiner', 'merges partial containers'],
    ['Finisher', 'creates final result'],
  ];
  return <Figure caption="A Collector packages a mutable reduction protocol. Parallel collection can use separate containers per partition and combine them without mutating one caller-owned list.">
    <div className="grid gap-2 sm:grid-cols-4">
      {stages.map(([name, detail], index) => <div key={name} className="relative rounded-xl border border-slate-300 bg-slate-50 p-4 text-center font-sans">
        <span className="text-xs font-extrabold text-cyan-800">{index + 1}</span><strong className="mt-1 block text-slate-950">{name}</strong><span className="mt-1 block text-sm text-slate-600">{detail}</span>
      </div>)}
    </div>
  </Figure>;
}

function GroupingDiagram() {
  return <Figure caption="groupingBy runs the classifier for every order, selects a map key, and sends the order to the downstream collector for that group.">
    <div className="grid gap-4 font-sans sm:grid-cols-[1fr_auto_1.2fr] sm:items-center">
      <div className="space-y-2 text-center text-sm"><div className="rounded-lg border bg-white p-2">Order 101 · PAID</div><div className="rounded-lg border bg-white p-2">Order 205 · NEW</div><div className="rounded-lg border bg-white p-2">Order 330 · PAID</div></div>
      <div className="rounded-full border border-cyan-300 bg-cyan-50 px-4 py-3 text-center text-sm font-bold">Order::status</div>
      <div className="space-y-2"><div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3"><b>PAID</b><span className="ml-2 text-sm">[101, 330]</span></div><div className="rounded-xl border border-amber-300 bg-amber-50 p-3"><b>NEW</b><span className="ml-2 text-sm">[205]</span></div></div>
    </div>
  </Figure>;
}

function DuplicateKeyDiagram() {
  return <Figure caption="toMap requires one value per map key. When two elements produce the same key, a merge function must decide how their values become one value.">
    <div className="grid gap-3 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
      <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4">User 7<br /><b>work email</b></div>
      <ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" />
      <div className="rounded-xl border border-rose-300 bg-rose-50 p-4"><b>duplicate key 7</b><br />throw or merge?</div>
      <ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" />
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">User 7<br /><b>home email</b></div>
    </div>
  </Figure>;
}

function ParallelDiagram() {
  return <Figure caption="A Spliterator partitions suitable sources. Workers process partitions, and the terminal reduction combines partial answers. Splitting and merging are overhead that the useful work must outweigh.">
    <div className="space-y-3 text-center font-sans text-sm">
      <div className="mx-auto max-w-sm rounded-xl border border-slate-300 bg-white p-3 font-bold">Orders [1 … 1,000,000]</div>
      <div className="mx-auto h-6 w-1/2 border-x-2 border-t-2 border-cyan-600" />
      <div className="grid grid-cols-2 gap-4"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4">partition A<br /><b>partial result</b></div><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4">partition B<br /><b>partial result</b></div></div>
      <div className="mx-auto h-6 w-1/2 border-x-2 border-b-2 border-emerald-600" />
      <div className="mx-auto max-w-sm rounded-xl border border-emerald-300 bg-emerald-50 p-3 font-bold">combined result</div>
    </div>
  </Figure>;
}

function InterviewRoadmapPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>A Java Stream is a consumable pipeline over a data source. Intermediate operations such as <code>filter</code> and <code>map</code> describe lazy transformations. A terminal operation initiates traversal and produces a value or side effect. Streams favor stateless functions and associative reductions, which lets the library optimize sequential execution and safely divide suitable work for parallel execution.</p></div>
    <PipelineDiagram />
    <h3>What interviewers are testing</h3>
    <ul>
      <li>Can you explain execution rather than only list Stream methods?</li>
      <li>Can you choose the correct transformation or reduction?</li>
      <li>Can you reason about ordering, duplicate keys, mutation, and parallel safety?</li>
      <li>Can you recognize when a loop communicates the algorithm better?</li>
    </ul>
    <CodeBlock code={firstPipelineCode} label="One pipeline" />
    <Callout tone="tip" title="Senior interview habit">Describe the data shape, required result, ordering requirement, and dominant cost before choosing operations.</Callout>
  </div>;
}

function SourcesLifecyclePage() {
  return <div className="article-copy">
    <p>A collection owns elements. A stream does not store them; it conveys elements from a source through a sequence of operations. Creating a stream therefore creates a traversal plan, not another collection.</p>
    <LifecycleDiagram />
    <CodeBlock code={streamSourcesCode} label="Stream sources" />
    <h3>Collection, iterator, and stream</h3>
    <ul>
      <li>A <code>Collection</code> is reusable storage.</li>
      <li>An <code>Iterator</code> exposes one element-at-a-time traversal controlled by the caller.</li>
      <li>A <code>Stream</code> expresses aggregate operations whose traversal is controlled by the Stream implementation.</li>
    </ul>
    <Callout tone="warning" title="Do not confuse stream families"><code>java.util.stream.Stream</code> processes element sequences. It is unrelated to byte and character I/O types such as <code>InputStream</code> and <code>Reader</code>, although an I/O API can provide a Stream as a traversal view.</Callout>
  </div>;
}

function PipelineExecutionPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>A Stream pipeline contains a source, zero or more intermediate operations, and a terminal operation. Intermediate calls build linked stages. The terminal operation obtains the source traversal and sends elements through those stages. Stateless stages such as <code>filter</code> and <code>map</code> can normally run as one fused pass, while stateful stages such as <code>sorted</code> may buffer elements.</p></div>
    <FusedTraversalDiagram />
    <CodeBlock code={fusedPipelineCode} label="Fused traversal" />
    <h3>The internal roles</h3>
    <ol className="step-list">
      <li><b>The source exposes traversal.</b><span>A collection normally supplies a <code>Spliterator</code>.</span></li>
      <li><b>Intermediate calls add stages.</b><span>They retain functions and pipeline metadata; they do not immediately process every element.</span></li>
      <li><b>The terminal operation begins work.</b><span>It drives traversal and requests the result required by <code>findFirst</code>, <code>reduce</code>, <code>collect</code>, or another terminal operation.</span></li>
      <li><b>Cancellation can stop traversal.</b><span>A short-circuiting terminal operation tells upstream traversal when enough information has been found.</span></li>
    </ol>
    <Callout title="Guarantee versus implementation">Laziness and single-use behavior are API guarantees. Pipeline stage objects, sink chains, and their exact classes are current OpenJDK implementation details.</Callout>
  </div>;
}

function LazinessPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Intermediate operations are lazy so the Stream implementation can combine stages, avoid intermediate collections, stop when a short-circuit result is known, and support potentially unbounded sources. Calling <code>filter()</code> creates a new pipeline stage; it does not traverse the source until a terminal operation begins.</p></div>
    <CodeBlock code={lazyCode} label="Lazy, bounded result" />
    <h3>What laziness makes possible</h3>
    <ul>
      <li><b>Fusion:</b> several stateless operations run during one source traversal.</li>
      <li><b>Short-circuiting:</b> <code>findFirst</code>, <code>anyMatch</code>, and <code>limit</code> can avoid later elements.</li>
      <li><b>Unbounded sources:</b> an infinite generator can complete when a later operation bounds the result.</li>
      <li><b>Optimization:</b> an implementation may skip a stage when it can prove that stage cannot affect the terminal result.</li>
    </ul>
    <Callout tone="warning" title="Side effects are not a progress counter">Do not depend on a lambda inside <code>map</code>, <code>filter</code>, or <code>peek</code> being invoked a particular number of times. The pipeline may stop early or legally elide work that cannot affect its result.</Callout>
  </div>;
}

function OperationKindsPage() {
  return <div className="article-copy">
    <p>Classifying operations predicts when traversal starts, whether memory is required, and whether a pipeline can finish early.</p>
    <OperationKindsDiagram />
    <h3>Stateless and stateful are different from pure and impure</h3>
    <p>A <em>stateless intermediate operation</em> does not need information about previously processed elements. This does not make a stateful lambda safe: a <code>map()</code> lambda that updates an external counter still depends on mutable state.</p>
    <p>A <em>stateful intermediate operation</em> is stateful by design. <code>distinct()</code> remembers seen values; <code>sorted()</code> generally needs all input before emitting sorted output. Under parallel execution, stateful operations can introduce buffering, synchronization, or extra passes.</p>
    <h3>Encounter order</h3>
    <p>Encounter order comes from the source or an operation such as <code>sorted()</code>. A <code>List</code> stream is ordered; a <code>HashSet</code> stream has no defined encounter order. Parallel execution may process elements in another physical order while still producing an ordered result when the operation requires one.</p>
    <CodeBlock code={orderCode} label="Order guarantees" />
    <Callout tone="tip" title="Ordering has a price">When order is irrelevant, <code>unordered()</code> can relax a constraint and help some parallel stateful operations. Use it only when every valid encounter order produces an acceptable result.</Callout>
  </div>;
}

function MapFlatMapPage() {
  return <div className="article-copy">
    <div className="answer-card"><p><code>map()</code> transforms each input into one output, preserving the outer shape. <code>flatMap()</code> transforms each input into a stream of zero or more outputs and concatenates those streams into one flat stream. Use <code>flatMap()</code> when the property being selected is itself a collection, stream, or optional value.</p></div>
    <MapFlatMapDiagram />
    <CodeBlock code={mapFlatMapCode} label="One-to-one and one-to-many" />
    <h3>Recognize the type shape</h3>
    <div className="formula text-left"><code>map(Order::items)&nbsp;&nbsp;&nbsp;&nbsp; → Stream&lt;List&lt;LineItem&gt;&gt;<br />flatMap(order → order.items().stream()) → Stream&lt;LineItem&gt;</code></div>
    <ul>
      <li>An empty inner collection contributes zero elements.</li>
      <li><code>Optional.stream()</code> lets zero-or-one values participate in flattening.</li>
      <li><code>flatMapToInt</code>, <code>flatMapToLong</code>, and <code>flatMapToDouble</code> avoid boxed primitive results.</li>
    </ul>
    <Callout tone="warning" title="flatMap is not ordinary map"><code>flatMap()</code> is useful because the mapping function returns another stream. If the function already returns one ordinary value, <code>map()</code> communicates the intent more clearly.</Callout>
  </div>;
}

function PrimitiveOptionalPage() {
  return <div className="article-copy">
    <p><code>IntStream</code>, <code>LongStream</code>, and <code>DoubleStream</code> process primitive values without wrapping each value in an object. They also provide numeric terminal operations such as <code>sum</code>, <code>average</code>, and <code>summaryStatistics</code>.</p>
    <CodeBlock code={primitiveCode} label="Primitives and absence" />
    <h3>Why Optional appears</h3>
    <p>An operation such as <code>max()</code> has no result for an empty stream, so it returns <code>Optional</code> or a primitive optional. A reduction with a valid identity can return that identity for empty input instead.</p>
    <h3>Null is possible, but costly to reason about</h3>
    <p>A Stream can contain <code>null</code> when its source permits it, but many operations assume non-null elements and some terminal operations reject a selected null result. Prefer domain models that represent absence explicitly. If null is valid input, filter or map it deliberately near the source.</p>
    <Callout tone="tip" title="Performance nuance">Primitive streams can reduce boxing and allocation, but readability and measured workload still decide whether the difference matters. Convert with <code>mapToInt()</code> and return to object form with <code>boxed()</code> only when required.</Callout>
  </div>;
}

function ReducePage() {
  return <div className="article-copy">
    <div className="answer-card"><p><code>reduce()</code> repeatedly combines elements into one immutable summary value. Its identity must be neutral, and its combining operation must be associative so sequential and parallel regrouping produce equivalent results. Use the no-identity overload when empty input has no natural result.</p></div>
    <ReductionDiagram />
    <CodeBlock code={reduceCode} label="Immutable reduction" />
    <h3>Identity, accumulator, and combiner</h3>
    <ul>
      <li><b>Identity:</b> the empty result and a neutral value, such as zero for addition.</li>
      <li><b>Accumulator:</b> combines a partial result with the next element.</li>
      <li><b>Combiner:</b> merges partial results created from separate partitions.</li>
    </ul>
    <p><b>Associative</b> means regrouping does not change the result: <code>(a + b) + c</code> equals <code>a + (b + c)</code>. Subtraction is not associative, so parallel partitioning can change its answer.</p>
    <Callout tone="warning" title="Do not mutate inside reduce">Appending into one mutable list and returning that same list from <code>reduce()</code> violates the intended reduction model and can break under parallel execution. Use <code>collect()</code> for mutable containers.</Callout>
  </div>;
}

function CollectPage() {
  return <div className="article-copy">
    <div className="answer-card"><p><code>reduce()</code> is suited to immutable summaries such as totals or maxima. <code>collect()</code> performs a mutable reduction into a container such as a list, set, map, or string builder. A Collector defines how to create containers, add elements, combine partial containers, and optionally finish the result.</p></div>
    <CollectorDiagram />
    <CodeBlock code={collectCode} label="Collector mechanics" />
    <h3>Parallel collection does not imply one shared list</h3>
    <p>A normal parallel collector can create separate mutable containers for separate partitions. Each worker mutates its own container, and the combiner joins them. The container itself therefore does not need to support unsynchronized writes from every worker.</p>
    <h3>Collector characteristics</h3>
    <ul>
      <li><code>IDENTITY_FINISH</code>: the accumulated container is already the final result.</li>
      <li><code>UNORDERED</code>: equivalent results do not depend on encounter order.</li>
      <li><code>CONCURRENT</code>: eligible workers may accumulate into the same result container concurrently.</li>
    </ul>
    <Callout title="Concurrent reduction has conditions">The stream must be parallel, the collector must be concurrent, and the stream must be unordered or the collector must declare unordered behavior before shared concurrent accumulation is appropriate.</Callout>
  </div>;
}

function ResultCollectionsPage() {
  return <div className="article-copy">
    <p>Choose the result contract explicitly. “Return a list” does not say whether callers may modify it, whether duplicates remain, or whether encounter order matters.</p>
    <CodeBlock code={resultCollectionCode} label="Result collection choices" />
    <div className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><h3 className="mt-0">Convenient snapshot</h3><p><code>Stream.toList()</code> returns an unmodifiable list. Use it when callers should consume the result without structural modification.</p></article>
      <article className="rounded-xl border border-amber-300 bg-amber-50 p-4"><h3 className="mt-0">Specific implementation</h3><p><code>toCollection(factory)</code> makes requirements explicit, such as an editable <code>ArrayList</code> or insertion-ordered <code>LinkedHashSet</code>.</p></article>
    </div>
    <h3>Do not infer undocumented types</h3>
    <p><code>Collectors.toList()</code> does not promise a particular list implementation or mutability contract. <code>Collectors.toSet()</code> does not promise a particular set type. Use a specific collector when code depends on those properties.</p>
    <Callout tone="tip" title="Finish in the right shape">Collectors such as <code>joining</code>, <code>counting</code>, <code>summingInt</code>, and <code>summarizingDouble</code> often communicate the requested result better than collecting elements first and processing the collection afterward.</Callout>
  </div>;
}

function GroupingPage() {
  return <div className="article-copy">
    <div className="answer-card"><p><code>groupingBy()</code> applies a classifier to each element and uses the classifier result as a map key. The downstream collector determines what is accumulated for that key: a list by default, or a count, set, sum, maximum, nested group, or another result when supplied.</p></div>
    <GroupingDiagram />
    <CodeBlock code={groupingCode} label="Grouping and downstream reduction" />
    <h3>Three decisions hidden in groupingBy</h3>
    <ol className="step-list">
      <li><b>Classifier.</b><span>Which group key does this element produce?</span></li>
      <li><b>Map factory.</b><span>Does the result require hash lookup, sorted keys, or stable key encounter order?</span></li>
      <li><b>Downstream collector.</b><span>Should each group contain elements, unique values, a count, a total, or another reduction?</span></li>
    </ol>
    <Callout tone="warning" title="Parallel grouping can merge many maps">Ordinary <code>groupingBy()</code> may build partial maps and merge their keys and values. For large parallel workloads, that merge can cost more than the parallel processing saves.</Callout>
  </div>;
}

function PartitionToMapPage() {
  return <div className="article-copy">
    <div className="answer-card"><p><code>partitioningBy()</code> divides elements by a boolean predicate and returns true and false partitions. <code>groupingBy()</code> supports any classifier key and usually accumulates multiple values per key. <code>toMap()</code> creates one map value per derived key, so duplicate keys require an explicit merge policy or cause <code>IllegalStateException</code>.</p></div>
    <CodeBlock code={partitionMapCode} label="Partition and map" />
    <DuplicateKeyDiagram />
    <CodeBlock code={duplicateKeyCode} label="Duplicate-key policy" />
    <h3>Choose the duplicate policy deliberately</h3>
    <ul>
      <li><b>Keep first:</b> appropriate when the earliest value is authoritative.</li>
      <li><b>Keep last:</b> appropriate when later input intentionally overrides earlier input.</li>
      <li><b>Combine:</b> sum totals, merge sets, or create a list of values.</li>
      <li><b>Throw:</b> appropriate when duplicate keys indicate invalid source data.</li>
    </ul>
    <Callout title="Map order is another decision">The four-argument <code>toMap()</code> accepts a map factory. Use <code>LinkedHashMap::new</code> when the result must iterate keys in first-encounter order; use <code>TreeMap::new</code> when keys must be sorted.</Callout>
  </div>;
}

function SharedStatePage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Stream lambdas should generally be non-interfering and stateless. Mutating the source can invalidate traversal, while mutating shared external state creates ordering dependencies and data races under parallel execution. Express accumulation with <code>reduce()</code> or <code>collect()</code>, which gives the library a safe partition-and-combine strategy.</p></div>
    <CodeBlock code={sharedStateCode} label="Shared state versus reduction" />
    <h3>Two different correctness rules</h3>
    <ul>
      <li><b>Non-interference:</b> do not modify a non-concurrent stream source while its pipeline is executing.</li>
      <li><b>Stateless behavior:</b> a lambda should not depend on state that changes while the pipeline runs.</li>
    </ul>
    <p>Wrapping the target list in a synchronized collection may prevent structural corruption, but it introduces contention, still leaves ordering questions, and hides the result in a side effect.</p>
    <Callout tone="warning" title="peek is observation, not business logic"><code>peek()</code> is useful for temporary diagnostics. Do not use it to send required messages, persist records, update counters, or perform another action whose execution must be guaranteed.</Callout>
    <Callout tone="tip" title="Side effects can be explicit">A terminal <code>forEach()</code> is reasonable when the requested outcome is itself an action, such as writing already-prepared records. Keep the action isolated and decide whether ordering, failure handling, and retries matter.</Callout>
  </div>;
}

function SingleUsePage() {
  return <div className="article-copy">
    <div className="answer-card"><p>A stream can be consumed once because it represents one traversal, not stored data. A terminal operation exhausts that pipeline and its traversal state. To process the source again, ask the source—or a supplier—for a fresh Stream. Reusing a consumed or already-linked Stream can produce <code>IllegalStateException</code>.</p></div>
    <CodeBlock code={reuseCode} label="Fresh traversal" />
    <h3>Why returning Stream changes an API</h3>
    <p>A method returning a Stream gives the caller a one-shot lazy view. Document source lifetime, ordering, possible nulls, and whether the caller must close it. Do not return a Stream whose backing resource has already been closed.</p>
    <h3>Close resource-backed streams</h3>
    <p>Collection streams normally require no explicit close. Streams backed by open files, directories, or similar resources should use try-with-resources so their close handlers execute reliably.</p>
    <Callout tone="warning" title="Detection is not the model">Some illegal stream reuse is detected and throws immediately, but code should not depend on every form of reuse being detected. Treat every pipeline as consumed after its terminal operation.</Callout>
  </div>;
}

function ParallelPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Use a parallel stream only when the source splits efficiently, the dataset and per-element CPU work are large enough to outweigh scheduling and merging, operations are stateless, and reduction is associative. Avoid it for small workloads, blocking I/O, strict ordering, shared mutation, expensive map merging, or request-handling code where shared worker usage is uncontrolled. Measure both versions with realistic data.</p></div>
    <ParallelDiagram />
    <CodeBlock code={parallelCode} label="Parallel candidate" />
    <h3>What the Spliterator contributes</h3>
    <p>A <code>Spliterator</code> traverses and partitions a source. Characteristics such as <code>SIZED</code>, <code>SUBSIZED</code>, <code>ORDERED</code>, <code>SORTED</code>, and <code>DISTINCT</code> help the pipeline choose valid optimizations. An array splits cheaply and evenly; an iterator-like source may split poorly.</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><h3 className="mt-0">Good candidate</h3><p>Large in-memory data, meaningful CPU work, balanced splitting, independent elements, associative reduction, and no required order.</p></article>
      <article className="rounded-xl border border-rose-300 bg-rose-50 p-4"><h3 className="mt-0">Poor candidate</h3><p>Small input, database or HTTP calls, shared state, ordered <code>limit</code>, nested parallel work, or expensive collector combination.</p></article>
    </div>
    <Callout title="Parallel is an execution mode">The most recent <code>parallel()</code> or <code>sequential()</code> setting applies to the whole pipeline. It requests an execution mode; it does not guarantee more threads, lower latency, or higher throughput.</Callout>
  </div>;
}

function LoopsInterviewPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>A stream is clearest for a recognizable transformation or aggregation such as filter-map-reduce, grouping, or collecting. A loop is often clearer for indexed algorithms, complex branching, several early exits, checked-exception-heavy work, state machines, or deliberate in-place mutation. Performance should be measured; neither syntax is universally faster.</p></div>
    <CodeBlock code={loopCode} label="Choose the clearer control model" />
    <h3>Rapid senior interview</h3>
    <div className="faq-list">
      <details><summary>Why can filter-map-findFirst avoid most work?</summary><p>Intermediate stages are lazy and fused. Each element is filtered and mapped only as needed, and the short-circuiting terminal operation cancels traversal after the first match.</p></details>
      <details><summary>Why can sorted() change pipeline memory behavior?</summary><p>It is stateful and normally needs to observe and buffer the input before it can emit globally sorted output.</p></details>
      <details><summary>When does toMap throw?</summary><p>The overload without a merge function throws when two input elements produce equal map keys. Supply a meaningful merge policy only when duplicates are valid.</p></details>
      <details><summary>Why is synchronizedList plus parallel forEach still weak?</summary><p>It adds contention, hides the result in shared state, and does not automatically supply the desired encounter order. A collector expresses safe accumulation.</p></details>
      <details><summary>What makes a parallel reduction correct?</summary><p>A neutral identity, stateless accumulation, an associative combiner, and compatibility between accumulation and combination.</p></details>
      <details><summary>When would you replace a stream with a loop?</summary><p>When explicit control flow, indexes, early exits, mutation, exception handling, or measured hot-path performance make the loop easier to verify.</p></details>
    </div>
    <div className="sources">
      <p className="eyebrow">Primary references</p>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html" target="_blank" rel="noreferrer">Stream package: pipelines, laziness, ordering, and reduction <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html" target="_blank" rel="noreferrer">Stream API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html" target="_blank" rel="noreferrer">Collectors API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collector.html" target="_blank" rel="noreferrer">Collector contract and characteristics <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Spliterator.html" target="_blank" rel="noreferrer">Spliterator traversal and characteristics <ArrowRight /></a>
    </div>
  </div>;
}

export const javaStreamsPages: ReadingPage[] = [
  { id: 'stream-roadmap', chapter: 'Interview roadmap', title: 'The Stream mental model', Content: InterviewRoadmapPage },
  { id: 'sources-lifecycle', chapter: 'Pipeline foundations', title: 'Sources and pipeline lifecycle', Content: SourcesLifecyclePage },
  { id: 'pipeline-execution', chapter: 'Pipeline internals', title: 'How a Stream pipeline executes', Content: PipelineExecutionPage },
  { id: 'laziness', chapter: 'Pipeline internals', title: 'Laziness and short-circuiting', Content: LazinessPage },
  { id: 'operation-kinds', chapter: 'Pipeline semantics', title: 'Operation types and encounter order', Content: OperationKindsPage },
  { id: 'map-flatmap', chapter: 'Transformations', title: 'map() versus flatMap()', Content: MapFlatMapPage },
  { id: 'primitives-optional', chapter: 'Data shapes', title: 'Primitive streams, Optional, and null', Content: PrimitiveOptionalPage },
  { id: 'reduce', chapter: 'Reduction', title: 'How reduce() works', Content: ReducePage },
  { id: 'collect', chapter: 'Reduction', title: 'reduce() versus collect()', Content: CollectPage },
  { id: 'result-collections', chapter: 'Collectors', title: 'Choosing the result collection', Content: ResultCollectionsPage },
  { id: 'grouping', chapter: 'Collectors', title: 'How groupingBy() works', Content: GroupingPage },
  { id: 'partition-tomap', chapter: 'Collectors', title: 'partitioningBy(), toMap(), and duplicate keys', Content: PartitionToMapPage },
  { id: 'shared-state', chapter: 'Correctness', title: 'Shared state, interference, and side effects', Content: SharedStatePage },
  { id: 'single-use', chapter: 'Lifecycle', title: 'Single use and resource-backed streams', Content: SingleUsePage },
  { id: 'parallel-streams', chapter: 'Parallelism', title: 'When parallel streams help or hurt', Content: ParallelPage },
  { id: 'loops-interview', chapter: 'Engineering judgment', title: 'Loops, mock interview, and recap', Content: LoopsInterviewPage },
];
