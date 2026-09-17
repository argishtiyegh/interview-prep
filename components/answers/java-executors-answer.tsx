'use client';

import { ArrowRight } from 'lucide-react';
import { Callout, CodeBlock, Figure } from '@/components/answer-primitives';
import type { ReadingPage } from '@/lib/reading';

const executorCode = [
  'try (ExecutorService executor = Executors.newFixedThreadPool(8)) {',
  '    Future<Invoice> future = executor.submit(() -> createInvoice(order));',
  '    doIndependentWork();',
  '    Invoice invoice = future.get();',
  '}',
  '',
  '// Submission is separated from where, when, and on which thread it runs.',
].join('\n');

const lifecycleCode = [
  'ExecutorService executor = Executors.newFixedThreadPool(4);',
  'try {',
  '    executor.submit(this::processBatch);',
  '} finally {',
  '    executor.shutdown();          // reject new tasks; finish accepted work',
  '    if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {',
  '        List<Runnable> queued = executor.shutdownNow();',
  '        // running tasks are interrupted cooperatively',
  '    }',
  '}',
].join('\n');

const poolKindsCode = [
  'ExecutorService fixed = Executors.newFixedThreadPool(8);',
  '// fixed workers + unbounded LinkedBlockingQueue',
  '',
  'ExecutorService cached = Executors.newCachedThreadPool();',
  '// SynchronousQueue handoff + potentially many threads',
  '',
  'ScheduledExecutorService scheduled =',
  '        Executors.newScheduledThreadPool(2);',
  'scheduled.scheduleAtFixedRate(this::refresh, 0, 1, TimeUnit.MINUTES);',
].join('\n');

const configuredPoolCode = [
  'ThreadPoolExecutor pool = new ThreadPoolExecutor(',
  '        4,                         // core workers',
  '        12,                        // maximum workers',
  '        30, TimeUnit.SECONDS,      // excess-worker keep alive',
  '        new ArrayBlockingQueue<>(200),',
  '        namedThreadFactory("invoice"),',
  '        new ThreadPoolExecutor.CallerRunsPolicy());',
].join('\n');

const sizingCode = [
  'int processors = Runtime.getRuntime().availableProcessors();',
  'int cpuPool = processors; // starting point for CPU-bound work',
  '',
  '// I/O starting hypothesis:',
  '// threads ≈ processors × (1 + waitTime / serviceTime)',
  '',
  '// Then validate with production-like measurements:',
  '// throughput, queue delay, task latency, CPU, memory, and downstream limits.',
].join('\n');

const rejectionCode = [
  'new ThreadPoolExecutor.AbortPolicy();',
  '// fail explicitly with RejectedExecutionException',
  '',
  'new ThreadPoolExecutor.CallerRunsPolicy();',
  '// submitter executes the task, slowing further submission',
  '',
  'new ThreadPoolExecutor.DiscardPolicy();',
  '// silently loses rejected work',
  '',
  'new ThreadPoolExecutor.DiscardOldestPolicy();',
  '// drops the oldest queued task and retries; rarely safe',
].join('\n');

const futureCode = [
  'CompletableFuture<Customer> customer = CompletableFuture.supplyAsync(',
  '        () -> customerClient.load(customerId), ioExecutor);',
  '',
  'CompletableFuture<Quote> quote = customer',
  '        .thenApply(this::calculateQuote)',
  '        .thenApply(this::validateQuote);',
  '',
  'Quote result = quote.join();',
].join('\n');

const composeCode = [
  'CompletableFuture<Customer> customer = loadCustomer(id);',
  '',
  'CompletableFuture<String> name = customer',
  '        .thenApply(Customer::name); // T -> U',
  '',
  'CompletableFuture<CreditReport> report = customer',
  '        .thenCompose(c -> loadCreditReport(c.id())); // T -> Future<U>',
  '',
  '// thenApply with the async function would produce:',
  '// CompletableFuture<CompletableFuture<CreditReport>>',
].join('\n');

