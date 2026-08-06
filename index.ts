export type ApiEnvironment = "sandbox" | "production";

export type Practitioner = {
  id: string;
  object: "practitioner";
  name: string;
  profession: string;
  location: {
    city: string;
    country: string;
  };
  session_fee: {
    amount: number;
    currency: string;
  };
};

export type PractitionerList = {
  object: "list";
  data: Practitioner[];
  has_more: boolean;
};

export type PractitionerAvailability = {
  object: "availability";
  practitioner_id: string;
  timezone: string;
  weekly_hours: Array<{
    weekday: number;
    start: string;
    end: string;
    formats: Array<"online" | "in_person" | "phone">;
  }>;
};

export type Session = {
  id: string;
  object: "session";
  practitioner_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  format: "online" | "in_person" | "phone";
  status:
    | "reserved"
    | "confirmed"
    | "in_progress"
    | "delivered"
    | "cancelled";
  payment_source: "self_pay" | "covered";
};

export type SessionList = {
  object: "list";
  data: Session[];
  has_more: boolean;
};

export type Booking = {
  id: string;
  object: "booking";
  session_id: string;
  practitioner_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  format: "online" | "in_person" | "phone";
  status: "reserved" | "confirmed" | "cancelled";
  payment_source: "self_pay" | "covered";
};

export type BookingList = {
  object: "list";
  data: Booking[];
  has_more: boolean;
};

export type CreateBookingInput = {
  practitioner_id: string;
  starts_at: string;
  ends_at: string;
  format: "online" | "in_person" | "phone";
  payment_source: "self_pay" | "covered";
};

export type Claim = {
  id: string;
  object: "claim";
  status:
    | "draft"
    | "submitted"
    | "queried"
    | "approved"
    | "partially_approved"
    | "denied"
    | "settled"
    | "reversed"
    | "cancelled";
  provider_claim_reference: string | null;
  submission_version: number;
  amount: {
    currency: string;
    billed: number;
    approved: number | null;
    remitted: number | null;
    settled: number | null;
  };
  service_period: {
    starts_at: string;
    ends_at: string;
  };
  lines: Array<{
    line_number: number;
    code_system: string;
    code_system_version: string | null;
    service_code: string;
    units: number;
    amount: number;
  }>;
  information_requests: Array<{
    id: string;
    object: "claim_information_request";
    reason_code: string;
    requested_evidence_types: string[];
    status: "open" | "fulfilled" | "cancelled";
    due_at: string | null;
    created_at: string;
    resolved_at: string | null;
  }>;
  adjudication: {
    id: string;
    object: "claim_adjudication";
    version: number;
    decision: "approved" | "partially_approved" | "denied";
    amount: {
      currency: string;
      billed: number;
      payer: number;
      patient_responsibility: number;
      adjustment: number;
    };
    reason_codes: string[];
    policy: { reference: string; version: string };
    lines: ClaimAdjudicationLine[];
    decided_at: string;
  } | null;
  submitted_at: string | null;
  updated_at: string;
};

export type CreateClaimInput = {
  eligibility_check_id: string;
  preauthorization_id?: string | null;
  session_id: string;
  provider_claim_reference: string;
  evidence_refs?: string[];
  lines: Array<{
    code_system: string;
    code_system_version?: string | null;
    service_code: string;
    units: number;
    amount: number;
  }>;
};

export type ClaimAdjudicationLine = {
  line_number: number;
  amount: {
    billed: number;
    allowed: number;
    payer: number;
    patient_responsibility: number;
    adjustment: number;
  };
  reason_codes: string[];
};

export type AdjudicateClaimInput = {
  policy_reference: string;
  policy_version: string;
  reason_codes: string[];
  evidence_refs?: string[];
  lines: ClaimAdjudicationLine[];
};

export type ClaimList = {
  object: "list";
  data: Claim[];
  has_more: boolean;
};

