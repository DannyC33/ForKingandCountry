import { NextResponse } from 'next/server';

const TEST_EMAIL = 'sms-test@servus-test.com';
const TEST_PHONE_DIGITS = '9089021994'; // 10-digit US number

const formats = [
  { label: 'With + prefix',         value: `+1${TEST_PHONE_DIGITS}` },
  { label: 'Without + prefix',      value: `1${TEST_PHONE_DIGITS}` },
  { label: 'Digits only (10)',       value: TEST_PHONE_DIGITS },
  { label: 'Formatted US',          value: `+1 (908) 902-1994` },
];

async function tryFormat(phone: string) {
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      attributes: { FIRSTNAME: 'SMS', LASTNAME: 'Test', SMS: phone },
      listIds: [parseInt(process.env.BREVO_LIST_ID ?? '3')],
      updateEnabled: true,
    }),
  });
  const text = await res.text();
  return { status: res.status, ok: res.ok, response: text };
}

export async function GET() {
  const results: Record<string, unknown>[] = [];

  for (const { label, value } of formats) {
    const result = await tryFormat(value);
    results.push({ format: label, value, ...result });
    // If one succeeds, no need to try the rest with a different email
    // updateEnabled:true means subsequent calls update the same contact
  }

  return NextResponse.json({ results });
}
