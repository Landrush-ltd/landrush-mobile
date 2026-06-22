/**
 * NIN Verification via Prembly (Identitypass)
 *
 * Enable live mode: set EXPO_PUBLIC_USE_LIVE_NIN=true in .env
 * (or flip USE_LIVE_API below to true for a quick local test)
 */

const USE_LIVE_API =
  process.env.EXPO_PUBLIC_USE_LIVE_NIN === 'true' || false;

// nin_wo_face = NIN-only lookup, no selfie required
const PREMBLY_ENDPOINT =
  'https://api.prembly.com/identitypass/verification/nin_wo_face';

const APP_ID  = process.env.EXPO_PUBLIC_PREMBLY_APP_ID  ?? '';
const API_KEY = process.env.EXPO_PUBLIC_PREMBLY_API_KEY ?? '';

export interface NINRecord {
  firstName:  string;
  lastName:   string;
  middleName: string;
  gender:     string;
  dob:        string;
  phone:      string;
  /** Raw key→value pairs from Prembly — visible in the debug panel */
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

export async function lookupNIN(nin: string): Promise<NINRecord> {
  if (USE_LIVE_API) {
    const res = await fetch(PREMBLY_ENDPOINT, {
      method: 'POST',
      headers: {
        'app-id':       APP_ID,
        'x-api-key':    API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ number: nin }),
    });

    const text = await res.text();

    // Log raw so you can inspect in Metro / browser console
    console.log('[NIN] raw response:', text);

    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      throw new NINLookupError('Unexpected response from verification server');
    }

    console.log('[NIN] parsed json:', JSON.stringify(json, null, 2));

    if (!res.ok || !json.status) {
      const msg = json?.detail ?? json?.message ?? json?.error ?? 'NIN not found in NIMC database';
      throw new NINLookupError(String(msg));
    }

    // Prembly nests the data under nin_data (sometimes inside json.data)
    const d: Record<string, any> =
      json.nin_data ??
      json.data?.nin_data ??
      json.data ??
      {};

    console.log('[NIN] extracted record fields:', JSON.stringify(d, null, 2));

    // Pull every known field variant
    const firstName  = (d.firstname   ?? d.first_name   ?? d.firstName   ?? '').trim();
    const lastName   = (d.surname     ?? d.last_name    ?? d.lastName    ?? d.lastname ?? '').trim();
    const middleName = (d.middlename  ?? d.middle_name  ?? d.middleName  ?? '').trim();

    // Build a flat string map of all fields for the debug panel
    const _raw: Record<string, string> = {};
    Object.entries(d).forEach(([k, v]) => {
      if (typeof v === 'string' || typeof v === 'number') {
        _raw[k] = String(v);
      }
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

  // ── Mock (dev) ────────────────────────────────────────────────
  await new Promise<void>((r) => setTimeout(r, 1600));

  if (nin.startsWith('0')) {
    throw new NINLookupError(
      'NIN not found in NIMC database. Check the number and try again.',
    );
  }

  return {
    firstName:  'KENNETH',
    middleName: 'EMEKA',
    lastName:   'UMOEKPE',
    gender:     'Male',
    dob:        '1995-03-14',
    phone:      '0803*****78',
  };
}
