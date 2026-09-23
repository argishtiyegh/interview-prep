'use client';

import { createTopicPages, type TopicPageSpec } from '@/components/answers/topic-page';

const specs: TopicPageSpec[] = [
  {
    id: 'ioc-di', chapter: 'Container fundamentals', title: 'Inversion of control and dependency injection',
    answer: 'Inversion of control means application code does not construct and wire its whole object graph. It declares components and dependencies, then the Spring container creates objects and supplies their collaborators. Dependency injection is the concrete mechanism used to provide those collaborators.',
    flow: ['Read bean definitions', 'Build dependency graph', 'Create dependencies', 'Inject collaborators'],
    sections: [{ title: 'Why this helps', bullets: ['Construction policy is separated from business behavior.', 'Implementations can be replaced through configuration or tests.', 'Lifecycle, scopes, proxies, and cross-cutting behavior can be applied consistently.'] }],
    code: ['@Service', 'final class CheckoutService {', '    private final PaymentGateway gateway;', '', '    CheckoutService(PaymentGateway gateway) {', '        this.gateway = gateway;', '    }', '}'].join('\n'), codeLabel: 'Constructor injection',
    callout: { title: 'IoC is broader than DI', text: 'The container also controls lifecycle callbacks, scope, event delivery, post-processing, proxy creation, and shutdown.', tone: 'tip' },
  },
  {
    id: 'constructor-injection', chapter: 'Container fundamentals', title: 'Why constructor injection is preferred',
    answer: 'Constructor injection makes required dependencies explicit, allows fields to be final, and prevents creation of an invalid partially initialized object. A single constructor is automatically used by Spring without requiring @Autowired.',
    comparisons: [
      { title: 'Constructor', text: 'Best for required dependencies. The object is valid after construction and easy to instantiate in a plain unit test.' },
      { title: 'Setter', text: 'Useful for a truly optional or replaceable dependency, but the object must define behavior before the setter is called.' },
      { title: 'Field', text: 'Hides requirements, prevents final fields, requires reflection, and makes non-container tests awkward.' },
      { title: 'Too many parameters', text: 'Usually a design signal that the class has too many responsibilities; it is not a reason to hide dependencies.' },
    ],
    callout: { title: 'Circular dependencies become visible', text: 'Constructor cycles cannot be satisfied normally. Redesign responsibilities or introduce a boundary rather than using field injection to disguise the cycle.', tone: 'warning' },
  },
  {
    id: 'bean-lifecycle', chapter: 'Container fundamentals', title: 'How Spring creates and manages beans',
    answer: 'The ApplicationContext discovers bean definitions, resolves dependencies, instantiates beans, populates properties, runs aware callbacks and BeanPostProcessors, invokes initialization callbacks, and exposes the final object—often a proxy. On shutdown it invokes destruction callbacks for managed singleton beans.',
    flow: ['Definition', 'Instantiate and inject', 'Post-process and initialize', 'Expose bean or proxy'],
    sections: [
      { title: 'Definition sources', text: 'Component scanning finds stereotype annotations; @Bean methods and imported configuration register explicit definitions; auto-configuration contributes conditional definitions.' },
      { title: 'Post-processors matter', text: 'BeanFactoryPostProcessor changes definitions before instances exist. BeanPostProcessor can wrap or replace instances and is the extension point behind many annotations and proxies.' },
      { title: 'Lifecycle callbacks', bullets: ['@PostConstruct or InitializingBean after injection.', 'Custom initMethod after standard initialization callbacks.', '@PreDestroy, DisposableBean, or destroyMethod when the context closes.'] },
    ],
    callout: { title: 'The injected object may be a proxy', text: 'Transactional, asynchronous, caching, security, and scoped behavior frequently comes from a wrapper created by a post-processor.', tone: 'info' },
  },
  {
    id: 'bean-scopes', chapter: 'Container fundamentals', title: 'Bean scopes and scoped dependencies',
    answer: 'Singleton is the default: one bean instance per ApplicationContext and bean definition. Prototype creates a new instance whenever the container resolves it. Web scopes bind instances to an HTTP request, session, application, or WebSocket lifecycle.',
    comparisons: [
      { title: 'singleton', text: 'One shared instance in the container. It must be stateless or make shared mutable state thread-safe.' },
      { title: 'prototype', text: 'A new instance per lookup or injection request. Spring creates it but does not manage its complete destruction lifecycle.' },
      { title: 'request', text: 'One instance for one HTTP request. Inject into a singleton through a scoped proxy or ObjectProvider.' },
      { title: 'session / application / websocket', text: 'Lives for the corresponding web scope; use only when that lifetime accurately owns the state.' },
    ],
    code: ['@Bean', '@RequestScope', 'RequestContext requestContext() {', '    return new RequestContext();', '}', '', '// A scoped proxy can defer the real request bean lookup', '// until a singleton invokes it during an active request.'].join('\n'),
    callout: { title: 'Singleton is not the GoF singleton', text: 'Spring guarantees one managed instance per context and bean definition, not one Java object for the entire JVM.', tone: 'warning' },
  },
  {
    id: 'auto-configuration', chapter: 'Spring Boot', title: 'How Spring Boot auto-configuration works',
    answer: '@SpringBootApplication combines configuration, component scanning, and auto-configuration. Boot imports candidate auto-configuration classes, evaluates conditions against the classpath, properties, beans, and application type, then registers only the definitions whose conditions match.',
    flow: ['Starter adds classpath', 'Auto-config candidates imported', 'Conditions evaluated', 'Missing infrastructure beans created'],
    sections: [
      { title: 'Back-off behavior', text: 'Many configurations use @ConditionalOnMissingBean. Defining your own bean makes the default configuration step aside rather than creating a duplicate.' },
      { title: 'Conditions', bullets: ['@ConditionalOnClass checks libraries.', '@ConditionalOnProperty checks configuration.', '@ConditionalOnBean and @ConditionalOnMissingBean check the graph.', '@ConditionalOnWebApplication checks application type.'] },
    ],
    code: ['# Explain why configurations matched or did not match', 'java -jar app.jar --debug', '', '# Actuator exposes the same condition report when enabled', 'curl -s http://localhost:8080/actuator/conditions'].join('\n'), codeLabel: 'Auto-configuration diagnostics',
    callout: { title: 'Boot does not scan every library class', text: 'Auto-configuration candidates are declared by framework metadata and guarded by conditions. Component scanning remains rooted in your application package.', tone: 'info' },
  },
  {
    id: 'proxy-types', chapter: 'Proxy mechanics', title: 'JDK proxies and class-based proxies',
    answer: 'Spring AOP applies advice through a proxy. A JDK dynamic proxy implements one or more interfaces and intercepts interface calls. A class-based proxy subclasses the target class and overrides interceptable methods. Both require callers to enter through the proxy.',
    comparisons: [
      { title: 'JDK dynamic proxy', text: 'Interface-based, created by java.lang.reflect.Proxy. The exposed type is the interface, so callers should program to it.' },
      { title: 'Class-based proxy', text: 'Subclasses the concrete class. Final classes and final or private methods cannot be overridden and therefore cannot be advised this way.' },
    ],
    sections: [{ title: 'What is actually intercepted', text: 'The proxy receives a method call, runs an interceptor chain, invokes the target, then runs completion or error advice. Transaction, async, caching, method security, and retry features often use this model.' }],
    callout: { title: 'Proxy limitations are design constraints', text: 'Do not assume an annotation changes bytecode inside the method. Proxy advice runs only when an eligible invocation crosses the proxy boundary.', tone: 'warning' },
  },
  {
    id: 'self-invocation', chapter: 'Proxy mechanics', title: 'Why self-invocation breaks transactional and async advice',
    answer: 'When one method calls another method with this.someMethod(), the call remains inside the target object and never re-enters the Spring proxy. Proxy-based @Transactional, @Async, @Cacheable, and similar advice therefore does not run for that internal call.',
    flow: ['External caller', 'Spring proxy', 'Advised method', 'Target object'],
    code: ['@Service', 'class BillingService {', '    void checkout() {', '        charge(); // direct call on this; proxy advice is bypassed', '    }', '', '    @Transactional', '    public void charge() { /* database work */ }', '}', '', '// Preferred: move charge() to a separate injected service', '// so checkout() calls through that service proxy.'].join('\n'),
    sections: [{ title: 'Reliable fixes', bullets: ['Move the advised operation to another bean with a clear responsibility.', 'Place the annotation on the externally invoked boundary method.', 'Use AspectJ weaving only when its different complexity and semantics are justified.', 'Avoid self-injection as the default solution; it hides the design boundary.'] }],
  },
  {
    id: 'web-cross-cutting', chapter: 'Spring MVC', title: 'Filters, interceptors, and controller advice',
    answer: 'A servlet Filter surrounds the servlet layer and can act before Spring MVC. A HandlerInterceptor surrounds handler selection and controller execution inside MVC. Controller advice applies controller-oriented concerns such as exception mapping, binding, and shared model behavior.',
    comparisons: [
      { title: 'Filter', text: 'Servlet API level. Good for request wrapping, correlation IDs, low-level logging, CORS, and security-chain integration.' },
      { title: 'HandlerInterceptor', text: 'Spring MVC level. Has handler metadata and preHandle, postHandle, and afterCompletion hooks.' },
      { title: '@RestControllerAdvice', text: 'Controller exception and response concern. Converts exceptions into consistent HTTP responses.' },
      { title: 'AOP advice', text: 'Method invocation concern across application beans; it does not understand the full servlet lifecycle by default.' },
    ],
    callout: { title: 'Choose the lowest layer that has the context you need', text: 'Authentication may belong in Spring Security filters; controller authorization usually belongs in Security configuration or method security, not a custom interceptor.', tone: 'tip' },
  },
  {
    id: 'mvc-pipeline', chapter: 'Spring MVC', title: 'How an MVC request reaches a controller',
    answer: 'The servlet container runs filters and delegates to DispatcherServlet. DispatcherServlet asks HandlerMappings for a handler, applies interceptors, invokes it through a HandlerAdapter, resolves arguments, validates data, handles the return value, and writes the response through an HttpMessageConverter.',
    flow: ['Filters and DispatcherServlet', 'HandlerMapping + interceptors', 'Argument resolution + controller', 'Return value + message converter'],
    sections: [
      { title: 'Before the method', bullets: ['Route patterns and HTTP methods select the handler.', 'Argument resolvers build @PathVariable, @RequestParam, request bodies, principals, and framework arguments.', 'Data binding and Bean Validation can reject invalid input.'] },
      { title: 'After the method', bullets: ['Return-value handlers interpret ResponseEntity, bodies, views, and asynchronous types.', 'Content negotiation chooses a compatible representation.', 'HttpMessageConverters serialize the body; exception resolvers delegate to @ExceptionHandler and advice.'] },
    ],
  },
  {
    id: 'profiles-properties', chapter: 'Configuration', title: 'Profiles and configuration properties',
    answer: 'Profiles conditionally activate bean definitions or configuration documents. Externalized configuration supplies values through ordered property sources. @ConfigurationProperties binds a related namespace into a typed, validated object and is preferable to scattering individual @Value expressions.',
    code: ['@ConfigurationProperties("payments")', 'public record PaymentProperties(', '        URI endpoint,', '        @DurationMin(seconds = 1) Duration timeout,', '        @Min(1) int maxAttempts) {}', '', '# application-prod.yml', 'payments:', '  endpoint: https://payments.internal', '  timeout: 3s', '  max-attempts: 2'].join('\n'), codeLabel: 'Typed configuration',
    sections: [
      { title: 'Profiles select environments, not every feature', text: 'Use profiles for broad environment groups. Use ordinary properties or conditional beans for independent features; a growing matrix of profile names becomes hard to reason about.' },
      { title: 'Precedence matters', text: 'Command-line arguments, environment variables, system properties, external files, profile-specific documents, and packaged defaults have an intentional override order. Inspect the Environment rather than guessing.' },
    ],
    callout: { title: 'Keep secrets outside source control', text: 'Bind secret values from the runtime environment or a secret manager. A profile is not a security boundary.', tone: 'warning' },
  },
  {
    id: 'graceful-shutdown', chapter: 'Operations', title: 'How graceful shutdown works',
    answer: 'On a controlled shutdown, Spring Boot stops accepting new work at the web server, allows in-flight requests to finish within the configured phase timeout, closes the ApplicationContext, and invokes lifecycle and destruction callbacks. The process still needs enough orchestrator grace time to complete this sequence.',
    flow: ['SIGTERM', 'Readiness becomes unavailable', 'Drain in-flight work', 'Close context and process'],
    code: ['server.shutdown=graceful', 'spring.lifecycle.timeout-per-shutdown-phase=30s', '', '# Kubernetes must allow more than the application timeout', 'terminationGracePeriodSeconds: 45'].join('\n'), codeLabel: 'Shutdown configuration',
    sections: [{ title: 'What can still go wrong', bullets: ['A hard kill bypasses cleanup.', 'Long or unbounded requests exceed the deadline.', 'Background executors must participate in lifecycle shutdown.', 'Readiness removal and load-balancer propagation need time before termination.'] }],
  },
  {
    id: 'actuator', chapter: 'Operations', title: 'What Spring Boot Actuator provides',
    answer: 'Actuator adds production-oriented endpoints and integrations for health, readiness, liveness, metrics, environment, configuration properties, loggers, mappings, beans, conditions, thread dumps, heap dumps, startup data, and more. Exposure and security must be configured deliberately.',
    code: ['# Maven dependency', '<dependency>', '  <groupId>org.springframework.boot</groupId>', '  <artifactId>spring-boot-starter-actuator</artifactId>', '</dependency>', '', '# Expose only required web endpoints', 'management.endpoints.web.exposure.include=health,info,metrics,prometheus', 'management.endpoint.health.probes.enabled=true', '', 'curl -s http://localhost:8080/actuator/health/readiness', 'curl -s http://localhost:8080/actuator/metrics/http.server.requests'].join('\n'), codeLabel: 'Install and inspect Actuator',
    sections: [{ title: 'Operational rules', bullets: ['Keep sensitive endpoints private and authenticated.', 'Use Micrometer metrics and tracing for trends; an endpoint snapshot is not monitoring.', 'Separate liveness from readiness: liveness answers whether to restart, readiness whether to receive traffic.', 'Avoid making liveness depend on every external system, which can trigger restart storms.'] }],
  },
  {
    id: 'mvc-model', chapter: 'Web stacks', title: 'When Spring MVC is the right model',
    answer: 'Use Spring MVC when the application and its libraries are primarily blocking, the team benefits from imperative code, and thread-per-request resource use fits the workload. It is the simplest default for typical database-backed services using JDBC or blocking JPA.',
    sections: [{ title: 'Strengths', bullets: ['Straight-line debugging and familiar exception flow.', 'Broad compatibility with blocking Java libraries.', 'Natural fit for JDBC, JPA, and synchronous clients.', 'Can use platform threads or virtual threads depending on the runtime and Boot configuration.'] }, { title: 'Limits', text: 'A blocked platform thread consumes stack and scheduler resources. Large numbers of slow concurrent I/O requests can require many threads and careful pool sizing.' }],
  },
  {
    id: 'webflux-model', chapter: 'Web stacks', title: 'When WebFlux is the right model',
    answer: 'Use WebFlux when the request path is nonblocking end to end, concurrency is very high, and streaming or backpressure is central. Reactor represents completion and data flow as Publisher types instead of blocking the current thread.',
    flow: ['Event-loop receives data', 'Reactive chain schedules work', 'Nonblocking client waits by callback', 'Demand controls emission'],
    sections: [{ title: 'The nonblocking requirement', text: 'Calling blocking JDBC, filesystem, or remote clients on an event-loop thread removes the main scalability benefit and can stall many requests. Isolate unavoidable blocking work on a bounded scheduler, but prefer a coherent stack.' }, { title: 'Costs', bullets: ['Reactive stack traces and context propagation require specific tooling.', 'Operators have lifecycle and cancellation semantics that teams must understand.', 'ThreadLocal assumptions do not automatically follow reactive execution.'] }],
    callout: { title: 'Reactive is not automatically faster', text: 'It changes how waiting is represented. CPU work still needs CPU, and a blocking dependency still limits throughput.', tone: 'warning' },
  },
  {
    id: 'virtual-thread-mvc', chapter: 'Web stacks', title: 'Virtual-thread-based MVC',
    answer: 'Virtual threads let blocking-style MVC handle many concurrent waiting tasks with far lower per-thread cost than platform threads. They improve concurrency for I/O-bound work while preserving imperative code; they do not make CPU-bound work faster or remove database and downstream limits.',
    code: ['# Spring Boot support for virtual threads', 'spring.threads.virtual.enabled=true', '', '// Blocking code remains readable, but concurrency still needs limits:', '// connection pool, HTTP client pool, downstream rate, and memory.'].join('\n'),
    sections: [{ title: 'Pinning and monitoring', text: 'Modern JDKs have reduced common pinning cases, but native calls and synchronization patterns still deserve observation. Thread dumps and JFR should be used to understand waiting and contention.' }, { title: 'Resource limits remain', text: 'Ten thousand virtual threads cannot use a 30-connection database pool simultaneously. Bound admission or downstream calls instead of allowing queues to grow without limit.' }],
  },
  {
    id: 'web-stack-choice', chapter: 'Web stacks', title: 'Choosing MVC, WebFlux, or virtual-thread MVC',
    answer: 'Choose from the complete dependency path and operational model. Blocking JPA usually favors MVC; very high concurrency with nonblocking drivers and streaming may favor WebFlux; blocking I/O with simple imperative code can benefit from virtual-thread MVC.',
    comparisons: [
      { title: 'MVC + platform threads', text: 'Best-established model; choose when concurrency and blocking duration are moderate.' },
      { title: 'MVC + virtual threads', text: 'Imperative code with many I/O waits; still enforce downstream concurrency and test library compatibility.' },
      { title: 'WebFlux', text: 'End-to-end nonblocking pipelines, streaming, and backpressure; requires reactive expertise and compatible dependencies.' },
      { title: 'Decision evidence', text: 'Measure throughput, tail latency, memory, connection-pool waits, CPU, failure behavior, and debugging cost under production-like load.' },
    ],
  },
  {
    id: 'boot4-baseline', chapter: 'Boot 4 migration', title: 'Spring Boot 3 to 4: baseline changes',
    answer: 'Migrate first to the latest Spring Boot 3.5 maintenance release, remove deprecated API use, then move to a current Boot 4 release. Boot 4 requires Java 17 or later, Spring Framework 7, Jakarta EE 11, and Servlet 6.1; compatible versions of Spring Cloud and other portfolio projects must be selected together.',
    sections: [{ title: 'Before changing the version', bullets: ['Inventory direct and transitive dependencies and custom starters.', 'Compile with deprecation warnings and remove deprecated calls.', 'Confirm Java, build tool, servlet container, Kotlin, GraalVM, and Spring portfolio compatibility.', 'Record integration tests, startup conditions, endpoint behavior, serialization, security, and observability baselines.'] }],
    callout: { title: 'Do not jump directly from an old 3.x release', text: 'Moving to the latest 3.5.x first separates accumulated 3.x changes from the Boot 4 major-version changes.', tone: 'warning' },
  },
  {
    id: 'boot4-modules', chapter: 'Boot 4 migration', title: 'Boot 4 modularization and application changes',
    answer: 'Boot 4 splits functionality into more focused modules and reorganizes packages. Several starters were renamed, including spring-boot-starter-web to spring-boot-starter-webmvc. Classic starters can temporarily restore a broad classpath, but the target state should use precise modules and updated imports.',
    sections: [{ title: 'Review carefully', bullets: ['Package moves and renamed starters or auto-configuration modules.', 'Removed Boot 3 deprecations and changed configuration properties.', 'Jakarta EE 11 and Servlet 6.1 compatibility.', 'Jackson 3 migration and changed JSON customization APIs.', 'Test annotations and test module changes.', 'Custom auto-configurations, starters, imports, and configuration metadata.'] }],
    code: ['# Temporary migration aid; remove after properties are corrected', '<dependency>', '  <groupId>org.springframework.boot</groupId>', '  <artifactId>spring-boot-properties-migrator</artifactId>', '  <scope>runtime</scope>', '</dependency>', '', '# Compare resolved dependencies', './mvnw dependency:tree', './gradlew dependencies'].join('\n'), codeLabel: 'Migration diagnostics',
  },
  {
    id: 'spring-diagnostics', chapter: 'Operations', title: 'Spring diagnostic toolkit',
    answer: 'Diagnose Spring from the layer that owns the symptom: condition reports for startup and bean selection, Actuator for runtime state, application startup recording for slow initialization, mappings for routing, metrics for trends, and thread or heap evidence for JVM-level failures.',
    code: ['# Startup and condition decisions', './mvnw spring-boot:run -Dspring-boot.run.arguments=--debug', '', '# Runtime inspection; protect these endpoints', 'curl -s localhost:8080/actuator/health', 'curl -s localhost:8080/actuator/conditions', 'curl -s localhost:8080/actuator/beans', 'curl -s localhost:8080/actuator/mappings', 'curl -s localhost:8080/actuator/configprops', 'curl -s localhost:8080/actuator/threaddump', '', '# Useful logging while diagnosing selected areas', 'logging.level.org.springframework.web=DEBUG', 'logging.level.org.springframework.transaction=TRACE'].join('\n'), codeLabel: 'Practical commands',
    callout: { title: 'Do not expose diagnostics publicly', text: 'Environment, beans, configuration, loggers, heap dumps, and thread dumps can disclose sensitive data. Restrict network access and authentication.', tone: 'warning' },
  },
  {
    id: 'spring-recap', chapter: 'Interview recap', title: 'Spring and Spring Boot interview recap',
    answer: 'A strong Spring answer connects container ownership, bean lifecycle, proxy boundaries, web request flow, configuration, and operational evidence. Explain where behavior is applied and which boundary a call must cross; annotations alone are not the mechanism.',
    sections: [{ title: 'Rapid checks', bullets: ['Constructor injection expresses a valid required object graph.', 'Singleton scope means shared state and therefore a thread-safety obligation.', 'Auto-configuration is conditional and backs off when user beans exist.', 'Self-invocation bypasses proxy advice.', 'Filters, interceptors, and controller advice operate at different layers.', 'Choose the web model from the complete I/O path, not fashion.', 'Treat Boot 4 as a dependency-platform and module migration, not only a version edit.'] }],
    links: [
      { label: 'Spring Framework reference', href: 'https://docs.spring.io/spring-framework/reference/' },
      { label: 'Spring Boot reference', href: 'https://docs.spring.io/spring-boot/' },
      { label: 'Spring Boot 4 migration guide', href: 'https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide' },
    ],
  },
];

export const springBootPages = createTopicPages(specs);
