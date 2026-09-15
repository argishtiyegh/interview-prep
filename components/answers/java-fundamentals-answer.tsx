'use client';

import { ArrowRight } from 'lucide-react';
import { Callout, CodeBlock, Figure } from '@/components/answer-primitives';
import type { ReadingPage } from '@/lib/reading';

const pillarsCode = [
  'interface PaymentMethod {',
  '    PaymentResult pay(Money amount);',
  '}',
  '',
  'final class CheckoutService {',
  '    private final PaymentMethod paymentMethod;',
  '',
  '    CheckoutService(PaymentMethod paymentMethod) {',
  '        this.paymentMethod = paymentMethod;',
  '    }',
  '',
  '    PaymentResult checkout(Money total) {',
  '        return paymentMethod.pay(total);',
  '    }',
  '}',
].join('\n');

const encapsulationCode = [
  'final class BankAccount {',
  '    private BigDecimal balance = BigDecimal.ZERO;',
  '',
  '    public void deposit(BigDecimal amount) {',
  '        if (amount.signum() <= 0) {',
  '            throw new IllegalArgumentException("amount must be positive");',
  '        }',
  '        balance = balance.add(amount);',
  '    }',
  '',
  '    public BigDecimal balance() {',
  '        return balance;',
  '    }',
  '}',
].join('\n');

const polymorphismCode = [
  'interface NotificationSender {',
  '    void send(Message message);',
  '}',
  '',
  'final class EmailSender implements NotificationSender {',
  '    @Override',
  '    public void send(Message message) { /* send email */ }',
  '}',
  '',
  'NotificationSender sender = new EmailSender();',
  'sender.send(message); // EmailSender.send is selected at runtime',
].join('\n');

const compositionCode = [
  '// Composition: the service HAS a retry policy.',
  'final class PaymentClient {',
  '    private final RetryPolicy retryPolicy;',
  '    private final HttpTransport transport;',
  '',
  '    PaymentClient(RetryPolicy retryPolicy, HttpTransport transport) {',
  '        this.retryPolicy = retryPolicy;',
  '        this.transport = transport;',
  '    }',
  '}',
  '',
  '// Inheritance is appropriate for a genuine IS-A relationship.',
  'sealed interface Shape permits Circle, Rectangle {',
  '    double area();',
  '}',
].join('\n');

const interfaceAbstractCode = [
  'interface Auditable {',
  '    void record(AuditEvent event);',
  '    default boolean enabled() { return true; }',
  '}',
  '',
  'abstract class BaseImporter {',
  '    private final Clock clock;',
  '',
  '    protected BaseImporter(Clock clock) { this.clock = clock; }',
  '    public final ImportResult run() { return parse(clock.instant()); }',
  '    protected abstract ImportResult parse(Instant startedAt);',
  '}',
].join('\n');

const dispatchCode = [
  'class Printer {',
  '    void print(Object value) { System.out.println("Object"); }',
  '    void print(String value) { System.out.println("String"); }',
  '}',
  '',
  'Object text = "hello";',
  'new Printer().print(text); // Object: overload chosen at compile time',
  '',
  'class Parent { String name() { return "parent"; } }',
  'class Child extends Parent {',
  '    @Override String name() { return "child"; }',
  '}',
  'Parent value = new Child();',
  'value.name(); // child: override chosen from runtime object',
].join('\n');

const passByValueCode = [
  'static void change(User user) {',
  '    user.setName("Maya");       // mutates the shared object',
  '    user = new User("Noah");   // changes only the local copy',
  '}',
  '',
  'User original = new User("Ana");',
  'change(original);',
  'System.out.println(original.name()); // Maya',
].join('\n');

const primitiveCode = [
  'int count = 42;          // the variable contains the number',
  'int copied = count;      // copies 42',
  '',
  'User first = new User("Ana");',
  'User second = first;     // copies a reference value',
  'second.setName("Maya"); // both references observe the same User',
  '',
  'User missing = null;     // a reference can contain null',
  '// int impossible = null; // primitive values cannot be null',
].join('\n');

const exceptionsCode = [
  'public Invoice loadInvoice(Path path) throws IOException {',
  '    return parse(Files.readString(path)); // checked IOException',
  '}',
  '',
  'public Money divide(Money total, int people) {',
  '    if (people <= 0) {',
  '        throw new IllegalArgumentException("people must be positive");',
  '    }',
  '    return total.divideBy(people); // unchecked caller error',
  '}',
].join('\n');

const resourcesCode = [
  'try (InputStream input = Files.newInputStream(source);',
  '     OutputStream output = Files.newOutputStream(target)) {',
  '    input.transferTo(output);',
  '}',
  '// output.close() runs first, then input.close()',
  '',
  'try (DatabaseConnection connection = openConnection()) {',
  '    connection.execute();          // throws workFailure',
  '} catch (Exception workFailure) {',
  '    // A close failure is available through:',
  '    Throwable[] closeFailures = workFailure.getSuppressed();',
  '}',
].join('\n');

