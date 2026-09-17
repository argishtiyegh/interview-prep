'use client';

import { ArrowRight } from 'lucide-react';
import { Callout, CodeBlock, Figure } from '@/components/answer-primitives';
import type { ReadingPage } from '@/lib/reading';

const memoryFlags = [
  'java -Xms512m -Xmx2g -Xss1m -XX:MaxMetaspaceSize=384m app.jar',
  '',
  '# Inspect effective VM settings',
  'java -XshowSettings:vm -version',
  'jcmd <pid> VM.flags',
  'jcmd <pid> GC.heap_info',
].join('\n');

const frameCode = [
  'static long total(Order order) {',
  '    long subtotal = order.subtotal(); // local value in this invocation frame',
  '    return applyTax(subtotal);        // new frame for applyTax()',
  '}',
  '',
  '// Deep unbounded recursion grows frames until StackOverflowError.',
  '// Many platform threads multiply reserved and committed stack memory.',
].join('\n');

const allocationCode = [
  'Invoice invoice = new Invoice(number, lines);',
  '',
  '// Conceptual HotSpot fast path:',
  '// 1. reserve aligned bytes in the current thread’s TLAB',
  '// 2. initialize header and zero fields',
  '// 3. run the constructor',
  '// 4. publish the reference only through a safe program action',
  '',
  '// Escape analysis may eliminate or scalar-replace some allocations.',
].join('\n');

const metaspaceCommands = [
  'jcmd <pid> VM.classloader_stats',
  'jcmd <pid> VM.metaspace',
  '',
  '# Native Memory Tracking must be enabled at JVM startup',
  'java -XX:NativeMemoryTracking=summary -jar app.jar',
  'jcmd <pid> VM.native_memory summary scale=MB',
].join('\n');

const gcRootsCode = [
  'static final Map<String, Session> SESSIONS = new HashMap<>();',
  '',
  'void login(Session session) {',
  '    SESSIONS.put(session.id(), session);',
  '}',
  '',
  '// If logout never removes old entries, every Session remains reachable',
  '// from a static GC root even when the application no longer needs it.',
].join('\n');

const gcLoggingFlags = [
  'java -Xlog:gc*,safepoint:file=logs/gc-%t.log:',
  'time,uptime,level,tags:filecount=10,filesize=20M -jar app.jar',
  '',
  '# Basic live view; sample every second, twenty times',
  'jstat -gcutil <pid> 1000 20',
  '',
  '# Current heap summary',
  'jcmd <pid> GC.heap_info',
].join('\n');

const leakCode = [
  'final class ListenerRegistry {',
  '    private final List<Listener> listeners = new ArrayList<>();',
  '',
  '    void register(Listener listener) { listeners.add(listener); }',
  '    void unregister(Listener listener) { listeners.remove(listener); }',
  '}',
  '',
  '// Missing unregister(), unbounded caches, ThreadLocal values, queues,',
  '// and class-loader retention are common logical leak patterns.',
].join('\n');

const referenceCode = [
  'ReferenceQueue<Image> cleared = new ReferenceQueue<>();',
  'Map<Key, WeakReference<Image>> cache = new HashMap<>();',
  '',
  'cache.put(key, new WeakReference<>(image, cleared));',
  'Image cached = cache.get(key).get(); // may already be null',
  '',
  '// SoftReference lifetime depends on memory pressure and collector policy.',
  '// Do not use it as a predictable cache eviction strategy.',
].join('\n');

const diagnosticStartup = [
  'java \\',
  '  -XX:+HeapDumpOnOutOfMemoryError \\',
  '  -XX:HeapDumpPath=/var/diagnostics \\',
  '  -XX:NativeMemoryTracking=summary \\',
  '  -Xlog:gc*,safepoint:file=/var/diagnostics/gc-%t.log:',
  'time,uptime,level,tags:filecount=10,filesize=20M \\',
  '  -XX:StartFlightRecording=name=continuous,settings=default,',
  'maxage=2h,maxsize=512m,dumponexit=true,filename=/var/diagnostics/app.jfr \\',
  '  -jar app.jar',
].join('\n');

const oomFirstResponse = [
  '# Confirm process and exact command line',
  'jcmd -l',
  'jcmd <pid> VM.command_line',
  'jcmd <pid> VM.flags',
  '',
  '# Low-cost orientation',
  'jcmd <pid> GC.heap_info',
  'jcmd <pid> GC.class_histogram',
  'jcmd <pid> Thread.print -l > threads.txt',
  '',
  '# Native memory, only if NMT was enabled at startup',
  'jcmd <pid> VM.native_memory summary scale=MB',
].join('\n');

const heapDumpCommands = [
  '# Preferred live-process heap dump',
  'jcmd <pid> GC.heap_dump filename=/var/diagnostics/heap.hprof',
  '',
  '# Histograms: all objects, then live objects (live may trigger GC)',
  'jcmd <pid> GC.class_histogram',
  'jcmd <pid> GC.class_histogram -all=false',
  '',
  '# Automatic evidence for the next failure',
  '-XX:+HeapDumpOnOutOfMemoryError',
  '-XX:HeapDumpPath=/var/diagnostics',
].join('\n');

const intellijHeapSteps = [
  '# 1. Install the current IntelliJ IDEA with JetBrains Toolbox App',
  '#    or download the installer from jetbrains.com/idea/download.',
  '# 2. Open: View > Tool Windows > Profiler.',
  '# 3. Select: Recent Snapshots > Open Snapshot.',
  '# 4. Choose the captured heap.hprof file.',
  '',
  '# Capture first when no dump exists:',
  'jcmd <pid> GC.heap_dump filename=/var/diagnostics/heap.hprof',
].join('\n');

const threadDumpCommands = [
  'jcmd <pid> Thread.print -l > thread-01.txt',
  '# Wait 5–10 seconds while the symptom continues',
  'jcmd <pid> Thread.print -l > thread-02.txt',
  'jcmd <pid> Thread.print -l > thread-03.txt',
  '',
  '# Alternative JDK command',
  'jstack -l <pid> > thread.txt',
  '',
  '# Linux: find hot native threads for one process',
  'top -H -p <pid>',
  'printf "%x\\n" <native-thread-id>  # match nid=0x... in dump',
].join('\n');

const gcLogReading = [
  '# Recommended rotating unified GC + safepoint log',
  '-Xlog:gc*,safepoint:file=/logs/gc-%t.log:',
  'time,uptime,level,tags:filecount=10,filesize=20M',
  '',
  '# Confirm selected collector and effective heap flags',
  'jcmd <pid> VM.flags',
  'jcmd <pid> GC.heap_info',
  '',
  '# Look for pause duration, cause, before/after occupancy,',
  '# allocation rate, promotion, concurrent-cycle health, and full GC.',
].join('\n');

