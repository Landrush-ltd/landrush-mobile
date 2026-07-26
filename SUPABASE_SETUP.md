# Landrush Supabase setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/migrations/202607260001_initial_landrush.sql`.
3. Copy `.env.example` to `.env` and add the project URL and publishable key from the Connect panel.
4. Restart Expo with `npm run web`.
5. Create the first user, then promote that account in the SQL editor:

```sql
update public.profiles
set role = 'admin', is_verified = true
where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
```

Never put the secret/service-role key in an Expo environment variable. Administrator authority is enforced by database RLS through the profile role.

Uploaded listing photos go to the public `listing-media` bucket. Ownership documents go to the private `listing-documents` bucket and are readable only by the listing owner and administrators.
