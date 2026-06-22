/**
 * NIN Verification via Prembly (Identitypass)
 *
 * Enable live mode: set EXPO_PUBLIC_USE_LIVE_NIN=true in .env
 */

const USE_LIVE_API =
  process.env.EXPO_PUBLIC_USE_LIVE_NIN === 'true' || false;

const ENDPOINT_NIN_PREVIEW   = 'https://api.prembly.com/identitypass/verification/nin_wo_face';
const ENDPOINT_NIN_WITH_FACE = 'https://api.prembly.com/identitypass/verification/nin';

const APP_ID  = process.env.EXPO_PUBLIC_PREMBLY_APP_ID  ?? '';
const API_KEY = process.env.EXPO_PUBLIC_PREMBLY_API_KEY ?? '';

export interface NINRecord {
  firstName:  string;
  lastName:   string;
  middleName: string;
  gender:     string;
  dob:        string;
  phone:      string;
  _raw?: Record<string, string>;
}

export class NINLookupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NINLookupError';
  }
}

function normaliseGender(raw: string | undefined): string {
  const g = (raw ?? '').toLowerCase().trim();
  if (g === 'm' || g === 'male')   return 'Male';
  if (g === 'f' || g === 'female') return 'Female';
  return raw ?? '';
}

function parsePremblyData(json: any): NINRecord {
  if (!json.status) {
    const msg = json?.detail ?? json?.message ?? json?.error ?? 'NIN not found in NIMC database';
    throw new NINLookupError(String(msg));
  }

  const d: Record<string, any> =
    json.nin_data ??
    json.data?.nin_data ??
    json.data ??
    {};

  console.log('[NIN] extracted fields:', JSON.stringify(d, null, 2));

  const firstName  = (d.firstname   ?? d.first_name   ?? d.firstName   ?? '').trim();
  const lastName   = (d.surname     ?? d.last_name    ?? d.lastName    ?? d.lastname ?? '').trim();
  const middleName = (d.middlename  ?? d.middle_name  ?? d.middleName  ?? '').trim();

  const _raw: Record<string, string> = {};
  Object.entries(d).forEach(([k, v]) => {
    if (typeof v === 'string' || typeof v === 'number') _raw[k] = String(v);
  });

  return {
    firstName,
    lastName,
    middleName,
    gender: normaliseGender(d.gender),
    dob:    d.birthdate ?? d.birth_date ?? d.dob ?? '',
    phone:  d.phone ?? d.phone_number ?? '',
    _raw,
  };
}

async function premblyPost(endpoint: string, body: Record<string, string>) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'app-id':       APP_ID,
      'x-api-key':    API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log('[NIN] raw response:', text);
  try {
    return JSON.parse(text);
  } catch {
    throw new NINLookupError('Unexpected response from verification server');
  }
}

/** Step 1 — fetch name from NIMC without a selfie (preview only). */
export async function lookupNIN(nin: string): Promise<NINRecord> {
  if (USE_LIVE_API) {
    const json = await premblyPost(ENDPOINT_NIN_PREVIEW, { number: nin });
    return parsePremblyData(json);
  }

  await new Promise<void>((r) => setTimeout(r, 1600));
  if (nin.startsWith('0')) throw new NINLookupError('NIN not found. Check the number and try again.');

  return {
    firstName: 'KENNETH', middleName: 'EMEKA', lastName: 'UMOEKPE',
    gender: 'Male', dob: '1995-03-14', phone: '0803*****78',
  };
}

/**
 * Step 2 — submit NIN + selfie to Prembly for face-match verification.
 * imageBase64 should NOT include the data:image/ prefix.
 */
export async function verifyNINWithFace(nin: string, imageBase64: string): Promise<NINRecord> {
  if (USE_LIVE_API) {
    const json = await premblyPost(ENDPOINT_NIN_WITH_FACE, {
      number: nin,
      image:  imageBase64,
    });
    return parsePremblyData(json);
  }

  await new Promise<void>((r) => setTimeout(r, 2200));
  return {
    firstName: 'KENNETH', middleName: 'EMEKA', lastName: 'UMOEKPE',
    gender: 'Male', dob: '1995-03-14', phone: '0803*****78',
  };
}