const combineCode = [
  'CompletableFuture<Customer> customer = loadCustomer(id);',
  'CompletableFuture<List<Order>> orders = loadOrders(id);',
  '',
  'CompletableFuture<Profile> profile = customer.thenCombine(',
  '        orders, Profile::new);',
  '',
  'List<CompletableFuture<Item>> futures = ids.stream()',
  '        .map(this::loadItem)',
  '        .toList();',
  'CompletableFuture<Void> all = CompletableFuture.allOf(',
  '        futures.toArray(CompletableFuture[]::new));',
  'CompletableFuture<List<Item>> items = all.thenApply(ignored ->',
  '        futures.stream().map(CompletableFuture::join).toList());',
].join('\n');

const exceptionCode = [
  'CompletableFuture<Quote> safe = loadQuote(id)',
  '        .orTimeout(800, TimeUnit.MILLISECONDS)',
  '        .exceptionally(error -> fallbackQuote(error));',
  '',
  'CompletableFuture<Quote> observed = safe.whenComplete((value, error) ->',
  '        metrics.record(value, error));',
  '',
  'CompletableFuture<Result> normalized = loadQuote(id).handle((value, error) ->',
  '        error == null ? Result.success(value) : Result.failure(unwrap(error)));',
].join('\n');

const timeoutCode = [
  'CompletableFuture<Response> response = callRemote()',
  '        .orTimeout(500, TimeUnit.MILLISECONDS);',
  '',
  'CompletableFuture<Response> defaulted = callRemote()',
  '        .completeOnTimeout(Response.cached(), 500, TimeUnit.MILLISECONDS);',
  '',
  'boolean cancelled = response.cancel(true);',
  '// CompletableFuture cancellation is exceptional completion;',
  '// it does not guarantee the underlying remote call stopped.',
].join('\n');

const commonPoolCode = [
  'CompletableFuture<Result> result = CompletableFuture.supplyAsync(() -> {',
  '    return blockingHttpCall(); // occupies a common-pool worker',
  '});',
  '',
  'ExecutorService ioExecutor = Executors.newFixedThreadPool(32);',
  'CompletableFuture<Result> isolated = CompletableFuture.supplyAsync(',
  '        this::blockingHttpCall, ioExecutor);',
].join('\n');

const virtualCode = [
  'try (ExecutorService executor =',
  '        Executors.newVirtualThreadPerTaskExecutor()) {',
  '    List<Future<Response>> futures = requests.stream()',
  '            .map(request -> executor.submit(() -> httpClient.send(request)))',
  '            .toList();',
  '    for (Future<Response> future : futures) {',
  '        consume(future.get());',
  '    }',
  '}',
].join('\n');

const cpuVirtualCode = [
  '// Many virtual threads do not create more CPU cores.',
  'try (ExecutorService executor =',
  '        Executors.newWorkStealingPool()) {',
  '    Future<Long> result = executor.submit(() -> cpuIntensiveTransform(data));',
  '}',
  '',
  '// Virtual threads excel when tasks spend much of their lifetime waiting.',
].join('\n');

const semaphoreCode = [
  'Semaphore permits = new Semaphore(40);',
  '',
  'Response callLimited(Request request) throws InterruptedException {',
  '    permits.acquire();',
  '    try {',
  '        return downstream.call(request);',
  '    } finally {',
  '        permits.release();',
  '    }',
  '}',
].join('\n');

const backpressureCode = [
  'ThreadPoolExecutor pool = new ThreadPoolExecutor(',
  '        8, 8, 0, TimeUnit.SECONDS,',
  '        new ArrayBlockingQueue<>(100),',
  '        new ThreadPoolExecutor.CallerRunsPolicy());',
  '',
  '// At saturation, the producer performs work itself.',
  '// Submission slows instead of allowing an unbounded queue to grow.',
].join('\n');

