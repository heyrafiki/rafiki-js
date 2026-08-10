# Heyrafiki JavaScript SDK

Server-side JavaScript and TypeScript client for the Heyrafiki API.

## Build from source

```bash
git clone https://github.com/heyrafiki/rafiki-js.git
cd rafiki-js
npm ci
npm run check
```

Node.js 22 or newer is required. The client connects to Sandbox projects with
the same typed contract, idempotency behavior and request evidence used by the
public REST API. Keep API keys on the server.

Prefer the command line? Build [`hey`](https://github.com/heyrafiki/hey) and run
`hey doctor` to verify a local setup.

## First request

```ts
import { Heyrafiki } from "@heyrafiki/rafiki-js";

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
const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
startsAt.setUTCHours(7, 0, 0, 0);
while ([0, 6].includes(startsAt.getUTCDay())) {
  startsAt.setUTCDate(startsAt.getUTCDate() + 1);
}
const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

const eligibility = await heyrafiki.eligibilityChecks.create(
  {
    member_reference: "member_demo_jubilee_001",
    service_code: "psychotherapy-60",
    scheduled_at: startsAt.toISOString(),
    amount: 350000,
    currency: "KES",
  },
  { idempotencyKey: crypto.randomUUID() },
);

const booking = await heyrafiki.bookings.create(
  {
    practitioner_id: "prc_2481",
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
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

Amounts use the currency's minor unit. `350000` KES is KES 3,500.00.

## Reproduce a Claim valuation

Use an explicit cutoff to retrieve only the Claim facts that had taken effect
and entered system knowledge by that time.

```ts
const valuation = await heyrafiki.claims.valuation(
  "clm_synthetic_payer_001",
  { valuationAt: "2026-07-31T23:59:59.000Z" },
);

console.log(valuation.amount.outstanding);
```

Remittance remains payer advice. `settled` reflects independently observed
money movement, and `outstanding` is payer liability less that settlement.

## Errors

```ts
import { HeyrafikiApiError } from "@heyrafiki/rafiki-js";

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
- [API contract](https://github.com/heyrafiki/contract)
- [Open insurance assurance benchmark](https://github.com/heyrafiki/proving-ground)
- [Webhooks](https://docs.heyrafiki.space/webhooks)
- [Security](https://github.com/heyrafiki/.github/blob/main/SECURITY.md)

## License

Licensed under the [Apache License 2.0](./LICENSE).
