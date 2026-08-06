# Heyrafiki JavaScript SDK

Server-side JavaScript and TypeScript client for the Heyrafiki API.

## Install

```bash
npm install @heyrafiki/heyrafiki-js
```

Node.js 20 or newer is required. Keep API keys on the server.

## First request

```ts
import { Heyrafiki } from "@heyrafiki/heyrafiki-js";

const heyrafiki = new Heyrafiki({
  apiKey: process.env.HEYRAFIKI_API_KEY!,
});

const practitioners = await heyrafiki.practitioners.list({ limit: 5 });
```

Sandbox keys return synthetic data.

## Covered Care

Check a Benefit, create the covered Booking and request authorization with a
caller-owned idempotency key for each write.

```ts
const eligibility = await heyrafiki.eligibilityChecks.create(
  {
    member_reference: "member_demo_jubilee_001",
    service_code: "psychotherapy-60",
    scheduled_at: "2026-08-05T07:00:00.000Z",
    amount: 380000,
    currency: "KES",
  },
  { idempotencyKey: crypto.randomUUID() },
);

const booking = await heyrafiki.bookings.create(
  {
    practitioner_id: "prc_2481",
    starts_at: "2026-08-05T07:00:00.000Z",
    ends_at: "2026-08-05T08:00:00.000Z",
    format: "online",
    payment_source: "covered",
  },
  { idempotencyKey: crypto.randomUUID() },
);

await heyrafiki.preauthorizations.create(
  {
    eligibility_check_id: eligibility.id,
    booking_id: booking.id,
  },
  { idempotencyKey: crypto.randomUUID() },
);
```

Amounts use the currency's minor unit. `380000` KES is KES 3,800.00.

## Errors

```ts
import { HeyrafikiApiError } from "@heyrafiki/heyrafiki-js";

try {
  await heyrafiki.claims.retrieve("clm_123");
} catch (error) {
  if (error instanceof HeyrafikiApiError) {
    console.error(error.status, error.code, error.requestId);
  }
}
```

Use the request ID when tracing a failed call. See
[Errors](https://docs.heyrafiki.space/errors) for retry guidance.

## Develop

```bash
npm ci
npm run check
npm run pack:dry-run
```

## Resources

- [Documentation](https://docs.heyrafiki.space)
- [API contract](https://github.com/heyrafiki/openapi)
- [Webhooks](https://docs.heyrafiki.space/webhooks)
- [Security](https://github.com/heyrafiki/.github/blob/main/SECURITY.md)
