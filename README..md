# Lifora — Community Healthcare Continuity & Care Coordination Platform
### Smart India Hackathon 2026 | Problem ID: SIH26133

> **Right Care. Right Place. Right Time.**  
> A Rural-First, Multilingual, Community-Assisted Digital Healthcare Continuity and Care Coordination Platform designed for underserved communities in India. Designed to close the referral loop, coordinate primary to secondary care, and support frontline health workers (ASHAs) with responsible clinical decision support.

---

## 🌟 Key Highlights

- **Rural-First & Low-Literacy Friendly**: Designed specifically for rural and underserved patients with large touch-friendly action cards, clear icons with descriptive text, simple language, high-contrast visual design, and mobile-first responsiveness (including iPhone SE 320px–375px).
- **Multilingual Healthcare (English, हिन्दी, ગુજરાતી)**: Instant in-browser language switching across all portals, buttons, medical profiles, forms, and alerts with persistent language preference.
- **Featured Patient Profile (Lakshmi Devi)**: Dedicated patient profile for Lakshmi Devi (Patient ID: `AP-1001`, Age: 62, Status: Active) with hypertension and diabetes management, vitals history, compartmentalized medical records, prescriptions, and follow-ups.
- **Closed-Loop Healthcare Continuity**: Referrals do not end with sending patient data; the system tracks the patient across `SENT → ACCEPTED → EN ROUTE → RECEIVED → TREATMENT → COMPLETED` and automatically creates follow-up visits for community health workers upon discharge.
- **Responsible AI Clinical Decision Support**: Priority urgency indicators (Routine, Priority, Urgent) with multi-factor vitals evaluation (blood pressure, blood glucose, heart rate, SpO₂, age risk, and symptom keywords). Always provides transparent reasoning and clear non-diagnostic disclaimers.
- **Centralized Shared State & Persistence**: Pure frontend architecture using in-memory state with immediate `localStorage` synchronization and cross-tab reactive updates.
- **Low-Connectivity / Offline-Ready Demo**: Supports local registration queueing with on-device caching and one-click synchronization once connectivity is restored.
- **Zero-Setup Deployment**: Built with vanilla HTML5, CSS3, and modern ES6 JavaScript. No bundlers, npm packages, or server runtimes required — run directly in any browser or deploy on GitHub Pages in seconds.

---

## 📂 Project Structure

```
├── index.html     # Single-page application markup with 7 integrated portals & multilingual data-i18n
├── styles.css     # Complete design system, rural-first tokens, mobile responsive styles & theme
├── script.js      # Central routing engine, mock database, translations dictionary, AI decision support
└── README.md      # Project overview and hackathon documentation
```

---

## 🚀 Portals & Architecture

1. **Patient Portal**:
   - **Dashboard**: Rural-first touch cards (My Health, My Records, Appointment, Follow-up, Find Hospital, Emergency Help, My Medicines, Health ID & QR).
   - **My Health Profile**: Lakshmi Devi (AP-1001, Age 62, Active) complete vitals and demographic record.
   - **Medical Records**: Compartmentalized into Medical Vault, Medical History, Prescriptions, and Reports.
   - **Appointments & Referrals**: Active facility referrals and scheduled clinic visits.
   - **Follow-up**: Due follow-up care instructions and reminders.
   - **Digital Health ID & QR**: Scannable QR Health ID and consent controls.
   - **Emergency Assistance**: 1-click emergency contacts alert and local helpline access.
   - **Consent & Privacy & Access History**: Granular data sharing permissions and audit logs.

2. **Health Worker Portal (ASHA)**:
   - Community dashboard, 4-step registration wizard (Patient Information, Symptoms & Vitals, Health Details, Next Steps & Assessment), patient records, AI-assisted priority assessment, closed-loop facility referral dispatch, follow-up management, offline mode.

3. **Healthcare Staff Portal (Hospital)**:
   - Clinical Dashboard, Live patient queue, incoming referral acceptance & progression pipeline, emergency registration, patient identification, ward & bed management, authorized medical records.

4. **Healthcare Services Portal**:
   - Service Dashboard, facility locator, hospital & clinic availability, real-time blood group inventory tracking, essential medicines availability index, ambulance dispatch.

5. **Ambulance Portal**:
   - Pre-arrival emergency alert transmission, en-route vitals broadcasting, ETA tracking, and hospital handover confirmation.

6. **Hospital Admin Portal**:
   - Emergency department KPIs, workload charts, discharge distribution donut, staff duty rosters, and audit logs.

7. **Public Website**:
   - Health portal education, workflow walkthrough, emergency help guidance, and community contact.

---

## 💻 How to Run Locally

1. Clone or download this repository.
2. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
3. Click **"⚡ Quick Demo Sign In (1-Click Access)"** or use:
   - **Phone**: `9265470008` (Demo OTP: `140706`)
   - **Email**: `PS21058@gmail.com` (Demo OTP: `041005`)

