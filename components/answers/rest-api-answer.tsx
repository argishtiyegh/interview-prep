'use client';

import { createTopicPages, type TopicPageSpec } from '@/components/answers/topic-page';

const specs: TopicPageSpec[] = [
  {
    id: 'safe-idempotent', chapter: 'HTTP semantics', title: 'Safe and idempotent HTTP operations',
    answer: 'A safe method is intended for retrieval and should not request a state change; GET, HEAD, OPTIONS, and TRACE are defined as safe. An idempotent method has the same intended server effect whether the same request is performed once or multiple times. Safe methods are idempotent, while PUT and DELETE are idempotent but not safe.',
    comparisons: [
      { title: 'Safe', text: 'The client asks to observe. Logging, metrics, and cache population may still occur as incidental side effects.' },
      { title: 'Idempotent', text: 'Retrying does not create additional intended state transitions. Responses can differ because time and resource state changed.' },
      { title: 'POST', text: 'Not inherently idempotent. A payment or order POST normally needs an idempotency key for safe retries.' },
      { title: 'DELETE', text: 'Deleting twice has the same intended final state, although the second response may be 404 instead of 204.' },
    ],
  },
  {
    id: 'post-put-patch', chapter: 'HTTP semantics', title: 'POST, PUT, and PATCH',
    answer: 'POST submits data to a resource for processing and commonly creates a server-named child. PUT replaces the state of a known target resource and is idempotent. PATCH applies a partial modification whose idempotency depends on the patch document and operation design.',
    comparisons: [
      { title: 'POST /orders', text: 'Server creates an order identifier; return 201 with Location when a resource was created.' },
      { title: 'PUT /profiles/42', text: 'Client addresses the complete target representation; omission semantics must be documented.' },
      { title: 'PATCH /profiles/42', text: 'Apply JSON Merge Patch, JSON Patch, or a domain command; declare content type and null/removal semantics.' },
      { title: 'POST command', text: 'Useful for non-CRUD actions such as /orders/42/cancellations when the action creates a business event.' },
    ],
    callout: { title: 'Do not infer semantics from a verb alone', text: 'Document ownership of identifiers, replacement versus merge behavior, validation, concurrency, and retry guarantees.', tone: 'tip' },
  },
  {
    id: 'status-codes', chapter: 'HTTP semantics', title: 'Choosing HTTP status codes',
    answer: 'Use status codes to describe protocol-level outcomes consistently: 200 for a successful response body, 201 for creation, 202 for accepted asynchronous work, 204 for success without a body, 400 for malformed requests, 401 for missing/invalid authentication, 403 for forbidden access, 404 for absent resources, 409 for state conflicts, 412 for failed preconditions, 422 for semantically invalid content, 429 for rate limits, and 5xx for server failures.',
    sections: [{ title: 'Nuances interviewers expect', bullets: ['401 should normally include the authentication challenge; 403 means the principal is understood but not permitted.', '409 fits a conflict with current resource state; 412 specifically fits failed conditional headers such as If-Match.', '503 can include Retry-After for temporary unavailability.', 'A validation failure should not be reported as 500.', 'Do not return 200 with an error object when the HTTP operation failed.'] }],
  },
  {
    id: 'validation', chapter: 'Request handling', title: 'Request validation',
    answer: 'Validate syntax and shape during deserialization, field constraints with Jakarta Bean Validation, and cross-field or domain invariants in application/domain services. Database constraints remain the final concurrency-safe guard for integrity.',
    code: ['public record CreateOrderRequest(', '        @NotEmpty List<@Valid OrderLineRequest> lines,', '        @NotNull UUID customerId) {}', '', '@PostMapping("/orders")', 'ResponseEntity<OrderResponse> create(', '        @Valid @RequestBody CreateOrderRequest request) {', '    return ResponseEntity.status(CREATED)', '            .body(orderService.create(request));', '}'].join('\n'),
    sections: [{ title: 'Separate concerns', bullets: ['Malformed JSON: the representation cannot be parsed.', 'Bean constraints: fields violate transport-level rules.', 'Domain validation: the command violates business policy.', 'Conflict: valid command cannot apply to current state.', 'Database constraint: concurrent or out-of-band writer attempted invalid state.'] }],
  },
  {
    id: 'problem-details', chapter: 'Errors', title: 'Designing a consistent API error response',
    answer: 'Use one documented error envelope across endpoints. RFC 9457 Problem Details provides type, title, status, detail, and instance; extensions can add a stable machine-readable code, field violations, correlation ID, and retry information.',
    code: ['{', '  "type": "https://api.example.com/problems/stock-conflict",', '  "title": "Insufficient stock",', '  "status": 409,', '  "code": "STOCK_CONFLICT",', '  "detail": "Requested 4 units; 2 remain.",', '  "instance": "/orders/req-8f2",', '  "correlationId": "01J...",', '  "violations": []', '}'].join('\n'), codeLabel: 'application/problem+json',
    sections: [{ title: 'Contract rules', bullets: ['Keep code and type stable for clients; detail is human-oriented.', 'Do not require clients to parse prose.', 'Document field paths and rejected-value policy.', 'Return Content-Type: application/problem+json.'] }],
  },
  {
    id: 'controller-advice', chapter: 'Errors', title: 'Centralizing errors with @RestControllerAdvice',
    answer: '@RestControllerAdvice combines controller advice with response-body semantics. @ExceptionHandler methods translate known exceptions into consistent HTTP responses after controller invocation or argument handling fails.',
    code: ['@RestControllerAdvice', 'class ApiErrors {', '    @ExceptionHandler(StockConflict.class)', '    ResponseEntity<ProblemDetail> stock(StockConflict ex,', '                                         HttpServletRequest request) {', '        ProblemDetail problem = ProblemDetail.forStatus(CONFLICT);', '        problem.setTitle("Insufficient stock");', '        problem.setDetail(ex.getMessage());', '        problem.setProperty("code", "STOCK_CONFLICT");', '        return ResponseEntity.status(CONFLICT).body(problem);', '    }', '}'].join('\n'),
    sections: [{ title: 'Handler ordering', text: 'Prefer specific exception handlers and stable application exceptions. A final generic handler should log the complete internal failure with correlation context and return a generic 500 problem.' }],
  },
  {
    id: 'safe-errors', chapter: 'Errors', title: 'Why internal exception details must stay private',
    answer: 'Stack traces and raw exception messages can disclose source paths, SQL, schemas, dependency versions, internal hosts, credentials, personal data, and implementation structure. They also create an unstable client contract coupled to internal code.',
    flow: ['Internal exception', 'Structured server log', 'Correlation identifier', 'Sanitized client problem'],
    sections: [{ title: 'What the client needs', bullets: ['A stable error code or problem type.', 'A safe explanation and actionable field errors.', 'Whether retry is appropriate and, when known, when.', 'A correlation identifier support can trace.'] }, { title: 'What operators need', bullets: ['Complete stack trace once, structured context, trace/span ID, request route, dependency, and timing.', 'Redaction for authorization headers, tokens, passwords, and sensitive bodies.'] }],
  },
  {
    id: 'pagination-filter-sort', chapter: 'Collections', title: 'Pagination, filtering, and sorting',
    answer: 'Expose bounded page size, deterministic sort order, explicit filter grammar, and a stable continuation model. Offset pagination is simple for shallow navigation; cursor pagination is better for deep, changing datasets when backed by a matching composite index.',
    code: ['GET /orders?status=OPEN&sort=-createdAt,id&limit=50', 'GET /orders?cursor=eyJjcmVhdGVkQXQiOiIuLi4iLCJpZCI6NDJ9', '', '{', '  "items": [ ... ],', '  "nextCursor": "opaque-token",', '  "hasMore": true', '}'].join('\n'),
    sections: [{ title: 'Design rules', bullets: ['Whitelist sortable and filterable fields.', 'Use a unique tie-breaker in ordering.', 'Encode cursors as opaque, signed or validated state.', 'Cap page size to protect memory and database work.', 'Define null ordering and timestamp precision.'] }],
  },
  {
    id: 'api-evolution', chapter: 'Evolution', title: 'Evolving APIs without breaking clients',
    answer: 'Prefer additive compatible changes: add optional request fields, add response fields clients are expected to ignore, and introduce new endpoints or media types for incompatible semantics. Deprecate with telemetry and a communicated removal policy.',
    sections: [{ title: 'Common breaking changes', bullets: ['Renaming/removing fields or enum values.', 'Changing nullability, defaults, units, precision, or ordering.', 'Making an optional request field required.', 'Changing error codes, pagination tokens, or idempotency behavior.', 'Tightening validation for previously accepted requests.'] }, { title: 'Compatibility tools', bullets: ['OpenAPI diff in CI.', 'Consumer-driven contract tests.', 'Usage telemetry by client/version.', 'Deprecation and Sunset headers where appropriate.', 'Parallel version support for unavoidable incompatible changes.'] }],
    callout: { title: 'URL versioning is only one option', text: 'A /v2 path does not automatically make a change safe; migration, coexistence, data semantics, and retirement still need design.', tone: 'warning' },
  },
  {
    id: 'rest-grpc', chapter: 'Protocols', title: 'REST and gRPC',
    answer: 'REST commonly uses HTTP resource semantics and JSON, offering broad browser, cache, gateway, and debugging compatibility. gRPC uses strongly typed protobuf contracts over HTTP/2 with generated clients and efficient unary or streaming RPCs.',
    comparisons: [
      { title: 'REST', text: 'Public APIs, web compatibility, resource caching, human-readable diagnostics, and diverse clients.' },
      { title: 'gRPC', text: 'Controlled service-to-service clients, strict schemas, code generation, lower serialization overhead, and bidirectional streaming.' },
      { title: 'Evolution', text: 'REST depends on documented JSON compatibility; protobuf preserves numeric field tags and requires disciplined schema changes.' },
      { title: 'Operations', text: 'gRPC needs compatible proxies, load balancing, reflection policy, deadline propagation, and status translation at boundaries.' },
    ],
  },
  {
    id: 'timeouts-deadlines', chapter: 'Resilience', title: 'Timeouts and deadlines',
    answer: 'A timeout limits one operation’s waiting duration. A deadline is an absolute end time for the entire request budget and should be propagated downstream. Each layer must reserve time for its own work and return before the caller’s deadline expires.',
    flow: ['Client deadline', 'Gateway budget', 'Service budget', 'Database/downstream budget'],
    sections: [{ title: 'Configure every phase', bullets: ['Connection establishment.', 'TLS handshake when separate.', 'Pool acquisition.', 'Request/write timeout.', 'Response/read timeout.', 'Overall call deadline and cancellation.'] }],
    callout: { title: 'Timeout without cancellation wastes capacity', text: 'When a caller gives up, propagate cancellation where possible so downstream work, connections, and threads are released.', tone: 'warning' },
  },
  {
    id: 'idempotency-keys', chapter: 'Resilience', title: 'Idempotency keys for write operations',
    answer: 'An idempotency key identifies one logical write attempt. The server atomically records the key, a fingerprint of the request, operation state, and final response. Repeated matching requests return the stored outcome instead of executing the side effect again.',
    flow: ['Receive key + request hash', 'Atomically reserve key', 'Execute once', 'Store and replay response'],
    sections: [{ title: 'Required details', bullets: ['Scope keys by tenant and operation.', 'Reject reuse with a different request fingerprint.', 'Handle concurrent duplicates while the first request is in progress.', 'Define retention and cleanup safely.', 'Persist before returning success so failover does not forget the result.'] }],
    callout: { title: 'The key is not a distributed transaction', text: 'Downstream payment or messaging systems also need compatible idempotency or an outbox/coordination strategy.', tone: 'info' },
  },
  {
    id: 'etags', chapter: 'Concurrency', title: 'ETags and optimistic concurrency',
    answer: 'An ETag identifies a selected representation version. A client reads the resource and ETag, then sends If-Match with an update. The server applies the update only if the current validator still matches; otherwise it returns 412 Precondition Failed.',
    code: ['GET /documents/42', 'ETag: "v7"', '', 'PUT /documents/42', 'If-Match: "v7"', 'Content-Type: application/json', '', '{ "title": "Revised" }', '', '# If current ETag is now "v8":', 'HTTP/1.1 412 Precondition Failed'].join('\n'), codeLabel: 'Conditional update',
    sections: [{ title: 'Strong versus weak validators', text: 'Strong ETags are suitable when byte-equivalent representation matters and for If-Match updates. Weak ETags indicate semantic equivalence and are not used for every conditional operation.' }],
  },
  {
    id: 'external-api-protection', chapter: 'Resilience', title: 'Protecting external API calls',
    answer: 'Bound the call with connection and response deadlines, limit concurrency, retry only transient idempotent operations with jitter, open a circuit when failures are sustained, and expose dependency-specific metrics. Fallbacks must preserve business correctness rather than merely hide errors.',
    comparisons: [
      { title: 'Timeout', text: 'Bounds waiting and releases resources.' },
      { title: 'Retry', text: 'Handles transient failure but multiplies load; cap attempts and honor Retry-After.' },
      { title: 'Circuit breaker', text: 'Stops repeated calls during sustained failure and probes recovery.' },
      { title: 'Bulkhead/rate limit', text: 'Caps concurrent or total demand so one dependency cannot consume all application capacity.' },
    ],
    callout: { title: 'Retries require a budget', text: 'Each attempt must fit inside the caller deadline. Layered automatic retries can create a retry storm.', tone: 'warning' },
  },
  {
    id: 'api-observability', chapter: 'Operations', title: 'API observability and correlation',
    answer: 'Observe APIs by route template, method, status class, latency distribution, request/response sizes, saturation, and dependency timing. Propagate trace context and return a safe correlation identifier so a client error can be connected to server logs and spans.',
    sections: [{ title: 'Avoid dangerous dimensions', bullets: ['Do not label metrics with raw URLs, user IDs, order IDs, or error messages.', 'Use route templates such as /orders/{id} to control cardinality.', 'Record percentiles or histograms suitable for service objectives.', 'Separate client cancellations, deadline failures, dependency failures, and application errors.'] }],
  },
  {
    id: 'api-testing-tools', chapter: 'Operations', title: 'HTTP debugging toolkit',
    answer: 'Use curl for reproducible protocol-level requests, browser or proxy traces for client behavior, OpenAPI for contract review, and application metrics/traces for server timing. Preserve request IDs and timestamps so evidence from each layer can be aligned.',
    code: ['# Headers, timing, conditional update, and idempotency', 'curl -i --fail-with-body \\', '  -H "Content-Type: application/json" \\', '  -H "Idempotency-Key: test-order-001" \\', '  --connect-timeout 2 --max-time 5 \\', '  -d @order.json http://localhost:8080/orders', '', 'curl -i -X PUT \\', '  -H \'If-Match: "v7"\' \\', '  -H "Content-Type: application/json" \\', '  -d @document.json http://localhost:8080/documents/42', '', '# Spring route and request metrics', 'curl -s localhost:8080/actuator/mappings', 'curl -s localhost:8080/actuator/metrics/http.server.requests'].join('\n'), codeLabel: 'Practical commands',
    callout: { title: 'Reproduce without leaking credentials', text: 'Remove tokens, cookies, personal data, and private hosts before sharing commands or traces.', tone: 'warning' },
  },
  {
    id: 'rest-recap', chapter: 'Interview recap', title: 'REST API interview recap',
    answer: 'A strong API answer combines HTTP semantics, a stable contract, concurrency protection, bounded failure behavior, and observable operations. Explain what a retry, duplicate, stale update, invalid request, downstream timeout, and incompatible client will experience.',
    sections: [{ title: 'Rapid checks', bullets: ['Safe and idempotent describe different guarantees.', 'PUT replaces a known resource; PATCH partially modifies according to a defined patch format.', 'Use stable machine-readable Problem Details.', 'If-Match protects a versioned update; an idempotency key protects duplicate execution.', 'A deadline spans the call chain; phase timeouts protect individual waits.', 'Retry only safe/idempotent transient failures and keep attempts inside the deadline.', 'Evolve contracts additively and measure deprecated client usage.'] }],
    links: [
      { label: 'HTTP Semantics (RFC 9110)', href: 'https://www.rfc-editor.org/rfc/rfc9110' },
      { label: 'Problem Details (RFC 9457)', href: 'https://www.rfc-editor.org/rfc/rfc9457' },
      { label: 'Spring MVC reference', href: 'https://docs.spring.io/spring-framework/reference/web/webmvc.html' },
      { label: 'Spring REST exception responses', href: 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html' },
    ],
  },
];

export const restApiPages = createTopicPages(specs);