const copyingCode = [
  'final class Address {',
  '    String city;',
  '    Address(String city) { this.city = city; }',
  '}',
  '',
  'final class Customer {',
  '    String name;',
  '    Address address;',
  '    Customer(String name, Address address) {',
  '        this.name = name;',
  '        this.address = address;',
  '    }',
  '}',
  '',
  'Customer shallow = new Customer(original.name, original.address);',
  '// shallow.address == original.address',
  '',
  'Customer deep = new Customer(',
  '        original.name,',
  '        new Address(original.address.city()));',
  '// deep owns a separate nested Address object',
].join('\n');

const immutableCode = [
  'public final class PurchaseOrder {',
  '    private final UUID id;',
  '    private final List<LineItem> items;',
  '',
  '    public PurchaseOrder(UUID id, List<LineItem> items) {',
  '        this.id = Objects.requireNonNull(id);',
  '        this.items = List.copyOf(items); // defensive snapshot',
  '    }',
  '',
  '    public UUID id() { return id; }',
  '    public List<LineItem> items() { return items; }',
  '}',
].join('\n');

const finalTrapCode = [
  'final class Team {',
  '    private final List<String> members;',
  '',
  '    Team(List<String> members) {',
  '        this.members = members; // unsafe alias',
  '    }',
  '',
  '    void add(String name) {',
  '        members.add(name);      // legal: field was not reassigned',
  '    }',
  '}',
].join('\n');

const recordsCode = [
  'record Money(BigDecimal amount, Currency currency) {',
  '    Money {',
  '        Objects.requireNonNull(amount);',
  '        Objects.requireNonNull(currency);',
  '    }',
  '}',
  '',
  'sealed interface PaymentResult permits Approved, Declined {}',
  'record Approved(String authorizationId) implements PaymentResult {}',
  'record Declined(String reason) implements PaymentResult {}',
  '',
  'String message = switch (result) {',
  '    case Approved approved -> "Approved " + approved.authorizationId();',
  '    case Declined declined -> "Declined: " + declined.reason();',
  '};',
].join('\n');

const stringImmutableCode = [
  'String original = "order";',
  'String upper = original.toUpperCase();',
  '',
  'System.out.println(original); // order',
  'System.out.println(upper);    // ORDER',
  '',
  '// The apparent change assigns a different String reference.',
  'original = original + "-42";',
].join('\n');

const stringPoolCode = [
  'String first = "java";',
  'String second = "java";',
  'String heap = new String("java");',
  '',
  'first == second;        // true: same pooled literal reference',
  'first == heap;          // false: heap refers to a new object',
  'first.equals(heap);     // true: same characters',
  'first == heap.intern(); // true: intern returns pooled reference',
].join('\n');

const stringEqualityCode = [
  'String fromRequest = new String("PAID");',
  '',
  'fromRequest == "PAID";       // false: different references',
  'fromRequest.equals("PAID");  // true: same character sequence',
  '',
  '// Null-safe when the known constant is on the left:',
  'if ("PAID".equals(status)) { /* ... */ }',
  '',
  '// For case-insensitive domain rules:',
  'boolean same = "paid".equalsIgnoreCase(status);',
].join('\n');

const buildersCode = [
  'StringBuilder builder = new StringBuilder();',
  'for (String part : parts) {',
  '    builder.append(part).append(", ");',
  '}',
  'String result = builder.toString();',
  '',
  '// StringBuffer has a similar mutable buffer API,',
  '// but its methods synchronize access to one instance.',
  'StringBuffer sharedBuffer = new StringBuffer();',
].join('\n');

const boxingCode = [
  'Integer a = 100;  // Integer.valueOf(100)',
  'Integer b = 100;',
  'Integer x = 1000;',
  'Integer y = 1000;',
  '',
  'a == b;       // true on required cache range',
  'x == y;       // do not rely on this; commonly false',
  'x.equals(y);  // true: numeric values are equal',
  '',
  'Integer missing = null;',
  '// int value = missing; // NullPointerException during unboxing',
].join('\n');

const optionalCode = [
  'Optional<Customer> findCustomer(CustomerId id) {',
  '    return repository.find(id); // absence is an expected result',
  '}',
  '',
  'String label = findCustomer(id)',
  '        .map(Customer::displayName)',
  '        .filter(name -> !name.isBlank())',
  '        .orElseGet(() -> "Customer " + id);',
  '',
  '// Avoid Optional fields, parameters, and collections of Optional.',
  '// Prefer an empty collection when there are zero elements.',
].join('\n');

const optionalFallbackCode = [
  'Customer eager = optional.orElse(loadFallback());',
  '// loadFallback() runs even when optional contains a Customer',
  '',
  'Customer lazy = optional.orElseGet(this::loadFallback);',
  '// loadFallback() runs only when optional is empty',
  '',
  'Customer required = optional.orElseThrow(',
  '        () -> new CustomerNotFoundException(id));',
].join('\n');

const moneyCode = [
  'BigDecimal price = new BigDecimal("19.99");',
  'BigDecimal quantity = BigDecimal.valueOf(3);',
  'BigDecimal total = price.multiply(quantity); // 59.97',
  '',
  'BigDecimal share = total.divide(',
  '        BigDecimal.valueOf(7),',
  '        2,',
  '        RoundingMode.HALF_EVEN);',
  '',
  'new BigDecimal("2.0").equals(new BigDecimal("2.00")); // false',
  'new BigDecimal("2.0").compareTo(new BigDecimal("2.00")) == 0; // true',
].join('\n');