---

## 🌐 Deploy to GitHub Pages (1 Minute)

1. Push these files to your GitHub repository `main` branch.
2. Go to repository **Settings** → **Pages**.
3. Under **Build and deployment** → **Branch**, select `main` and `/ (root)`.
4. Click **Save**. Your live demo will be published at `https://<username>.github.io/<repo-name>/`.

---

## 🧭 ASHA Portal — Current Status (this update)

The ASHA tab is now visible by name in the main portal navigation (not "Health
Worker"), and the ASHA landing screen has been rebuilt into **Today's
Priorities**: colour-coded, clickable task cards (Urgent/High-Risk Cases,
Follow-ups/Home Visits Due, Overdue Follow-ups, Pending Referrals, Registered
Today, Total Patients) plus a **⭐ What should I do now?** card that picks the
single most important next task from the demo data and opens straight into
that patient's profile. All counts are computed live from the existing
patients/referrals/follow-ups data — nothing is hard-coded.

This update reused the existing routing, translation, filter, and referral
systems rather than duplicating them, per the existing architecture.

## 🏠 Phase 2 — Digital Household Register + Smart Home Visit

Added **My Families**, a searchable household register (search by name,
household ID, phone, or village; filter by Pregnant / Newborn / High risk /
Referral pending). Each household opens a **Household Profile**: household
info, priority alerts, member list, a combined visit timeline across every
member, and that household's referrals.

Households reference existing patient records by ID (`memberIds`) — nothing
about a person is duplicated between the two systems. **Start Home Visit**
on a household jumps straight into the existing Record Visit flow: if the
household has one member it opens immediately with a reason inferred from
that person's record (pregnant → Pregnancy, newborn → Newborn, else Routine
follow-up); with more than one member it asks who the visit is for first.
The visit modal now also has a **Reason for visit** field, which prepends
a `[Reason]` tag to the saved note (Pregnancy, Postnatal, Newborn, Child
health, Immunisation, Nutrition, Illness, NCD, Referral follow-up, Elderly,
Other) — a lightweight version of a fully dynamic per-reason form.

Two new demo residents were added to exercise this end-to-end: **Rina Patel**
(pregnant, 32 weeks, elevated BP flagged as a concern) and **Baby Aarav**
(newborn, Day-7 HBNC-style follow-up due) — each with their own household,
a due follow-up, and (for Rina) a visit history showing the BP trend. Today's
Priorities now includes live **Pregnancy Follow-ups Due** and **Newborn
Follow-ups Due** cards computed from this data.

**Not yet built (still on the roadmap):** a dedicated multi-step Smart Home
Visit wizard with fully dynamic per-reason question sets (today's version is
a reason tag on the existing visit form, not a branching form), Postnatal
module, Immunization tracker, Nutrition module, Village Health surveillance
reporting, NCD/Chronic Care module, My Stock, VHND/VHSND planner, voice-first
data entry, a Care Team messaging screen for ASHA↔ANM/CHO communication,
bottom mobile navigation, and a global search across households/referrals/
tasks/facilities.

## 🚪 Phase 3 — No-login entry + 5-portal architecture + Nurse portal

**Removed entirely:** the fake Phone/Email OTP login, Quick Demo Sign-In, and
all related state (`LOGIN_STORAGE_KEY`, `DEMO_LOGIN`, OTP step logic). There
is no authentication of any kind left in the app.

**New entry point:** opening Lifora now shows a **Portal Selection** screen
— Lifora's name, "Right Care. Right Place. Right Time.", and five tappable
cards in this order: **Patient / Citizen, ASHA, Nurse, Hospital / Admin,
Healthcare Services**. Tapping a card is the entire "sign-in" mechanism —
internally it just sets which portal is open. A **← Change Portal** button
in the topbar returns to this screen from anywhere, without a page reload.
The screen is mobile-first from scratch: cards stack full-width on phones
and switch to a 2-column grid at ≥768px.

**Portal relabeling to match the requested 5-portal model:**
- "Healthcare Staff" → **Hospital / Admin**
- "Resource Staff" → **Healthcare Services**
- **Nurse** is a genuinely new portal (see below)
- Admin and Ambulance remain their own underlying sections (to avoid a
  risky full DOM merge in one pass) but are now reached via an explicit
  in-portal link — "Admin Overview →" inside Hospital/Admin, "Ambulance →"
  inside Healthcare Services — with a link back. From the user's
  perspective there are 5 portals; under the hood two of them currently
  have a linked sibling screen rather than being one flat section.

**New Nurse portal** — built for real, not stubbed: a Dashboard (assigned
patients, medication tasks due, clinical alerts, pending handover, discharge
preparations — all live counts), an Assigned Patients list, a Patient
Profile with per-patient care tasks and nursing notes, a Care Tasks screen
(filterable, with "mark complete"), and a Handover screen with an
auto-generated shift summary plus a note field for the next shift. It reuses
the existing hospital patient queue (`db.patients`) rather than duplicating
patient records — only `nurseTasks`, `nurseNotes`, and `handoverNote` are
new data.