export type EligibilityCheck = {
  id: string;
  object: "eligibility_check";
  status: "eligible" | "ineligible";
  reason_codes: string[];
  service: {
    code: string;
    scheduled_at: string;
  };
  amount: {
    requested: number;
    currency: string;
    maximum_per_session: number | null;
  };
  authorization_required: boolean;
  remaining_sessions: number | null;
  coverage_valid_until: string | null;
  checked_at: string;
};

export type CreateEligibilityCheckInput = {
  member_reference: string;
  service_code: string;
  scheduled_at: string;
  amount: number;
  currency: "KES" | "USD" | "EUR" | "GBP";
};

export type Preauthorization = {
  id: string;
  object: "preauthorization";
  eligibility_check_id: string;
  booking_id: string;
  status: "pending" | "approved" | "denied" | "expired" | "cancelled";
  reason_codes: string[];
  amount: {
    requested: number;
    approved: number | null;
    currency: string;
  };
  valid_until: string | null;
  created_at: string;
  decision: {
    id: string;
    object: "preauthorization_decision";
    version: number;
    outcome: "approved" | "denied";
    reason_codes: string[];
    policy: {
      reference: string;
      version: string;
    };
    authority_reference: string;
    evidence_references: string[];
    decided_at: string;
  } | null;
};

export type CoverageObservation = {
  id: string;
  object: "coverage_observation";
  coverage_id: string;
  source: "payer_api" | "batch_file";
  source_contract_reference: string;
  external_coverage_reference: string;
  source_version: string;
  snapshot_version: number;
  status: "active" | "paused" | "exhausted" | "expired";
  service_code: string;
  amount_limit: {
    currency: "KES" | "USD" | "EUR" | "GBP";
    value: number;
  };
  remaining_sessions: number;
  authorization_required: boolean;
  coordination_priority: number | null;
  valid_from: string;
  valid_until: string;
  observed_at: string;
};

export type RecordCoverageObservationInput = {
  source_contract_reference: string;
  external_coverage_reference: string;
  source_version: string;
  tenant_reference: string;
  member_reference: string;
  plan_name: string;
  service_code: string;
  status: "active" | "paused" | "exhausted" | "expired";
  currency: "KES" | "USD" | "EUR" | "GBP";
  amount_limit: number;
  remaining_sessions: number;
  authorization_required: boolean;
  coordination_priority: number | null;
  valid_from: string;
  valid_until: string;
  observed_at: string;
  evidence_references: string[];
};

export type CoverageBatchRecordInput = {
  coverage_reference: string;
  record_version: string;
  tenant_reference: string;
  member_reference: string;
  plan_name: string;
  service_code: string;
  status: "active" | "paused" | "exhausted" | "expired";
  currency: "KES" | "USD" | "EUR" | "GBP";
  amount_limit: number;
  remaining_sessions: number;
  authorization_required: boolean;
  coordination_priority: number | null;
  valid_from: string;
  valid_until: string;
};

export type RecordCoverageBatchInput = {
  contract_version: "2026-08-01";
  batch_reference: string;
  batch_version: string;
  source_contract_reference: string;
  generated_at: string;
  records: CoverageBatchRecordInput[];
};

export type CoverageBatchResult = {
  object: "coverage_batch_result";
  batch_reference: string;
  artifact_sha256: string;
  total: number;
  recorded: number;
  replayed: number;
  observations: CoverageObservation[];
};

export type CreatePreauthorizationInput = {
  eligibility_check_id: string;
  booking_id: string;
};

type PreauthorizationDecisionContext = {
  reason_codes: string[];
  policy_reference: string;
  policy_version: string;
  evidence_references: string[];
};

export type DecidePreauthorizationInput =
  | (PreauthorizationDecisionContext & {
      outcome: "approved";
      approved_amount: number;
      valid_until: string;
    })
  | (PreauthorizationDecisionContext & {
      outcome: "denied";
    });

