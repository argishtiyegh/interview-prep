'use client';

import { createTopicPages, type TopicPageSpec } from './topic-page';

const specs: TopicPageSpec[] = [
  { id:'architecture-shapes', chapter:'Architecture foundations', title:'Monolith, modular monolith, and microservices', answer:'A monolith deploys one application. A modular monolith keeps that deployment but enforces internal module boundaries. Microservices split business capabilities into independently deployable services that usually own their data.', comparisons:[
    {title:'Monolith',text:'Simplest deployment and local calls, but weak boundaries can turn changes into whole-application coordination.'},
    {title:'Modular monolith',text:'One process and transaction boundary, with explicit APIs between modules. Often the best starting point.'},
    {title:'Microservices',text:'Independent deployment and scaling, paid for with network failures, eventual consistency, observability, and operational overhead.'}
  ], callout:{title:'Senior judgment',text:'Prefer the simplest architecture that meets current constraints. Microservices solve organizational and independent-change problems; they are not a default upgrade.'} },
  { id:'when-split', chapter:'Architecture foundations', title:'When to stay modular and when to split', answer:'Start with a modular monolith when the domain or team boundaries are still changing. Split a module when independent deployment, scaling, reliability isolation, ownership, or technology needs produce measurable value.', sections:[
    {title:'Good reasons to extract',bullets:['A capability has a stable business boundary and clear data ownership.','Its release cadence or scaling profile differs materially.','A team can own it end to end, including production support.']},
    {title:'Warning signs',bullets:['Services share tables or must deploy together.','Most requests cross many services synchronously.','A small team spends more time operating infrastructure than delivering product behavior.']}
  ]},
  { id:'communication', chapter:'Communication', title:'Synchronous calls, messaging, REST, and gRPC', answer:'Use synchronous communication when the caller needs an immediate result. Use messaging when work can happen later, multiple consumers need the fact, or temporal decoupling matters. REST favors broad interoperability; gRPC favors typed, efficient internal calls.', comparisons:[
    {title:'Request and response',text:'Simple control flow and immediate errors, but the caller inherits downstream latency and availability.'},
    {title:'Messaging',text:'Buffers bursts and decouples availability, but introduces duplicates, reordering, lag, and eventual consistency.'}
  ], flow:['Caller sends request','Gateway or discovery routes','Service performs work','Response returns'], callout:{title:'Design rule',text:'Do not choose messaging merely to remove a direct call. Choose it only when asynchronous semantics are acceptable.'} },
  { id:'state-scaling', chapter:'Scalability', title:'Stateless services and horizontal scaling', answer:'A stateless instance keeps no request-specific durable state in its own memory or disk. Any healthy instance can handle the next request, so a load balancer can spread traffic and replace failed instances.', sections:[
    {title:'Horizontal versus vertical',text:'Vertical scaling gives one machine more CPU or memory. Horizontal scaling adds instances. Horizontal scaling improves capacity and fault tolerance but requires shared state to live in a database, cache, object store, or token.'},
    {title:'Stateful does not mean wrong',text:'Databases and stream processors are intentionally stateful. They scale through replication, partitioning, and carefully managed ownership rather than arbitrary request routing.'}
  ], flow:['Client','Load balancer','Stateless instances','Shared durable state'] },
  { id:'discovery-autoscaling', chapter:'Scalability', title:'Discovery, load balancing, and autoscaling', answer:'Service discovery tells clients or load balancers which instances exist. Load balancing chooses a healthy instance. Autoscaling changes the number of instances from demand signals; these mechanisms solve different parts of the routing loop.', sections:[
    {title:'Why health matters',text:'A registry entry is not proof that an instance can serve traffic. Readiness checks prevent routing to starting or overloaded instances, while failure detection removes unhealthy ones.'},
    {title:'Autoscaling nuance',text:'CPU is not always the correct signal. Queue lag, request concurrency, latency, or custom work metrics may track capacity better. Scaling also has delay, so queues and admission control still matter.'}
  ]},
  { id:'caching-levels', chapter:'Data and performance', title:'Local, distributed, and database caching', answer:'Local caches are fastest but duplicated and hard to invalidate. Distributed caches share a view across instances but add a network dependency. Database caches are managed by the database and reduce storage work without removing query or connection costs.', comparisons:[
    {title:'Cache-aside',text:'Application reads cache, loads a miss from the database, then stores it. Simple and common, with a stale-data window.'},
    {title:'Read/write-through',text:'A cache layer loads or writes the backing store. It centralizes policy but adds infrastructure behavior the application must understand.'}
  ], callout:{title:'Correctness first',text:'A cache is a disposable copy. Define the source of truth, staleness tolerance, invalidation, and behavior when the cache is down.'} },
  { id:'data-ownership', chapter:'Service boundaries', title:'Database per service and cross-service views', answer:'Database-per-service means a service owns its schema and other services use its API or events. It protects autonomy. A shared database makes joins and transactions easy, but couples releases, schemas, and failure domains.', sections:[
    {title:'Combining data',bullets:['API composition queries services and combines current responses.','A materialized view consumes events into a read model optimized for the query.','A reporting pipeline copies data into an analytical store.']},
    {title:'Boundary test',text:'A service boundary should surround a cohesive business capability and its invariants. Splitting entities or technical layers usually creates chatty services and distributed transactions.'}
  ]},
  { id:'events-cqrs', chapter:'Service boundaries', title:'Events, CQRS, and separate read models', answer:'An event states a completed fact; a command asks one owner to perform an action. CQRS separates the write model that protects invariants from read models shaped for queries. Separate storage is optional, not the definition.', flow:['Command','Write model validates','Event is published','Read model updates'], sections:[
    {title:'When CQRS earns its cost',text:'Use it when read and write shapes, scale, or consistency needs differ substantially. A CRUD system rarely benefits from extra models, pipelines, and lag.'},
    {title:'Consistency consequence',text:'Read models update after the write commits, so the UI may need read-your-own-write handling, progress states, or a version token.'}
  ]},
  { id:'gateway', chapter:'Edge architecture', title:'API gateway and backend for frontend', answer:'An API gateway is the entry point for routing and cross-cutting edge concerns. A backend for frontend is tailored to one client experience, such as mobile or web, and composes data in the shape that client needs.', sections:[
    {title:'Gateway responsibilities',bullets:['TLS termination, authentication enforcement, routing, rate limits, request IDs, and coarse observability.','Avoid business workflows and large domain transformations; they make the gateway a coupled bottleneck.']},
    {title:'BFF tradeoff',text:'A BFF reduces client chatter and isolates client-specific change, but duplicated BFF logic must not become duplicated domain logic.'}
  ]},
  { id:'resilience', chapter:'Resilience', title:'Timeouts, circuit breakers, bulkheads, and degradation', answer:'Timeouts bound waiting. Circuit breakers stop calls to a dependency that is repeatedly failing. Bulkheads cap the resources one dependency can consume. Graceful degradation returns a reduced but useful response when an optional capability is unavailable.', flow:['Bound every call','Retry only safe failures','Open circuit on repeated failure','Serve fallback or fail fast'], sections:[
    {title:'They are complementary',text:'A circuit breaker without a timeout still waits too long. A timeout without a bulkhead can still exhaust every worker. A fallback must be semantically safe, not fabricated success.'}
  ]},
  { id:'cap-consistency', chapter:'Distributed data', title:'CAP, strong consistency, and eventual consistency', answer:'During a network partition, a distributed system cannot guarantee both that every response reflects the latest write and that every request receives a successful response. CAP is about partition behavior, not a permanent binary label for an entire product.', comparisons:[
    {title:'Strong consistency',text:'A completed write is visible to later reads under the promised model. It simplifies invariants but may add coordination and reduce availability.'},
    {title:'Eventual consistency',text:'Replicas or read models may temporarily differ but converge when updates stop. The product must expose lag safely.'}
  ]},
  { id:'distributed-monolith', chapter:'Evolution', title:'Avoiding a distributed monolith', answer:'A distributed monolith has service-shaped deployments but monolith-shaped coupling: shared data, lockstep releases, long synchronous chains, and unclear ownership.', sections:[
    {title:'Migration path',bullets:['Make module boundaries explicit first.','Measure coupling and extract one stable capability behind an API.','Move data ownership and integration contracts with it.','Run the old and new paths safely, then remove the old path.']},
    {title:'When migration is justified',text:'The operational cost is justified when independent teams and releases, isolated scaling, or reliability boundaries deliver durable business value.'}
  ], callout:{title:'Interview close',text:'Name the business boundary, owner, data, consistency model, failure behavior, and reason independent deployment is valuable.'} },
  { id:'architecture-recap', chapter:'Daily recap', title:'Architecture selection checklist', answer:'Start from constraints and failure modes, then choose boundaries and communication. Architecture is a set of tradeoffs that must remain operable.', sections:[
    {title:'Ask in order',bullets:['What must be independently changed or scaled?','Who owns each invariant and its data?','Which calls require immediate answers?','What happens when a dependency is slow or unavailable?','Where is eventual consistency acceptable?','How will the system be deployed, observed, and recovered?']}
  ], links:[
    {label:'Microsoft microservices architecture guide',href:'https://learn.microsoft.com/azure/architecture/guide/architecture-styles/microservices'},
    {label:'AWS Builders Library',href:'https://aws.amazon.com/builders-library/'},
    {label:'Google SRE book',href:'https://sre.google/sre-book/table-of-contents/'}
  ]}
];

export const architectureMicroservicesPages = createTopicPages(specs);
