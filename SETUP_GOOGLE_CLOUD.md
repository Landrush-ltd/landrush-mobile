# Google Cloud Console Setup Guide

This guide walks you through setting up Google Sign-In and Google Maps for the Landrush mobile app.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)
- The app's Android package name: `com.landrush.mobile` (configure in `app.json`)
- The app's iOS bundle ID: `com.landrush.mobile` (configure in `app.json`)

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Click **NEW PROJECT**
4. Enter name: `Landrush Mobile`
5. Click **CREATE**
6. Wait for the project to be created, then select it

---

## Step 2: Enable Required APIs

### Enable Google Sign-In API
1. In the left sidebar, click **APIs & Services** → **Library**
2. Search for **Google Identity Services API**
3. Click it, then click **ENABLE**

### Enable Google Maps APIs
1. In **APIs & Services** → **Library**, search for **Maps SDK for Android**
2. Click it, then click **ENABLE**
3. Go back to **Library**, search for **Maps SDK for iOS**
4. Click it, then click **ENABLE**

---

## Step 3: Create OAuth 2.0 Credentials

### 3a. Web Client (for web/Expo Web preview)
1. In the left sidebar, click **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted to configure the OAuth consent screen:
   - Click **CONFIGURE CONSENT SCREEN**
   - Select **External** → **CREATE**
   - Fill in:
     - **App name**: `Landrush`
     - **User support email**: your email
     - **Developer contact**: your email
   - Click **SAVE AND CONTINUE**
   - On "Scopes" page, click **SAVE AND CONTINUE**
   - Review and click **BACK TO DASHBOARD**

4. Back on Credentials page, click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Select **Web application**
6. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:8081
   http://localhost:19006
   http://localhost:3000
   https://auth.expo.io/@your-expo-username/landrush
   ```
7. Click **CREATE**
8. Copy the **Client ID** and save it for `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

### 3b. iOS Client
1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select **iOS**
3. Fill in:
   - **Name**: `Landrush iOS`
   - **Bundle ID**: `com.landrush.mobile`
4. Click **CREATE**
5. Copy the **Client ID** and save it for `.env` as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

### 3c. Android Client
1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select **Android**
3. Fill in:
   - **Name**: `Landrush Android`
   - **Package name**: `com.landrush.mobile`
   - **SHA-1 certificate fingerprint**: (see section below)
4. Click **CREATE**
5. Copy the **Client ID** and save it for `.env` as `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

#### Getting Android SHA-1 Fingerprint
If using EAS Build (managed), the SHA-1 is auto-generated. For local development:

```bash
# Generate with keytool (macOS/Linux/Windows with Java installed)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep "SHA1"
```

Or ask your Android release manager for the production keystore SHA-1.

---

## Step 4: Create Google Maps API Keys

### 4a. Android Maps API Key
1. In **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Click the **Edit API key** icon (pencil)
4. Under **API restrictions**, select **Restrict key**
5. Choose **Maps SDK for Android**
6. Under **Application restrictions**, select **Android apps**
7. Click **+ Add an item**
8. Enter:
   - **Package name**: `com.landrush.mobile`
   - **SHA-1 certificate fingerprint**: (same as above)
9. Click **DONE**, then **SAVE**
10. Copy the key and save it for `.env` as `GOOGLE_MAPS_ANDROID_API_KEY`

### 4b. iOS Maps API Key
1. Click **+ CREATE CREDENTIALS** → **API Key**
2. Click the **Edit API key** icon
3. Under **API restrictions**, select **Restrict key**
4. Choose **Maps SDK for iOS**
5. Under **Application restrictions**, select **iOS apps**
6. Click **+ Add an item**
7. Enter **Bundle ID**: `com.landrush.mobile`
8. Click **DONE**, then **SAVE**
9. Copy the key and save it for `.env` as `GOOGLE_MAPS_IOS_API_KEY`

---

## Step 5: Update `.env` File

Create or update `.env` in the project root:

```bash
# API Backend (leave empty for mock mode)
EXPO_PUBLIC_API_URL=

# Google Maps API Keys (build-time, no EXPO_PUBLIC_ prefix)
GOOGLE_MAPS_ANDROID_API_KEY=YOUR_ANDROID_MAPS_KEY
GOOGLE_MAPS_IOS_API_KEY=YOUR_IOS_MAPS_KEY

# Google OAuth 2.0 Client IDs (runtime, needs EXPO_PUBLIC_ prefix)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID

# Prembly NIN Verification (optional)
EXPO_PUBLIC_PREMBLY_APP_ID=your-app-id-here
EXPO_PUBLIC_PREMBLY_API_KEY=your-api-key-here
EXPO_PUBLIC_USE_LIVE_NIN=false
```

Replace all `YOUR_*` values with credentials from Google Cloud Console.

---

## Step 6: Verify Setup

### Test Google Sign-In (Web/Expo Web)
1. Run the app: `npx expo start --web`
2. Navigate to login or signup screen
3. Click "Google" button
4. You should see a Google OAuth popup
5. Sign in and confirm you're redirected to the home screen

### Test Google Maps (iOS/Android Device or Emulator)
1. Run the app on device/emulator
2. Open the map screen (Explore location → pick state → view listings)
3. Map should load and show markers
4. Confirm markers are clickable

### Verify OAuth Client IDs Are Working
If you see "Popup window was blocked by the browser" on web, ensure:
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set in `.env`
- The web client ID is created in Google Cloud Console
- Redirect URIs include your local dev URL

---

## Troubleshooting

### "Invalid Client" Error
- Check the client ID matches the platform (Web, iOS, Android)
- Verify package name/bundle ID matches exactly

### Maps Not Loading
- Verify Maps API is enabled in Google Cloud Console
- Check the API key is restricted to the correct app
- For Android: verify SHA-1 fingerprint is correct
- For iOS: verify Bundle ID is correct

### Google Sign-In Fails on Device
- Ensure the OAuth client ID is for the correct platform
- On Android: check package name and SHA-1 match
- On iOS: check Bundle ID matches

### "Redirect URI mismatch"
- Check the web client redirect URIs match your dev environment
- For Expo Web: redirect URI should be `http://localhost:19006` (or your web port)

---

## Next Steps

1. **Backend API**: Set `EXPO_PUBLIC_API_URL` to your backend URL (currently using mock data with empty value)
2. **EAS Build**: Add `projectId` to `app.json` for App Store/Play Store builds
3. **Paystack Integration**: Wire up payment flow for listings and inspections
4. **Compliance**: Submit OAuth consent screen for verification if going to production

For questions, refer to:
- [Google Sign-In for Mobile](https://developers.google.com/identity/protocols/oauth2/mobile)
- [Google Maps SDK Documentation](https://developers.google.com/maps/documentation)
- [Expo Authentication Guide](https://docs.expo.dev/build-reference/variables/)
