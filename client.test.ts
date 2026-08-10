import assert from "node:assert/strict";
import test from "node:test";
import claimListFixture from "./fixtures/claim-list.json";
import claimValuationFixture from "./fixtures/claim-valuation.json";
import coverageObservationFixture from "./fixtures/coverage-observation.json";
import coverageBatchFixture from "./fixtures/coverage-batch.json";
import coverageBatchResponseFixture from "./fixtures/coverage-batch-response.json";
import bookingListFixture from "./fixtures/booking-list.json";
import eligibilityFixture from "./fixtures/eligibility-check.json";
import approvedPreauthorizationFixture from "./fixtures/preauthorization-approved.json";
import preauthorizationFixture from "./fixtures/preauthorization.json";
import practitionerListFixture from "./fixtures/practitioner-list.json";
import sessionListFixture from "./fixtures/session-list.json";
import webhookEndpointFixture from "./fixtures/webhook-endpoint.json";
import {
  Heyrafiki,
  HeyrafikiApiError,
  type RecordCoverageBatchInput,
} from "./index";

test("sends a scoped sandbox request and parses the shared fixture", async () => {
  const requests: Request[] = [];
  const client = new Heyrafiki({
    apiKey: "test_api_key",
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json(practitionerListFixture);
    },
  });

  const result = await client.practitioners.list({ limit: 10 });

  assert.deepEqual(result, practitionerListFixture);
  assert.equal(requests[0]?.url, "https://api.heyrafiki.space/v1/practitioners?limit=10");
  assert.equal(
    requests[0]?.headers.get("authorization"),
    "Bearer test_api_key",
  );
});

test("preserves the stable error envelope", async () => {
  const client = new Heyrafiki({
    apiKey: "test_api_key",
    fetch: async () =>
      Response.json(
        {
          error: {
            code: "permission_denied",
            message: "This key does not have access to this resource.",
            docs: "https://docs.heyrafiki.space/errors",
          },
        },
        {
          status: 403,
          headers: { "x-request-id": "req_123" },
        },
      ),
  });

  await assert.rejects(
    client.practitioners.availability("prc_2481"),
    (error: unknown) => {
      assert.ok(error instanceof HeyrafikiApiError);
      assert.equal(error.status, 403);
      assert.equal(error.code, "permission_denied");
      assert.equal(error.requestId, "req_123");
      return true;
    },
  );
});

test("keeps Session and Claim clients aligned with shared fixtures", async () => {
  const client = new Heyrafiki({
    apiKey: "test_api_key",
    fetch: async (input) => {
      const path = new URL(new Request(input).url).pathname;
      return Response.json(
        path.endsWith("/sessions") ? sessionListFixture : claimListFixture,
      );
    },
  });

  assert.deepEqual(await client.sessions.list(), sessionListFixture);
  assert.deepEqual(await client.claims.list(), claimListFixture);
});

test("requests a Claim valuation with an explicit knowledge cutoff", async () => {
  const requests: Request[] = [];
  const client = new Heyrafiki({
    apiKey: "test_api_key",
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json(claimValuationFixture);
    },
  });

  assert.deepEqual(
    await client.claims.valuation("clm_synthetic_payer_001", {
      valuationAt: "2026-07-31T23:59:59.000Z",
    }),
    claimValuationFixture,
  );
  assert.equal(
    requests[0]?.url,
    "https://api.heyrafiki.space/v1/claims/clm_synthetic_payer_001/valuation?valuation_at=2026-07-31T23%3A59%3A59.000Z",
  );
  assert.equal(requests[0]?.method, "GET");
});

test("submits and adjudicates Claims with caller-owned idempotency keys", async () => {
  const requests: Request[] = [];
  const client = new Heyrafiki({
    apiKey: "test_api_key",
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json(claimListFixture.data[0], { status: 201 });
    },
  });
  await client.claims.create(
    {
      eligibility_check_id: "elig_demo_jubilee_001",
      session_id: "ses_demo_jubilee_001",
      provider_claim_reference: "provider:claim:001",
      lines: [
        {
          code_system: "urn:heyrafiki:service-code",
          code_system_version: "2026-07",
          service_code: "psychotherapy-60",
          units: 1,
          amount: 380000,
        },
      ],
    },
    { idempotencyKey: "claim-demo-001" },
  );
  await client.claims.adjudicate(
    "clm_demo_jubilee_001",
    {
      policy_reference: "policy:demo",
      policy_version: "2026-01",
      reason_codes: ["covered"],
      lines: [
        {
          line_number: 1,
          amount: {
            billed: 380000,
            allowed: 380000,
            payer: 380000,
            patient_responsibility: 0,
            adjustment: 0,
          },
          reason_codes: ["covered"],
        },
      ],
    },
    { idempotencyKey: "adjudication-demo-001" },
  );

  assert.equal(requests[0]?.url, "https://api.heyrafiki.space/v1/claims");
  assert.equal(requests[0]?.headers.get("idempotency-key"), "claim-demo-001");
  assert.equal(
    requests[1]?.url,
    "https://api.heyrafiki.space/v1/claims/clm_demo_jubilee_001/adjudications",
  );
  assert.equal(
    requests[1]?.headers.get("idempotency-key"),
    "adjudication-demo-001",
  );
});

