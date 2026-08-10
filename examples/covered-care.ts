import { Heyrafiki } from "@heyrafiki/rafiki-js";

const apiKey = process.env.HEYRAFIKI_API_KEY;
if (!apiKey) throw new Error("HEYRAFIKI_API_KEY is required");

const baseUrl = process.env.HEYRAFIKI_BASE_URL;
const heyrafiki = new Heyrafiki({
  apiKey,
  ...(baseUrl ? { baseUrl } : {}),
});
const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
startsAt.setUTCHours(7, 0, 0, 0);
while ([0, 6].includes(startsAt.getUTCDay())) {
  startsAt.setUTCDate(startsAt.getUTCDate() + 1);
}
const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
const scheduledAt = startsAt.toISOString();

const eligibility = await heyrafiki.eligibilityChecks.create(
  {
    member_reference: "member_demo_jubilee_001",
    service_code: "psychotherapy-60",
    scheduled_at: scheduledAt,
    amount: 350000,
    currency: "KES",
  },
  { idempotencyKey: crypto.randomUUID() },
);

const booking = await heyrafiki.bookings.create(
  {
    practitioner_id: "prc_2481",
    starts_at: scheduledAt,
    ends_at: endsAt.toISOString(),
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