**Verified, not just written:** this phase was run end-to-end in a headless
browser test (portal selection → each of the 5 portals → Nurse's full
dashboard→patients→profile→note→task-complete→handover flow → the two
cross-links) before being packaged. The only console output was a
jsdom-only `scrollTo` limitation that real browsers implement fine.

**Not yet done:**
- Full 5-breakpoint (360/375/390/412/430px) mobile QA pass across the
  *existing* screens (referral tables, multi-column forms, etc.) — only the
  new Portal Selection screen and the topbar/pill switcher have been
  mobile-first-built from scratch in this pass.
- Admin and Ambulance are cross-linked, not merged into Hospital/Admin and
  Healthcare Services at the DOM/section level.
- Role-specific referral action labels (e.g. ASHA sees "Create referral",
  Hospital sees "Accept referral") — the referral system itself is shared
  and works, but the wording isn't yet role-differentiated.
- Bottom mobile navigation, voice entry, and a global cross-portal search
  are still not built (see Phase 2's roadmap list above).

### 🐛 Bug fix (post-Phase 3): blank screen on portal click

The first version of Phase 3 shipped with the show/hide CSS logic for the
portal-selection screen **inverted** — clicking any portal card hid the
picker *and* left the app shell hidden too, so the whole page went blank.
This is fixed: the CSS now uses a single `body:not(.portal-chosen) ...`
rule to hide the app shell only in the "no portal chosen yet" state (the
same pattern the old login gate used, rather than two competing
show/hide rules fighting over specificity). Verified by rendering the real
stylesheet and checking computed `display` values for all 5 portals before
packaging, not just by re-reading the code.

### 🔒 Topbar pill strip removed — "← Change Portal" is now the only way to switch

The row of Patient / ASHA / Nurse / Hospital-Admin / Healthcare-Services pills
that sat in the topbar (for quick in-app switching) has been removed
entirely from `index.html`. It let someone jump straight from one portal to
another without going back through Portal Selection, which wasn't the
intended flow. **"← Change Portal" in the topbar is now the only way to
switch portals** — it always returns to the Portal Selection screen first.

Removing the pill strip also meant rebuilding the topbar's layout: it used
to be a 3-column grid (left group / pill strip / right group), and several
mobile breakpoints had extra rules to wrap the pill strip onto its own row
(with matching extra topbar height and sidebar offset). All of that has
been simplified to a plain 2-item flex row (left group, right group) at
every breakpoint, and the now-unnecessary extra height/offset rules were
removed rather than left in place hiding an empty gap. Verified with a
computed-style check same as above: topbar renders `display: flex`, no
`.portal-switcher` element remains anywhere in the page, and portal
switching still works correctly through Change Portal → picker → portal.

---

## 🏆 SIH 2026 Team Deliverable
- **Platform**: Lifora (SIH26133)
- **Built for**: Smart India Hackathon 2026

## ☁️ Phase 4 — Cloud backend (Supabase), optional and additive

Lifora can now share data across devices/browsers via a real backend
instead of each browser only ever seeing its own `localStorage` copy. This
is entirely **optional** — with no setup, the app works exactly as before.

**New files:**
- `supabase-schema.sql` — run once in your Supabase project's SQL Editor.
  Creates 6 tables (referrals, follow-ups, households, ASHA patients,
  hospital patients, nurse tasks), each storing full records as JSON so the
  schema doesn't need to track every field the app uses.
- `supabase-config.js` — the **only** file you edit: paste your Supabase
  Project URL and anon public key here.
- `cloud-sync.js` — the sync logic. Reads/writes the app's shared data via
  a small bridge (`window.LiforaApp`) exposed at the bottom of `script.js`.

**How it works:** a **☁ Sync** button in the topbar (and the ASHA portal's
existing "Sync Saved Records" button) pushes local data up, then pulls the
latest shared data back down and re-renders. There's no automatic
background sync yet — it's a manual, explicit action, which is easier to
demo and debug than a live realtime connection.

**Security note, worth repeating:** the demo access policy in
`supabase-schema.sql` allows anyone with the public anon key to read and
write these tables — normal for a public demo key, but it means this setup
is only appropriate for fictional demo data, never real patient records.

**Verified before shipping:** tested with a mocked Supabase client — push
then wipe local data then pull correctly restores it — and confirmed the
app behaves normally with zero console errors when the backend isn't
configured yet (the button just says so instead of failing silently).

**Not built yet:** live/realtime updates (Supabase Realtime subscriptions),
automatic sync on every save instead of a manual button, and conflict
resolution beyond "cloud wins on pull."


