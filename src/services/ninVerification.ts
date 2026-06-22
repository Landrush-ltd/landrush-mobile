/**
 * NIN Verification via Prembly (Identitypass)
 *
 * Real API docs: https://docs.prembly.com/docs/nin-verification
 *
 * To enable live lookups:
 *  1. Sign up at https://app.prembly.com
 *  2. Create an app and copy the App-Id + x-api-key
 *  3. Set EXPO_PUBLIC_PREMBLY_APP_ID and EXPO_PUBLIC_PREMBLY_API_KEY
 *     in your .env file (Expo auto-exposes EXPO_PUBLIC_* to the client)
 *  4. Flip USE_LIVE_API to true below
 */

const USE_LIVE_API = false; // set true once you have credentials

const PREMBLY_ENDPOINT = 'https://api.prembly.com/identitypass/verification/nin';
const APP_ID  = process.env.EXPO_PUBLIC_PREMBLY_APP_ID  ?? '';
const API_KEY = process.env.EXPO_PUBLIC_PREMBLY_API_KEY ?? '';

export interface NINRecord {
  firstName:  string;
  lastName:   string;
  middleName: string;
  gender:     string;
  dob:        string;   // YYYY-MM-DD
  phone:      string;
}

export class NINLookupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NINLookupError';
  }
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

    if (!res.ok) {
      throw new NINLookupError('Network error — please check your connection');
    }

    const json = await res.json();

    if (!json.status) {
      throw new NINLookupError(json.detail ?? 'NIN not found in NIMC database');
    }

    // Prembly can nest nin_data at different levels depending on API version:
    //   json.nin_data            (v1)
    //   json.data.nin_data       (v2 wrapper)
    //   json.data                (fallback)
    const d = json.nin_data ?? json.data?.nin_data ?? json.data ?? {};

    // NIMC field names vary — handle all known variants
    const firstName  = d.firstname   ?? d.first_name   ?? d.firstName   ?? '';
    const lastName   = d.surname     ?? d.last_name    ?? d.lastName    ?? d.lastname ?? '';
    const middleName = d.middlename  ?? d.middle_name  ?? d.middleName  ?? '';

    // Sanity-check: if firstName looks like a surname (ALL_CAPS single token
    // and lastName is empty) swap them so display is always Given → Family.
    // NIMC occasionally returns records with reversed name fields.
    if (lastName === '' && firstName.includes(' ')) {
      const parts = firstName.trim().split(/\s+/);
      return {
        firstName:  parts.slice(1).join(' '),
        lastName:   parts[0],
        middleName,
        gender:     (d.gender ?? '').toLowerCase() === 'm' ? 'Male' : (d.gender ?? '').toLowerCase() === 'f' ? 'Female' : d.gender ?? '',
        dob:        d.birthdate ?? d.dob ?? '',
        phone:      d.phone ?? '',
      };
    }

    return {
      firstName,
      lastName,
      middleName,
      gender:  (d.gender ?? '').toLowerCase() === 'm' ? 'Male' : (d.gender ?? '').toLowerCase() === 'f' ? 'Female' : d.gender ?? '',
      dob:     d.birthdate ?? d.dob ?? '',
      phone:   d.phone ?? '',
    };
  }

  // ── Mock (dev) ────────────────────────────────────────────────
  await new Promise<void>((resolve) => setTimeout(resolve, 1800));

  // Simulate "not found" for NIN starting with 0
  if (nin.startsWith('0')) {
    throw new NINLookupError('NIN not found in NIMC database. Check the number and try again.');
  }

  // Everything else returns a realistic record
  return {
    firstName:  'KENNETH',
    lastName:   'UMOEKPE',
    middleName: 'EMEKA',
    gender:     'Male',
    dob:        '1995-03-14',
    phone:      '0803*****78',
  };
}