const jitCommands = [
  'jcmd <pid> Compiler.codecache',
  'jcmd <pid> Compiler.queue',
  '',
  '# Diagnostic compilation log; use for focused experiments',
  'java -XX:+UnlockDiagnosticVMOptions -XX:+LogCompilation \\',
  '     -XX:LogFile=hotspot-compilation.xml -jar benchmark.jar',
  '',
  '# Use JMH for JVM microbenchmarks; warmup and prevent dead-code removal.',
].join('\n');

const cpuCommands = [
  '# Linux: confirm process and hot native threads',
  'pidstat -p <pid> -t 1',
  'top -H -p <pid>',
  '',
  '# Capture Java evidence during the spike',
  'jcmd <pid> Thread.print -l > threads-$(date +%s).txt',
  'jcmd <pid> JFR.start name=cpu settings=profile duration=60s \\',
  '     filename=/var/diagnostics/cpu.jfr',
  '',
  '# Also check GC and compiler activity',
  'jcmd <pid> GC.heap_info',
  'jcmd <pid> Compiler.queue',
].join('\n');

const asyncProfilerInstall = [
  '# Linux example: download the matching release archive from',
  '# github.com/async-profiler/async-profiler/releases',
  'tar xzf async-profiler-<version>-linux-x64.tar.gz',
  'cd async-profiler-<version>-linux-x64',
  '',
  './bin/asprof -d 30 -e cpu   -f cpu.html   <pid>',
  './bin/asprof -d 30 -e wall  -f wall.html  <pid>',
  './bin/asprof -d 30 -e alloc -f alloc.html <pid>',
  './bin/asprof -d 30 -e lock  -f locks.html <pid>',
].join('\n');

const latencyCommands = [
  '# Capture time-correlated evidence while latency is high',
  'jcmd <pid> JFR.start name=latency settings=profile duration=2m \\',
  '     filename=/var/diagnostics/latency.jfr',
  'jcmd <pid> Thread.print -l > latency-threads-01.txt',
  '',
  '# Inspect application metrics beside JVM evidence:',
  '# request queue time, executor queue depth, connection-pool wait,',
  '# socket/DNS/TLS/database time, lock contention, GC/safepoint pauses,',
  '# retries, timeouts, and downstream percentiles.',
].join('\n');

const jfrCommands = [
  '# Timed profiling recording on an already-running JVM',
  'jcmd <pid> JFR.start name=incident settings=profile duration=5m \\',
  '     filename=/var/diagnostics/incident.jfr',
  '',
  '# Continuous ring recording, then dump the most recent history',
  'jcmd <pid> JFR.start name=continuous settings=default \\',
  '     maxage=2h maxsize=512m',
  'jcmd <pid> JFR.check',
  'jcmd <pid> JFR.dump name=continuous \\',
  '     filename=/var/diagnostics/incident-now.jfr',
  '',
  'jfr summary incident.jfr',
  'jfr print --events jdk.CPULoad,jdk.GarbageCollection incident.jfr',
].join('\n');

const intellijProfilerSetup = [
  '# Install IntelliJ IDEA with JetBrains Toolbox App, or use the',
  '# operating-system installer from jetbrains.com/idea/download.',
  '',
  '# Profile a project run configuration:',
  'Run configuration menu > Profile with IntelliJ Profiler',
  '',
  '# Attach to a local Java process:',
  'View > Tool Windows > Profiler',
  'Right-click the process > Attach IntelliJ Profiler',
  '',
  '# Finish and inspect:',
  'Stop Profiling and Show Results',
].join('\n');

const jcmdToolkit = [
  'jcmd -l                              # list local JVMs',
  'jcmd <pid> help                      # supported commands for this JVM',
  'jcmd <pid> VM.version',
  'jcmd <pid> VM.command_line',
  'jcmd <pid> VM.flags',
  'jcmd <pid> VM.system_properties',
  'jcmd <pid> GC.heap_info',
  'jcmd <pid> GC.class_histogram',
  'jcmd <pid> Thread.print -l',
  'jcmd <pid> VM.classloader_stats',
  'jcmd <pid> Compiler.codecache',
  'jcmd <pid> VM.native_memory summary scale=MB',
].join('\n');

const nmtCommands = [
  '# NMT must be enabled when the JVM starts',
  'java -XX:NativeMemoryTracking=summary -jar app.jar',
  '',
  'jcmd <pid> VM.native_memory baseline',
  '# Recheck after the suspected native growth period',
  'jcmd <pid> VM.native_memory summary.diff scale=MB',
  '',
  '# detail has higher overhead and reports call-site categories',
  'java -XX:NativeMemoryTracking=detail -jar app.jar',
  'jcmd <pid> VM.native_memory detail scale=MB',
].join('\n');

const containerCommands = [
  '# What limits does this JVM observe?',
  'java -XshowSettings:system -XshowSettings:vm -version',
  'jcmd <pid> VM.flags',
  '',
  '# Linux cgroup v2 orientation',
  'cat /sys/fs/cgroup/memory.max',
  'cat /sys/fs/cgroup/memory.current',
  'cat /sys/fs/cgroup/cpu.max',
  '',
  '# Leave memory for metaspace, code cache, stacks, direct buffers,',
  '# GC/JIT/native libraries, and operating-system accounting.',
  'java -XX:MaxRAMPercentage=60 -jar app.jar',
].join('\n');

const collectorFlags = [
  'java -XX:+UseSerialGC   -jar app.jar',
  'java -XX:+UseParallelGC -jar app.jar',
  'java -XX:+UseG1GC       -jar app.jar',
  'java -XX:+UseZGC        -jar app.jar  # generational in JDK 25',
  '',
  '# Shenandoah availability depends on the selected OpenJDK distribution.',
  '# Always verify with: java -XX:+PrintFlagsFinal -version',
].join('\n');

function MemoryMapFigure(){return <Figure caption="These areas have different owners and failure modes. Heap is only one part of process memory; stacks, metaspace, code cache, direct buffers, JVM structures, and native libraries also consume the container or host limit."><div className="grid gap-3 font-sans text-sm sm:grid-cols-3"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>Per thread</b><span className="block text-slate-600">Java stack · native stack · registers</span></div><div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><b>Shared heap</b><span className="block text-slate-600">objects · arrays · GC-managed generations or regions</span></div><div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>Native JVM memory</b><span className="block text-slate-600">metaspace · code cache · direct/native allocations</span></div></div></Figure>}

