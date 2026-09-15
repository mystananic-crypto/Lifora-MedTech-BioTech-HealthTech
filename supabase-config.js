/* =============================================================================
   LIFORA — Supabase connection settings
   =============================================================================
   This is the ONLY file you need to edit to connect Lifora to your backend.

   1. Go to your Supabase project → Settings (gear icon) → API.
   2. Copy the "Project URL" and paste it below as LIFORA_SUPABASE_URL.
   3. Copy the "anon public" key (NOT the "service_role" key — never put
      that one in a website) and paste it below as LIFORA_SUPABASE_ANON_KEY.
   4. Save this file and push it to GitHub along with everything else.

   The anon key is safe to publish — it's designed to be used in a browser.
   It only works because of the access rules ("policies") set up by
   supabase-schema.sql, which currently allow anyone to read/write the demo
   tables. Do not put real patient data behind this key.
   ============================================================================= */

window.LIFORA_SUPABASE_URL = "PASTE_YOUR_PROJECT_URL_HERE";
window.LIFORA_SUPABASE_ANON_KEY = "PASTE_YOUR_ANON_PUBLIC_KEY_HERE";