function PillarsDiagram() {
  const items = [
    ['ABSTRACTION', 'Expose the capability callers need'],
    ['ENCAPSULATION', 'Protect state and its rules'],
    ['INHERITANCE', 'Create a subtype relationship'],
    ['POLYMORPHISM', 'Use one contract with different behavior'],
  ];
  return <Figure caption="The four ideas work together. A contract hides details, an object protects its state, a subtype fulfills the contract, and runtime dispatch selects its behavior.">
    <div className="grid gap-3 font-sans sm:grid-cols-2">
      {items.map(([title, meaning], index) => <div key={title} className="rounded-xl border border-slate-300 bg-slate-50 p-4">
        <span className="text-xs font-extrabold text-cyan-800">0{index + 1}</span><strong className="mt-1 block text-slate-950">{title}</strong><span className="mt-1 block text-sm leading-6 text-slate-600">{meaning}</span>
      </div>)}
    </div>
  </Figure>;
}

function DispatchDiagram() {
  return <Figure caption="The variable's declared type controls which members are available at compile time. For an overridden instance method, the runtime object's class selects the implementation.">
    <div className="grid gap-3 text-center font-sans text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div className="rounded-xl border border-slate-300 bg-slate-50 p-4"><b>Reference type</b><span className="mt-1 block text-slate-600">NotificationSender</span></div>
      <ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" />
      <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>Runtime object</b><span className="mt-1 block text-slate-600">EmailSender → EmailSender.send()</span></div>
    </div>
  </Figure>;
}

function ValuePassingDiagram() {
  return <Figure caption="Java copies the argument value into the parameter. For an object argument, that value is a reference, so caller and callee initially refer to the same object; reassigning the parameter does not reassign the caller's variable.">
    <div className="space-y-4 font-sans text-sm">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4 text-center"><b>caller: original</b><span className="block text-slate-600">reference R1</span></div><ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" /><div className="rounded-xl border border-slate-300 bg-white p-4 text-center"><b>User object</b><span className="block text-slate-600">name = Ana</span></div></div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center"><b>callee: user</b><span className="block text-slate-600">copied reference R1</span></div><ArrowRight className="mx-auto rotate-90 text-amber-700 sm:rotate-0" /><div className="rounded-xl border border-slate-300 bg-white p-4 text-center"><b>same User object</b><span className="block text-slate-600">can be mutated through either reference</span></div></div>
    </div>
  </Figure>;
}

function ResourceDiagram() {
  return <Figure caption="Resources close in reverse declaration order, like unwinding a stack. If work and close both fail, the work failure remains primary and close failures are attached as suppressed exceptions.">
    <div className="grid gap-3 font-sans text-sm sm:grid-cols-3">
      <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4 text-center"><b>1 · Open</b><span className="block text-slate-600">input, then output</span></div>
      <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 text-center"><b>2 · Work</b><span className="block text-slate-600">transfer bytes</span></div>
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center"><b>3 · Close</b><span className="block text-slate-600">output, then input</span></div>
    </div>
  </Figure>;
}

function CopyDiagram() {
  return <Figure caption="A shallow copy creates a new outer object but reuses nested references. A deep copy recursively creates independent mutable state. The required depth depends on which nested objects are mutable and who owns them.">
    <div className="grid gap-4 font-sans text-sm sm:grid-cols-2">
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><b>Shallow copy</b><div className="mt-3 flex items-center justify-center gap-2"><span className="rounded-lg bg-white p-3">Customer A</span><span>→</span><span className="rounded-lg border border-amber-400 bg-white p-3">Address #1</span><span>←</span><span className="rounded-lg bg-white p-3">Customer B</span></div></div>
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4"><b>Deep copy</b><div className="mt-3 grid grid-cols-2 gap-2 text-center"><span className="rounded-lg bg-white p-3">A → Address #1</span><span className="rounded-lg bg-white p-3">B → Address #2</span></div></div>
    </div>
  </Figure>;
}

function StringPoolDiagram() {
  return <Figure caption="Literals with equal contents normally share the canonical pooled object. new String creates a distinct object. intern() returns the canonical pooled reference for equal contents.">
    <div className="grid gap-4 font-sans text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div className="space-y-2"><div className="rounded-lg border bg-white p-3"><b>first</b> → pooled #1</div><div className="rounded-lg border bg-white p-3"><b>second</b> → pooled #1</div><div className="rounded-lg border bg-white p-3"><b>heap</b> → object #2</div></div>
      <ArrowRight className="mx-auto rotate-90 text-cyan-700 sm:rotate-0" />
      <div className="space-y-2"><div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4 text-center"><b>String pool</b><span className="block text-slate-600">#1 “java”</span></div><div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center"><b>separate object</b><span className="block text-slate-600">#2 “java”</span></div></div>
    </div>
  </Figure>;
}