export type Remittance = {
  id: string;
  object: "remittance";
  status: "received" | "reconciled" | "exception";
  payer_reference: string;
  amount: { currency: string; paid: number };
  allocations: Array<{
    claim_id: string;
    paid_amount: number;
    reason_codes: string[];
  }>;
  received_at: string;
  reconciled_at: string | null;
};

export type RemittanceList = {
  object: "list";
  data: Remittance[];
  has_more: boolean;
};

export type CreateRemittanceInput = {
  payer_reference: string;
  currency: "KES" | "USD" | "EUR" | "GBP";
  received_at: string;
  allocations: Array<{
    claim_id: string;
    paid_amount: number;
    reason_codes?: string[];
  }>;
};

export type WebhookEventType =
  | "sandbox.ping"
  | "preauthorization.requested"
  | "preauthorization.approved"
  | "preauthorization.denied"
  | "preauthorization.expired"
  | "claim.submitted"
  | "claim.information_requested"
  | "claim.resubmitted"
  | "claim.approved"
  | "claim.partially_approved"
  | "claim.denied"
  | "claim.settled"
  | "remittance.reconciled";

export type WebhookEndpoint = {
  id: string;
  object: "webhook_endpoint";
  url: string;
  events: string[];
  status: "active" | "disabled";
  created_at: string;
  disabled_at: string | null;
};

export type CreatedWebhookEndpoint = WebhookEndpoint & {
  signing_secret: string;
};

export type WebhookEndpointList = {
  object: "list";
  data: WebhookEndpoint[];
  has_more: boolean;
};

export type WebhookDelivery = {
  id: string;
  object: "webhook_delivery";
  delivered: boolean;
  attempts: number;
  response_status: number | null;
};

type ApiInformation = {
  object: "api";
  version: "v1";
  environment: ApiEnvironment;
  resources: string[];
};

type ApiErrorEnvelope = {
  error?: {
    code?: unknown;
    message?: unknown;
    docs?: unknown;
  };
};

export class HeyrafikiApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly docs?: string;

  constructor(input: {
    status: number;
    code: string;
    message: string;
    requestId?: string;
    docs?: string;
  }) {
    super(input.message);
    this.name = "HeyrafikiApiError";
    this.status = input.status;
    this.code = input.code;
    this.requestId = input.requestId;
    this.docs = input.docs;
  }
}

export type HeyrafikiClientOptions = {
  apiKey: string;
  baseUrl?: string;
  fetch?: typeof fetch;
};