function AllocationFigure(){return <Figure caption="Most small objects follow a thread-local bump-pointer fast path. When the TLAB cannot satisfy the request, the JVM refills it or uses a shared/collector-specific allocation path. Exact large-object handling depends on the collector."><div className="grid gap-2 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center"><div className="rounded-xl border bg-white p-4"><b>new</b><span className="block text-slate-600">size known from class layout</span></div><ArrowRight className="mx-auto rotate-90 sm:rotate-0"/><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>TLAB</b><span className="block text-slate-600">reserve by moving a pointer</span></div><ArrowRight className="mx-auto rotate-90 sm:rotate-0"/><div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><b>initialized object</b><span className="block text-slate-600">reference returned</span></div></div></Figure>}

function ReachabilityFigure(){return <Figure caption="Tracing collectors begin from GC roots and follow reference edges. Reachable does not mean useful; a forgotten cache entry remains live if a root can still reach it."><div className="space-y-4 text-center font-sans text-sm"><div className="grid grid-cols-3 gap-3"><span className="rounded-xl border border-cyan-300 bg-cyan-50 p-3">static field</span><span className="rounded-xl border border-cyan-300 bg-cyan-50 p-3">thread stack</span><span className="rounded-xl border border-cyan-300 bg-cyan-50 p-3">JNI reference</span></div><div className="font-bold text-cyan-800">↓ follow strong reference graph</div><div className="grid grid-cols-3 gap-3"><span className="rounded-xl border border-emerald-300 bg-emerald-50 p-3">live object</span><span className="rounded-xl border border-emerald-300 bg-emerald-50 p-3">live object</span><span className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-500">unreachable → reclaimable</span></div></div></Figure>}

function GenerationsFigure(){return <Figure caption="Generational collectors exploit the observation that most objects die young. Frequent young collections focus on a small area; survivors age or move to old regions, where collection is less frequent and usually more expensive."><div className="grid gap-4 font-sans text-sm sm:grid-cols-[1.4fr_auto_1fr] sm:items-center"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>Young</b><div className="mt-3 grid grid-cols-4 gap-2"><span className="rounded bg-white p-2">new</span><span className="rounded bg-white p-2">dead</span><span className="rounded bg-white p-2">dead</span><span className="rounded bg-white p-2">survive</span></div></div><ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0"/><div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>Old</b><span className="mt-2 block text-slate-600">long-lived objects and promoted survivors</span></div></div></Figure>}

function PauseFigure(){return <Figure caption="A collector may perform expensive discovery or relocation concurrently, but it still needs short global coordination points for phases that require a consistent view, root scanning, reference updates, or safe relocation."><div className="space-y-2 font-sans text-sm"><div className="grid grid-cols-5 gap-1 text-center"><span className="rounded bg-emerald-50 p-2">app</span><span className="rounded bg-emerald-50 p-2">app</span><span className="rounded bg-rose-100 p-2 font-bold">STW</span><span className="rounded bg-emerald-50 p-2">app + concurrent GC</span><span className="rounded bg-rose-100 p-2 font-bold">STW</span></div><div className="grid grid-cols-5 gap-1 text-center text-xs text-slate-600"><span>mutators run</span><span>allocate</span><span>roots / phase</span><span>concurrent work</span><span>finish / relocate</span></div></div></Figure>}

function RetainedGraphFigure(){return <Figure caption="Shallow size is one object’s own memory. Retained size includes objects that would become collectible if that object were removed. Dominator analysis ranks the ownership points that retain large subgraphs."><div className="grid gap-3 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1.2fr] sm:items-center"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>Cache</b><span className="block text-slate-600">shallow: small map object</span></div><ArrowRight className="mx-auto rotate-90 sm:rotate-0"/><div className="rounded-xl border border-rose-300 bg-rose-50 p-4"><b>retained graph</b><span className="block text-slate-600">keys → sessions → payloads → byte arrays</span><strong className="mt-2 block">retained: 1.8 GB</strong></div></div></Figure>}

function JitFigure(){return <Figure caption="HotSpot tiered compilation combines quick profiling compilation with highly optimized compilation. Optimized code may rely on observed assumptions; if they become invalid, the JVM deoptimizes and resumes in a safer tier or interpreter."><div className="grid gap-2 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center"><div className="rounded-xl border bg-white p-4"><b>Interpreter</b><span className="block text-slate-600">starts immediately</span></div><ArrowRight className="mx-auto rotate-90 sm:rotate-0"/><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>C1 tiers</b><span className="block text-slate-600">fast compile + profiling</span></div><ArrowRight className="mx-auto rotate-90 sm:rotate-0"/><div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><b>C2</b><span className="block text-slate-600">hot-code optimization</span></div></div></Figure>}

function DiagnosticFlowFigure(){return <Figure caption="Start with the symptom and preserve time-correlated evidence. A tool answers one question; it does not replace a hypothesis. Correlate JVM evidence with application and operating-system metrics."><div className="grid gap-3 font-sans text-sm sm:grid-cols-4"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>1 · Symptom</b><span className="block text-slate-600">heap · RSS · CPU · latency</span></div><div className="rounded-xl border bg-white p-4"><b>2 · Capture</b><span className="block text-slate-600">logs · JFR · dumps · metrics</span></div><div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>3 · Correlate</b><span className="block text-slate-600">same time window and load</span></div><div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><b>4 · Prove</b><span className="block text-slate-600">change one cause and measure</span></div></div></Figure>}

function ContainerFigure(){return <Figure caption="The container limit covers the whole process, while -Xmx caps only Java heap. Heap sizing must leave headroom for every native category and for short-lived peaks."><div className="rounded-2xl border border-slate-400 bg-slate-50 p-4 font-sans text-sm"><b>Container memory limit</b><div className="mt-3 grid gap-2 sm:grid-cols-5"><span className="rounded bg-emerald-100 p-3">heap</span><span className="rounded bg-cyan-100 p-3">metaspace</span><span className="rounded bg-amber-100 p-3">thread stacks</span><span className="rounded bg-violet-100 p-3">direct buffers</span><span className="rounded bg-rose-100 p-3">code + native</span></div></div></Figure>}

function CollectorFigure(){const items=[['Serial','one GC thread · small heaps'],['Parallel','throughput · parallel STW collection'],['G1','regional · mostly concurrent · pause goal'],['ZGC','highly concurrent · very low pauses'],['Shenandoah','concurrent compaction · distribution dependent']];return <Figure caption="Collector choice trades pause time, throughput, footprint, CPU, and operational maturity. Measure with the application’s allocation rate, live set, heap, hardware limits, and latency objective."><div className="grid gap-3 font-sans text-sm sm:grid-cols-2">{items.map(([a,b])=><div key={a} className="rounded-xl border border-slate-300 bg-slate-50 p-4"><b className="text-cyan-900">{a}</b><span className="ml-2 text-slate-600">{b}</span></div>)}</div></Figure>}

function MemoryOverviewPage(){return <div className="article-copy"><div className="answer-card"><p>Each Java thread has a JVM stack containing method frames. The heap is shared storage for ordinary objects and arrays and is managed by the garbage collector. Metaspace is native memory used mainly for class metadata. The process also uses native stacks, code cache, direct buffers, GC structures, libraries, and other native memory.</p></div><MemoryMapFigure/><CodeBlock code={memoryFlags} label="Memory limits and inspection"/><Callout title="Heap is not process memory">An application can remain below <code>-Xmx</code> and still exceed a container limit because non-heap memory belongs to the same process.</Callout></div>}

function StackPage(){return <div className="article-copy"><div className="answer-card"><p>A JVM stack is private to one thread. Every active method invocation contributes a frame containing implementation-defined storage for local variables, an operand stack, and return or linkage state. Returning removes the frame. Excessive call depth produces <code>StackOverflowError</code>; too many or oversized platform-thread stacks can exhaust native memory.</p></div><CodeBlock code={frameCode} label="Method frames grow with call depth"/><h3>References versus objects</h3><p>A frame may contain a reference value, while the referenced object normally lives in heap storage. The JVM may optimize representation, so “references on stack, objects on heap” is a useful conceptual model rather than an exact placement promise.</p><Callout tone="warning" title="Do not increase -Xss blindly">A larger stack may delay recursion failure but increases per-platform-thread memory pressure. Fix unbounded recursion and measure thread count first.</Callout></div>}

function AllocationPage(){return <div className="article-copy"><div className="answer-card"><p>HotSpot usually allocates a small object by advancing a pointer in the current thread’s Thread-Local Allocation Buffer, making the common path cheap and mostly contention-free. The JVM initializes object memory and runs the constructor. Escape analysis may remove some allocations or replace an object with scalar values when its identity never escapes.</p></div><AllocationFigure/><CodeBlock code={allocationCode} label="Conceptual allocation path"/><h3>What controls object size</h3><p>An object contains a header, instance fields, and alignment padding. Reference width, compact or compressed headers, field layout, array length, and JVM options affect the actual size. Use JOL for layout experiments; do not infer exact bytes from source fields alone.</p><Callout title="Allocation is often cheap; retention is expensive">Optimizing every <code>new</code> is rarely useful. First measure allocation rate, object lifetime, and retained heap.</Callout></div>}

function MetaspacePage(){return <div className="article-copy"><div className="answer-card"><p>Metaspace stores class metadata in native memory rather than the Java heap. Loading many classes or retaining class loaders grows it. Classes can be unloaded only when their defining class loader and its classes become unreachable and the collector performs class unloading. A class-loader leak can therefore retain both metadata and application objects.</p></div><CodeBlock code={metaspaceCommands} label="Class metadata and native memory"/><h3>Related areas</h3><ul><li><b>Compressed class space:</b> class pointers and related metadata when compressed class pointers are enabled.</li><li><b>Code cache:</b> native machine code produced by the JIT compiler.</li><li><b>Direct memory:</b> off-heap buffers commonly used by I/O libraries.</li></ul><Callout tone="warning" title="MaxMetaspaceSize is a cap, not a leak fix">A low cap changes when failure occurs. Investigate class-loader growth and repeated dynamic class generation.</Callout></div>}

function ReachabilityPage(){return <div className="article-copy"><div className="answer-card"><p>Garbage collection is based on reachability, not reference counting. The collector starts from GC roots—such as live thread stacks, static fields, and native references—then traces reachable objects. Objects outside that graph are eligible for reclamation. Collection timing is deliberately nondeterministic.</p></div><ReachabilityFigure/><CodeBlock code={gcRootsCode} label="Reachable but no longer useful"/><h3>Eligibility is not immediate deletion</h3><p>Becoming unreachable means the JVM may reclaim the memory in a future collection. It does not promise when a collection runs. External resources therefore require explicit lifecycle management such as try-with-resources.</p></div>}

function GenerationalPage(){return <div className="article-copy"><div className="answer-card"><p>Generational collection exploits the weak generational hypothesis: most objects become unreachable soon after allocation. New objects enter young storage; young collections reclaim dead objects cheaply, while survivors age or are promoted. Old storage is collected less often because it contains a larger live set.</p></div><GenerationsFigure/><h3>Why live data drives cost</h3><p>Tracing or evacuating dead objects is usually cheap because the collector does not need to copy them. Surviving objects must be discovered, scanned, copied, marked, or updated. Large live sets and references from old to young require more collector work.</p><Callout title="Not every collector exposes the same layout">Young/old generations, regions, relocation sets, and remembered sets are collector mechanisms. Learn the concepts, then verify the selected collector and JDK version before tuning flags.</Callout></div>}

function GarbageCollectionPage(){return <div className="article-copy"><div className="answer-card"><p>A tracing collector identifies reachable objects, reclaims unreachable storage, and may compact or evacuate survivors to reduce fragmentation. Modern collectors divide work between stop-the-world phases and concurrent phases. Write barriers and remembered metadata let the JVM track references without rescanning the entire heap for every collection.</p></div><CodeBlock code={gcLoggingFlags} label="Observe, do not guess"/><h3>Four measurements matter</h3><ul><li><b>Allocation rate:</b> bytes created per unit of time.</li><li><b>Live set:</b> memory still reachable after effective collection.</li><li><b>Pause distribution:</b> frequency and tail duration.</li><li><b>GC CPU and throughput:</b> collector work versus useful application work.</li></ul><Callout tone="tip" title="Sawtooth heap usage is normal">Heap occupancy rises with allocation and drops after collection. A concern is the post-collection floor rising over comparable load windows or collections reclaiming too little.</Callout></div>}

function StopTheWorldPage(){return <div className="article-copy"><div className="answer-card"><p>A stop-the-world pause temporarily prevents application threads—mutators—from executing Java code while the JVM performs a phase requiring global coordination. GC root processing, some marking or relocation phases, reference processing, class unloading, safepoint operations, or explicit full collections can contribute. Concurrent collectors reduce pause work but cannot remove every coordination point.</p></div><PauseFigure/><h3>Pause duration is not only heap size</h3><p>Root-set size, live objects, remembered-set work, reference processing, class count, dirty cards, allocation failure, OS scheduling, CPU quota, and collector choice can matter. Safepoint “time to reach” can also delay a global operation.</p><Callout tone="warning" title="A latency spike near GC is correlation, not proof">Use GC and safepoint logs or JFR to separate application pauses, JVM safepoints, lock waits, I/O waits, and CPU starvation.</Callout></div>}

function LeakPage(){return <div className="article-copy"><div className="answer-card"><p>Java can leak memory when objects remain reachable even though the application no longer needs them. The collector is correct: it cannot infer business usefulness. Common retention paths include unbounded caches and queues, static collections, listeners, ThreadLocal values, class loaders, sessions, and accidental references from long-lived tasks.</p></div><RetainedGraphFigure/><CodeBlock code={leakCode} label="Logical retention leak"/><h3>Evidence of a heap leak</h3><p>Under comparable load, the live heap after collection trends upward, growing classes dominate retained memory, and paths to GC roots reveal an unexpected long-lived owner. High allocation alone is pressure, not necessarily a leak.</p></div>}

function ReferencesPage(){return <div className="article-copy"><div className="answer-card"><p>A strong reference keeps an object ordinarily reachable. A softly reachable object may be cleared in response to memory demand. A weakly reachable object can be cleared once no strong or soft path remains. ReferenceQueue lets code learn that a Reference object was cleared and remove stale bookkeeping.</p></div><CodeBlock code={referenceCode} label="Weak reference with cleanup queue"/><h3>Use cases and limits</h3><ul><li><b>Strong:</b> normal ownership and the default choice.</li><li><b>Soft:</b> memory-sensitive data, but clearing policy and timing are unsuitable for deterministic caches.</li><li><b>Weak:</b> canonical maps, metadata keyed by externally owned objects, and listeners when disappearance is acceptable.</li><li><b>Phantom:</b> post-mortem cleanup coordination after reachability, with no access to the object.</li></ul><Callout title="Reference type does not replace a cache policy">For production caches, explicit size, weight, expiry, and observability are easier to reason about.</Callout></div>}

function OomKindsPage(){return <div className="article-copy"><div className="answer-card"><p><code>OutOfMemoryError</code> means the JVM could not satisfy a memory-related operation, but the message identifies different resource classes. “Java heap space,” “GC overhead limit exceeded,” “Metaspace,” “Direct buffer memory,” and “unable to create native thread” require different evidence and fixes. A container OOM kill may terminate the process without any Java exception.</p></div><h3>Map the message to the resource</h3><ul><li><b>Java heap space:</b> live set, leak, burst, or insufficient heap.</li><li><b>GC overhead:</b> most time spent collecting with little recovery.</li><li><b>Metaspace:</b> class metadata or class-loader growth.</li><li><b>Direct buffer memory:</b> off-heap buffer pressure and cleanup timing.</li><li><b>Unable to create native thread:</b> thread count, stack memory, PID or OS limits.</li><li><b>Container OOMKilled:</b> total process RSS crossed the cgroup limit.</li></ul><Callout tone="warning" title="Do not respond by raising -Xmx first">More memory can delay a leak, reduce native headroom, and make heap dumps or pauses larger. Preserve evidence and identify which area failed.</Callout></div>}

function OomRunbookPage(){return <div className="article-copy"><div className="answer-card"><p>Investigate OOM by preserving the exact error, timestamps, JVM command line, container or host limit, GC log, JFR history, heap dump when relevant, and native-memory evidence. First determine whether the JVM threw an error or the operating system killed the process. Then follow the resource named by the evidence.</p></div><DiagnosticFlowFigure/><CodeBlock code={diagnosticStartup} label="Prepare evidence before an incident"/><CodeBlock code={oomFirstResponse} label="First-response commands"/><Callout title="Evidence has storage and privacy costs">Heap dumps can approach heap size and contain credentials, personal data, and business objects. Write them to a protected volume with sufficient space and transfer them through approved secure channels.</Callout></div>}

function HeapDumpPage(){return <div className="article-copy"><div className="answer-card"><p>A heap dump is a point-in-time object graph with classes, instances, fields, sizes, and paths to roots. A class histogram is much smaller and shows counts and shallow bytes by class, but not ownership paths. Use histograms for orientation and trends; use a dump to answer who retains the objects.</p></div><CodeBlock code={heapDumpCommands} label="Capture heap evidence"/><h3>Operational impact</h3><p>Dumping a large heap requires disk and can pause or heavily disturb the process. Prefer automatic OOM dumps or reproduce in a safe environment when the production risk is unacceptable. Never take repeated dumps without checking free space and latency impact.</p><Callout tone="tip" title="Compare like with like">Two dumps at comparable points after GC and under comparable load are much more useful than arbitrary snapshots at different workload phases.</Callout></div>}

function IntelliJHeapPage(){return <div className="article-copy"><div className="answer-card"><p>IntelliJ IDEA can open a heap dump captured by the JVM as an <code>.hprof</code> file. Its Profiler window shows classes, instance counts, shallow size, and retained size. You can then inspect the reference chains and dominators that explain why a suspicious object remains reachable.</p></div><CodeBlock code={intellijHeapSteps} label="Open a heap dump in IntelliJ IDEA"/><h3>Repeatable IntelliJ workflow</h3><ol className="step-list"><li><b>Start with Classes and Packages.</b><span>Sort by retained size and look for unexpectedly large application classes, collections, arrays, or class loaders.</span></li><li><b>Open suspicious instances.</b><span>Double-click a class to inspect individual objects ordered by retained size.</span></li><li><b>Inspect Shortest Paths.</b><span>Follow the shortest reference chains to GC roots to find the long-lived owner.</span></li><li><b>Check Incoming References and Dominators.</b><span>Incoming references show who points to the object; dominators show which owner prevents a retained subgraph from being collected.</span></li><li><b>Use Retained Objects or Dominator Tree.</b><span>Confirm what would become collectible if the retaining reference were removed, then navigate to application source with <code>F4</code>.</span></li></ol><Callout title="Shallow size is not retained size">A small cache or map object may retain gigabytes through its entries. Prioritize retained size and the path to a GC root rather than only the object’s own shallow bytes.</Callout><Callout tone="warning" title="Analyze dumps on a suitable workstation">Large heap dumps require substantial memory and may contain credentials or personal data. Use a protected workstation, keep the dump out of source control, and verify that your IntelliJ version and subscription expose the Profiler features before an incident.</Callout></div>}

function ThreadDumpPage(){return <div className="article-copy"><div className="answer-card"><p>A thread dump shows Java thread names, states, stack traces, locks owned or awaited, and often native thread identifiers. It explains what threads are doing at one instant. Several dumps spaced during the symptom distinguish stable deadlock or blocking from brief, normal transitions.</p></div><CodeBlock code={threadDumpCommands} label="Capture and correlate threads"/><h3>How to read states</h3><ul><li><b>RUNNABLE:</b> executing Java, native code, or sometimes blocked in an OS call; inspect the stack.</li><li><b>BLOCKED:</b> waiting to enter a synchronized monitor.</li><li><b>WAITING / TIMED_WAITING:</b> parked, joining, sleeping, or awaiting a condition.</li></ul><Callout tone="tip" title="Diff repeated dumps">A thread stuck on the same application frame and lock across captures is more suspicious than a thread that advances through different work.</Callout></div>}

function GcLogsPage(){return <div className="article-copy"><div className="answer-card"><p>GC logs are a time series of collection causes, phases, durations, worker activity, and before/after memory occupancy. Safepoint logs show global JVM coordination and time-to-safepoint. Together they distinguish allocation pressure, growing live heap, promotion problems, full collections, concurrent-cycle failure, and non-GC safepoint delays.</p></div><CodeBlock code={gcLogReading} label="Enable and interpret unified logs"/><h3>Questions to ask</h3><ul><li>Does the post-GC occupancy return to a stable baseline?</li><li>Are pauses frequent, long, or both?</li><li>Is allocation outrunning concurrent collection?</li><li>Are full collections or evacuation failures appearing?</li><li>Does a latency spike align with pause or safepoint duration?</li></ul><Callout title="jstat is a sampler">It is useful for orientation but is not a durable incident record and its output is implementation-specific. Keep rotating unified logs or JFR for historical analysis.</Callout></div>}

function JitPage(){return <div className="article-copy"><div className="answer-card"><p>The JVM initially interprets bytecode and observes execution. HotSpot’s tiered compilation uses C1 tiers to compile quickly and gather profiles, then C2 applies deeper optimizations to hot methods. Inlining, escape analysis, loop optimizations, and speculative assumptions improve steady-state speed. Invalid assumptions can trigger deoptimization.</p></div><JitFigure/><CodeBlock code={jitCommands} label="Inspect compilation state"/><h3>Why benchmarks lie</h3><p>Startup, class loading, tier transitions, dead-code elimination, constant folding, GC, and profile pollution can dominate naïve timings. Use JMH for microbenchmarks and production profiles for application decisions.</p><Callout tone="warning" title="A hot compiled method is not automatically the bug">It may simply be doing the most legitimate work. Connect CPU samples to request throughput, input shape, and business behavior.</Callout></div>}

function HighCpuPage(){return <div className="article-copy"><div className="answer-card"><p>Diagnose high CPU by first confirming whether the process, JVM GC/JIT threads, or application threads consume it. Capture evidence during the spike: OS per-thread CPU, several thread dumps, and a sampled JFR or profiler. Match a hot native thread ID to <code>nid</code> in the Java dump, then inspect repeated stacks or flame-graph width.</p></div><CodeBlock code={cpuCommands} label="High-CPU runbook"/><h3>Common causes</h3><ul><li>Busy loops, retry storms, pathological regex or parsing, and excessive serialization.</li><li>High allocation causing GC CPU, or a growing live set causing repeated collection.</li><li>Lock-free retry contention, excessive logging, or exception storms.</li><li>JIT compilation during warmup or repeated deoptimization.</li></ul><Callout title="Capture first, restart second">A restart may restore service but destroys the hottest stacks and recent recording unless continuous JFR and logs are preserved.</Callout></div>}

function AsyncProfilerPage(){return <div className="article-copy"><div className="answer-card"><p>async-profiler is a low-overhead sampling profiler commonly used for CPU, wall-clock, allocation, and lock profiles. It can produce interactive flame graphs where width represents the number of samples attributed to a stack. Use the official release matching the operating system and CPU architecture, and validate production permissions before an incident.</p></div><CodeBlock code={asyncProfilerInstall} label="Install and capture profiles"/><h3>Choose the event from the question</h3><ul><li><code>cpu</code>: where on-CPU samples accumulate.</li><li><code>wall</code>: where elapsed time accumulates, including waits and blocking.</li><li><code>alloc</code>: which stacks allocate sampled bytes or objects.</li><li><code>lock</code>: contended monitor acquisition.</li></ul><Callout tone="warning" title="Platform and privilege requirements vary">Linux profiling may require perf-event permissions, container capabilities, or host configuration. Follow the selected release documentation and organizational security rules; do not grant broad container privileges by default.</Callout></div>}

function LatencyPage(){return <div className="article-copy"><div className="answer-card"><p>High latency with normal CPU usually means requests spend time waiting rather than executing instructions. Investigate queue delay, saturated connection or executor pools, lock contention, downstream I/O, DNS or TLS, retries, timeouts, disk, safepoints, and coordinated pauses. CPU averages can also hide one saturated core or short spikes.</p></div><CodeBlock code={latencyCommands} label="Latency-with-normal-CPU runbook"/><h3>Follow one request budget</h3><p>Break end-to-end latency into admission, queue, service, downstream, retry, and response stages. Compare percentiles over the same time window. A thread dump explains current waiting; JFR supplies time-stamped monitor, park, socket, file, GC, and CPU events.</p><Callout tone="tip" title="Low CPU can be evidence">If throughput falls while CPU is low, workers may be blocked, starved of work, limited by a pool, or waiting on an external dependency.</Callout></div>}

function JfrPage(){return <div className="article-copy"><div className="answer-card"><p>Use Java Flight Recorder when an issue is intermittent, spans CPU, memory, locks, I/O, GC, threads, exceptions, or compilation, or needs production-safe historical evidence. JFR is built into the JDK and records timestamped events. The default template is suitable for continuous low-overhead recording; the profile template collects more detail for a bounded investigation.</p></div><CodeBlock code={jfrCommands} label="Start, inspect, and dump JFR"/><h3>Open the recording with a question</h3><ul><li>CPU → Method Profiling, hot threads, and execution samples.</li><li>Allocation → allocation by class, thread, and stack.</li><li>Latency → socket/file I/O, monitor enter, thread park, and request timing.</li><li>GC → pause events, live-set behavior, allocation, and collector phases.</li><li>JVM → compilation, class loading, code cache, and environment.</li></ul><Callout title="Continuous recording is incident insurance">A ring buffer preserves the minutes before the alert—often the only view of how the system entered the bad state.</Callout></div>}

function IntelliJProfilerPage(){return <div className="article-copy"><div className="answer-card"><p>IntelliJ Profiler provides CPU, total-time, and allocation views inside the IDE. It integrates Java Flight Recorder and async-profiler for supported configurations, and presents call trees, flame graphs, method lists, timelines, and source navigation. Use it for local reproduction or to inspect securely transferred snapshots.</p></div><CodeBlock code={intellijProfilerSetup} label="Start IntelliJ Profiler"/><h3>Choose the view from the question</h3><ol className="step-list"><li><b>CPU Time.</b><span>Find code consuming processor time while excluding sleeping and most waiting.</span></li><li><b>Total Time.</b><span>Find stacks accumulating elapsed time through I/O, locks, parking, scheduling, or CPU work.</span></li><li><b>Memory Allocations.</b><span>Find call paths creating the most sampled objects or bytes; this explains allocation pressure, not retained heap.</span></li><li><b>Call tree or flame graph.</b><span>Use the call tree for caller-callee detail and the flame graph to recognize wide, expensive stack paths.</span></li><li><b>Navigate to source.</b><span>Move from a hot method or allocation site to the corresponding application code and validate the suspected behavior.</span></li></ol><Callout title="Allocation profile and heap dump answer different questions">An allocation profile shows where objects were created during an interval. An HPROF heap dump shows which objects are still reachable at one instant and what retains them.</Callout><Callout tone="warning" title="Attach deliberately">Profiler attachment and detailed recording can add overhead. Reproduce locally when possible; for production, use a bounded recording, validate permissions, and preserve the unmodified evidence.</Callout></div>}

function JcmdPage(){return <div className="article-copy"><div className="answer-card"><p><code>jcmd</code> is the preferred command-line gateway to HotSpot diagnostics. It ships with a full JDK, must normally run on the same machine with the same effective user as the target JVM, and exposes only commands supported by that process. Begin with <code>jcmd -l</code> and <code>jcmd &lt;pid&gt; help</code>.</p></div><CodeBlock code={jcmdToolkit} label="Essential jcmd commands"/><h3>Installing the command-line tools</h3><p>Install a full JDK of the same major release family as the application and add its <code>bin</code> directory to <code>PATH</code>. Confirm with <code>java -version</code>, <code>javac -version</code>, and <code>jcmd -l</code>. A minimal JRE or distroless image may omit these tools; plan a diagnostic image or secure host-side workflow before incidents.</p><Callout tone="warning" title="Attach can be disabled or isolated">Different users, PID namespaces, containers, security settings, or <code>-XX:+DisableAttachMechanism</code> can prevent attachment. Do not weaken isolation during an incident without an approved diagnostic design.</Callout></div>}

function NativeMemoryPage(){return <div className="article-copy"><div className="answer-card"><p>Native Memory Tracking attributes HotSpot native memory to categories such as Java Heap reservation, Class, Thread, Code, GC, Compiler, and Internal. It is the first JVM tool to use when process RSS grows but live heap does not. NMT must be enabled at startup and does not account for every third-party native allocation.</p></div><CodeBlock code={nmtCommands} label="Baseline and compare native memory"/><h3>Interpret committed and reserved separately</h3><p>Reserved address space is not necessarily resident physical memory. Compare committed category growth with OS RSS and container accounting. If NMT stays flat while RSS grows, investigate native libraries, memory mapping, allocator behavior, or file-backed pages with OS tools.</p><Callout title="Thread growth appears outside heap">Each platform thread consumes stack and native structures. Pair NMT Thread growth with thread count and dumps before changing stack size or OS limits.</Callout></div>}

function ContainersPage(){return <div className="article-copy"><div className="answer-card"><p>Modern HotSpot JVMs are container-aware and use detected cgroup memory and CPU limits for ergonomics. That influences default heap sizing, GC and JIT thread counts, and APIs reporting processors. The heap remains only part of the container’s memory. If total usage crosses the cgroup limit, the kernel may kill the process without a Java OOM or heap dump.</p></div><ContainerFigure/><CodeBlock code={containerCommands} label="Inspect container-aware sizing"/><h3>Container diagnostic rules</h3><ul><li>Set a realistic memory limit and leave explicit native headroom.</li><li>Persist GC logs, JFR, and dumps on a volume or external collector.</li><li>Correlate pod restart reason and exit code with JVM logs.</li><li>CPU quota can lengthen GC pauses and reduce compiler or common-pool parallelism.</li><li>Test under the same limits used in production, not only on the host.</li></ul></div>}

function CollectorsPage(){return <div className="article-copy"><div className="answer-card"><p>Serial uses one GC thread and suits small heaps or constrained environments. Parallel emphasizes throughput with parallel stop-the-world collection. G1 divides the heap into regions and combines concurrent work with pause-targeted evacuation; it is the usual server default. ZGC performs expensive work concurrently for very low pauses and is generational in JDK 25. Shenandoah also performs concurrent compaction where the selected distribution provides it.</p></div><CollectorFigure/><CodeBlock code={collectorFlags} label="Collector selection flags"/><h3>Select from an objective</h3><p>Begin with JVM ergonomics unless requirements prove otherwise. Compare the same production-like workload using tail pause, application throughput, CPU cost, live-set headroom, allocation stalls, and footprint. A collector cannot compensate for an undersized heap, unbounded retention, or overloaded downstream system.</p><Callout tone="warning" title="Pause goals are goals">A flag such as G1’s pause target guides heuristics; it is not a latency guarantee. Large live sets, allocation bursts, humongous objects, native pressure, and CPU throttling still matter.</Callout></div>}

function ToolChoicePage(){return <div className="article-copy"><div className="answer-card"><p>Choose a diagnostic tool from the question you need to answer. Start with low-cost historical evidence, narrow the hypothesis, and capture a heavier artifact only when it adds missing information. Always align timestamps with application, host, and container metrics.</p></div><h3>Symptom → first evidence → deeper proof</h3><div className="comparison-table"><table><thead><tr><th>Question</th><th>Start with</th><th>Use next</th></tr></thead><tbody><tr><td>Why is live heap growing?</td><td>GC logs or JFR allocation and heap events</td><td>Comparable histograms, then an HPROF dump in IntelliJ IDEA</td></tr><tr><td>Why is process RSS growing while heap is stable?</td><td>OS or cgroup memory plus NMT summary</td><td>NMT baseline diff and native or direct-buffer investigation</td></tr><tr><td>Which code consumes CPU?</td><td>Per-thread OS CPU and JFR execution samples</td><td>Repeated thread dumps or IntelliJ Profiler flame graph</td></tr><tr><td>Why is latency high while CPU is normal?</td><td>Request metrics, JFR, and pool or queue metrics</td><td>Repeated thread dumps and total-time profiling</td></tr><tr><td>Why are GC pauses long?</td><td>GC and safepoint logs</td><td>JFR plus live-set, allocation-rate, and reference-processing analysis</td></tr><tr><td>Why does metaspace grow?</td><td><code>VM.classloader_stats</code> and NMT</td><td>Heap dump grouped by class loader and paths to roots</td></tr></tbody></table></div><Callout tone="tip" title="Strong interview answer">State the symptom, name the artifact that answers it, explain what signal you would inspect, and describe how that result chooses the next step. Listing tools without a diagnostic question is weaker.</Callout></div>}

function RecapPage(){return <div className="article-copy"><div className="answer-card"><p>JVM performance diagnosis is evidence-driven. Identify the failing resource, preserve the relevant time window, use the least disruptive tool that can answer the next question, and correlate JVM data with workload and operating-system behavior. Heap dumps explain retention; thread dumps explain instantaneous execution; GC logs explain collection history; JFR connects many event types over time.</p></div><DiagnosticFlowFigure/><h3>Rapid senior interview</h3><div className="faq-list"><details><summary>Can Java leak memory with garbage collection?</summary><p>Yes. The collector preserves all reachable objects, including objects the application no longer needs but still references.</p></details><details><summary>What causes stop-the-world pauses?</summary><p>JVM phases that require global coordination, including collector root or relocation phases and other safepoint operations. Exact work depends on collector and JDK.</p></details><details><summary>Heap dump or histogram?</summary><p>A histogram gives class counts and shallow bytes. A heap dump adds the object graph and paths to roots needed to explain retention.</p></details><details><summary>High latency with low CPU?</summary><p>Look for waiting: queues, locks, connection pools, I/O, retries, timeouts, GC/safepoints, and downstream latency.</p></details><details><summary>Why can a container die below -Xmx?</summary><p>The container limit covers heap plus stacks, metaspace, code cache, direct buffers, GC structures, native libraries, and other resident pages.</p></details></div><div className="sources"><p className="eyebrow">Primary references and downloads</p><a href="https://docs.oracle.com/en/java/javase/25/gctuning/" target="_blank" rel="noreferrer">Java 25 GC Tuning Guide <ArrowRight/></a><a href="https://docs.oracle.com/en/java/javase/25/troubleshoot/diagnostic-tools.html" target="_blank" rel="noreferrer">Java 25 diagnostic tools and JFR guide <ArrowRight/></a><a href="https://docs.oracle.com/en/java/javase/25/docs/specs/man/jcmd.html" target="_blank" rel="noreferrer">jcmd command specification <ArrowRight/></a><a href="https://docs.oracle.com/en/java/javase/25/vm/native-memory-tracking.html" target="_blank" rel="noreferrer">Native Memory Tracking <ArrowRight/></a><a href="https://www.jetbrains.com/help/idea/create-a-memory-snapshot.html" target="_blank" rel="noreferrer">Open and capture heap snapshots in IntelliJ IDEA <ArrowRight/></a><a href="https://www.jetbrains.com/help/idea/read-the-memory-snapshot.html" target="_blank" rel="noreferrer">Analyze heap snapshots in IntelliJ IDEA <ArrowRight/></a><a href="https://www.jetbrains.com/help/idea/cpu-and-allocation-profiling-basic-concepts.html" target="_blank" rel="noreferrer">IntelliJ CPU and allocation profiling <ArrowRight/></a><a href="https://github.com/async-profiler/async-profiler" target="_blank" rel="noreferrer">async-profiler repository and releases <ArrowRight/></a></div></div>}

export const jvmMemoryPerformancePages: ReadingPage[] = [
  {id:'memory-map',chapter:'Memory model',title:'JVM stack, heap, and metaspace',Content:MemoryOverviewPage},
  {id:'thread-stacks',chapter:'Memory model',title:'Thread stacks and method frames',Content:StackPage},
  {id:'object-allocation',chapter:'Allocation',title:'How Java objects are allocated',Content:AllocationPage},
  {id:'metaspace-native',chapter:'Memory model',title:'Metaspace and native JVM memory',Content:MetaspacePage},
  {id:'reachability',chapter:'Garbage collection',title:'Reachability and GC roots',Content:ReachabilityPage},
  {id:'generations',chapter:'Garbage collection',title:'Why generational collection works',Content:GenerationalPage},
  {id:'gc-process',chapter:'Garbage collection',title:'How garbage collection works',Content:GarbageCollectionPage},
  {id:'stw-pauses',chapter:'Garbage collection',title:'Stop-the-world pauses and safepoints',Content:StopTheWorldPage},
  {id:'memory-leaks',chapter:'Retention',title:'How Java applications leak memory',Content:LeakPage},
  {id:'reference-strengths',chapter:'Retention',title:'Strong, soft, weak, and phantom references',Content:ReferencesPage},
  {id:'oom-kinds',chapter:'Out of memory',title:'OutOfMemoryError categories',Content:OomKindsPage},
  {id:'oom-runbook',chapter:'Out of memory',title:'OutOfMemoryError investigation runbook',Content:OomRunbookPage},
  {id:'heap-dumps',chapter:'Diagnostic tools',title:'Heap dumps and class histograms',Content:HeapDumpPage},
  {id:'intellij-heap-analysis',chapter:'Diagnostic tools',title:'Analyzing heap dumps with IntelliJ IDEA',Content:IntelliJHeapPage},
  {id:'thread-dumps',chapter:'Diagnostic tools',title:'Capturing and reading thread dumps',Content:ThreadDumpPage},
  {id:'gc-logs',chapter:'Diagnostic tools',title:'Reading GC and safepoint logs',Content:GcLogsPage},
  {id:'jit',chapter:'Runtime optimization',title:'How JIT compilation works',Content:JitPage},
  {id:'high-cpu',chapter:'Performance incidents',title:'Diagnosing high CPU usage',Content:HighCpuPage},
  {id:'async-profiler',chapter:'Diagnostic tools',title:'Profiling with async-profiler',Content:AsyncProfilerPage},
  {id:'high-latency',chapter:'Performance incidents',title:'High latency with normal CPU',Content:LatencyPage},
  {id:'jfr',chapter:'Diagnostic tools',title:'Java Flight Recorder in practice',Content:JfrPage},
  {id:'intellij-profiler',chapter:'Diagnostic tools',title:'Using IntelliJ Profiler',Content:IntelliJProfilerPage},
  {id:'jcmd',chapter:'Diagnostic tools',title:'The essential jcmd toolkit',Content:JcmdPage},
  {id:'nmt',chapter:'Native memory',title:'Native Memory Tracking',Content:NativeMemoryPage},
  {id:'containers',chapter:'Containers',title:'How the JVM behaves in containers',Content:ContainersPage},
  {id:'collectors',chapter:'Collector selection',title:'How common garbage collectors differ',Content:CollectorsPage},
  {id:'tool-choice',chapter:'Diagnostic tools',title:'Choosing the right diagnostic tool',Content:ToolChoicePage},
  {id:'jvm-recap',chapter:'Interview recap',title:'JVM diagnostics interview recap',Content:RecapPage},
];