function BuilderDiagram() {
  return <Figure caption="A builder mutates one expandable character buffer. Repeated String concatenation in a loop can create a succession of temporary String objects; a builder accumulates first and creates the final String once.">
    <div className="space-y-3 text-center font-sans text-sm">
      <div className="grid grid-cols-3 gap-2"><span className="rounded-lg border bg-white p-3">“Java”</span><span className="rounded-lg border bg-white p-3">“ ”</span><span className="rounded-lg border bg-white p-3">“Guide”</span></div>
      <div className="font-bold text-cyan-700">↓ append into mutable capacity</div>
      <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><b>[ J a v a · G u i d e _ _ _ ]</b><span className="mt-1 block text-slate-600">length 10 · capacity has spare room</span></div>
      <div className="font-bold text-emerald-700">↓ toString()</div>
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3"><b>immutable “Java Guide”</b></div>
    </div>
  </Figure>;
}

function FundamentalsOverviewPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Object-oriented design separates what a component promises from how it fulfills that promise. Abstraction exposes useful behavior, encapsulation protects valid state, inheritance declares a subtype relationship, and polymorphism lets code invoke the same contract while different runtime objects provide different behavior.</p></div>
    <PillarsDiagram />
    <CodeBlock code={pillarsCode} label="One contract, replaceable behavior" />
    <h3>What senior interviewers listen for</h3>
    <ul><li>Concrete invariants and boundaries, not only four memorized definitions.</li><li>A distinction between subtype polymorphism and simple code reuse.</li><li>Judgment about composition, mutability, error contracts, and value semantics.</li></ul>
    <Callout tone="tip" title="A useful answering pattern">Define the mechanism, show a small example, state why it matters, and finish with the failure mode or tradeoff.</Callout>
  </div>;
}

function AbstractionEncapsulationPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Abstraction presents the operations a caller needs while hiding irrelevant implementation details. Encapsulation places state and the rules that keep it valid behind a controlled boundary. An interface can provide abstraction; private fields plus behavior that enforces invariants provide encapsulation.</p></div>
    <CodeBlock code={encapsulationCode} label="Protect the invariant" />
    <h3>They are related, but different</h3>
    <ul><li><b>Abstraction asks:</b> what capability should callers see?</li><li><b>Encapsulation asks:</b> who may change this state, and through which rules?</li></ul>
    <p>A class with private fields and unrestricted setters hides representation but does little to protect invariants. A well-encapsulated account exposes <code>deposit()</code> rather than a <code>setBalance()</code> escape hatch.</p>
    <Callout title="Information hiding is the practical result">Callers depend on a stable contract, so the implementation can change without forcing unrelated code to change.</Callout>
  </div>;
}

function InheritancePolymorphismPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Inheritance lets a class extend another class and creates an <i>is-a</i> subtype relationship. Polymorphism means code written against a supertype can work with different subtype objects. For an overridden instance method, Java selects the implementation from the object’s runtime class.</p></div>
    <DispatchDiagram />
    <CodeBlock code={polymorphismCode} label="Runtime dispatch" />
    <h3>The substitutability test</h3>
    <p>A subtype should preserve the promises of its parent: it should not require stronger inputs, provide weaker results, or violate expected invariants. If callers must check the concrete subtype to use it safely, the hierarchy is probably misleading.</p>
    <Callout tone="warning" title="Fields are not polymorphic">Method overriding uses dynamic dispatch. Field access and static methods are resolved from the declared type; they are hidden, not overridden.</Callout>
  </div>;
}

function CompositionPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Prefer composition when one object uses another capability or when behavior should be replaceable independently. Use inheritance when the child is a true subtype that can honor the parent’s complete contract. Composition reduces coupling to superclass internals and avoids fragile hierarchies.</p></div>
    <CodeBlock code={compositionCode} label="HAS-A versus IS-A" />
    <h3>Choose composition when</h3>
    <ul><li>You want to combine policies such as retry, pricing, storage, or notification.</li><li>Behavior must vary at runtime or be easy to test with a substitute.</li><li>The proposed child would override methods merely to disable parent behavior.</li></ul>
    <h3>Inheritance can still be correct</h3>
    <p>It fits a stable semantic hierarchy with a deliberately designed extension contract—for example, framework hooks or a closed family of domain variants. Reusing a few lines of code alone is not a sufficient reason.</p>
  </div>;
}

function InterfacesAbstractClassesPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>An interface defines a role that unrelated classes can implement, and a class may implement multiple interfaces. An abstract class is a partially implemented base class: it may own instance state, constructors, protected helpers, and a shared lifecycle, but a class can extend only one class.</p></div>
    <CodeBlock code={interfaceAbstractCode} label="Role versus shared base" />
    <div className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><h3 className="mt-0">Choose an interface</h3><p>For a capability, multiple implementations, loose coupling, and multiple type roles. Interfaces may also have <code>default</code>, <code>static</code>, and private helper methods.</p></article>
      <article className="rounded-xl border border-amber-300 bg-amber-50 p-4"><h3 className="mt-0">Choose an abstract class</h3><p>When closely related subclasses need common state, construction rules, protected implementation, or a template-method lifecycle.</p></article>
    </div>
    <Callout title="A default method is not instance state">It can evolve an interface with shared behavior, but it cannot provide per-object fields or constructors. Use an abstract class when those are part of the design.</Callout>
  </div>;
}