export class Heyrafiki {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: HeyrafikiClientOptions) {
    if (!options.apiKey.trim()) throw new TypeError("apiKey is required.");
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "https://api.heyrafiki.space/v1").replace(
      /\/+$/,
      "",
    );
    this.fetcher = options.fetch ?? globalThis.fetch;
  }

  readonly api = {
    retrieve: () => this.request<ApiInformation>("/"),
  };

  readonly practitioners = {
    list: (options: { limit?: number } = {}) => {
      const search = new URLSearchParams();
      if (options.limit !== undefined) search.set("limit", String(options.limit));
      const query = search.size > 0 ? `?${search.toString()}` : "";
      return this.request<PractitionerList>(`/practitioners${query}`);
    },
    retrieve: (practitionerId: string) =>
      this.request<Practitioner>(
        `/practitioners/${encodeURIComponent(practitionerId)}`,
      ),
    availability: (practitionerId: string) =>
      this.request<PractitionerAvailability>(
        `/practitioners/${encodeURIComponent(practitionerId)}/availability`,
      ),
  };

  readonly sessions = {
    list: (options: { limit?: number } = {}) => {
      const search = new URLSearchParams();
      if (options.limit !== undefined) search.set("limit", String(options.limit));
      const query = search.size > 0 ? `?${search.toString()}` : "";
      return this.request<SessionList>(`/sessions${query}`);
    },
    retrieve: (sessionId: string) =>
      this.request<Session>(`/sessions/${encodeURIComponent(sessionId)}`),
  };

  readonly bookings = {
    list: (options: { limit?: number } = {}) => {
      const search = new URLSearchParams();
      if (options.limit !== undefined) search.set("limit", String(options.limit));
      const query = search.size > 0 ? `?${search.toString()}` : "";
      return this.request<BookingList>(`/bookings${query}`);
    },
    retrieve: (bookingId: string) =>
      this.request<Booking>(`/bookings/${encodeURIComponent(bookingId)}`),
    create: (
      input: CreateBookingInput,
      options: { idempotencyKey: string },
    ) =>
      this.request<Booking>("/bookings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": options.idempotencyKey,
        },
        body: JSON.stringify(input),
      }),
  };

  readonly claims = {
    list: (options: { limit?: number } = {}) => {
      const search = new URLSearchParams();
      if (options.limit !== undefined) search.set("limit", String(options.limit));
      const query = search.size > 0 ? `?${search.toString()}` : "";
      return this.request<ClaimList>(`/claims${query}`);
    },
    retrieve: (claimId: string) =>
      this.request<Claim>(`/claims/${encodeURIComponent(claimId)}`),
    create: (input: CreateClaimInput, options: { idempotencyKey: string }) =>
      this.request<Claim>("/claims", {
        method: "POST",
        headers: this.idempotentHeaders(options.idempotencyKey),
        body: JSON.stringify(input),
      }),
    requestInformation: (
      claimId: string,
      input: {
        reason_code: string;
        requested_evidence_types: string[];
        due_at?: string | null;
      },
      options: { idempotencyKey: string },
    ) =>
      this.request<Claim>(
        `/claims/${encodeURIComponent(claimId)}/information_requests`,
        {
          method: "POST",
          headers: this.idempotentHeaders(options.idempotencyKey),
          body: JSON.stringify(input),
        },
      ),
    submitEvidence: (
      claimId: string,
      input: { information_request_id: string; evidence_refs: string[] },
      options: { idempotencyKey: string },
    ) =>
      this.request<Claim>(`/claims/${encodeURIComponent(claimId)}/evidence`, {
        method: "POST",
        headers: this.idempotentHeaders(options.idempotencyKey),
        body: JSON.stringify(input),
      }),
    adjudicate: (
      claimId: string,
      input: AdjudicateClaimInput,
      options: { idempotencyKey: string },
    ) =>
      this.request<Claim>(
        `/claims/${encodeURIComponent(claimId)}/adjudications`,
        {
          method: "POST",
          headers: this.idempotentHeaders(options.idempotencyKey),
          body: JSON.stringify(input),
        },
      ),
  };

  readonly eligibilityChecks = {
    create: (
      input: CreateEligibilityCheckInput,
      options: { idempotencyKey: string },
    ) =>
      this.request<EligibilityCheck>("/eligibility_checks", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": options.idempotencyKey,
        },
        body: JSON.stringify(input),
      }),
    retrieve: (eligibilityCheckId: string) =>
      this.request<EligibilityCheck>(
        `/eligibility_checks/${encodeURIComponent(eligibilityCheckId)}`,
      ),
  };

  readonly coverages = {
    record: (
      input: RecordCoverageObservationInput,
      options: { idempotencyKey: string },
    ) =>
      this.request<CoverageObservation>("/coverages", {
        method: "POST",
        headers: this.idempotentHeaders(options.idempotencyKey),
        body: JSON.stringify(input),
      }),
  };

  readonly coverageBatches = {
    record: (
      input: RecordCoverageBatchInput,
      options: { idempotencyKey: string; artifactReference: string },
    ) =>
      this.request<CoverageBatchResult>("/coverage_batches", {
        method: "POST",
        headers: {
          ...this.idempotentHeaders(options.idempotencyKey),
          "x-heyrafiki-artifact-reference": options.artifactReference,
        },
        body: JSON.stringify(input),
      }),
  };

  readonly preauthorizations = {
    create: (
      input: CreatePreauthorizationInput,
      options: { idempotencyKey: string },
    ) =>
      this.request<Preauthorization>("/preauthorizations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": options.idempotencyKey,
        },
        body: JSON.stringify(input),
      }),
    retrieve: (preauthorizationId: string) =>
      this.request<Preauthorization>(
        `/preauthorizations/${encodeURIComponent(preauthorizationId)}`,
      ),
    decide: (
      preauthorizationId: string,
      input: DecidePreauthorizationInput,
      options: { idempotencyKey: string },
    ) =>
      this.request<Preauthorization>(
        `/preauthorizations/${encodeURIComponent(preauthorizationId)}/decisions`,
        {
          method: "POST",
          headers: this.idempotentHeaders(options.idempotencyKey),
          body: JSON.stringify(input),
        },
      ),
  };

  readonly remittances = {
    list: (options: { limit?: number } = {}) => {
      const search = new URLSearchParams();
      if (options.limit !== undefined) search.set("limit", String(options.limit));
      const query = search.size > 0 ? `?${search.toString()}` : "";
      return this.request<RemittanceList>(`/remittances${query}`);
    },
    retrieve: (remittanceId: string) =>
      this.request<Remittance>(
        `/remittances/${encodeURIComponent(remittanceId)}`,
      ),
    create: (
      input: CreateRemittanceInput,
      options: { idempotencyKey: string },
    ) =>
      this.request<Remittance>("/remittances", {
        method: "POST",
        headers: this.idempotentHeaders(options.idempotencyKey),
        body: JSON.stringify(input),
      }),
  };

  readonly webhookEndpoints = {
    list: (options: { limit?: number } = {}) => {
      const search = new URLSearchParams();
      if (options.limit !== undefined) search.set("limit", String(options.limit));
      const query = search.size > 0 ? `?${search.toString()}` : "";
      return this.request<WebhookEndpointList>(`/webhook_endpoints${query}`);
    },
    retrieve: (endpointId: string) =>
      this.request<WebhookEndpoint>(
        `/webhook_endpoints/${encodeURIComponent(endpointId)}`,
      ),
    create: (input: { url: string; events: WebhookEventType[] }) =>
      this.request<CreatedWebhookEndpoint>("/webhook_endpoints", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      }),
    disable: (endpointId: string) =>
      this.request<WebhookEndpoint>(
        `/webhook_endpoints/${encodeURIComponent(endpointId)}`,
        { method: "DELETE" },
      ),
    sendTest: (endpointId: string) =>
      this.request<WebhookDelivery>(
        `/webhook_endpoints/${encodeURIComponent(endpointId)}/test`,
        { method: "POST" },
      ),
  };

  private idempotentHeaders(idempotencyKey: string): HeadersInit {
    return {
      "content-type": "application/json",
      "idempotency-key": idempotencyKey,
    };
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    headers.set("authorization", `Bearer ${this.apiKey}`);
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });
    const body = (await response.json().catch(() => null)) as
      | T
      | ApiErrorEnvelope
      | null;

    if (!response.ok) {
      const error =
        body && typeof body === "object" && "error" in body
          ? body.error
          : undefined;
      throw new HeyrafikiApiError({
        status: response.status,
        code: typeof error?.code === "string" ? error.code : "request_failed",
        message:
          typeof error?.message === "string"
            ? error.message
            : "The Heyrafiki API request failed.",
        requestId: response.headers.get("x-request-id") ?? undefined,
        docs: typeof error?.docs === "string" ? error.docs : undefined,
      });
    }

    if (body === null) {
      throw new HeyrafikiApiError({
        status: response.status,
        code: "invalid_response",
        message: "The Heyrafiki API returned an invalid response.",
        requestId: response.headers.get("x-request-id") ?? undefined,
      });
    }

    return body as T;
  }
}
