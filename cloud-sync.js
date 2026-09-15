/* =============================================================================
   LIFORA — Cloud sync layer (Supabase)
   =============================================================================
   This file is additive: it does not change how the app works if you never
   click "☁ Sync". It reads/writes the shared browser data (via the small
   window.LiforaApp bridge exposed at the bottom of script.js) to your
   Supabase project, so different people on different devices can share the
   same referrals/patients/etc. instead of each browser only ever seeing
   its own local copy.

   Load order matters — this file expects, in this order, already loaded
   before it runs:
     1. script.js              (defines window.LiforaApp)
     2. the Supabase JS CDN    (defines window.supabase)
     3. supabase-config.js     (defines window.LIFORA_SUPABASE_URL / _ANON_KEY)
   ============================================================================= */

(function () {
  // Local array (in the app's shared `db` object) <-> Supabase table name.
  const TABLES = {
    referrals: "lifora_referrals",
    followUps: "lifora_follow_ups",
    households: "lifora_households",
    ashaPatients: "lifora_asha_patients",
    patients: "lifora_patients",
    nurseTasks: "lifora_nurse_tasks"
  };

  function isConfigured() {
    const url = window.LIFORA_SUPABASE_URL;
    const key = window.LIFORA_SUPABASE_ANON_KEY;
    return !!url && !!key &&
      !url.includes("PASTE_YOUR") && !key.includes("PASTE_YOUR") &&
      window.supabase && typeof window.supabase.createClient === "function";
  }

  let client = null;
  function getClient() {
    if (!client && isConfigured()) {
      client = window.supabase.createClient(window.LIFORA_SUPABASE_URL, window.LIFORA_SUPABASE_ANON_KEY);
    }
    return client;
  }

  async function pushToCloud() {
    const sb = getClient();
    if (!sb || !window.LiforaApp) return { ok: false, reason: "not configured" };
    const db = window.LiforaApp.getDB();
    const errors = [];

    for (const [localKey, table] of Object.entries(TABLES)) {
      const list = db[localKey];
      if (!Array.isArray(list) || !list.length) continue;
      const rows = list.map(item => ({
        id: String(item.id),
        data: item,
        updated_at: new Date().toISOString()
      }));
      const { error } = await sb.from(table).upsert(rows, { onConflict: "id" });
      if (error) errors.push(`${table}: ${error.message}`);
    }

    return { ok: errors.length === 0, errors };
  }

  async function pullFromCloud() {
    const sb = getClient();
    if (!sb || !window.LiforaApp) return { ok: false, reason: "not configured" };
    const db = window.LiforaApp.getDB();
    const errors = [];

    for (const [localKey, table] of Object.entries(TABLES)) {
      const { data, error } = await sb.from(table).select("*").order("updated_at", { ascending: true });
      if (error) { errors.push(`${table}: ${error.message}`); continue; }
      if (data && data.length) {
        db[localKey] = data.map(row => row.data);
      }
    }

    if (errors.length === 0) {
      window.LiforaApp.saveDB();
      window.LiforaApp.rerenderActiveView();
    }

    return { ok: errors.length === 0, errors };
  }

  async function syncNow(button) {
    if (!isConfigured()) {
      window.LiforaApp && window.LiforaApp.toast
        ? window.LiforaApp.toast("Cloud backend not connected yet — fill in supabase-config.js first")
        : alert("Cloud backend not connected yet — fill in supabase-config.js first");
      return;
    }
    const originalText = button ? button.textContent : null;
    if (button) { button.disabled = true; button.textContent = "☁ Syncing…"; }

    const pushResult = await pushToCloud();
    const pullResult = await pullFromCloud();

    if (button) { button.disabled = false; button.textContent = originalText; }

    const ok = pushResult.ok && pullResult.ok;
    const msg = ok
      ? "Synced with the cloud — shared data updated"
      : "Sync finished with some errors — check the browser console";
    if (!ok) console.warn("Lifora cloud sync errors:", pushResult.errors, pullResult.errors);
    window.LiforaApp && window.LiforaApp.toast ? window.LiforaApp.toast(msg) : alert(msg);
  }

  function wireButtons() {
    const globalBtn = document.getElementById("cloudSyncBtn");
    if (globalBtn) globalBtn.addEventListener("click", () => syncNow(globalBtn));

    // Piggyback on the ASHA portal's existing "Sync Saved Records" button
    // (its own offline-queue simulation still runs — this just also does a
    // real cloud sync alongside it).
    const ashaBtn = document.getElementById("ashaSyncNowBtn");
    if (ashaBtn) ashaBtn.addEventListener("click", () => syncNow(null));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireButtons);
  } else {
    wireButtons();
  }

  // Exposed for debugging from the browser console if needed:
  // LiforaCloud.pushToCloud(), LiforaCloud.pullFromCloud()
  window.LiforaCloud = { pushToCloud, pullFromCloud, isConfigured };
})();