function TaskBoundaryFigure(){return <Figure caption="An Executor separates the task from execution policy. The same Runnable or Callable can run on a bounded pool, scheduled executor, virtual thread, or test executor without changing business logic."><div className="grid gap-3 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>Submitter</b><span className="block text-slate-600">Runnable / Callable</span></div><ArrowRight className="mx-auto rotate-90 sm:rotate-0"/><div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>Executor policy</b><span className="block text-slate-600">queue · schedule · reject</span></div><ArrowRight className="mx-auto rotate-90 sm:rotate-0"/><div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><b>Worker</b><span className="block text-slate-600">runs task, completes result</span></div></div></Figure>}

function PoolFlowFigure(){return <Figure caption="ThreadPoolExecutor first fills core workers, then queues, then grows beyond core only when the queue rejects an offer. At maximum workers plus a full queue, the rejection handler decides what happens."><div className="grid gap-2 font-sans text-sm sm:grid-cols-4"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>1 · Core</b><span className="block text-slate-600">create until core size</span></div><div className="rounded-xl border border-slate-300 bg-slate-50 p-4"><b>2 · Queue</b><span className="block text-slate-600">offer when core busy</span></div><div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>3 · Grow</b><span className="block text-slate-600">queue full, below max</span></div><div className="rounded-xl border border-rose-300 bg-rose-50 p-4"><b>4 · Reject</b><span className="block text-slate-600">queue full, at max</span></div></div></Figure>}

function FutureGraphFigure(){return <Figure caption="A CompletableFuture is both a result state and a node in a dependency graph. Completion triggers eligible dependent stages; non-async stages may run on the thread that completes the prior stage, while async stages use an executor."><div className="space-y-3 text-center font-sans text-sm"><div className="mx-auto max-w-xs rounded-xl border border-cyan-300 bg-cyan-50 p-3">load customer</div><div className="mx-auto h-6 w-1/2 border-x-2 border-t-2 border-cyan-600"/><div className="grid grid-cols-2 gap-4"><div className="rounded-xl border bg-white p-3">calculate quote</div><div className="rounded-xl border bg-white p-3">load preferences</div></div><div className="mx-auto h-6 w-1/2 border-x-2 border-b-2 border-emerald-600"/><div className="mx-auto max-w-xs rounded-xl border border-emerald-300 bg-emerald-50 p-3">combine response</div></div></Figure>}

function VirtualThreadFigure(){return <Figure caption="The runtime mounts many virtual threads onto a smaller set of platform carrier threads. During supported blocking operations, a virtual thread can unmount so its carrier runs another virtual thread. The application still writes ordinary sequential blocking code."><div className="space-y-4 text-center font-sans text-sm"><div className="grid grid-cols-4 gap-2"><span className="rounded-lg border border-cyan-300 bg-cyan-50 p-3">VT 1</span><span className="rounded-lg border border-cyan-300 bg-cyan-50 p-3">VT 2</span><span className="rounded-lg border border-cyan-300 bg-cyan-50 p-3">VT 3</span><span className="rounded-lg border border-cyan-300 bg-cyan-50 p-3">VT 4</span></div><div className="font-bold text-cyan-800">mount · unmount · remount</div><div className="grid grid-cols-2 gap-4"><span className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>carrier A</b><br/>platform thread</span><span className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>carrier B</b><br/>platform thread</span></div></div></Figure>}

function BackpressureFigure(){return <Figure caption="Backpressure makes overload visible to producers. Instead of buffering unlimited work, the system slows, rejects, sheds, or redirects work before memory and latency become unbounded."><div className="grid gap-3 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>arrival</b><span className="block">120 tasks/s</span></div><ArrowRight className="mx-auto rotate-90 sm:rotate-0"/><div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>bounded capacity</b><span className="block">queue + permits</span></div><ArrowRight className="mx-auto rotate-90 sm:rotate-0"/><div className="rounded-xl border border-rose-300 bg-rose-50 p-4"><b>service</b><span className="block">80 tasks/s</span></div></div></Figure>}

function OverviewPage(){return <div className="article-copy"><div className="answer-card"><p>Executors decouple task submission from thread creation, scheduling, queuing, lifecycle, and overload policy. They reuse or create execution resources according to one managed policy, return Futures for completion, and make capacity and shutdown explicit. Manually creating a platform thread per task scatters those decisions and can exhaust OS resources.</p></div><TaskBoundaryFigure/><CodeBlock code={executorCode} label="Submit work to a managed executor"/><h3>The questions behind the API</h3><ul><li>How many tasks may execute concurrently?</li><li>Where does excess work wait, and how much may wait?</li><li>What happens during overload and shutdown?</li><li>How are results, failures, cancellation, context, and metrics observed?</li></ul></div>}

function LifecyclePage(){return <div className="article-copy"><div className="answer-card"><p>An ExecutorService owns resources and has a lifecycle. <code>shutdown()</code> stops acceptance but lets accepted work finish. <code>shutdownNow()</code> attempts to interrupt running work and returns tasks that never started; interruption is cooperative, so task code and blocking APIs must respond correctly.</p></div><CodeBlock code={lifecycleCode} label="Graceful then forced shutdown"/><h3>Operational responsibilities</h3><ul><li>Name platform threads so stack traces identify the pool.</li><li>Capture uncaught failures and Future failures.</li><li>Track active workers, queue depth, rejection count, wait time, and task latency.</li><li>Propagate or reconstruct required request context deliberately.</li></ul><Callout title="Close is lifecycle, not cancellation magic">In modern Java, ExecutorService is AutoCloseable. Scope ownership carefully; application-wide executors usually belong to application lifecycle management rather than each request.</Callout></div>}

function PoolKindsPage(){return <div className="article-copy"><div className="answer-card"><p>A fixed pool runs at most a fixed number of tasks and ordinarily queues the rest. A cached pool hands tasks directly to idle or newly created workers and can grow aggressively. A scheduled pool runs delayed or periodic tasks. Their factory defaults imply important queue and growth behavior.</p></div><CodeBlock code={poolKindsCode} label="Common executor policies"/><div className="grid gap-3 sm:grid-cols-3"><article className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><h3 className="mt-0">Fixed</h3><p>Stable concurrency, but the factory uses an unbounded queue, so overload can become growing latency and memory.</p></article><article className="rounded-xl border border-amber-300 bg-amber-50 p-4"><h3 className="mt-0">Cached</h3><p>Useful for many short asynchronous tasks only when arrival and resource use are controlled; thread count can grow without a practical bound.</p></article><article className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><h3 className="mt-0">Scheduled</h3><p>Delays and periodic triggers. Long tasks, exceptions, and overlap policy still require deliberate handling.</p></article></div></div>}

function PoolInternalsPage(){return <div className="article-copy"><div className="answer-card"><p><code>ThreadPoolExecutor.execute()</code> follows a specific admission sequence: create a core worker while below core size; otherwise offer to the queue; if the queue is full, create a worker up to maximum size; if both capacity limits are reached—or shutdown has begun—invoke the rejection policy.</p></div><PoolFlowFigure/><CodeBlock code={configuredPoolCode} label="Bounded pool configuration"/><Callout tone="warning" title="An unbounded queue makes maximumPoolSize ineffective">Once core workers exist, every new task can be queued, so the queue never forces growth toward maximum size. Capacity then moves from threads into waiting work.</Callout></div>}

function SizingPage(){return <div className="article-copy"><div className="answer-card"><p>Pool size is a capacity decision, not a universal formula. CPU-bound work usually starts near available processors. Blocking work may use more threads based on the wait-to-compute ratio, but memory, connection pools, rate limits, latency targets, queue bounds, and neighboring workloads impose harder limits. Measure under realistic load.</p></div><CodeBlock code={sizingCode} label="Starting hypotheses, then measurement"/><h3>Separate unlike workloads</h3><p>A slow blocking dependency can occupy every worker and delay unrelated fast tasks. Separate executors or bulkheads by resource and service-level objective when workloads can interfere.</p><Callout title="Optimize queueing delay, not only utilization">A large pool can increase context switching and downstream contention; a large queue can hide overload while latency grows. Observe time waiting before execution separately from task service time.</Callout></div>}

function SaturationPage(){return <div className="article-copy"><div className="answer-card"><p>A bounded executor is saturated when all permitted workers are busy and its queue has no capacity. The rejection handler then defines the overload contract. Rejection is also possible after shutdown. The right policy depends on whether work may be retried, delayed, run by the caller, or dropped.</p></div><BackpressureFigure/><h3>Design the full failure path</h3><ul><li>Return an overload response or propagate a clear failure.</li><li>Apply bounded retry with jitter only for transient conditions and idempotent work.</li><li>Record rejection and queue delay as first-class health signals.</li><li>Never silently lose business-critical work.</li></ul></div>}

function RejectionPage(){return <div className="article-copy"><div className="answer-card"><p><code>AbortPolicy</code> fails explicitly. <code>CallerRunsPolicy</code> executes on the submitting thread and can slow producers, but can also violate latency or thread-affinity assumptions. Discard policies lose work and are acceptable only when loss is explicitly part of the product contract.</p></div><CodeBlock code={rejectionCode} label="Built-in rejection policies"/><Callout tone="warning" title="CallerRuns is feedback, not a complete overload strategy">If the submitter is an event-loop or latency-sensitive request thread, running the task there can block the wrong resource. Evaluate the caller’s role before choosing it.</Callout><Callout title="Custom handlers need observability">A handler can block, redirect, persist, or fail, but it must avoid deadlocking the executor and must make the outcome visible to callers and operations.</Callout></div>}

function CompletableFuturePage(){return <div className="article-copy"><div className="answer-card"><p><code>CompletableFuture</code> represents a result that may complete normally, exceptionally, or through cancellation, and also acts as a CompletionStage node. Dependent stages register transformations or actions that become eligible when prerequisites complete, forming a graph rather than occupying one waiting thread per dependency.</p></div><FutureGraphFigure/><CodeBlock code={futureCode} label="Build a completion graph"/><h3>Execution context is part of correctness</h3><p>A non-async continuation may run in the thread that completes the prior stage. An <code>Async</code> variant uses its supplied Executor or the default async executor. Supply an executor when isolation, capacity, context, or blocking behavior matters.</p></div>}

function ApplyComposePage(){return <div className="article-copy"><div className="answer-card"><p><code>thenApply()</code> transforms a completed value with <code>T → U</code>. <code>thenCompose()</code> chains an asynchronous function with <code>T → CompletionStage&lt;U&gt;</code> and flattens the nested stage. It is the asynchronous equivalent of choosing <code>map</code> versus <code>flatMap</code>.</p></div><CodeBlock code={composeCode} label="Transform versus asynchronous chain"/><h3>Why flattening matters</h3><p>A nested Future forces callers to wait or attach callbacks twice and complicates failure propagation. The composed stage completes when the inner asynchronous operation completes and presents one normal success-or-failure path.</p></div>}

function CombinePage(){return <div className="article-copy"><div className="answer-card"><p><code>thenCombine()</code> waits for two independent stages and combines their typed results. <code>allOf()</code> returns a <code>CompletableFuture&lt;Void&gt;</code> that completes when every supplied stage completes; retain the original futures to collect typed results afterward.</p></div><CodeBlock code={combineCode} label="Fan out and join"/><h3>Failure behavior</h3><p>If a prerequisite completes exceptionally, the dependent aggregate completes exceptionally. <code>allOf()</code> does not cancel remaining work automatically and does not return a typed list. Decide whether the operation is fail-fast, best-effort, or needs partial results and model that policy explicitly.</p><Callout title="Starting two calls first creates concurrency">Calling one future and immediately joining before starting the second serializes them. Start independent work, then combine or await it.</Callout></div>}

function ExceptionsPage(){return <div className="article-copy"><div className="answer-card"><p>Failures propagate through dependent stages until handled. <code>exceptionally()</code> recovers from failure with a replacement value. <code>handle()</code> transforms either success or failure. <code>whenComplete()</code> observes the outcome without normally replacing it. Completion wrappers such as <code>CompletionException</code> preserve the underlying cause.</p></div><CodeBlock code={exceptionCode} label="Recover, normalize, and observe"/><h3>Place recovery at the correct boundary</h3><p>Recover only when a meaningful fallback exists. Logging and returning null can convert a clear failure into a later, confusing error. Preserve cancellation and interruption semantics when translating exceptions.</p><Callout tone="tip" title="One owner should report the failure">Avoid logging the same propagated exception at every stage. Add context where ownership changes, and report it once at the request, message, or job boundary.</Callout></div>}

function TimeoutsPage(){return <div className="article-copy"><div className="answer-card"><p>A timeout bounds how long a caller waits for a stage, while cancellation changes the Future’s completion state. Neither necessarily stops underlying I/O or remote work. Configure timeouts at the actual client or resource boundary, propagate a remaining deadline, and make abandoned work cancellable where the API supports it.</p></div><CodeBlock code={timeoutCode} label="Bound the wait and define fallback"/><h3>Timeout budgets compose</h3><p>Three sequential calls with independent one-second timeouts can consume roughly three seconds. A request deadline should be divided or propagated so nested work cannot exceed the caller’s remaining budget.</p><Callout tone="warning" title="Timeout is not rollback">A timed-out write may still complete remotely. Idempotency keys, reconciliation, and explicit transactional boundaries address that uncertainty.</Callout></div>}

function CommonPoolPage(){return <div className="article-copy"><div className="answer-card"><p>Async CompletableFuture methods without an explicit Executor normally use the common <code>ForkJoinPool</code>. It is shared process-wide and designed for work that keeps workers productive. Long blocking calls can occupy its limited workers and delay unrelated futures, parallel streams, and fork-join tasks.</p></div><CodeBlock code={commonPoolCode} label="Isolate blocking work"/><h3>Why work stealing does not remove blocking</h3><p>A worker waiting on external I/O cannot steal another task. The pool can compensate in some managed-blocking situations, but arbitrary library calls may be invisible to it. Use explicit executors or virtual threads for substantial blocking workloads.</p><Callout title="Do not hide executor choice">The chosen executor is part of service capacity and isolation. Passing it explicitly makes tests, monitoring, and overload behavior understandable.</Callout></div>}

function VirtualModelPage(){return <div className="article-copy"><div className="answer-card"><p>A virtual thread is a Java Thread scheduled by the runtime rather than permanently tied to one OS thread. It can run ordinary blocking code and usually unmount from its carrier while waiting for supported I/O, allowing the carrier to run another virtual thread. This makes thread-per-task style scalable for high-concurrency blocking workloads.</p></div><VirtualThreadFigure/><CodeBlock code={virtualCode} label="One virtual thread per task"/><Callout title="Virtual threads are not pooled">They are inexpensive task resources. Create one per concurrent task and use semaphores, connection pools, or rate limiters to constrain scarce downstream resources.</Callout></div>}

function VirtualUsePage(){return <div className="article-copy"><div className="answer-card"><p>Use virtual threads when there are many independent tasks that spend substantial time blocked on network, file, database, or queue operations and the libraries use compatible blocking APIs. They simplify code that would otherwise need deeply asynchronous callbacks. They do not remove database connection limits, service quotas, memory costs, or the need for cancellation and observability.</p></div><h3>How the runtime makes waiting cheap</h3><p>When a virtual thread parks or performs supported blocking I/O, its stack state is retained and the carrier becomes available. Later the virtual thread is scheduled again, possibly on another carrier. In current JDKs, long blocking while executing native or foreign-function code can still pin the carrier and reduce scalability.</p><Callout tone="warning" title="ThreadLocal multiplication">Millions of virtual threads can make large per-thread caches or inherited context expensive. Prefer scoped request data and small thread-local values.</Callout><Callout tone="tip" title="Measure pinning and behavior">JDK Flight Recorder and <code>jcmd</code> expose virtual-thread diagnostics. Treat pinning as a scalability observation, not proof of incorrectness.</Callout></div>}

function CpuVirtualPage(){return <div className="article-copy"><div className="answer-card"><p>Virtual threads do not make CPU-intensive work execute faster because CPU throughput is bounded by available cores. Creating far more runnable CPU tasks adds scheduling overhead. Use a bounded CPU-oriented executor or fork-join design near processor parallelism, and reserve virtual-thread scale for tasks that often wait.</p></div><CodeBlock code={cpuVirtualCode} label="Match execution to the bottleneck"/><h3>Concurrency is not parallelism</h3><ul><li><b>Concurrency:</b> many tasks are in progress, often because most are waiting.</li><li><b>Parallelism:</b> several tasks are executing instructions simultaneously on different cores.</li></ul><p>Virtual threads dramatically increase affordable concurrency. They do not increase hardware parallelism.</p></div>}

function DownstreamLimitPage(){return <div className="article-copy"><div className="answer-card"><p>Limit concurrent downstream calls with a Semaphore, bounded connection pool, bulkhead, or client-specific concurrency limiter. Acquire before consuming the scarce resource and release in <code>finally</code>. This limit remains necessary with virtual threads because making waiting threads cheap does not make the database or remote service unlimited.</p></div><CodeBlock code={semaphoreCode} label="Explicit downstream permit"/><h3>Concurrency limit versus rate limit</h3><p>A semaphore bounds simultaneous in-flight calls. A rate limiter bounds starts per time interval. A downstream may need both: one protects concurrent capacity and the other protects contractual or recovery limits.</p><Callout tone="warning" title="Bound waiting too">An unlimited number of tasks waiting for permits can still consume memory and exceed deadlines. Combine admission control, acquisition timeouts, and a clear overload response.</Callout></div>}

function BackpressurePage(){return <div className="article-copy"><div className="answer-card"><p>Backpressure is feedback that prevents producers from indefinitely outrunning consumers. In executor systems it can be expressed through bounded queues, blocking or timed offers, CallerRuns, semaphores, rejected submissions, demand-aware streams, or upstream rate reduction. Without it, overload accumulates as memory use and queue latency.</p></div><BackpressureFigure/><CodeBlock code={backpressureCode} label="Bounded buffering with feedback"/><h3>Backpressure is an end-to-end property</h3><p>A bounded executor protects one process, but retry queues, message brokers, HTTP clients, and databases can move the backlog elsewhere. Track the full path from admission to completion and set a total latency and capacity budget.</p></div>}

function ProductionChecklistPage(){return <div className="article-copy"><div className="answer-card"><p>A production execution design is complete only when it defines admission, capacity, scheduling, result ownership, deadlines, cancellation, shutdown, and observability. The thread mechanism is one part of that contract. Most failures appear at the boundaries between submission, waiting, and downstream capacity.</p></div><h3>Signals that explain the system</h3><ul><li><b>Admission:</b> accepted, rejected, shed, and retried task counts.</li><li><b>Waiting:</b> queue depth, permit wait, and time from submission to execution.</li><li><b>Service:</b> active tasks, task latency, completion rate, and failure causes.</li><li><b>Resources:</b> CPU, carrier and platform threads, connections, memory, and downstream saturation.</li></ul><h3>Scenario choices</h3><ul><li>CPU transformations → bounded pool near processor parallelism.</li><li>Many blocking request tasks → virtual thread per task plus downstream permits.</li><li>Independent async calls → start both, then combine their stages.</li><li>Bursty producers → bounded queue and an explicit overload response.</li><li>Recurring maintenance → scheduled executor with overlap and failure policy.</li></ul><Callout tone="tip" title="Capacity belongs in architecture diagrams">Name the queue, concurrency limit, timeout, and owner at every asynchronous boundary. Invisible queues become surprise latency reservoirs.</Callout></div>}

function RecapPage(){return <div className="article-copy"><div className="answer-card"><p>Choose an execution model from workload and capacity: bounded pools for controlled platform-thread resources, completion graphs for composing asynchronous dependencies, and virtual threads for large numbers of blocking tasks written in direct style. Every model still needs deadlines, failure ownership, overload behavior, downstream limits, metrics, and lifecycle management.</p></div><h3>Rapid senior interview</h3><div className="faq-list"><details><summary>Why can a fixed pool still exhaust memory?</summary><p>The standard factory uses an unbounded queue, so arrival above service rate accumulates waiting tasks.</p></details><details><summary>When does maximumPoolSize matter?</summary><p>Only after core workers are busy and the queue cannot accept the task. With an unbounded queue that condition does not occur.</p></details><details><summary>thenApply or thenCompose?</summary><p>Apply transforms a value directly. Compose chains a function that already returns a stage and flattens the nested future.</p></details><details><summary>Why avoid blocking the common pool?</summary><p>Blocked shared workers cannot process unrelated common-pool tasks, causing cross-feature starvation and latency.</p></details><details><summary>Should virtual threads be pooled?</summary><p>No. Create one per task; separately limit scarce external resources.</p></details><details><summary>What is backpressure?</summary><p>Feedback that slows, bounds, rejects, or sheds upstream work when downstream service capacity is saturated.</p></details></div><div className="sources"><p className="eyebrow">Primary references</p><a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html" target="_blank" rel="noreferrer">ThreadPoolExecutor admission and rejection rules <ArrowRight /></a><a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html" target="_blank" rel="noreferrer">CompletableFuture execution and completion policies <ArrowRight /></a><a href="https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html" target="_blank" rel="noreferrer">Java 25 virtual threads guide <ArrowRight /></a><a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Semaphore.html" target="_blank" rel="noreferrer">Semaphore permits and memory effects <ArrowRight /></a></div></div>}

export const javaExecutorsPages: ReadingPage[] = [
  {id:'executors-roadmap',chapter:'Execution model',title:'Why executors manage tasks',Content:OverviewPage},
  {id:'executor-lifecycle',chapter:'Execution model',title:'Executor lifecycle and shutdown',Content:LifecyclePage},
  {id:'pool-kinds',chapter:'Thread pools',title:'Fixed, cached, and scheduled pools',Content:PoolKindsPage},
  {id:'pool-admission',chapter:'Thread pools',title:'How ThreadPoolExecutor admits work',Content:PoolInternalsPage},
  {id:'pool-sizing',chapter:'Thread pools',title:'Selecting thread-pool size',Content:SizingPage},
  {id:'saturation',chapter:'Overload',title:'What happens when a pool is full',Content:SaturationPage},
  {id:'rejection-policies',chapter:'Overload',title:'Executor rejection policies',Content:RejectionPage},
  {id:'completable-future',chapter:'Completion graphs',title:'How CompletableFuture works',Content:CompletableFuturePage},
  {id:'apply-compose',chapter:'Completion graphs',title:'thenApply() versus thenCompose()',Content:ApplyComposePage},
  {id:'combine-all',chapter:'Completion graphs',title:'thenCombine() and allOf()',Content:CombinePage},
  {id:'async-exceptions',chapter:'Failure handling',title:'Asynchronous exceptions',Content:ExceptionsPage},
  {id:'timeouts-cancellation',chapter:'Failure handling',title:'Timeouts and cancellation',Content:TimeoutsPage},
  {id:'common-pool',chapter:'Execution isolation',title:'Blocking and the common ForkJoinPool',Content:CommonPoolPage},
  {id:'virtual-model',chapter:'Virtual threads',title:'How virtual threads work',Content:VirtualModelPage},
  {id:'virtual-use',chapter:'Virtual threads',title:'When virtual threads should be used',Content:VirtualUsePage},
  {id:'virtual-cpu',chapter:'Virtual threads',title:'Virtual threads and CPU-intensive work',Content:CpuVirtualPage},
  {id:'downstream-limits',chapter:'Capacity control',title:'Limiting concurrent downstream calls',Content:DownstreamLimitPage},
  {id:'backpressure',chapter:'Capacity control',title:'Backpressure and bounded demand',Content:BackpressurePage},
  {id:'production-checklist',chapter:'Operations',title:'Production execution checklist',Content:ProductionChecklistPage},
  {id:'executors-recap',chapter:'Interview recap',title:'Executors and async mock interview',Content:RecapPage},
];