test("creates a Booking with a caller-owned idempotency key", async () => {
  const requests: Request[] = [];
  const client = new Heyrafiki({
    apiKey: "test_api_key",
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json(bookingListFixture.data[0], { status: 201 });
    },
  });
  const input = {
    practitioner_id: "prc_2481",
    starts_at: "2026-08-02T07:00:00.000Z",
    ends_at: "2026-08-02T08:00:00.000Z",
    format: "online" as const,
    payment_source: "covered" as const,
  };

  assert.deepEqual(
    await client.bookings.create(input, {
      idempotencyKey: "booking-demo-001",
    }),
    bookingListFixture.data[0],
  );
  assert.equal(requests[0]?.method, "POST");
  assert.equal(requests[0]?.headers.get("idempotency-key"), "booking-demo-001");
  assert.deepEqual(await requests[0]?.json(), input);
});

test("requests and decides a pre-authorization with separate scopes", async () => {
  const requests: Request[] = [];
  const client = new Heyrafiki({
    apiKey: "test_api_key",
    fetch: async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return Response.json(
        request.url.endsWith("/eligibility_checks")
          ? eligibilityFixture
          : request.url.endsWith("/decisions")
            ? approvedPreauthorizationFixture
            : preauthorizationFixture,
        { status: request.url.endsWith("/decisions") ? 200 : 201 },
      );
    },
  });

  await client.eligibilityChecks.create(
    {
      member_reference: "member_demo_jubilee_001",
      service_code: "psychotherapy-60",
      scheduled_at: "2026-08-02T07:00:00.000Z",
      amount: 380000,
      currency: "KES",
    },
    { idempotencyKey: "eligibility-demo-001" },
  );
  await client.preauthorizations.create(
    {
      eligibility_check_id: "elig_demo_jubilee_001",
      booking_id: "bkg_demo_jubilee_001",
    },
    { idempotencyKey: "preauthorization-demo-001" },
  );
  await client.preauthorizations.decide(
    "preauth_demo_jubilee_001",
    {
      outcome: "approved",
      approved_amount: 380000,
      valid_until: "2026-08-03T07:00:00.000Z",
      reason_codes: ["covered"],
      policy_reference: "policy_demo_jubilee_2026",
      policy_version: "2026-01",
      evidence_references: [
        "eligibility:elig_demo_jubilee_001",
        "booking:bkg_demo_jubilee_001",
      ],
    },
    { idempotencyKey: "preauthorization-decision-demo-001" },
  );

  assert.equal(requests[0]?.headers.get("idempotency-key"), "eligibility-demo-001");
  assert.equal(
    requests[1]?.headers.get("idempotency-key"),
    "preauthorization-demo-001",
  );
  assert.equal(
    requests[2]?.url,
    "https://api.heyrafiki.space/v1/preauthorizations/preauth_demo_jubilee_001/decisions",
  );
  assert.equal(
    requests[2]?.headers.get("idempotency-key"),
    "preauthorization-decision-demo-001",
  );
});

test("records a payer Coverage observation with a caller-owned idempotency key", async () => {
  const requests: Request[] = [];
  const client = new Heyrafiki({
    apiKey: "test_api_key",
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json(coverageObservationFixture, { status: 201 });
    },
  });
  const input = {
    source_contract_reference: "contract:jubilee:2026",
    external_coverage_reference: "coverage:jubilee:001",
    source_version: "2026-08-04T09:00:00Z",
    tenant_reference: "tenant:acme:001",
    member_reference: "member:opaque:001",
    plan_name: "Essential Care",
    service_code: "psychotherapy-60",
    status: "active" as const,
    currency: "KES" as const,
    amount_limit: 600000,
    remaining_sessions: 12,
    authorization_required: true,
    coordination_priority: 1,
    valid_from: "2026-01-01T00:00:00.000Z",
    valid_until: "2026-12-31T23:59:59.000Z",
    observed_at: "2026-08-04T09:00:00.000Z",
    evidence_references: ["payer-response:jubilee:001"],
  };

  assert.deepEqual(
    await client.coverages.record(input, {
      idempotencyKey: "coverage-demo-001",
    }),
    coverageObservationFixture,
  );
  assert.equal(requests[0]?.method, "POST");
  assert.equal(requests[0]?.headers.get("idempotency-key"), "coverage-demo-001");
  assert.deepEqual(await requests[0]?.json(), input);
});

test("records a replay-safe payer Coverage batch", async () => {
  const requests: Request[] = [];
  const client = new Heyrafiki({
    apiKey: "test_api_key",
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json(coverageBatchResponseFixture, { status: 201 });
    },
  });

  assert.deepEqual(
    await client.coverageBatches.record(
      coverageBatchFixture as RecordCoverageBatchInput,
      {
        idempotencyKey: "coverage-batch-demo-001",
        artifactReference: "payer-file:jubilee:2026-08-04:001",
      },
    ),
    coverageBatchResponseFixture,
  );
  assert.equal(requests[0]?.method, "POST");
  assert.equal(
    requests[0]?.headers.get("idempotency-key"),
    "coverage-batch-demo-001",
  );
  assert.equal(
    requests[0]?.headers.get("x-heyrafiki-artifact-reference"),
    "payer-file:jubilee:2026-08-04:001",
  );
  assert.deepEqual(await requests[0]?.json(), coverageBatchFixture);
});

test("manages Webhook endpoints without persisting the returned secret", async () => {
  const requests: Request[] = [];
  const client = new Heyrafiki({
    apiKey: "test_api_key",
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json({
        ...webhookEndpointFixture,
        signing_secret: "whsec_once",
      });
    },
  });

  const endpoint = await client.webhookEndpoints.create({
    url: "https://hooks.example.com/heyrafiki",
    events: ["sandbox.ping"],
  });
  assert.equal(endpoint.signing_secret, "whsec_once");
  assert.equal(requests[0]?.method, "POST");
  assert.deepEqual(await requests[0]?.json(), {
    url: "https://hooks.example.com/heyrafiki",
    events: ["sandbox.ping"],
  });
});
