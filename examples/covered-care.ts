import { Heyrafiki } from "@heyrafiki/heyrafiki-js";

const apiKey = process.env.HEYRAFIKI_API_KEY;
if (!apiKey) throw new Error("HEYRAFIKI_API_KEY is required");

const heyrafiki = new Heyrafiki({ apiKey });
const scheduledAt = "2026-08-05T07:00:00.000Z";

const eligibility = await heyrafiki.eligibilityChecks.create(
  {
    member_reference: "member_demo_jubilee_001",
    service_code: "psychotherapy-60",
    scheduled_at: scheduledAt,
    amount: 380000,
    currency: "KES",
  },
  { idempotencyKey: crypto.randomUUID() },
);

const booking = await heyrafiki.bookings.create(
  {
    practitioner_id: "prc_2481",
    starts_at: scheduledAt,
    ends_at: "2026-08-05T08:00:00.000Z",
    format: "online",
    payment_source: "covered",
  },
  { idempotencyKey: crypto.randomUUID() },
);

const preauthorization = await heyrafiki.preauthorizations.create(
  {
    eligibility_check_id: eligibility.id,
    booking_id: booking.id,
  },
  { idempotencyKey: crypto.randomUUID() },
);

console.log({
  booking_id: booking.id,
  eligibility_check_id: eligibility.id,
  preauthorization_id: preauthorization.id,
});