function OverloadOverridePage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Overloading means several methods share a name but have different parameter lists; the compiler chooses a signature from the declared argument types. Overriding means a subtype replaces an inherited instance-method implementation; runtime dispatch chooses it from the actual object.</p></div>
    <CodeBlock code={dispatchCode} label="Compile time versus runtime" />
    <h3>Rules interviewers probe</h3>
    <ul><li>A return type alone cannot distinguish overloads.</li><li>An override must keep a compatible parameter signature and may use a covariant return type.</li><li>An override cannot reduce visibility or add broader checked exceptions.</li><li><code>private</code>, <code>static</code>, and <code>final</code> methods are not overridden.</li></ul>
    <Callout tone="tip" title="Use @Override">It asks the compiler to verify that the method really overrides a parent method and catches accidental signature changes.</Callout>
  </div>;
}

function PassByValuePage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Java is always pass-by-value. A method receives a copy of each argument value. For a primitive, the copied value is the primitive itself. For an object, the copied value is a reference, so the method can mutate the shared object but cannot replace the caller’s reference variable.</p></div>
    <ValuePassingDiagram />
    <CodeBlock code={passByValueCode} label="A copied reference value" />
    <h3>Why “pass-by-reference” is incorrect</h3>
    <p>In true pass-by-reference, assigning a new object to the parameter would also change the caller’s variable. Java does not do that: parameter <code>user</code> is a separate local variable containing a copied reference value.</p>
  </div>;
}

function PrimitiveReferencePage() {
  return <div className="article-copy">
    <div className="answer-card"><p>A primitive variable directly contains a language-level value such as an <code>int</code> or <code>boolean</code>. A reference variable contains either <code>null</code> or a reference to an object or array. Assigning either kind copies its value; copying a reference does not copy the referenced object.</p></div>
    <CodeBlock code={primitiveCode} label="What assignment copies" />
    <h3>Practical differences</h3>
    <ul><li>Primitives have fixed language-defined value ranges and cannot be <code>null</code>.</li><li>References enable objects, arrays, methods, inheritance, and identity comparison.</li><li>Local variables must be initialized before use; fields receive default values such as <code>0</code> or <code>null</code>.</li><li>Wrapper classes let primitive-like values participate in generics and nullable APIs, with boxing costs and null risks.</li></ul>
    <Callout title="Avoid oversimplified memory claims">The Java language specifies values and references, not “primitives are always on the stack and objects are always on the heap.” A JVM may optimize representation as long as observable behavior is preserved.</Callout>
  </div>;
}

function ExceptionTypesPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Checked exceptions are <code>Exception</code> subclasses other than <code>RuntimeException</code>; callers must catch them or declare them. Unchecked exceptions are <code>RuntimeException</code> subclasses, and <code>Error</code> types are also unchecked. Use checked exceptions when a caller can reasonably recover from a declared external failure; use unchecked exceptions for programming errors, invalid arguments, and broken invariants.</p></div>
    <CodeBlock code={exceptionsCode} label="Two error contracts" />
    <h3>Good exception design</h3>
    <ul><li>Preserve the cause when translating infrastructure exceptions into domain exceptions.</li><li>Catch an exception only where you can recover, add useful context, or convert the abstraction.</li><li>Do not use exceptions for ordinary control flow.</li><li>Do not catch <code>Exception</code> merely to log and continue with invalid state.</li></ul>
    <Callout tone="warning" title="Checked does not mean recoverable">The type hierarchy enforces handling syntax; it does not prove that recovery is possible. Choose the API contract from what callers can meaningfully do.</Callout>
  </div>;
}

function TryResourcesPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Try-with-resources automatically calls <code>close()</code> on every declared <code>AutoCloseable</code> resource, including when the body throws. Resources close in reverse declaration order. If the body and closing both fail, the body’s exception is thrown and close failures are retained as suppressed exceptions.</p></div>
    <ResourceDiagram />
    <CodeBlock code={resourcesCode} label="Deterministic cleanup" />
    <h3>Ownership is the key question</h3>
    <p>The scope that opens or acquires a resource normally owns closing it. Do not close a resource borrowed from a caller unless the API contract transfers ownership.</p>
    <Callout title="Effectively final resources">Since Java 9, a final or effectively final resource declared before the <code>try</code> can be referenced directly in the resource header.</Callout>
  </div>;
}

function CopyingPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>A shallow copy creates a new outer object while reusing references to nested objects. A deep copy creates independent copies of the mutable object graph that must not be shared. Deep is a design decision, not a universal recursive algorithm: immutable values can safely be shared.</p></div>
    <CopyDiagram />
    <CodeBlock code={copyingCode} label="Shared versus independent nested state" />
    <h3>Prefer explicit copying</h3>
    <p>Copy constructors, factories, and domain mapping make ownership clear. Java’s <code>clone()</code> is shallow by default, has awkward construction rules, and is usually less expressive for application models.</p>
    <Callout tone="tip" title="Often the better solution is immutability">If nested objects cannot change, sharing their references is safe and a costly deep copy is unnecessary.</Callout>
  </div>;
}

function ImmutableClassPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>An immutable object cannot have its observable state changed after construction. Make the class non-extendable or control subclassing, keep state private, initialize it completely, expose no mutators, validate invariants during construction, and defensively copy mutable inputs and outputs.</p></div>
    <CodeBlock code={immutableCode} label="Immutable aggregate boundary" />
    <h3>Immutability checklist</h3>
    <ol className="step-list"><li><b>Complete construction.</b><span>Reject invalid or null state immediately.</span></li><li><b>No writable aliases.</b><span>Snapshot caller-owned mutable inputs.</span></li><li><b>No mutable escape.</b><span>Return immutable views, copies, or immutable component values.</span></li><li><b>Stable behavior.</b><span>Methods return new values rather than changing <code>this</code>.</span></li></ol>
    <p>This example assumes <code>LineItem</code> is itself immutable. If it is mutable, copying only the list structure is insufficient: each element also needs an immutable representation or a defensive copy.</p>
    <Callout title="Thread safety becomes simpler">A properly constructed immutable object can be shared because readers never race with later mutation. Publication rules still matter when the reference itself is shared.</Callout>
  </div>;
}

function FinalIsNotImmutablePage() {
  return <div className="article-copy">
    <div className="answer-card"><p>No. A <code>final</code> field can be assigned only once, but if it contains a reference, the referenced object may still be mutable. Immutability requires the complete observable state to remain unchanged and requires preventing mutable aliases from entering or escaping.</p></div>
    <CodeBlock code={finalTrapCode} label="Final reference, mutable object" />
    <h3>Three separate guarantees</h3>
    <ul><li><code>final List&lt;...&gt;</code>: the field cannot point to another list after construction.</li><li><code>List.copyOf(...)</code>: the resulting list cannot be structurally modified through its API.</li><li>Immutable elements: objects inside the list also cannot expose changing state.</li></ul>
    <p>A record has final component fields, but it is only shallowly immutable. A record component such as <code>List&lt;String&gt;</code> still needs a defensive copy when the record is intended to be deeply immutable.</p>
  </div>;
}

function RecordsSealedPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Use a record for a transparent, fixed set of data components with value-based <code>equals()</code>, <code>hashCode()</code>, accessors, and <code>toString()</code> generated by the compiler. Use a sealed class or interface when the domain has a deliberately closed set of permitted subtypes and exhaustive handling is valuable.</p></div>
    <CodeBlock code={recordsCode} label="Closed value variants" />
    <h3>Records are a semantic choice</h3>
    <ul><li>They are implicitly final and cannot extend another application class.</li><li>Their state description is part of the public API.</li><li>They suit value carriers, messages, keys, and results; they are less suitable when representation must stay hidden or identity and lifecycle dominate.</li></ul>
    <h3>Sealed hierarchy rules</h3>
    <p>Each permitted direct subtype must declare itself <code>final</code>, <code>sealed</code>, or <code>non-sealed</code>. Permitted types must also satisfy the language’s package or module placement rules.</p>
    <Callout tone="warning" title="A record is shallowly immutable">The generated field for a mutable component is final, but the component object can still change unless you copy or restrict it.</Callout>
  </div>;
}

function StringImmutabilityPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>A <code>String</code> never changes its character sequence after construction. Operations that appear to modify it create or return another String. This makes strings safe to share and pool, stable as hash keys, naturally thread-safe as values, and suitable for security-sensitive names and class-loading data.</p></div>
    <CodeBlock code={stringImmutableCode} label="A new value, not a mutation" />
    <h3>Why the design matters</h3>
    <ul><li><b>Pooling:</b> equal literals can share one object without one caller changing another’s text.</li><li><b>Hashing:</b> a String key cannot become unreachable because its contents changed after insertion.</li><li><b>Concurrency:</b> readers require no synchronization to protect String contents.</li><li><b>Boundaries:</b> validated file names, URLs, and class names cannot be altered through another alias.</li></ul>
    <Callout title="Immutability does not mean every operation allocates">An implementation may reuse an existing String when the result is already correct. The guarantee is that callers never observe a String’s contents change.</Callout>
  </div>;
}

function StringPoolPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>String literals and constant string expressions are interned, so equal literals refer to one canonical pooled String. <code>new String(...)</code> explicitly creates a distinct object. <code>intern()</code> returns the canonical pooled reference for an equal character sequence; it does not change the existing object.</p></div>
    <StringPoolDiagram />
    <CodeBlock code={stringPoolCode} label="Pool, heap object, and intern" />
    <h3>What “heap string” means</h3>
    <p>All String instances are objects managed by the JVM. The important distinction in this example is canonical pooled identity versus a separately constructed identity, not a promise about a special physical memory region.</p>
    <Callout tone="warning" title="Do not use intern as a general cache">Interning retains canonical values and introduces a global pool decision. Use it only for a measured, bounded use case; ordinary application equality should use <code>equals()</code>.</Callout>
  </div>;
}

function StringEqualityPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Use <code>equals()</code> because it compares the characters that form the String value. <code>==</code> compares reference identity—whether both variables refer to the exact same object. Pooling can make <code>==</code> appear to work for literals, then fail for input or dynamically created strings.</p></div>
    <CodeBlock code={stringEqualityCode} label="Value versus identity" />
    <h3>Interview trap</h3>
    <p><code>hashCode()</code> does not participate in a direct <code>String.equals()</code> call. Hash-based collections use a hash to select a candidate bucket and then use <code>equals()</code> to decide value equality.</p>
    <Callout tone="tip" title="Know the intended comparison">Use <code>equals()</code> for exact content, <code>equalsIgnoreCase()</code> only for appropriate case-insensitive rules, and a <code>Collator</code> when locale-sensitive human-language ordering or comparison is required.</Callout>
  </div>;
}

function BuilderBufferPage() {
  return <div className="article-copy">
    <div className="answer-card"><p><code>StringBuilder</code> and <code>StringBuffer</code> are mutable character sequences backed by expandable storage. <code>StringBuilder</code> provides no synchronization and is the normal choice for local construction. <code>StringBuffer</code> synchronizes its methods for access to one shared instance, which adds coordination cost.</p></div>
    <BuilderDiagram />
    <CodeBlock code={buildersCode} label="Accumulate, then materialize" />
    <h3>Nuances</h3>
    <ul><li>The builder grows its internal capacity when needed; exact growth policy is an implementation detail.</li><li>The compiler may optimize simple <code>+</code> concatenation, so use readable <code>+</code> for a few parts.</li><li>Use a builder for loops or incremental construction.</li><li>A synchronized method does not make a multi-call workflow atomic; external coordination may still be required.</li></ul>
  </div>;
}

function BoxingCachingPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Autoboxing converts a primitive to its wrapper, conceptually using methods such as <code>Integer.valueOf()</code>; unboxing extracts the primitive value. Wrapper factories may reuse cached objects. Java requires caching for certain constant integral values from −128 through 127, so reference identity is an unsafe way to compare wrappers.</p></div>
    <CodeBlock code={boxingCode} label="Caching makes == misleading" />
    <h3>Runtime and correctness costs</h3>
    <ul><li>Boxing can allocate or retrieve wrapper objects and increases memory traffic in large collections.</li><li>Unboxing a <code>null</code> wrapper throws <code>NullPointerException</code>.</li><li><code>==</code> between two wrappers compares references; between a wrapper and primitive it normally unboxes and compares values.</li><li>Use primitive-specialized APIs such as <code>IntStream</code> in numeric hot paths when they improve clarity and measurement supports it.</li></ul>
    <Callout tone="warning" title="Cache size is not a business rule">Only rely on value equality through <code>equals()</code> or explicit primitive comparison. VM options and wrapper types may provide additional caching beyond the required minimum.</Callout>
  </div>;
}

function OptionalPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Use <code>Optional&lt;T&gt;</code> mainly as a return type when one result may legitimately be absent and callers should handle that possibility explicitly. Avoid using it indiscriminately for fields, method parameters, collection elements, or methods where an empty collection or domain-specific result communicates better.</p></div>
    <CodeBlock code={optionalCode} label="Model an optional result" />
    <h3>Use the API as a pipeline</h3>
    <ul><li><code>map()</code> transforms a present value.</li><li><code>flatMap()</code> avoids <code>Optional&lt;Optional&lt;T&gt;&gt;</code> when the mapping already returns Optional.</li><li><code>filter()</code> retains a present value only when it satisfies a predicate.</li><li><code>orElseThrow()</code> converts absence into an explicit exceptional contract.</li></ul>
    <Callout title="Optional is value-based">Do not synchronize on an Optional or rely on its object identity. Also never return <code>null</code> where the method promises an Optional; return <code>Optional.empty()</code>.</Callout>
  </div>;
}

function OrElsePage() {
  return <div className="article-copy">
    <div className="answer-card"><p><code>orElse(value)</code> receives an already evaluated fallback, so the expression that creates it runs before the method call even when the Optional is present. <code>orElseGet(supplier)</code> invokes its supplier only when the Optional is empty. Use <code>orElseGet()</code> for expensive, stateful, or side-effecting fallback creation.</p></div>
    <CodeBlock code={optionalFallbackCode} label="Eager versus lazy fallback" />
    <h3>A precise explanation</h3>
    <p>The difference is ordinary Java argument evaluation. In <code>orElse(loadFallback())</code>, Java must evaluate <code>loadFallback()</code> to obtain the argument before it can invoke <code>orElse</code>. In <code>orElseGet(this::loadFallback)</code>, it passes a Supplier object that Optional may choose to call later.</p>
    <Callout tone="tip" title="Use the simplest correct form">For a constant such as <code>orElse(&quot;unknown&quot;)</code>, eager evaluation is trivial and clear. Laziness matters when producing the alternative performs work.</Callout>
  </div>;
}

function BigDecimalPage() {
  return <div className="article-copy">
    <div className="answer-card"><p>Use <code>BigDecimal</code> for money because decimal amounts such as 0.1 cannot generally be represented exactly by binary floating-point, while BigDecimal stores an arbitrary-precision decimal value and gives explicit control over scale and rounding. Construct decimal constants from strings, define rounding rules, and include currency in the domain model.</p></div>
    <CodeBlock code={moneyCode} label="Exact decimal arithmetic" />
    <h3>Senior-level details</h3>
    <ul><li><code>BigDecimal</code> is immutable; operations return new values.</li><li>Division can be non-terminating and may require a scale and <code>RoundingMode</code>.</li><li><code>equals()</code> compares value and scale, so <code>2.0</code> differs from <code>2.00</code>; <code>compareTo()</code> compares numerical value.</li><li>Choose and enforce a scale policy at system boundaries. A decimal amount without currency is not a complete monetary value.</li></ul>
    <Callout tone="warning" title="Avoid new BigDecimal(double)">It captures the exact, often surprising binary floating-point value. Prefer a decimal string or <code>BigDecimal.valueOf(double)</code> when a double is unavoidable.</Callout>
    <h3>Rapid recap</h3>
    <div className="faq-list">
      <details><summary>Can final fields contain mutable state?</summary><p>Yes. Final prevents field reassignment; defensive copies and immutable components prevent observable mutation.</p></details>
      <details><summary>Does Java pass objects by reference?</summary><p>No. It passes a copied reference value. The shared object can be mutated, but the caller’s variable cannot be reassigned by the callee.</p></details>
      <details><summary>Why can == seem to work for Strings or Integers?</summary><p>String pooling and wrapper caching may reuse objects. The operator still compares reference identity, so use value comparison.</p></details>
      <details><summary>When is inheritance appropriate?</summary><p>When the child is substitutable for the parent and the base type intentionally defines a stable extension contract.</p></details>
    </div>
    <div className="sources">
      <p className="eyebrow">Primary references</p>
      <a href="https://docs.oracle.com/javase/specs/jls/se25/html/index.html" target="_blank" rel="noreferrer">Java Language Specification, Java SE 25 <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html" target="_blank" rel="noreferrer">String API and interning contract <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/AutoCloseable.html" target="_blank" rel="noreferrer">AutoCloseable and try-with-resources <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/language/records.html" target="_blank" rel="noreferrer">Record classes <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/language/sealed-classes-interfaces.html" target="_blank" rel="noreferrer">Sealed classes and interfaces <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Optional.html" target="_blank" rel="noreferrer">Optional API <ArrowRight /></a>
      <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html" target="_blank" rel="noreferrer">BigDecimal API <ArrowRight /></a>
    </div>
  </div>;
}

export const javaFundamentalsPages: ReadingPage[] = [
  { id: 'object-design-roadmap', chapter: 'Object design', title: 'The object-oriented mental model', Content: FundamentalsOverviewPage },
  { id: 'abstraction-encapsulation', chapter: 'Object design', title: 'Abstraction and encapsulation', Content: AbstractionEncapsulationPage },
  { id: 'inheritance-polymorphism', chapter: 'Object design', title: 'Inheritance and polymorphism', Content: InheritancePolymorphismPage },
  { id: 'composition-inheritance', chapter: 'Object design', title: 'Composition versus inheritance', Content: CompositionPage },
  { id: 'interfaces-abstract-classes', chapter: 'Type design', title: 'Interfaces and abstract classes', Content: InterfacesAbstractClassesPage },
  { id: 'overloading-overriding', chapter: 'Method dispatch', title: 'Overloading versus overriding', Content: OverloadOverridePage },
  { id: 'pass-by-value', chapter: 'Values and references', title: 'Java is always pass-by-value', Content: PassByValuePage },
  { id: 'primitive-reference-types', chapter: 'Values and references', title: 'Primitive and reference types', Content: PrimitiveReferencePage },
  { id: 'exception-types', chapter: 'Failure design', title: 'Checked and unchecked exceptions', Content: ExceptionTypesPage },
  { id: 'try-with-resources', chapter: 'Failure design', title: 'How try-with-resources works', Content: TryResourcesPage },
  { id: 'shallow-deep-copy', chapter: 'Object ownership', title: 'Shallow and deep copying', Content: CopyingPage },
  { id: 'immutable-design', chapter: 'Object ownership', title: 'Designing an immutable class', Content: ImmutableClassPage },
  { id: 'final-not-immutable', chapter: 'Object ownership', title: 'Why final does not guarantee immutability', Content: FinalIsNotImmutablePage },
  { id: 'records-sealed', chapter: 'Domain modeling', title: 'Records and sealed classes', Content: RecordsSealedPage },
  { id: 'string-immutability', chapter: 'Strings', title: 'Why String is immutable', Content: StringImmutabilityPage },
  { id: 'string-pool', chapter: 'Strings', title: 'Literals, new String(), and intern()', Content: StringPoolPage },
  { id: 'string-equality', chapter: 'Strings', title: 'String equals() versus ==', Content: StringEqualityPage },
  { id: 'builders-buffers', chapter: 'Strings', title: 'StringBuilder versus StringBuffer', Content: BuilderBufferPage },
  { id: 'boxing-caching', chapter: 'Boxed values', title: 'Autoboxing and wrapper caching', Content: BoxingCachingPage },
  { id: 'optional', chapter: 'Optional values', title: 'When Optional should be used', Content: OptionalPage },
  { id: 'optional-fallbacks', chapter: 'Optional values', title: 'orElse() versus orElseGet()', Content: OrElsePage },
  { id: 'bigdecimal-money', chapter: 'Numeric design', title: 'BigDecimal for money and final recap', Content: BigDecimalPage },
];
