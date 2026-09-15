/* ==========================================================================
   LIFORA — Application logic
   Everything here runs against an in-memory mock "database" (plain JS
   objects/arrays). No network calls are made — this is a self-contained
   front-end prototype: every screen reads and writes the same shared state,
   so an action in one portal (e.g. a nurse confirming a triage priority)
   is reflected immediately in every other screen that depends on it
   (the live queue, the dashboard summary, the audit log, notifications).
   ========================================================================== */

(function () {
  "use strict";

  /* ========================================================================
     0. MULTILINGUAL TRANSLATION ENGINE
     ------------------------------------------------------------------------
     Central translation dictionary for English, Hindi and Gujarati.
     All translatable UI strings use data-i18n="key" attributes in HTML.
     Call applyLanguage(langCode) to switch. Language is persisted in
     localStorage under 'lifora_language_v1'.
     ======================================================================== */

  const LANG_STORAGE_KEY = "lifora_language_v1";
  let currentLang = "en";

  const translations = {
    en: {
      /* --- Login / Auth --- */
      login_welcome: "Welcome to Lifora",
      login_subtitle: "Right Care. Right Place. Right Time.",
      login_demo_note: "Prototype login — no real SMS or email is sent. Use demo accounts below.",
      login_quick_demo: "⚡ Quick Demo Sign In (1-Click)",
      login_phone_tab: "📱 Phone",
      login_email_tab: "✉️ Email",
      login_phone_label: "Phone number",
      login_phone_placeholder: "10-digit number",
      login_phone_hint: "Demo number:",
      login_email_label: "Email address",
      login_email_placeholder: "you@example.com",
      login_email_hint: "Demo email:",
      login_send_otp: "Send OTP",
      login_enter_otp: "Enter OTP",
      login_otp_placeholder: "6-digit code",
      login_verify: "Verify & Sign In",
      login_change_method: "← Use different number/email",
      login_asha_help: "Need help using Lifora? Your ASHA / community health worker can assist you.",

      /* --- Portal switcher --- */
      portal_public: "Public",
      portal_patient: "Patient",
      portal_asha: "ASHA",
      portal_hospital: "Hospital / Admin",
      portal_nurse: "Nurse",
      portal_ambulance: "Ambulance",
      portal_resource: "Healthcare Services",
      portal_admin: "Admin",

      /* --- Network status --- */
      network_connected: "Connected",
      network_offline: "Offline",
      network_offline_msg: "Offline — data will sync when network returns",

      /* --- Emergency mode --- */
      emergency_mode_btn: "Emergency Mode",

      /* --- Topbar / header --- */
      change_portal: "← Change Portal",
      signed_in: "✓ Signed in",

      /* --- PUBLIC PORTAL nav --- */
      public_nav_home: "Home",
      public_nav_about: "About Lifora",
      public_nav_how: "How It Works",
      public_nav_help: "Emergency Help",
      public_nav_contact: "Contact",
      public_portal_title: "Public Website",

      /* --- PATIENT PORTAL nav --- */
      patient_portal_title: "Patient Portal",
      patient_nav_dashboard: "Dashboard",
      patient_nav_healthid: "Digital Health ID",
      patient_nav_profile: "My Health Profile",
      patient_nav_records: "Medical Records",
      patient_nav_vault: "Medical Vault",
      patient_nav_history: "Medical History",
      patient_nav_prescriptions: "Prescriptions",
      patient_nav_reports: "Reports",
      patient_nav_qr: "QR Health ID",
      patient_nav_contacts: "Emergency Contacts",
      patient_nav_consent: "Consent & Privacy",
      patient_nav_access: "Access History",
      patient_nav_assist: "Emergency Assistance",
      patient_nav_appointments: "Appointments",
      patient_nav_referrals: "Referrals & Follow-up",

      /* --- Patient dashboard --- */
      patient_greeting: "Hello",
      patient_dashboard_title: "Patient Portal",
      patient_health_btn: "My Health",
      patient_records_btn: "My Records",
      patient_appointment_btn: "Appointment",
      patient_followup_btn: "Follow-up",
      patient_hospital_btn: "Find Hospital",
      patient_emergency_btn: "Emergency Help",
      patient_medicines_btn: "My Medicines",
      patient_healthid_btn: "Health ID & QR",

      /* --- Patient Profile --- */
      patient_profile_overview: "Overview",
      patient_profile_age: "Age",
      patient_profile_status: "Status",
      patient_profile_status_active: "Active",

      /* --- Medical Records sections --- */
      medical_records_heading: "Medical Records",
      medical_vault_tab: "Medical Vault",
      medical_history_tab: "Medical History",
      prescriptions_tab: "Prescriptions",
      reports_tab: "Reports & Investigations",

      /* --- Medical Vault --- */
      vault_upload_btn: "+ Upload Document",
      vault_filter_all: "All",
      vault_filter_lab: "Lab Reports",
      vault_filter_rx: "Prescriptions",
      vault_filter_imaging: "Imaging",
      vault_filter_discharge: "Discharge Summaries",
      vault_filter_vaccination: "Vaccination",
      vault_filter_diagnosis: "Diagnosis",
      vault_filter_other: "Other",
      vault_empty: "No documents in this category yet.",

      /* --- Medical History --- */
      history_heading: "Medical History",
      history_sub: "Visit & condition timeline",

      /* --- Prescriptions --- */
      rx_heading: "Prescriptions",
      rx_sub: "Current & past prescriptions",
      rx_col_medication: "Medication",
      rx_col_dosage: "Dosage",
      rx_col_prescribed: "Prescribed by",
      rx_col_date: "Date",
      rx_col_status: "Status",

      /* --- Reports --- */
      reports_heading: "Reports & Investigations",
      reports_sub: "Lab & imaging reports",
      reports_empty: "No lab or imaging reports uploaded yet.",

      /* --- Health ID --- */
      healthid_heading: "Your Lifora Health ID",
      healthid_eyebrow: "Digital Health ID",
      healthid_dob: "Date of birth",
      healthid_blood: "Blood group",
      healthid_allergies: "Allergies",
      healthid_conditions: "Major conditions",
      healthid_medication: "Current medication",
      healthid_surgery: "Previous surgery",
      healthid_contact: "Primary emergency contact",

      /* --- QR Health ID --- */
      qr_heading: "Share your information, on your terms",
      qr_eyebrow: "QR Health ID",
      qr_hint: "This is a real, scannable QR code encoding your Health ID. Show it to authorized healthcare staff.",
      qr_simulate_scan: "Simulate hospital scan",
      qr_share_title: "What's shared when approved",
      qr_blood_allergies: "Blood group & allergies",
      qr_medications: "Current medications",
      qr_conditions: "Major conditions & surgeries",
      qr_full_vault: "Full medical vault",
      qr_contacts: "Emergency contacts",

      /* --- Emergency Contacts --- */
      contacts_heading: "Emergency Contacts",
      contacts_sub: "Who we reach, and in what order",
      contacts_note: "If the primary contact does not respond within a configured window, Lifora escalates to the next contact.",

      /* --- Consent --- */
      consent_heading: "Consent & Privacy Center",
      consent_eyebrow: "Consent & Privacy",
      consent_qr_sharing: "QR sharing",
      consent_qr_sharing_desc: "Allow hospitals to request access via your QR code",
      consent_emergency_access: "Emergency access",
      consent_emergency_access_desc: "Allow emergency staff to view your Emergency Snapshot without a live approval",
      consent_doc_sharing: "Document sharing",
      consent_doc_sharing_desc: "Allow doctors treating you to view Medical Vault documents relevant to the visit",
      consent_research: "Research & analytics",
      consent_research_desc: "Allow de-identified data to inform hospital analytics",

      /* --- Access History --- */
      access_heading: "Who has viewed your information",
      access_eyebrow: "Access History",
      access_col_by: "Accessed by",
      access_col_type: "Type of information",
      access_col_date: "Date",
      access_col_time: "Time",
      access_empty: "No access recorded yet.",

      /* --- Emergency Assistance --- */
      emergency_heading: "Need help right now?",
      emergency_eyebrow: "Emergency Assistance",
      emergency_call_title: "Call local emergency services",
      emergency_call_desc: "For any life-threatening situation, call your local emergency number first.",
      emergency_alert_title: "Alert your emergency contacts",
      emergency_alert_btn: "Notify my emergency contacts",
      emergency_qr_title: "Share your QR Health ID",
      emergency_qr_btn: "Open QR Health ID",

      /* --- Medical Profile --- */
      profile_heading: "Personal & medical details",
      profile_eyebrow: "My Health Profile",
      profile_name: "Full name",
      profile_dob: "Date of birth",
      profile_blood: "Blood group",
      profile_allergies: "Allergies",
      profile_conditions: "Major medical conditions",
      profile_medications: "Current medications",
      profile_surgeries: "Previous surgeries",
      profile_save: "Save Profile",
      profile_saved: "✅ Profile changes saved.",

      /* --- ASHA / Health Worker portal nav --- */
      asha_portal_title: "ASHA Worker Portal",
      asha_nav_dashboard: "Dashboard",
      asha_nav_help_patient: "Help a Patient",
      asha_nav_register: "Register Patient",
      asha_nav_patients: "Patients",
      asha_nav_urgency: "Priority Assessment",
      asha_nav_referrals: "Referrals",
      asha_nav_followups: "Follow-Ups",
      asha_nav_medicines: "Medicines",
      asha_nav_diagnostics: "Diagnostics",
      asha_nav_teleconsult: "Teleconsultation",
      asha_nav_emergency: "Emergency",

      /* --- ASHA Dashboard --- */
      asha_dashboard_greeting: "Good morning, Nurse Kulkarni",
      asha_dashboard_eyebrow: "Community Health Worker",
      asha_help_patient_title: "Help a Patient",
      asha_help_patient_desc: "Assist a patient who needs healthcare. Register them, record their health details, and connect them to appropriate care.",
      asha_help_patient_btn: "Start — Help a Patient",
      asha_quick_actions: "Quick Actions",
      asha_register_btn: "Register Patient",
      asha_find_patient_btn: "Find Patient",
      asha_priority_btn: "Priority Assessment",
      asha_referrals_btn: "Referrals",
      asha_followups_btn: "Follow-Ups",
      asha_emergency_btn: "Emergency",
      asha_offline_title: "Low-connectivity mode",
      asha_offline_desc: "Community visits often happen with poor or no signal. While offline, new registrations are saved on this device.",
      asha_offline_toggle: "📡 Simulate Offline Mode",
      asha_online_toggle: "🔌 Simulate Online Mode",
      asha_sync_btn: "Sync Saved Records",
      asha_followups_today: "Follow-ups due today",
      asha_registered_today: "Registered today",
      asha_total_patients: "Total patients",
      asha_high_risk: "High-risk patients",
      asha_pending_referrals: "Pending referrals",
      asha_followups_due: "Follow-ups due",

      /* --- ASHA Register wizard --- */
      asha_register_title: "Register Patient",
      asha_step_of: "Step",
      asha_step_of_4: "of 4",
      asha_step1_title: "Patient Information",
      asha_step2_title: "Symptoms & Vitals",
      asha_step3_title: "Health Details",
      asha_step4_title: "Next Steps & Assessment",
      asha_name_label: "Full name",
      asha_name_placeholder: "e.g. Lakshmi Devi",
      asha_age_label: "Age",
      asha_age_placeholder: "e.g. 34",
      asha_gender_label: "Gender",
      asha_phone_label: "Phone",
      asha_phone_placeholder: "10-digit number",
      asha_village_label: "Village",
      asha_village_placeholder: "e.g. Rampura",
      asha_emergency_contact_label: "Emergency contact",
      asha_emergency_contact_placeholder: "Name & phone",
      asha_next_btn: "Next →",
      asha_back_btn: "← Back",
      asha_finish_btn: "Run Priority Assessment",
      asha_step1_error: "Please enter the patient's name and age.",

      /* --- ASHA Step 2 - Vitals --- */
      asha_bp_label: "Blood pressure",
      asha_pulse_label: "Pulse (bpm)",
      asha_temp_label: "Temperature (°F)",
      asha_sugar_label: "Blood sugar (mg/dL)",
      asha_spo2_label: "SpO₂ (%)",
      asha_resp_label: "Respiratory rate",
      asha_weight_label: "Weight (kg)",

      /* --- ASHA Step 3 - Health Details --- */
      asha_blood_group_label: "Blood group",
      asha_allergies_label: "Allergies",
      asha_conditions_label: "Existing conditions",
      asha_medicines_label: "Current medicines",

      /* --- ASHA Step 4 - Symptoms --- */
      asha_symptoms_note: "Voice input is planned for a future update — use the quick buttons or type below.",
      asha_symptoms_other: "Other / additional details",
      asha_symptoms_other_placeholder: "Anything else worth noting",
      asha_symptom_weakness: "Weakness",
      asha_symptom_dizziness: "Dizziness",
      asha_symptom_fever: "Fever",
      asha_symptom_cough: "Cough",
      asha_symptom_breathing: "Breathing Difficulty",
      asha_symptom_chest: "Chest Pain",
      asha_symptom_bleeding: "Bleeding",
      asha_symptom_vomiting: "Vomiting",
      asha_symptom_pain: "Severe Pain",
      asha_symptom_pregnancy: "Pregnancy Concern",

      /* --- ASHA Patients list --- */
      asha_patients_title: "Registered Patients",
      asha_patients_eyebrow: "Patients",
      asha_register_new_btn: "+ Register patient",
      asha_col_name: "Name",
      asha_col_age_gender: "Age / Gender",
      asha_col_village: "Village",
      asha_col_risk: "Risk level",
      asha_col_last_visit: "Last visit",
      asha_col_next_followup: "Next follow-up",
      asha_col_worker: "Assigned worker",
      asha_check_urgency_btn: "Check Urgency",
      asha_filter_all: "All",
      asha_filter_high: "High risk",
      asha_filter_maternal: "Maternal",
      asha_filter_children: "Children",
      asha_filter_elderly: "Elderly",

      /* --- ASHA Patient Profile --- */
      asha_profile_eyebrow: "Patient Profile",
      asha_profile_back: "← Back to Patients",
      asha_profile_overview: "Overview",
      asha_profile_age_gender: "Age / Gender",
      asha_profile_village: "Village",
      asha_profile_phone: "Phone",
      asha_profile_emerg_contact: "Emergency contact",
      asha_profile_blood_group: "Blood group",
      asha_profile_risk: "Risk level",
      asha_profile_latest_vitals: "Latest Vitals",
      asha_profile_bp: "Blood pressure",
      asha_profile_pulse: "Pulse",
      asha_profile_sugar: "Blood sugar",
      asha_profile_temp: "Temperature",
      asha_profile_spo2: "SpO₂",
      asha_profile_weight: "Weight",
      asha_profile_conditions_med: "Conditions & Medication",
      asha_profile_conditions: "Conditions",
      asha_profile_allergies: "Allergies",
      asha_profile_medicines: "Current medicines",
      asha_profile_symptoms: "Latest symptoms",
      asha_profile_quick_actions: "Quick Actions",
      asha_profile_record_vitals: "Record Vitals",
      asha_profile_record_visit: "Record New Visit",
      asha_profile_check_urgency: "Check Urgency",
      asha_profile_referral: "Create Referral",
      asha_profile_schedule_followup: "Schedule Follow-Up",
      asha_profile_visit_history: "Visit History",
      asha_profile_referral_history: "Referral History",
      asha_profile_followups: "Follow-Ups",
      asha_ref_col_id: "Referral ID",
      asha_ref_col_facility: "Facility",
      asha_ref_col_urgency: "Urgency",
      asha_ref_col_status: "Status",

      /* --- ASHA Urgency/Triage --- */
      asha_urgency_title: "Health Assessment",
      asha_urgency_eyebrow: "AI-Assisted Priority Support",
      asha_urgency_patient_label: "Which patient is this for?",
      asha_urgency_run_btn: "Run Priority Assessment",
      asha_urgency_result_title: "Priority Assessment Result",
      asha_urgency_result_empty: "Select a patient to run priority assessment.",
      asha_urgency_find_care: "Find Appropriate Care",
      asha_urgency_view_summary: "View Clinical Summary",
      asha_urgency_disclaimer: "This assessment provides decision support and does not replace professional clinical judgement.",

      /* --- ASHA Referrals --- */
      asha_referrals_title: "Find Appropriate Care & Send Referral",
      asha_referrals_eyebrow: "Closed-Loop Care Referrals",
      asha_facility_title: "Recommended Healthcare Facility",
      asha_patient_label: "Patient",
      asha_facility_empty: "Select a patient to see a recommended facility.",
      asha_ref_table_id: "Referral ID",
      asha_ref_table_patient: "Patient",
      asha_ref_table_facility: "Facility",
      asha_ref_table_urgency: "Urgency",
      asha_ref_table_status: "Status",

      /* --- ASHA Follow-ups --- */
      asha_followups_title: "High-Risk Patient Follow-Ups",
      asha_followups_eyebrow: "Follow-Ups",
      asha_medicines_eyebrow: "Medicine Availability",
      asha_medicines_title: "Where can I find this medicine?",
      asha_medicines_search_label: "Search medicine",
      asha_diagnostics_eyebrow: "Diagnostic Coordination",
      asha_diagnostics_title: "Diagnostics",
      asha_diagnostics_request_title: "Request a Test",
      asha_diagnostics_request_btn: "Request Test",
      asha_diagnostics_tracker_title: "Test Tracker",
      asha_teleconsult_eyebrow: "ASHA-Assisted Teleconsultation",
      asha_teleconsult_title: "Request a Teleconsultation",
      asha_teleconsult_request_btn: "Request Teleconsultation",
      asha_teleconsult_list_title: "Teleconsultation Requests",
      asha_contact_patient_btn: "Contact Patient",
      asha_record_followup_btn: "Record Follow-Up",
      asha_complete_followup_btn: "Mark Completed",
      asha_no_followups: "No follow-ups due right now.",
      asha_completed_section: "Completed",

      /* --- ASHA Emergency --- */
      asha_emergency_title: "What is happening?",
      asha_emergency_eyebrow: "Emergency",

      /* --- HEALTHCARE / HOSPITAL portal nav --- */
      hospital_portal_title: "Healthcare Staff",
      hospital_nav_dashboard: "Clinical Dashboard",
      hospital_nav_referrals: "Incoming Referrals",
      hospital_nav_registration: "Emergency Registration",
      hospital_nav_identify: "Patient Identification",
      hospital_nav_scanner: "QR Scanner",
      hospital_nav_snapshot: "Emergency Snapshot",
      hospital_nav_triage: "AI Triage",
      hospital_nav_queue: "Live Patient Queue",
      hospital_nav_management: "Patient Management",
      hospital_nav_beds: "Bed / Ward Management",
      hospital_nav_records: "Medical Records",
      hospital_nav_contacts: "Emergency Contacts",
      hospital_nav_notifications: "Notifications",

      /* --- Resource portal nav --- */
      resource_portal_title: "Healthcare Services",
      resource_nav_availability: "Blood Availability",
      resource_nav_medicines: "Essential Medicines",
      resource_nav_bank: "Blood Bank",
      resource_nav_resources: "Emergency Resources",
      resource_nav_facilities: "Find Facility",
      resource_nav_ambulance: "Ambulance",
      resource_nav_diagnostics: "Diagnostics",
      resource_nav_teleconsult: "Teleconsultation",

      /* --- Admin portal nav --- */
      admin_portal_title: "Admin",
      admin_nav_analytics: "Hospital Analytics",
      admin_nav_staff: "Staff Management",
      admin_nav_beds: "Bed Management",
      admin_nav_audit: "Audit Logs",
      admin_nav_settings: "System Settings",

      /* --- Ambulance portal nav --- */
      ambulance_portal_title: "Ambulance",
      ambulance_nav_incoming: "Incoming Patient",
      ambulance_nav_prearrival: "Pre-Arrival Information",
      ambulance_nav_vitals: "Vitals",
      ambulance_nav_eta: "ETA",
      ambulance_nav_handover: "Hospital Handover",

      /* --- Common buttons / actions --- */
      btn_save: "Save",
      btn_cancel: "Cancel",
      btn_close: "Close",
      btn_view_details: "View Details",
      btn_share: "Share",
      btn_back: "Back",
      btn_next: "Next",
      btn_submit: "Submit",
      btn_send: "Send",
      btn_upload: "Upload",
      btn_download: "Download",
      btn_print: "Print",
      btn_search: "Search",
      btn_find_hospital: "Find Hospital",
      btn_get_directions: "Get Directions",
      btn_refer_patient: "Refer Patient",
      btn_view: "View",
      btn_accept: "Accept",
      btn_reject: "Reject",
      btn_confirm: "Confirm",

      /* --- Common status messages --- */
      msg_saved: "Patient saved successfully.",
      msg_invalid_input: "Please check the details entered.",
      msg_missing_fields: "Please fill in all required fields.",
      msg_upload_complete: "Document uploaded successfully.",
      msg_upload_failed: "Upload failed. Please try again.",
      msg_referral_sent: "Referral sent successfully.",
      msg_referral_accepted: "Referral accepted.",
      msg_appointment_confirmed: "Appointment confirmed.",
      msg_followup_completed: "Follow-up completed.",
      msg_offline_sync: "Offline — data will sync when network returns.",
      msg_emergency_notified: "Emergency contact notified.",
      msg_phone_invalid: "Enter a valid 10-digit phone number.",
      msg_otp_sent: "OTP sent (simulated)",
      msg_otp_wrong: "Incorrect OTP — please try again.",
      msg_signed_out: "Signed out",
      msg_contact_sent: "Message sent. The Lifora team will get back to you shortly.",
    },

    hi: {
      /* --- Login / Auth --- */
      login_welcome: "Lifora में आपका स्वागत है",
      login_subtitle: "सही देखभाल। सही जगह। सही समय।",
      login_demo_note: "प्रोटोटाइप लॉगिन — कोई असली SMS या email नहीं भेजा जाता। नीचे दिए डेमो अकाउंट से try करें।",
      login_quick_demo: "⚡ एक क्लिक में डेमो साइन इन",
      login_phone_tab: "📱 फ़ोन",
      login_email_tab: "✉️ ईमेल",
      login_phone_label: "फ़ोन नंबर",
      login_phone_placeholder: "10 अंकों का नंबर",
      login_phone_hint: "डेमो नंबर:",
      login_email_label: "ईमेल पता",
      login_email_placeholder: "आपका@ईमेल.com",
      login_email_hint: "डेमो ईमेल:",
      login_send_otp: "OTP भेजें",
      login_enter_otp: "OTP दर्ज करें",
      login_otp_placeholder: "6 अंकों का कोड",
      login_verify: "वेरिफाई करें और साइन इन करें",
      login_change_method: "← दूसरे नंबर/ईमेल से लॉगिन करें",
      login_asha_help: "Lifora इस्तेमाल करने में मदद चाहिए? आपकी ASHA / सामुदायिक स्वास्थ्य कार्यकर्ता आपकी मदद कर सकती हैं।",

      /* --- Portal switcher --- */
      portal_public: "सार्वजनिक",
      portal_patient: "मरीज",
      portal_asha: "ASHA",
      portal_hospital: "अस्पताल / प्रशासन",
      portal_nurse: "नर्स",
      portal_ambulance: "एम्बुलेंस",
      portal_resource: "स्वास्थ्य सेवाएं",
      portal_admin: "प्रशासक",

      /* --- Network status --- */
      network_connected: "कनेक्टेड",
      network_offline: "ऑफलाइन",
      network_offline_msg: "ऑफलाइन — इंटरनेट आने पर डेटा सिंक होगा",

      /* --- Emergency mode --- */
      emergency_mode_btn: "आपातकाल मोड",

      /* --- Topbar --- */
      change_portal: "← पोर्टल बदलें",
      signed_in: "✓ साइन इन हो गए",

      /* --- PUBLIC PORTAL nav --- */
      public_nav_home: "होम",
      public_nav_about: "Lifora के बारे में",
      public_nav_how: "कैसे काम करता है",
      public_nav_help: "आपातकालीन सहायता",
      public_nav_contact: "संपर्क",
      public_portal_title: "सार्वजनिक वेबसाइट",

      /* --- PATIENT PORTAL nav --- */
      patient_portal_title: "मरीज पोर्टल",
      patient_nav_dashboard: "डैशबोर्ड",
      patient_nav_healthid: "डिजिटल हेल्थ ID",
      patient_nav_profile: "मेरा स्वास्थ्य प्रोफाइल",
      patient_nav_records: "स्वास्थ्य रिकॉर्ड",
      patient_nav_vault: "दस्तावेज़",
      patient_nav_history: "चिकित्सा इतिहास",
      patient_nav_prescriptions: "दवाइयाँ",
      patient_nav_reports: "जाँच रिपोर्ट",
      patient_nav_qr: "QR हेल्थ ID",
      patient_nav_contacts: "आपातकालीन संपर्क",
      patient_nav_consent: "सहमति और गोपनीयता",
      patient_nav_access: "एक्सेस इतिहास",
      patient_nav_assist: "आपातकालीन सहायता",
      patient_nav_appointments: "अपॉइंटमेंट",
      patient_nav_referrals: "रेफरल और फॉलो-अप",

      /* --- Patient dashboard --- */
      patient_greeting: "नमस्ते",
      patient_dashboard_title: "मरीज पोर्टल",
      patient_health_btn: "मेरा स्वास्थ्य",
      patient_records_btn: "मेरे रिकॉर्ड",
      patient_appointment_btn: "अपॉइंटमेंट",
      patient_followup_btn: "फॉलो-अप",
      patient_hospital_btn: "अस्पताल खोजें",
      patient_emergency_btn: "आपातकालीन सहायता",
      patient_medicines_btn: "मेरी दवाइयाँ",
      patient_healthid_btn: "हेल्थ ID और QR",

      /* --- Patient Profile --- */
      patient_profile_overview: "सारांश",
      patient_profile_age: "उम्र",
      patient_profile_status: "स्थिति",
      patient_profile_status_active: "सक्रिय",

      /* --- Medical Records sections --- */
      medical_records_heading: "स्वास्थ्य रिकॉर्ड",
      medical_vault_tab: "दस्तावेज़",
      medical_history_tab: "चिकित्सा इतिहास",
      prescriptions_tab: "दवाइयाँ",
      reports_tab: "जाँच रिपोर्ट",

      /* --- Medical Vault --- */
      vault_upload_btn: "+ दस्तावेज़ अपलोड करें",
      vault_filter_all: "सभी",
      vault_filter_lab: "लैब रिपोर्ट",
      vault_filter_rx: "प्रिस्क्रिप्शन",
      vault_filter_imaging: "इमेजिंग",
      vault_filter_discharge: "डिस्चार्ज सारांश",
      vault_filter_vaccination: "टीकाकरण",
      vault_filter_diagnosis: "निदान",
      vault_filter_other: "अन्य",
      vault_empty: "इस श्रेणी में अभी कोई दस्तावेज़ नहीं है।",

      /* --- Medical History --- */
      history_heading: "चिकित्सा इतिहास",
      history_sub: "दौरे और बीमारियों की जानकारी",

      /* --- Prescriptions --- */
      rx_heading: "दवाइयाँ / प्रिस्क्रिप्शन",
      rx_sub: "मौजूदा और पुरानी दवाइयाँ",
      rx_col_medication: "दवा",
      rx_col_dosage: "खुराक",
      rx_col_prescribed: "डॉक्टर का नाम",
      rx_col_date: "तारीख",
      rx_col_status: "स्थिति",

      /* --- Reports --- */
      reports_heading: "जाँच रिपोर्ट",
      reports_sub: "लैब और इमेजिंग रिपोर्ट",
      reports_empty: "अभी तक कोई लैब या इमेजिंग रिपोर्ट अपलोड नहीं हुई।",

      /* --- Health ID --- */
      healthid_heading: "आपका Lifora हेल्थ ID",
      healthid_eyebrow: "डिजिटल हेल्थ ID",
      healthid_dob: "जन्म तिथि",
      healthid_blood: "रक्त समूह",
      healthid_allergies: "एलर्जी",
      healthid_conditions: "मुख्य बीमारियाँ",
      healthid_medication: "मौजूदा दवाइयाँ",
      healthid_surgery: "पुरानी सर्जरी",
      healthid_contact: "मुख्य आपातकालीन संपर्क",

      /* --- QR --- */
      qr_heading: "अपनी जानकारी साझा करें, अपनी शर्तों पर",
      qr_eyebrow: "QR हेल्थ ID",
      qr_hint: "यह एक असली, स्कैन करने योग्य QR कोड है। अधिकृत स्वास्थ्य कर्मचारियों को दिखाएं।",
      qr_simulate_scan: "अस्पताल स्कैन सिम्युलेट करें",
      qr_share_title: "मंजूरी देने पर क्या साझा होता है",
      qr_blood_allergies: "रक्त समूह और एलर्जी",
      qr_medications: "मौजूदा दवाइयाँ",
      qr_conditions: "मुख्य बीमारियाँ और सर्जरी",
      qr_full_vault: "पूरा मेडिकल वॉल्ट",
      qr_contacts: "आपातकालीन संपर्क",

      /* --- Emergency Contacts --- */
      contacts_heading: "आपातकालीन संपर्क",
      contacts_sub: "किसे और किस क्रम में संपर्क करें",
      contacts_note: "यदि प्राथमिक संपर्क उत्तर नहीं देता, तो Lifora अगले संपर्क पर जाता है।",

      /* --- Consent --- */
      consent_heading: "सहमति और गोपनीयता केंद्र",
      consent_eyebrow: "सहमति और गोपनीयता",
      consent_qr_sharing: "QR साझाकरण",
      consent_qr_sharing_desc: "अस्पतालों को आपके QR कोड से एक्सेस मांगने दें",
      consent_emergency_access: "आपातकालीन एक्सेस",
      consent_emergency_access_desc: "जरूरत पड़ने पर आपातकालीन कर्मचारियों को Emergency Snapshot देखने दें",
      consent_doc_sharing: "दस्तावेज़ साझाकरण",
      consent_doc_sharing_desc: "इलाज करने वाले डॉक्टरों को Medical Vault दस्तावेज़ देखने दें",
      consent_research: "शोध और विश्लेषण",
      consent_research_desc: "अज्ञात डेटा को अस्पताल विश्लेषण में उपयोग करने दें",

      /* --- Access History --- */
      access_heading: "किसने आपकी जानकारी देखी",
      access_eyebrow: "एक्सेस इतिहास",
      access_col_by: "किसने देखा",
      access_col_type: "जानकारी का प्रकार",
      access_col_date: "तारीख",
      access_col_time: "समय",
      access_empty: "अभी तक कोई एक्सेस दर्ज नहीं है।",

      /* --- Emergency Assistance --- */
      emergency_heading: "अभी मदद चाहिए?",
      emergency_eyebrow: "आपातकालीन सहायता",
      emergency_call_title: "आपातकालीन सेवाओं को कॉल करें",
      emergency_call_desc: "किसी भी जानलेवा स्थिति में, पहले अपना स्थानीय आपातकालीन नंबर डायल करें।",
      emergency_alert_title: "अपने आपातकालीन संपर्कों को सूचित करें",
      emergency_alert_btn: "मेरे आपातकालीन संपर्कों को सूचित करें",
      emergency_qr_title: "अपना QR हेल्थ ID साझा करें",
      emergency_qr_btn: "QR हेल्थ ID खोलें",

      /* --- Medical Profile --- */
      profile_heading: "व्यक्तिगत और चिकित्सा विवरण",
      profile_eyebrow: "मेरा स्वास्थ्य प्रोफाइल",
      profile_name: "पूरा नाम",
      profile_dob: "जन्म तिथि",
      profile_blood: "रक्त समूह",
      profile_allergies: "एलर्जी",
      profile_conditions: "मुख्य चिकित्सा स्थितियाँ",
      profile_medications: "मौजूदा दवाइयाँ",
      profile_surgeries: "पुरानी सर्जरी",
      profile_save: "प्रोफाइल सेव करें",
      profile_saved: "✅ प्रोफाइल बदलाव सेव हो गए।",

      /* --- ASHA portal --- */
      asha_portal_title: "ASHA वर्कर पोर्टल",
      asha_nav_dashboard: "डैशबोर्ड",
      asha_nav_help_patient: "मरीज की मदद करें",
      asha_nav_register: "मरीज पंजीकरण",
      asha_nav_patients: "मरीज",
      asha_nav_urgency: "प्राथमिकता आकलन",
      asha_nav_referrals: "रेफरल",
      asha_nav_followups: "फॉलो-अप",
      asha_nav_medicines: "दवाइयाँ",
      asha_nav_diagnostics: "डायग्नोस्टिक्स",
      asha_nav_teleconsult: "टेलीकंसल्टेशन",
      asha_nav_emergency: "आपातकाल",

      /* --- ASHA Dashboard --- */
      asha_dashboard_greeting: "नमस्ते, Nurse Kulkarni",
      asha_dashboard_eyebrow: "सामुदायिक स्वास्थ्य कार्यकर्ता",
      asha_help_patient_title: "मरीज की मदद करें",
      asha_help_patient_desc: "मरीज को स्वास्थ्य सेवाओं से जोड़ें। उनका पंजीकरण करें, स्वास्थ्य जानकारी दर्ज करें और उचित देखभाल तक पहुंचाएं।",
      asha_help_patient_btn: "शुरू करें — मरीज की मदद करें",
      asha_quick_actions: "त्वरित क्रियाएँ",
      asha_register_btn: "मरीज पंजीकृत करें",
      asha_find_patient_btn: "मरीज खोजें",
      asha_priority_btn: "प्राथमिकता आकलन",
      asha_referrals_btn: "रेफरल",
      asha_followups_btn: "फॉलो-अप",
      asha_emergency_btn: "आपातकाल",
      asha_offline_title: "कम कनेक्टिविटी मोड",
      asha_offline_desc: "सामुदायिक दौरों में अक्सर कमजोर या कोई सिग्नल नहीं होता। ऑफलाइन होने पर, नए पंजीकरण इस डिवाइस पर सेव होते हैं।",
      asha_offline_toggle: "📡 ऑफलाइन मोड सिम्युलेट करें",
      asha_online_toggle: "🔌 ऑनलाइन मोड सिम्युलेट करें",
      asha_sync_btn: "सेव रिकॉर्ड सिंक करें",
      asha_followups_today: "आज के फॉलो-अप",
      asha_registered_today: "आज पंजीकृत",
      asha_total_patients: "कुल मरीज",
      asha_high_risk: "उच्च जोखिम मरीज",
      asha_pending_referrals: "लंबित रेफरल",
      asha_followups_due: "बकाया फॉलो-अप",

      /* --- ASHA Register --- */
      asha_register_title: "मरीज पंजीकरण",
      asha_step_of: "चरण",
      asha_step_of_4: "में से 4",
      asha_step1_title: "मरीज की जानकारी",
      asha_step2_title: "लक्षण और वाइटल्स",
      asha_step3_title: "स्वास्थ्य विवरण",
      asha_step4_title: "अगले कदम और आकलन",
      asha_name_label: "पूरा नाम",
      asha_name_placeholder: "जैसे: Lakshmi Devi",
      asha_age_label: "उम्र",
      asha_age_placeholder: "जैसे: 34",
      asha_gender_label: "लिंग",
      asha_phone_label: "फ़ोन",
      asha_phone_placeholder: "10 अंकों का नंबर",
      asha_village_label: "गाँव",
      asha_village_placeholder: "जैसे: रामपुरा",
      asha_emergency_contact_label: "आपातकालीन संपर्क",
      asha_emergency_contact_placeholder: "नाम और फ़ोन",
      asha_next_btn: "आगे →",
      asha_back_btn: "← वापस",
      asha_finish_btn: "प्राथमिकता आकलन चलाएं",
      asha_step1_error: "कृपया मरीज का नाम और उम्र दर्ज करें।",

      /* --- ASHA Step 2 Vitals --- */
      asha_bp_label: "रक्तचाप",
      asha_pulse_label: "नाड़ी (bpm)",
      asha_temp_label: "तापमान (°F)",
      asha_sugar_label: "रक्त शर्करा (mg/dL)",
      asha_spo2_label: "SpO₂ (%)",
      asha_resp_label: "श्वसन दर",
      asha_weight_label: "वजन (kg)",

      /* --- ASHA Step 3 Health --- */
      asha_blood_group_label: "रक्त समूह",
      asha_allergies_label: "एलर्जी",
      asha_conditions_label: "मौजूदा बीमारियाँ",
      asha_medicines_label: "मौजूदा दवाइयाँ",

      /* --- ASHA Step 4 Symptoms --- */
      asha_symptoms_note: "वॉयस इनपुट अगले संस्करण में आएगा — अभी नीचे बटन या टाइप करके चुनें।",
      asha_symptoms_other: "अन्य / अतिरिक्त जानकारी",
      asha_symptoms_other_placeholder: "कोई और जरूरी जानकारी",
      asha_symptom_weakness: "कमजोरी",
      asha_symptom_dizziness: "चक्कर आना",
      asha_symptom_fever: "बुखार",
      asha_symptom_cough: "खांसी",
      asha_symptom_breathing: "सांस लेने में तकलीफ",
      asha_symptom_chest: "सीने में दर्द",
      asha_symptom_bleeding: "खून आना",
      asha_symptom_vomiting: "उल्टी",
      asha_symptom_pain: "तेज दर्द",
      asha_symptom_pregnancy: "गर्भावस्था की चिंता",

      /* --- ASHA Patients list --- */
      asha_patients_title: "पंजीकृत मरीज",
      asha_patients_eyebrow: "मरीज",
      asha_register_new_btn: "+ मरीज पंजीकृत करें",
      asha_col_name: "नाम",
      asha_col_age_gender: "उम्र / लिंग",
      asha_col_village: "गाँव",
      asha_col_risk: "जोखिम स्तर",
      asha_col_last_visit: "अंतिम दौरा",
      asha_col_next_followup: "अगला फॉलो-अप",
      asha_col_worker: "नियुक्त कार्यकर्ता",
      asha_check_urgency_btn: "तात्कालिकता जांचें",
      asha_filter_all: "सभी",
      asha_filter_high: "उच्च जोखिम",
      asha_filter_maternal: "मातृत्व",
      asha_filter_children: "बच्चे",
      asha_filter_elderly: "बुजुर्ग",

      /* --- ASHA Patient Profile --- */
      asha_profile_eyebrow: "मरीज प्रोफाइल",
      asha_profile_back: "← मरीजों की सूची पर वापस",
      asha_profile_overview: "सारांश",
      asha_profile_age_gender: "उम्र / लिंग",
      asha_profile_village: "गाँव",
      asha_profile_phone: "फ़ोन",
      asha_profile_emerg_contact: "आपातकालीन संपर्क",
      asha_profile_blood_group: "रक्त समूह",
      asha_profile_risk: "जोखिम स्तर",
      asha_profile_latest_vitals: "नवीनतम वाइटल्स",
      asha_profile_bp: "रक्तचाप",
      asha_profile_pulse: "नाड़ी",
      asha_profile_sugar: "रक्त शर्करा",
      asha_profile_temp: "तापमान",
      asha_profile_spo2: "SpO₂",
      asha_profile_weight: "वजन",
      asha_profile_conditions_med: "बीमारियाँ और दवाइयाँ",
      asha_profile_conditions: "बीमारियाँ",
      asha_profile_allergies: "एलर्जी",
      asha_profile_medicines: "मौजूदा दवाइयाँ",
      asha_profile_symptoms: "हाल के लक्षण",
      asha_profile_quick_actions: "त्वरित क्रियाएँ",
      asha_profile_record_vitals: "वाइटल्स दर्ज करें",
      asha_profile_record_visit: "नया दौरा दर्ज करें",
      asha_profile_check_urgency: "तात्कालिकता जांचें",
      asha_profile_referral: "रेफरल बनाएं",
      asha_profile_schedule_followup: "फॉलो-अप शेड्यूल करें",
      asha_profile_visit_history: "दौरों का इतिहास",
      asha_profile_referral_history: "रेफरल इतिहास",
      asha_profile_followups: "फॉलो-अप",
      asha_ref_col_id: "रेफरल ID",
      asha_ref_col_facility: "सुविधा",
      asha_ref_col_urgency: "तात्कालिकता",
      asha_ref_col_status: "स्थिति",

      /* --- ASHA Urgency --- */
      asha_urgency_title: "स्वास्थ्य आकलन",
      asha_urgency_eyebrow: "AI-सहायक प्राथमिकता समर्थन",
      asha_urgency_patient_label: "यह किस मरीज के लिए है?",
      asha_urgency_run_btn: "प्राथमिकता आकलन चलाएं",
      asha_urgency_result_title: "प्राथमिकता आकलन परिणाम",
      asha_urgency_result_empty: "प्राथमिकता आकलन के लिए मरीज चुनें।",
      asha_urgency_find_care: "उचित देखभाल खोजें",
      asha_urgency_view_summary: "क्लिनिकल सारांश देखें",
      asha_urgency_disclaimer: "यह आकलन निर्णय समर्थन प्रदान करता है और पेशेवर चिकित्सा निर्णय की जगह नहीं लेता।",

      /* --- ASHA Referrals --- */
      asha_referrals_title: "उचित देखभाल खोजें और रेफरल भेजें",
      asha_referrals_eyebrow: "बंद-लूप देखभाल रेफरल",
      asha_facility_title: "अनुशंसित स्वास्थ्य सुविधा",
      asha_patient_label: "मरीज",
      asha_facility_empty: "अनुशंसित सुविधा देखने के लिए मरीज चुनें।",
      asha_ref_table_id: "रेफरल ID",
      asha_ref_table_patient: "मरीज",
      asha_ref_table_facility: "सुविधा",
      asha_ref_table_urgency: "तात्कालिकता",
      asha_ref_table_status: "स्थिति",

      /* --- ASHA Follow-ups --- */
      asha_followups_title: "उच्च-जोखिम रोगी फॉलो-अप",
      asha_followups_eyebrow: "फॉलो-अप",
      asha_medicines_eyebrow: "दवा उपलब्धता",
      asha_medicines_title: "यह दवा कहाँ मिलेगी?",
      asha_medicines_search_label: "दवा खोजें",
      asha_diagnostics_eyebrow: "डायग्नोस्टिक समन्वय",
      asha_diagnostics_title: "डायग्नोस्टिक्स",
      asha_diagnostics_request_title: "जांच का अनुरोध करें",
      asha_diagnostics_request_btn: "जांच का अनुरोध करें",
      asha_diagnostics_tracker_title: "जांच ट्रैकर",
      asha_teleconsult_eyebrow: "आशा-सहायता प्राप्त टेलीकंसल्टेशन",
      asha_teleconsult_title: "टेलीकंसल्टेशन का अनुरोध करें",
      asha_teleconsult_request_btn: "टेलीकंसल्टेशन का अनुरोध करें",
      asha_teleconsult_list_title: "टेलीकंसल्टेशन अनुरोध",
      asha_contact_patient_btn: "मरीज से संपर्क करें",
      asha_record_followup_btn: "फॉलो-अप दर्ज करें",
      asha_complete_followup_btn: "पूरा हुआ चिह्नित करें",
      asha_no_followups: "अभी कोई फॉलो-अप बकाया नहीं है।",
      asha_completed_section: "पूर्ण",

      /* --- ASHA Emergency --- */
      asha_emergency_title: "क्या हो रहा है?",
      asha_emergency_eyebrow: "आपातकाल",

      /* --- Hospital portal nav --- */
      hospital_portal_title: "स्वास्थ्य कर्मचारी",
      hospital_nav_dashboard: "क्लिनिकल डैशबोर्ड",
      hospital_nav_referrals: "आने वाले रेफरल",
      hospital_nav_registration: "आपातकालीन पंजीकरण",
      hospital_nav_identify: "मरीज पहचान",
      hospital_nav_scanner: "QR स्कैनर",
      hospital_nav_snapshot: "आपातकालीन स्नैपशॉट",
      hospital_nav_triage: "AI ट्राइयज",
      hospital_nav_queue: "लाइव मरीज कतार",
      hospital_nav_management: "मरीज प्रबंधन",
      hospital_nav_beds: "बेड / वार्ड प्रबंधन",
      hospital_nav_records: "चिकित्सा रिकॉर्ड",
      hospital_nav_contacts: "आपातकालीन संपर्क",
      hospital_nav_notifications: "सूचनाएं",

      /* --- Resource portal nav --- */
      resource_portal_title: "स्वास्थ्य सेवाएं",
      resource_nav_availability: "रक्त उपलब्धता",
      resource_nav_medicines: "आवश्यक दवाइयाँ",
      resource_nav_bank: "रक्त बैंक",
      resource_nav_resources: "आपातकालीन संसाधन",
      resource_nav_facilities: "सुविधा खोजें",
      resource_nav_ambulance: "एम्बुलेंस",
      resource_nav_diagnostics: "डायग्नोस्टिक्स",
      resource_nav_teleconsult: "टेलीकंसल्टेशन",

      /* --- Admin portal nav --- */
      admin_portal_title: "प्रशासक",
      admin_nav_analytics: "अस्पताल विश्लेषण",
      admin_nav_staff: "कर्मचारी प्रबंधन",
      admin_nav_beds: "बेड प्रबंधन",
      admin_nav_audit: "ऑडिट लॉग",
      admin_nav_settings: "सिस्टम सेटिंग्स",

      /* --- Ambulance portal nav --- */
      ambulance_portal_title: "एम्बुलेंस",
      ambulance_nav_incoming: "आने वाला मरीज",
      ambulance_nav_prearrival: "पूर्व-आगमन जानकारी",
      ambulance_nav_vitals: "वाइटल्स",
      ambulance_nav_eta: "आगमन समय",
      ambulance_nav_handover: "अस्पताल हैंडओवर",

      /* --- Common buttons --- */
      btn_save: "सेव करें",
      btn_cancel: "रद्द करें",
      btn_close: "बंद करें",
      btn_view_details: "विवरण देखें",
      btn_share: "साझा करें",
      btn_back: "वापस",
      btn_next: "आगे",
      btn_submit: "जमा करें",
      btn_send: "भेजें",
      btn_upload: "अपलोड",
      btn_download: "डाउनलोड",
      btn_print: "प्रिंट",
      btn_search: "खोजें",
      btn_find_hospital: "अस्पताल खोजें",
      btn_get_directions: "रास्ता दिखाएं",
      btn_refer_patient: "मरीज रेफर करें",
      btn_view: "देखें",
      btn_accept: "स्वीकार करें",
      btn_reject: "अस्वीकार करें",
      btn_confirm: "पुष्टि करें",

      /* --- Status messages --- */
      msg_saved: "मरीज की जानकारी सफलतापूर्वक सेव हो गई।",
      msg_invalid_input: "कृपया दर्ज की गई जानकारी जांचें।",
      msg_missing_fields: "कृपया सभी जरूरी फ़ील्ड भरें।",
      msg_upload_complete: "दस्तावेज़ सफलतापूर्वक अपलोड हो गया।",
      msg_upload_failed: "अपलोड विफल। कृपया फिर से प्रयास करें।",
      msg_referral_sent: "रेफरल सफलतापूर्वक भेजा गया।",
      msg_referral_accepted: "रेफरल स्वीकार किया गया।",
      msg_appointment_confirmed: "अपॉइंटमेंट की पुष्टि हो गई।",
      msg_followup_completed: "फॉलो-अप पूरा हो गया।",
      msg_offline_sync: "ऑफलाइन — इंटरनेट आने पर डेटा सिंक होगा।",
      msg_emergency_notified: "आपातकालीन संपर्क को सूचित किया गया।",
      msg_phone_invalid: "कृपया 10 अंकों का वैध फ़ोन नंबर दर्ज करें।",
      msg_otp_sent: "OTP भेजा गया (सिम्युलेटेड)",
      msg_otp_wrong: "गलत OTP — कृपया फिर से प्रयास करें।",
      msg_signed_out: "साइन आउट हो गए",
      msg_contact_sent: "संदेश भेज दिया गया। Lifora टीम जल्द संपर्क करेगी।",
    },

    gu: {
      /* --- Login / Auth --- */
      login_welcome: "Lifora માં આપનું સ્વાગત છે",
      login_subtitle: "સાચી સંભાળ. સાચી જગ્યા. સાચો સમય.",
      login_demo_note: "પ્રોટોટાઇપ લૉગિન — કોઈ સાચો SMS કે email મોકલાતો નથી. નીચેના ડેમો અકાઉન્ટ્સ વાપરો.",
      login_quick_demo: "⚡ એક ક્લિકમાં ડેમો સાઇન ઇન",
      login_phone_tab: "📱 ફોન",
      login_email_tab: "✉️ ઈમેઇલ",
      login_phone_label: "ફોન નંબર",
      login_phone_placeholder: "10 અંકનો નંબર",
      login_phone_hint: "ડેમો નંબર:",
      login_email_label: "ઈમેઇલ સરનામું",
      login_email_placeholder: "તમારો@ઈમેઇલ.com",
      login_email_hint: "ડેમો ઈમેઇલ:",
      login_send_otp: "OTP મોકલો",
      login_enter_otp: "OTP દાખલ કરો",
      login_otp_placeholder: "6 અંકનો કોડ",
      login_verify: "ચકાસો અને સાઇન ઇન કરો",
      login_change_method: "← બીજા નંબર/ઈમેઇલ વાપરો",
      login_asha_help: "Lifora વાપરવામાં મદદ જોઈએ? તમારી ASHA / સમુદાય આરોગ્ય કાર્યકર તમારી મદદ કરી શકે છે.",

      /* --- Portal switcher --- */
      portal_public: "જાહેર",
      portal_patient: "દર્દી",
      portal_asha: "ASHA",
      portal_hospital: "હોસ્પિટલ / એડમિન",
      portal_nurse: "નર્સ",
      portal_ambulance: "એમ્બ્યુલન્સ",
      portal_resource: "આરોગ્ય સેવાઓ",
      portal_admin: "એડમિન",

      /* --- Network status --- */
      network_connected: "કનેક્ટ થયેલ",
      network_offline: "ઑફલાઇન",
      network_offline_msg: "ઑફલાઇન — ઇન્ટરનેટ આવ્યા પછી ડેટા સિંક થશે",

      /* --- Emergency mode --- */
      emergency_mode_btn: "આપત્કાલ મોડ",

      /* --- Topbar --- */
      change_portal: "← પોર્ટલ બદલો",
      signed_in: "✓ સાઇન ઇન થઈ ગયા",

      /* --- PUBLIC PORTAL nav --- */
      public_nav_home: "હોમ",
      public_nav_about: "Lifora વિશે",
      public_nav_how: "કેવી રીતે કામ કરે છે",
      public_nav_help: "તાત્કાલિક મદદ",
      public_nav_contact: "સંપર્ક",
      public_portal_title: "જાહેર વેબસાઇટ",

      /* --- PATIENT PORTAL nav --- */
      patient_portal_title: "દર્દી પોર્ટલ",
      patient_nav_dashboard: "ડેશબોર્ડ",
      patient_nav_healthid: "ડિજિટલ હેલ્થ ID",
      patient_nav_profile: "મારી આરોગ્ય પ્રોફાઇલ",
      patient_nav_records: "તબીબી રેકોર્ડ",
      patient_nav_vault: "દસ્તાવેજો",
      patient_nav_history: "તબીબી ઇતિહાસ",
      patient_nav_prescriptions: "દવાઓ",
      patient_nav_reports: "તપાસ રિપોર્ટ",
      patient_nav_qr: "QR હેલ્થ ID",
      patient_nav_contacts: "આपत્કાલ સંપર્કો",
      patient_nav_consent: "સંમતિ અને ગોપનીયતા",
      patient_nav_access: "ઍક્સેસ ઇતિહાસ",
      patient_nav_assist: "તાત્કાલિક સહાય",
      patient_nav_appointments: "મુલાકાત",
      patient_nav_referrals: "રેફરલ અને ફોલો-અપ",

      /* --- Patient dashboard --- */
      patient_greeting: "નમસ્તે",
      patient_dashboard_title: "દર્દી પોર્ટલ",
      patient_health_btn: "મારું આરોગ્ય",
      patient_records_btn: "મારા રેકોર્ડ",
      patient_appointment_btn: "મુલાકાત",
      patient_followup_btn: "ફોલો-અપ / અનુસરણ",
      patient_hospital_btn: "હૉસ્પિટલ શોધો",
      patient_emergency_btn: "તાત્કાલિક મદદ",
      patient_medicines_btn: "મારી દવાઓ",
      patient_healthid_btn: "હેલ્થ ID અને QR",

      /* --- Patient Profile --- */
      patient_profile_overview: "સારાંશ",
      patient_profile_age: "ઉંમર",
      patient_profile_status: "સ્થિતિ",
      patient_profile_status_active: "સક્રિય",

      /* --- Medical Records sections --- */
      medical_records_heading: "તબીબી રેકોર્ડ",
      medical_vault_tab: "દસ્તાવેજો",
      medical_history_tab: "તબીબી ઇતિહાસ",
      prescriptions_tab: "દવાઓ",
      reports_tab: "તપાસ રિપોર્ટ",

      /* --- Medical Vault --- */
      vault_upload_btn: "+ દસ્તાવેજ અપલોડ કરો",
      vault_filter_all: "બધા",
      vault_filter_lab: "લેબ રિપોર્ટ",
      vault_filter_rx: "પ્રિસ્ક્રિપ્શન",
      vault_filter_imaging: "ઇમેજિંગ",
      vault_filter_discharge: "ડિસ્ચાર્જ સારાંશ",
      vault_filter_vaccination: "રસીકરણ",
      vault_filter_diagnosis: "નિદાન",
      vault_filter_other: "અન્ય",
      vault_empty: "આ વર્ગમાં હજી કોઈ દસ્તાવેજ નથી.",

      /* --- Medical History --- */
      history_heading: "તબીબી ઇતિહાસ",
      history_sub: "મુલાકાત અને રોગોની વિગત",

      /* --- Prescriptions --- */
      rx_heading: "દવાઓ / પ્રિસ્ક્રિપ્શન",
      rx_sub: "વર્તમાન અને જૂની દવાઓ",
      rx_col_medication: "દવા",
      rx_col_dosage: "ડોઝ",
      rx_col_prescribed: "ડૉ. નું નામ",
      rx_col_date: "તારીખ",
      rx_col_status: "સ્થિતિ",

      /* --- Reports --- */
      reports_heading: "તપાસ રિપોર્ટ",
      reports_sub: "લેબ અને ઇમેજિંગ રિપોર્ટ",
      reports_empty: "હજી કોઈ લેબ કે ઇમેજિંગ રિપોર્ટ અપલોડ થઈ નથી.",

      /* --- Health ID --- */
      healthid_heading: "તમારી Lifora હેલ્થ ID",
      healthid_eyebrow: "ડિજિટલ હેલ્થ ID",
      healthid_dob: "જન્મ તારીખ",
      healthid_blood: "લોહીનો ગ્રૂપ",
      healthid_allergies: "એલર્જી",
      healthid_conditions: "મુખ્ય બીમારીઓ",
      healthid_medication: "હાલની દવાઓ",
      healthid_surgery: "જૂની સર્જરી",
      healthid_contact: "મુખ્ય આпत्काल સંપર્ક",

      /* --- QR --- */
      qr_heading: "તમારી માહિતી શેર કરો, તમારી શરતો પ્રમાણે",
      qr_eyebrow: "QR હેલ્થ ID",
      qr_hint: "આ એક સ્કૅન કરી શકાય તેવો QR કોડ છે. અધિકૃત આરોગ્ય કર્મચારીઓને બતાવો.",
      qr_simulate_scan: "હૉસ્પિટલ સ્કૅન સિમ્યુલેટ કરો",
      qr_share_title: "મંજૂરી આપ્યા પછી શું શેર થાય",
      qr_blood_allergies: "લોહીનો ગ્રૂપ અને એલર્જી",
      qr_medications: "હાલની દવાઓ",
      qr_conditions: "મુખ્ય બીમારીઓ અને સર્જરી",
      qr_full_vault: "સંપૂર્ણ મેડિકલ વૉલ્ટ",
      qr_contacts: "આपत्काल સંપર્કો",

      /* --- Emergency Contacts --- */
      contacts_heading: "આपत्કाल સંपर्को",
      contacts_sub: "કોઈને ક્યારે સংपर्क करवो",
      contacts_note: "જો પ્રાથમિક સંपर्क जवाब न दे, तो Lifora अगले संपर्क पर जाता है।",

      /* --- Consent --- */
      consent_heading: "સंमति अने गोपनीयता केन्द्र",
      consent_eyebrow: "સংमति अने गोपनीयता",
      consent_qr_sharing: "QR शेरिंग",
      consent_qr_sharing_desc: "હૉस્પिटलोने तमारा QR थी एक्सेस माँगवा दो",
      consent_emergency_access: "आपत्काल एक्सेस",
      consent_emergency_access_desc: "जरूर पडे त्यारे आपत्काल कर्मचारीओने Emergency Snapshot जोवा दो",
      consent_doc_sharing: "दस्तावेज शेरिंग",
      consent_doc_sharing_desc: "तमारी सारवार करता डॉक्टरोने Medical Vault दस्तावेजो जोवा दो",
      consent_research: "संशोधन अने विश्लेषण",
      consent_research_desc: "अज्ञात डेटाने हॉस्पिटल विश्लेषणमाँ उपयोग करवा दो",

      /* --- Access History --- */
      access_heading: "कोणे तमारी माहिती जोई",
      access_eyebrow: "एक्सेस इतिहास",
      access_col_by: "कोणे जोयु",
      access_col_type: "माहितीनो प्रकार",
      access_col_date: "तारीख",
      access_col_time: "समय",
      access_empty: "हजी कोई एक्सेस नोंधायो नथी.",

      /* --- Emergency Assistance --- */
      emergency_heading: "अभी मदद जोईए छे?",
      emergency_eyebrow: "तात्कालिक સহाय",
      emergency_call_title: "आपत्काल सेवाओने कॉल करो",
      emergency_call_desc: "कोई पण जीव जोखमावाळी परिस्थितिमाँ, पहेला तमारो स्थानिक आपत्काल नंबर डायल करो.",
      emergency_alert_title: "तमारा आपत्काल संपर्कोने जाण करो",
      emergency_alert_btn: "मारा आपत्काल संपर्कोने जाण करो",
      emergency_qr_title: "तमारी QR हेल्थ ID शेर करो",
      emergency_qr_btn: "QR हेल्थ ID खोलो",

      /* --- Medical Profile --- */
      profile_heading: "व्यक्तिगत अने तबीबी विगतो",
      profile_eyebrow: "मारी आरोग्य प्रोफाइल",
      profile_name: "पूरु नाम",
      profile_dob: "जन्म तारीख",
      profile_blood: "लोहीनो ग्रूप",
      profile_allergies: "एलर्जी",
      profile_conditions: "मुख्य तबीबी परिस्थितिओ",
      profile_medications: "हाली दवाओ",
      profile_surgeries: "जूनी शस्त्रक्रिया",
      profile_save: "प्रोफाइल साचवो",
      profile_saved: "✅ प्रोफाइल बदलाव साचवाया.",

      /* --- ASHA portal --- */
      asha_portal_title: "ASHA वर्कर पोर्टल",
      asha_nav_dashboard: "डेशबोर्ड",
      asha_nav_help_patient: "दर्दीनी मदद करो",
      asha_nav_register: "दर्दी नोंधणी",
      asha_nav_patients: "दर्दीओ",
      asha_nav_urgency: "प्राथमिकता आकलन",
      asha_nav_referrals: "रेफरल",
      asha_nav_followups: "फोलो-अप",
      asha_nav_medicines: "દવાઓ",
      asha_nav_diagnostics: "ડાયગ્નોસ્ટિક્સ",
      asha_nav_teleconsult: "ટેલીકન્સલ્ટેશન",
      asha_nav_emergency: "आपत्काल",

      /* --- ASHA Dashboard --- */
      asha_dashboard_greeting: "नमस्ते, Nurse Kulkarni",
      asha_dashboard_eyebrow: "સмुदाय आरोग्य कार्यकर",
      asha_help_patient_title: "दर्दीनी मदद करो",
      asha_help_patient_desc: "दर्दीने आरोग्य सेवाओ साथे जोडो. तेमनी नोंधणी करो, आरोग्य माहिती नोंधो अने योग्य सारवार मेळवाव्यो.",
      asha_help_patient_btn: "शरू करो — दर्दीनी मदद करो",
      asha_quick_actions: "झडपी कार्यवाही",
      asha_register_btn: "दर्दी नोंधो",
      asha_find_patient_btn: "दर्दी शोधो",
      asha_priority_btn: "प्राथमिकता आकलन",
      asha_referrals_btn: "रेफरल",
      asha_followups_btn: "फोलो-अप",
      asha_emergency_btn: "आपत्काल",
      asha_offline_title: "ओछी कनेक्टिविटी मोड",
      asha_offline_desc: "ग्रामीण मुलाकातोमाँ अनेक वखत नबळा या कोई सिग्नल नथी होता. ऑफलाइन होइए त्यारे नवी नोंधणी डिवाइस पर सचवाय छे.",
      asha_offline_toggle: "📡 ऑफलाइन मोड सिमुलेट करो",
      asha_online_toggle: "🔌 ऑनलाइन मोड सिमुलेट करो",
      asha_sync_btn: "सचवेला रेकोर्ड सिंक करो",
      asha_followups_today: "आजना फोलो-अप",
      asha_registered_today: "आज नोंधाया",
      asha_total_patients: "कुल दर्दीओ",
      asha_high_risk: "उच्च जोखमवाळा दर्दीओ",
      asha_pending_referrals: "बाकी रेफरल",
      asha_followups_due: "बाकी फोलो-अप",

      /* --- ASHA Register --- */
      asha_register_title: "दर्दी नोंधणी",
      asha_step_of: "पगथियुं",
      asha_step_of_4: "4 माँथी",
      asha_step1_title: "दर्दीनी माहिती",
      asha_step2_title: "लक्षणो अने वाइटल्स",
      asha_step3_title: "आरोग्य विगतो",
      asha_step4_title: "अगला पगला अने आकलन",
      asha_name_label: "पूरु नाम",
      asha_name_placeholder: "दा.त. Lakshmi Devi",
      asha_age_label: "उंमर",
      asha_age_placeholder: "दा.त. 34",
      asha_gender_label: "जाति",
      asha_phone_label: "फोन",
      asha_phone_placeholder: "10 अंकनो नंबर",
      asha_village_label: "गाम",
      asha_village_placeholder: "दा.त. रामपुरा",
      asha_emergency_contact_label: "आपत्काल संपर्क",
      asha_emergency_contact_placeholder: "नाम अने फोन",
      asha_next_btn: "आगळ →",
      asha_back_btn: "← पाछळ",
      asha_finish_btn: "प्राथमिकता आकलन चलावो",
      asha_step1_error: "कृपया दर्दीनु नाम अने उंमर दाखल करो.",

      /* --- ASHA Vitals --- */
      asha_bp_label: "रक्तचाप",
      asha_pulse_label: "नाडी (bpm)",
      asha_temp_label: "तापमान (°F)",
      asha_sugar_label: "ब्लड शुगर (mg/dL)",
      asha_spo2_label: "SpO₂ (%)",
      asha_resp_label: "श्वसन दर",
      asha_weight_label: "वजन (kg)",

      /* --- ASHA Health Details --- */
      asha_blood_group_label: "लोहीनो ग्रूप",
      asha_allergies_label: "एलर्जी",
      asha_conditions_label: "हालनी बीमारीओ",
      asha_medicines_label: "हाली दवाओ",

      /* --- ASHA Symptoms --- */
      asha_symptoms_note: "वॉइस इनपुट आगामी अपडेटमाँ आवशे — अत्यारे बटन दाबो या टाइप करो.",
      asha_symptoms_other: "अन्य / अतिरिक्त माहिती",
      asha_symptoms_other_placeholder: "कोई बीजी जरूरी माहिती",
      asha_symptom_weakness: "नबळाई",
      asha_symptom_dizziness: "चक्कर आववा",
      asha_symptom_fever: "तावक",
      asha_symptom_cough: "खांसी",
      asha_symptom_breathing: "श्वास लेवामाँ तकलीफ",
      asha_symptom_chest: "छातीमाँ दुखावो",
      asha_symptom_bleeding: "लोही आवuं",
      asha_symptom_vomiting: "उल्टी",
      asha_symptom_pain: "तीव्र दुखावो",
      asha_symptom_pregnancy: "ग र्भावस्थानी ચينता",

      /* --- ASHA Patients list --- */
      asha_patients_title: "नोंधायेला दर्दीओ",
      asha_patients_eyebrow: "दर्दीओ",
      asha_register_new_btn: "+ दर्दी नोंधो",
      asha_col_name: "नाम",
      asha_col_age_gender: "उंमर / जाति",
      asha_col_village: "गाम",
      asha_col_risk: "जोखम स्तर",
      asha_col_last_visit: "छेल्ली मुलाकात",
      asha_col_next_followup: "अगलो फोलो-अप",
      asha_col_worker: "नियुक्त कार्यकर",
      asha_check_urgency_btn: "ताकीद तपासो",
      asha_filter_all: "बधा",
      asha_filter_high: "उच्च जोखम",
      asha_filter_maternal: "मातृत्व",
      asha_filter_children: "बाळको",
      asha_filter_elderly: "वृद्ध",

      /* --- ASHA Patient Profile --- */
      asha_profile_eyebrow: "दर्दीनी प्रोफाइल",
      asha_profile_back: "← दर्दीओनी यादी पर पाछा",
      asha_profile_overview: "सारांश",
      asha_profile_age_gender: "उंमर / जाति",
      asha_profile_village: "गाम",
      asha_profile_phone: "फोन",
      asha_profile_emerg_contact: "आपत्काल संपर्क",
      asha_profile_blood_group: "लोहीनो ग्रूप",
      asha_profile_risk: "जोखम स्तर",
      asha_profile_latest_vitals: "छेल्ला वाइटल्स",
      asha_profile_bp: "रक्तचाप",
      asha_profile_pulse: "नाडी",
      asha_profile_sugar: "ब्लड शुगर",
      asha_profile_temp: "तापमान",
      asha_profile_spo2: "SpO₂",
      asha_profile_weight: "वजन",
      asha_profile_conditions_med: "बीमारीओ अने दवाओ",
      asha_profile_conditions: "बीमारीओ",
      asha_profile_allergies: "एलर्जी",
      asha_profile_medicines: "हाली दवाओ",
      asha_profile_symptoms: "हालना लक्षणो",
      asha_profile_quick_actions: "झडपी कार्यवाही",
      asha_profile_record_vitals: "वाइटल्स नोंधो",
      asha_profile_record_visit: "नवी मुलाकात नोंधो",
      asha_profile_check_urgency: "ताकीद तपासो",
      asha_profile_referral: "रेफरल बनावो",
      asha_profile_schedule_followup: "फोलो-अप शेड्यूल करो",
      asha_profile_visit_history: "मुलाकातनो इतिहास",
      asha_profile_referral_history: "रेफरलनो इतिहास",
      asha_profile_followups: "फोलो-अप",
      asha_ref_col_id: "रेफरल ID",
      asha_ref_col_facility: "सुविधा",
      asha_ref_col_urgency: "ताकीद",
      asha_ref_col_status: "स्थिति",

      /* --- ASHA Urgency --- */
      asha_urgency_title: "आरोग्य आकलन",
      asha_urgency_eyebrow: "AI-सहायित प्राथमिकता समर्थन",
      asha_urgency_patient_label: "आ कयা दर्दी माटे छे?",
      asha_urgency_run_btn: "प्राथमिकता आकलन चलावो",
      asha_urgency_result_title: "प्राथमिकता आकलन परिणाम",
      asha_urgency_result_empty: "प्राथमिकता आकलन माटे दर्दी पसंद करो.",
      asha_urgency_find_care: "योग्य सारवार शोधो",
      asha_urgency_view_summary: "क्लिनिकल सारांश जुओ",
      asha_urgency_disclaimer: "आ आकलन निर्णय समर्थन आपे छे अने व्यावसायिक चिकित्सा निर्णयनी जगा लेतु नथी.",

      /* --- ASHA Referrals --- */
      asha_referrals_title: "योग्य सारवार शोधो अने रेफरल मोकलो",
      asha_referrals_eyebrow: "बंध-लूप सारवार रेफरल",
      asha_facility_title: "ब्लड ग्रूप अने एलर्जी",
      asha_patient_label: "दर्दी",
      asha_facility_empty: "भलामण करेली सुविधा जोवा माटे दर्दी पसंद करो.",
      asha_ref_table_id: "रेफरल ID",
      asha_ref_table_patient: "दर्दी",
      asha_ref_table_facility: "सुविधा",
      asha_ref_table_urgency: "ताकीद",
      asha_ref_table_status: "स्थिति",

      /* --- ASHA Follow-ups --- */
      asha_followups_title: "ઉચ્ચ-જોખમ દર્દી ફોલો-અપ",
      asha_followups_eyebrow: "ફોલો-અપ",
      asha_medicines_eyebrow: "દવા ઉપલબ્ધતા",
      asha_medicines_title: "આ દવા ક્યાં મળશે?",
      asha_medicines_search_label: "દવા શોધો",
      asha_diagnostics_eyebrow: "ડાયગ્નોસ્ટિક સંકલન",
      asha_diagnostics_title: "ડાયગ્નોસ્ટિક્સ",
      asha_diagnostics_request_title: "ટેસ્ટ માટે વિનંતી કરો",
      asha_diagnostics_request_btn: "ટેસ્ટ માટે વિનંતી કરો",
      asha_diagnostics_tracker_title: "ટેસ્ટ ટ્રેકર",
      asha_teleconsult_eyebrow: "આશા-સહાયિત ટેલીકન્સલ્ટેશન",
      asha_teleconsult_title: "ટેલીકન્સલ્ટેશન માટે વિનંતી કરો",
      asha_teleconsult_request_btn: "ટેલીકન્સલ્ટેશન માટે વિનંતી કરો",
      asha_teleconsult_list_title: "ટેલીકન્સલ્ટેશન વિનંતીઓ",
      asha_contact_patient_btn: "दर्दीने संपर्क करो",
      asha_record_followup_btn: "फोलो-अप नोंधो",
      asha_complete_followup_btn: "पूर्ण थयु चिह्नित करो",
      asha_no_followups: "अत्यारे कोई फोलो-अप बाकी नथी.",
      asha_completed_section: "पूर्ण",

      /* --- ASHA Emergency --- */
      asha_emergency_title: "शु थई रहु छे?",
      asha_emergency_eyebrow: "आपत्काल",

      /* --- Hospital portal nav --- */
      hospital_portal_title: "आरोग्य कर्मचारी",
      hospital_nav_dashboard: "क्लिनिकल डेशबोर्ड",
      hospital_nav_referrals: "आवता रेफरल",
      hospital_nav_registration: "आपत्काल नोंधणी",
      hospital_nav_identify: "दर्दी ओळख",
      hospital_nav_scanner: "QR स्केनर",
      hospital_nav_snapshot: "आपत्काल स्नेपशोट",
      hospital_nav_triage: "AI ट्राइयज",
      hospital_nav_queue: "लाइव दर्दी लाइन",
      hospital_nav_management: "दर्दी व्यवस्थापन",
      hospital_nav_beds: "बेड / वार्ड व्यवस्थापन",
      hospital_nav_records: "तबीबी रेकोर्ड",
      hospital_nav_contacts: "आपत्काल संपर्को",
      hospital_nav_notifications: "सूचनाओ",

      /* --- Resource portal nav --- */
      resource_portal_title: "आरोग्य सेवाओ",
      resource_nav_availability: "रक्त उपलब्धता",
      resource_nav_medicines: "जरूरी दवाओ",
      resource_nav_bank: "रक्त बेंक",
      resource_nav_resources: "आपत्काल संसाधनो",
      resource_nav_facilities: "सुविधा शोधो",
      resource_nav_ambulance: "एम्ब्यूलन्स",
      resource_nav_diagnostics: "ડায়ग્નોस્ટિક્સ",
      resource_nav_teleconsult: "टेलीकन्सल्टेशन",

      /* --- Admin portal nav --- */
      admin_portal_title: "एडमिन",
      admin_nav_analytics: "हॉस्पिटल विश्लेषण",
      admin_nav_staff: "कर्मचारी व्यवस्थापन",
      admin_nav_beds: "बेड व्यवस्थापन",
      admin_nav_audit: "ओडिट लोग",
      admin_nav_settings: "सिस्टम सेटिंग्स",

      /* --- Ambulance portal nav --- */
      ambulance_portal_title: "एम्ब्युलन्स",
      ambulance_nav_incoming: "आवतो दर्दी",
      ambulance_nav_prearrival: "पूर्व-आगमन माहिती",
      ambulance_nav_vitals: "वाइटल्स",
      ambulance_nav_eta: "आगमन समय",
      ambulance_nav_handover: "हॉस्पिटल हेन्डओवर",

      /* --- Common buttons --- */
      btn_save: "साचवो",
      btn_cancel: "रद्द करो",
      btn_close: "बंध करो",
      btn_view_details: "विगतो जुओ",
      btn_share: "शेर करो",
      btn_back: "पाछळ",
      btn_next: "आगळ",
      btn_submit: "सबमिट करो",
      btn_send: "मोकलो",
      btn_upload: "अपलोड",
      btn_download: "डाउनलोड",
      btn_print: "प्रिन्ट",
      btn_search: "शोधो",
      btn_find_hospital: "हॉस्पिटल शोधो",
      btn_get_directions: "दिशा मेळवो",
      btn_refer_patient: "दर्दी रेफर करो",
      btn_view: "जुओ",
      btn_accept: "स्वीकारो",
      btn_reject: "नकारो",
      btn_confirm: "पुष्टि करो",

      /* --- Status messages --- */
      msg_saved: "दर्दीनी माहिती सफळतापूर्वक साचवाई गई.",
      msg_invalid_input: "कृपया दाखल करेली माहिती तपासो.",
      msg_missing_fields: "कृपया बधा जरूरी फिल्ड भरो.",
      msg_upload_complete: "दस्तावेज सफळतापूर्वक अपलोड थयो.",
      msg_upload_failed: "अपलोड निष्फळ. कृपया फरीथी प्रयास करो.",
      msg_referral_sent: "रेफरल सफळतापूर्वक मोकलायो.",
      msg_referral_accepted: "रेफरल स्वीकारायो.",
      msg_appointment_confirmed: "मुलाकात की पुष्टि थई.",
      msg_followup_completed: "फोलो-अप पूर्ण थयो.",
      msg_offline_sync: "ऑफलाइन — इन्टरनेट आव्या पछी डेटा सिंक थशे.",
      msg_emergency_notified: "आपत्काल संपर्कने जाण करायी.",
      msg_phone_invalid: "कृपया 10 अंकनो वैध फोन नंबर दाखल करो.",
      msg_otp_sent: "OTP मोकलायो (सिम्युलेटेड)",
      msg_otp_wrong: "ખોटો OTP — कृपया फरीथी प्रयास करो.",
      msg_signed_out: "साइन आउट थई गया",
      msg_contact_sent: "संदेश मोकलायो. Lifora टीम जल्द संपर्क करशे.",
    }
  };

  /* ---- Translation helper ---- */
  function t(key) {
    const lang = translations[currentLang] || translations.en;
    return lang[key] || translations.en[key] || key;
  }

  /* ---- Apply language to all data-i18n elements ---- */
  function applyLanguage(lang) {
    if (!translations[lang]) lang = "en";
    currentLang = lang;
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) {}

    // Update all static data-i18n elements
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (key) el.textContent = t(key);
    });

    // Update placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) el.placeholder = t(key);
    });

    // Update aria-labels
    document.querySelectorAll("[data-i18n-aria]").forEach(el => {
      const key = el.getAttribute("data-i18n-aria");
      if (key) el.setAttribute("aria-label", t(key));
    });

    // Update the language selector active state
    const sel = document.getElementById("globalLangSelect");
    if (sel && sel.value !== lang) sel.value = lang;

    // Update HTML lang attribute
    document.documentElement.lang = lang === "hi" ? "hi" : lang === "gu" ? "gu" : "en";

    // Update network status label
    updateNetworkStatusLabel();

    // Re-render dynamic content that contains translated strings
    rerenderActiveView();
  }

  function updateNetworkStatusLabel() {
    const label = document.getElementById("networkStatusLabel");
    const pill = document.getElementById("networkStatus");
    if (!label || !pill) return;
    const isOffline = pill.classList.contains("offline");
    label.textContent = isOffline ? t("network_offline") : t("network_connected");
  }

  function initLanguage() {
    let saved = "en";
    try { saved = localStorage.getItem(LANG_STORAGE_KEY) || "en"; } catch (e) {}
    if (!translations[saved]) saved = "en";
    currentLang = saved;
    applyLanguage(saved);
  }

  function wireLanguageSelector() {
    const sel = document.getElementById("globalLangSelect");
    if (!sel) return;
    sel.addEventListener("change", () => applyLanguage(sel.value));
  }



  /* ========================================================================
     1. MOCK DATABASE
     ======================================================================== */

  const STATUSES = ["Waiting", "Under Assessment", "Treatment", "Admitted", "ICU", "Discharged", "LAMA/DAMA", "Transferred", "Deceased"];
  const TERMINAL_STATUSES = ["Discharged", "LAMA/DAMA", "Transferred", "Deceased"];
  const PRIORITY_WEIGHT = { RED: 4, ORANGE: 3, YELLOW: 2, GREEN: 1 };
  const PRIORITY_LABEL = { RED: "🔴 RED — Immediate", ORANGE: "🟠 ORANGE — Very Urgent", YELLOW: "🟡 YELLOW — Urgent", GREEN: "🟢 GREEN — Less Urgent" };
  const ESCALATION_THRESHOLD = { RED: 10, ORANGE: 20 };
  const DEPTS = ["Emergency", "Trauma", "Cardiology", "General Medicine", "Pediatrics"];

  let nextPatientSeq = 9200;
  let nextDocSeq = 3000;

  const db = {
    patients: [
      { id: "LF-8841", name: "Aarav Rao", arrival: "Ambulance", priority: "RED", waitingMin: 3, dept: "Emergency", status: "Under Assessment" },
      { id: "UNK-0472", name: "Unknown-Male-40", arrival: "Ambulance", priority: "RED", waitingMin: 8, dept: "Trauma", status: "Waiting" },
      { id: "LF-1190", name: "Priya Nair", arrival: "Walk-in", priority: "ORANGE", waitingMin: 14, dept: "Cardiology", status: "Waiting" },
      { id: "LF-3387", name: "Devraj Singh", arrival: "Walk-in", priority: "YELLOW", waitingMin: 40, dept: "General Medicine", status: "Waiting" },
      { id: "LF-9021", name: "Fatima Sheikh", arrival: "Referred", priority: "YELLOW", waitingMin: 22, dept: "General Medicine", status: "Under Assessment" },
      { id: "LF-5510", name: "Karan Mehta", arrival: "Walk-in", priority: "GREEN", waitingMin: 25, dept: "General Medicine", status: "Waiting" },
      { id: "LF-6602", name: "Sara Thomas", arrival: "Walk-in", priority: "GREEN", waitingMin: 12, dept: "Pediatrics", status: "Waiting" }
    ],

    documents: [
      { id: "DOC-1001", type: "Lab Reports", date: "2026-01-14", doctor: "Dr. S. Bhatt, City Hospital", fileName: "HbA1c_report_jan2026.pdf", notes: "Routine diabetes review", aiSummary: "HbA1c within target range. No acute abnormalities flagged. Continue current management plan and confirm with your physician." },
      { id: "DOC-1002", type: "Prescriptions", date: "2026-01-14", doctor: "Dr. S. Bhatt, City Hospital", fileName: "insulin_lantus_rx.pdf", notes: "", aiSummary: "Active prescription for Insulin (Lantus), 10 units nightly. Cross-checked against current medication list." },
      { id: "DOC-1003", type: "Imaging", date: "2021-08-02", doctor: "Sunrise Clinic", fileName: "left_wrist_xray.pdf", notes: "Post-fracture follow-up", aiSummary: "Imaging shows a healed distal radius fracture with no signs of malunion. Findings appear consistent with prior clinical notes." },
      { id: "DOC-1004", type: "Discharge Summaries", date: "2019-11-20", doctor: "City Hospital — General Surgery", fileName: "appendectomy_discharge.pdf", notes: "", aiSummary: "Uncomplicated laparoscopic appendectomy. Discharged in stable condition with standard post-operative guidance." },
      { id: "DOC-1005", type: "Vaccination", date: "2025-06-10", doctor: "City Hospital", fileName: "vaccination_record_2025.pdf", notes: "", aiSummary: "Vaccination record up to date, no missed doses identified for the standard adult schedule reviewed." },
      { id: "DOC-1006", type: "Diagnosis", date: "2016-04-03", doctor: "Dr. S. Bhatt, City Hospital", fileName: "t1d_diagnosis_note.pdf", notes: "Initial diagnosis", aiSummary: "Diagnosis note indicates newly identified Type 1 Diabetes with insulin therapy initiated." }
    ],

    auditLog: [
      { action: "Medical document viewed", user: "Dr. S. Bhatt", patient: "Aarav Rao", type: "access", time: Date.now() - 1000 * 60 * 40 },
      { action: "QR access granted", user: "City Hospital ER", patient: "Aarav Rao", type: "qr", time: Date.now() - 1000 * 60 * 60 * 3 },
      { action: "Triage modified", user: "N. Kulkarni", patient: "Priya Nair", type: "triage", time: Date.now() - 1000 * 60 * 60 * 5 }
    ],

    notifications: [
      { title: "🚑 Critical patient arriving — ETA 7 minutes", meta: "Ambulance · Road traffic accident, suspected internal bleeding", time: Date.now() - 1000 * 60 * 2 },
      { title: "Triage confirmed — RED", meta: "Aarav Rao · LF-8841 · Emergency", time: Date.now() - 1000 * 60 * 6 },
      { title: "Emergency contact notified", meta: "Meera Rao (Spouse) · SMS + Call", time: Date.now() - 1000 * 60 * 9 }
    ],

    // ---- Nurse portal — care tasks against the same shared patient queue
    // used by Hospital/Admin, so a task always points at a real patient.
    nurseTasks: [
      { id: "NT-01", patientId: "LF-8841", patientName: "Aarav Rao", type: "Medication", detail: "Insulin (Lantus) 10 units, subcutaneous", dueTime: "14:00", status: "Due" },
      { id: "NT-02", patientId: "LF-1190", patientName: "Priya Nair", type: "Vitals Check", detail: "Routine 4-hourly vitals recheck", dueTime: "14:30", status: "Due" },
      { id: "NT-03", patientId: "LF-9021", patientName: "Fatima Sheikh", type: "Medication", detail: "Paracetamol 500mg, oral", dueTime: "14:45", status: "Due" },
      { id: "NT-04", patientId: "LF-3387", patientName: "Devraj Singh", type: "Handover", detail: "Prepare shift handover notes", dueTime: "15:00", status: "Pending" },
      { id: "NT-05", patientId: "LF-6602", patientName: "Sara Thomas", type: "Discharge Prep", detail: "Discharge paperwork & patient/family education", dueTime: "15:30", status: "Pending" }
    ],
    nurseNotes: {},
    handoverNote: "",

    wards: [
      { name: "Emergency", total: 12, occupied: 8, reserved: 1 },
      { name: "ICU", total: 10, occupied: 8, reserved: 1 },
      { name: "General", total: 40, occupied: 27, reserved: 2 }
    ],

    blood: [
      { group: "O Negative", units: 6, max: 10 },
      { group: "O Positive", units: 9, max: 12 },
      { group: "A Positive", units: 7, max: 10 },
      { group: "A Negative", units: 2, max: 8 },
      { group: "B Positive", units: 5, max: 10 },
      { group: "B Negative", units: 1, max: 8 },
      { group: "AB Positive", units: 4, max: 8 },
      { group: "AB Negative", units: 1, max: 6 }
    ],

    // Essential medicine coordination — a public-health availability view,
    // not a pharmacy or ordering system.
    medicines: [
      { name: "Paracetamol", category: "Analgesic", facility: "Rampura PHC", status: "Available", lastUpdated: "2026-09-14" },
      { name: "Paracetamol", category: "Analgesic", facility: "Sundarpur PHC", status: "Available", lastUpdated: "2026-09-13" },
      { name: "Paracetamol", category: "Analgesic", facility: "City General Hospital", status: "Low Stock", lastUpdated: "2026-09-10" },
      { name: "ORS", category: "Rehydration", facility: "Rampura PHC", status: "Available", lastUpdated: "2026-09-14" },
      { name: "Insulin", category: "Endocrine", facility: "City General Hospital", status: "Available", lastUpdated: "2026-09-12" },
      { name: "Insulin", category: "Endocrine", facility: "District Hospital", status: "Available", lastUpdated: "2026-09-11" },
      { name: "Amoxicillin", category: "Antibiotic", facility: "Sundarpur PHC", status: "Low Stock", lastUpdated: "2026-09-09" },
      { name: "Amoxicillin", category: "Antibiotic", facility: "Rampura PHC", status: "Unavailable", lastUpdated: "2026-09-08" },
      { name: "Iron & Folic Acid", category: "Antenatal", facility: "Rampura PHC", status: "Available", lastUpdated: "2026-09-14" },
      { name: "Amlodipine", category: "Cardiovascular", facility: "District Hospital", status: "Available", lastUpdated: "2026-09-13" },
      { name: "Amlodipine", category: "Cardiovascular", facility: "City General Hospital", status: "Available", lastUpdated: "2026-09-11" },
      { name: "Metformin", category: "Endocrine", facility: "City General Hospital", status: "Low Stock", lastUpdated: "2026-09-10" },
      { name: "Anti-rabies vaccine", category: "Vaccine", facility: "Sundarpur PHC", status: "Unavailable", lastUpdated: "2026-09-07" }
    ],

    // ---- Diagnostic test → facility availability lookup for coordination.
    diagnosticFacilities: [
      { test: "Blood Sugar (Random)", facility: "Rampura PHC", status: "Available", turnaround: "Same day" },
      { test: "Blood Sugar (Random)", facility: "Sundarpur PHC", status: "Available", turnaround: "Same day" },
      { test: "Blood Test (CBC)", facility: "Sundarpur PHC", status: "Available", turnaround: "1 day" },
      { test: "Blood Test (CBC)", facility: "District Hospital", status: "Available", turnaround: "Same day" },
      { test: "Blood Test (CBC)", facility: "Rampura PHC", status: "Not Available", turnaround: "—" },
      { test: "Urine Test", facility: "Rampura PHC", status: "Available", turnaround: "Same day" },
      { test: "X-Ray", facility: "City General Hospital", status: "Available", turnaround: "Same day" },
      { test: "X-Ray", facility: "District Hospital", status: "Available", turnaround: "1 day" },
      { test: "Ultrasound (Antenatal)", facility: "District Hospital", status: "Available", turnaround: "1–2 days" },
      { test: "Ultrasound (Antenatal)", facility: "City General Hospital", status: "Available", turnaround: "Same day" },
      { test: "ECG", facility: "City General Hospital", status: "Available", turnaround: "Same day" },
      { test: "HbA1c", facility: "District Hospital", status: "Available", turnaround: "2 days" },
      { test: "HbA1c", facility: "City General Hospital", status: "Available", turnaround: "1 day" }
    ],

    // ---- ASHA / Community Health Worker data ----------------------------
    village: { name: "Shantipur", asha: "Meena Patel" },
    ashaPatients: [
      {
        id: "AP-1001", name: "Lakshmi Devi", age: 62, gender: "Female", phone: "9876500001",
        village: "Demo Village", emergencyContact: "Ramesh Devi (Son) · 9876500002", householdId: "HH-01",
        bloodGroup: "O Positive", allergies: "None known", conditions: "Hypertension, Type 2 Diabetes", medicines: "Amlodipine 5mg, Metformin 500mg",
        vitals: { bp: "158/96", pulse: 88, temp: 98.6, spo2: 96, resp: 19, weight: 58, sugar: 210 },
        symptoms: "Weakness, Dizziness", riskCategory: "Elderly", lastVisit: "2026-01-18", registeredBy: "Nurse Kulkarni",
        visits: [
          { date: "2026-01-05", vitals: { bp: "142/88", pulse: 82, temp: 98.4, spo2: 97, resp: 18, weight: 58, sugar: 180 }, notes: "Routine hypertension and blood glucose check.", recordedBy: "Nurse Kulkarni" },
          { date: "2026-01-18", vitals: { bp: "158/96", pulse: 88, temp: 98.6, spo2: 96, resp: 19, weight: 58, sugar: 210 }, notes: "Reports acute weakness and dizziness. Significantly elevated blood pressure and glucose.", recordedBy: "Nurse Kulkarni" }
        ]
      },
      {
        id: "AP-1002", name: "Bhura Singh", age: 68, gender: "Male", phone: "9876500003",
        village: "Rampura", emergencyContact: "Meena Singh · 9876500004", householdId: "HH-02",
        bloodGroup: "B Positive", allergies: "Penicillin", conditions: "Hypertension, Type 2 Diabetes", medicines: "Metformin, Amlodipine",
        vitals: { bp: "148/94", pulse: 92, temp: 98.2, spo2: 95, resp: 20, weight: 71, sugar: 190 },
        symptoms: "Dizziness, elevated blood pressure", riskCategory: "Elderly", lastVisit: "2026-01-15", registeredBy: "Nurse Kulkarni",
        visits: [
          { date: "2025-11-05", vitals: { bp: "138/88", pulse: 86, temp: 98.1, spo2: 96, resp: 18, weight: 72, sugar: 165 }, notes: "Routine hypertension follow-up", recordedBy: "Nurse Kulkarni" },
          { date: "2026-01-15", vitals: { bp: "148/94", pulse: 92, temp: 98.2, spo2: 95, resp: 20, weight: 71, sugar: 190 }, notes: "Dizziness, elevated blood pressure", recordedBy: "Nurse Kulkarni" }
        ]
      },
      {
        id: "AP-1003", name: "Kiran Patel", age: 6, gender: "Female", phone: "9876500005",
        village: "Sundarpur", emergencyContact: "Dipak Patel · 9876500006", householdId: "HH-03",
        bloodGroup: "A Positive", allergies: "None known", conditions: "None", medicines: "None",
        vitals: { bp: "96/60", pulse: 104, temp: 99.1, spo2: 97, resp: 22, weight: 19, sugar: 95 },
        symptoms: "Mild fever, cough", riskCategory: "Children", lastVisit: "2026-01-10", registeredBy: "Nurse Kulkarni",
        visits: [
          { date: "2026-01-10", vitals: { bp: "96/60", pulse: 104, temp: 99.1, spo2: 97, resp: 22, weight: 19, sugar: 95 }, notes: "Mild fever, cough", recordedBy: "Nurse Kulkarni" }
        ]
      },
      {
        id: "AP-1004", name: "Rina Patel", age: 27, gender: "Female", phone: "9876500007",
        village: "Rampura", emergencyContact: "Suresh Patel (Husband) · 9876500008", householdId: "HH-04",
        bloodGroup: "B Positive", allergies: "None known", conditions: "None", medicines: "Iron & Folic Acid",
        vitals: { bp: "150/100", pulse: 90, temp: 98.4, spo2: 97, resp: 18, weight: 64, sugar: 0 },
        symptoms: "Swelling in feet, occasional headache", riskCategory: "Maternal", lastVisit: "2026-01-19", registeredBy: "Meena Patel",
        pregnant: true, gestationWeeks: 32, edd: "2026-03-10", ancVisits: 4,
        visits: [
          { date: "2025-12-20", vitals: { bp: "128/84", pulse: 82, temp: 98.2, spo2: 98, resp: 17, weight: 61, sugar: 0 }, notes: "Routine ANC follow-up — 28 weeks. No concerns.", recordedBy: "Meena Patel" },
          { date: "2026-01-19", vitals: { bp: "150/100", pulse: 90, temp: 98.4, spo2: 97, resp: 18, weight: 64, sugar: 0 }, notes: "32 weeks. Reports swelling in feet and occasional headache. BP elevated.", recordedBy: "Meena Patel" }
        ]
      },
      {
        id: "AP-1005", name: "Baby Aarav", age: 0, gender: "Male", phone: "9876500009",
        village: "Demo Village", emergencyContact: "Sunita Sharma (Mother) · 9876500009", householdId: "HH-05",
        bloodGroup: "Unknown", allergies: "None known", conditions: "None", medicines: "None",
        vitals: { bp: "—", pulse: 128, temp: 98.6, spo2: 98, resp: 34, weight: 3.1, sugar: 0 },
        symptoms: "Feeding well, no danger signs observed", riskCategory: "Children", lastVisit: "2026-01-12", registeredBy: "Meena Patel",
        newborn: true, birthDate: "2026-01-12", motherName: "Sunita Sharma", deliveryPlace: "City General Hospital",
        visits: [
          { date: "2026-01-12", vitals: { bp: "—", pulse: 130, temp: 98.7, spo2: 98, resp: 36, weight: 3.1, sugar: 0 }, notes: "Day 0 — birth details recorded. Institutional delivery, no complications.", recordedBy: "Meena Patel" }
        ]
      }
    ],

    // ---- Household register — links to the ashaPatients above via
    // householdId / memberIds so nothing about a person is duplicated.
    households: [
      { id: "HH-01", headName: "Lakshmi Devi", village: "Demo Village", address: "12, Shantipur Main Road", phone: "9876500001", memberIds: ["AP-1001"] },
      { id: "HH-02", headName: "Bhura Singh", village: "Rampura", address: "4, Rampura Cross Street", phone: "9876500003", memberIds: ["AP-1002"] },
      { id: "HH-03", headName: "Dipak Patel", village: "Sundarpur", address: "22, Sundarpur Lane", phone: "9876500006", memberIds: ["AP-1003"] },
      { id: "HH-04", headName: "Suresh Patel", village: "Rampura", address: "9, Rampura Cross Street", phone: "9876500008", memberIds: ["AP-1004"] },
      { id: "HH-05", headName: "Sunita Sharma", village: "Demo Village", address: "31, Shantipur Main Road", phone: "9876500009", memberIds: ["AP-1005"] }
    ],


    referrals: [
      {
        id: "LFR-00100", patientId: "AP-1002", patientName: "Bhura Singh",
        urgency: "HIGH", facility: "City General Hospital",
        reason: "Elevated blood pressure with dizziness — needs same-day evaluation.",
        status: "SENT", createdBy: "Nurse Kulkarni", time: Date.now() - 1000 * 60 * 40,
        followUpDate: todayStrOffset(-2), lastUpdate: Date.now() - 1000 * 60 * 40, notes: ""
      }
    ],

    // ---- Diagnostic coordination — test requests linked to a patient/case.
    diagnosticRequests: [
      {
        id: "DX-5001", patientId: "AP-1002", patientName: "Bhura Singh",
        test: "Blood Sugar (Random)", facility: "Sundarpur PHC",
        status: "Scheduled", requestedAt: Date.now() - 1000 * 60 * 60 * 20, requestedBy: "Nurse Kulkarni", result: ""
      }
    ],

    // ---- ASHA-assisted teleconsultation requests.
    teleconsults: [
      {
        id: "TC-3001", patientId: "AP-1004", patientName: "Rina Patel",
        department: "Gynaecology & Obstetrics", priority: "URGENT",
        reason: "32 weeks, BP elevated with swelling — needs specialist review.",
        status: "Requested", requestedAt: Date.now() - 1000 * 60 * 30,
        advice: "", nextAction: "", followUpDate: ""
      }
    ],

    followUps: [
      {
        id: "FU-9001", patientId: "AP-1001", patientName: "Lakshmi Devi",
        reason: "Hypertension & Diabetes Follow-Up", dueLabel: "Today",
        status: "Due", createdFrom: null
      },
      {
        id: "FU-9002", patientId: "AP-1004", patientName: "Rina Patel",
        reason: "Pregnancy follow-up — 32 weeks, monitor BP", dueLabel: "Today",
        status: "Due", createdFrom: null
      },
      {
        id: "FU-9003", patientId: "AP-1005", patientName: "Baby Aarav",
        reason: "Newborn home visit (Day 7 — HBNC)", dueLabel: "Today",
        status: "Due", createdFrom: null
      },
      {
        id: "FU-9004", patientId: "AP-1002", patientName: "Bhura Singh",
        reason: "Hypertension recheck after elevated referral reading", dueLabel: "Overdue — was due 2 days ago",
        status: "Due", createdFrom: "LFR-00100"
      },
      {
        id: "FU-9005", patientId: "AP-1003", patientName: "Kiran Patel",
        reason: "Fever/cough recovery check", dueLabel: "Upcoming — in 3 days",
        status: "Due", createdFrom: null
      }
    ],

    // Records an ASHA worker saved while offline, waiting to sync — see
    // the "Low-Connectivity Ready" section of the Health Worker dashboard.
    pendingSyncQueue: [],

    escalated: new Set(),

    consentSettings: { bloodAllergies: true, medications: true, conditions: true, fullVault: false, contacts: true }
  };

  // Bed objects are generated once from the ward summary above.
  db.wards.forEach(w => {
    w.beds = [];
    for (let i = 1; i <= w.total; i++) {
      let status = "available";
      if (i <= w.occupied) status = "occupied";
      else if (i <= w.occupied + w.reserved) status = "reserved";
      w.beds.push({ n: i, status });
    }
  });

  /* ========================================================================
     1b. PERSISTENCE — browser localStorage + cross-tab live sync
     ------------------------------------------------------------------------
     There is no server here, so this is NOT a real backend or a real
     database: it only shares data between tabs of THIS SAME browser, on
     THIS SAME computer. It cannot sync between two different phones/
     laptops — that genuinely requires a server, which is outside what
     three static files can do.

     What it DOES give you, honestly:
     - data survives a page refresh (previously everything reset)
     - open Lifora in two tabs (e.g. Ambulance in one, Hospital in
       another) and actions in one tab appear in the other automatically,
       via the browser's built-in "storage" event — no polling, no server.
     ======================================================================== */

  const STORAGE_KEY = "lifora_shared_state_sih2026_v3";

  // The one demo patient whose QR code the Patient portal generates, and
  // that the Hospital's camera scanner looks for. Keeping this as a single
  // constant (rather than duplicating the string) is what lets the two
  // screens agree on what a "successful scan" means.
  const DEMO_QR_PATIENT_ID = "LF-2231-9048";
  const DEMO_QR_PATIENT_NAME = "Aarav Rao";
  const DEMO_QR_PAYLOAD = "LIFORA-HEALTHID:" + DEMO_QR_PATIENT_ID;

  function saveDB() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      // Storage can fail (private browsing, quota, etc.) — the app still
      // works for the current tab, it just won't persist/sync. Fail quiet.
    }
  }

  function loadDB() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.patients) || !Array.isArray(parsed.ashaPatients)) return false;
      Object.assign(db, parsed);
      db.escalated = new Set(); // Set doesn't survive JSON; not relied on elsewhere.
      return true;
    } catch (e) {
      return false;
    }
  }

  function rerenderActiveView() {
    const section = document.querySelector(".portal-section.active");
    if (!section) return;
    const view = section.querySelector(".view.active");
    if (view) runRenderer(view.id.replace("view-", ""));
  }

  /* ========================================================================
     1c. PORTAL SELECTION — the app's entry point (no login of any kind)
     ------------------------------------------------------------------------
     Lifora opens directly into a portal picker. Choosing a portal is the
     entire "entry" mechanism — there's no account, password, or OTP.
     Internally this only ever needs to track which portal is open, which
     navigateTo()/getCurrentPortalId() already do; this block just handles
     showing/hiding the picker screen itself.
     ======================================================================== */

  const PORTAL_CHOICE_KEY = "lifora_last_portal_v1";

  // Reveals the app shell and hides the portal-selection screen. There is
  // no "show" counterpart with its own function — the picker is the
  // default state (body starts with no special class in the HTML), so
  // nothing needs to explicitly show it on load; it's only ever hidden.
  function enterPortal(portalId) {
    document.body.classList.add("portal-chosen");
    try { localStorage.setItem(PORTAL_CHOICE_KEY, portalId); } catch (e) {}
    navigateTo(portalId, null);
  }

  function showPortalSelection() {
    document.body.classList.remove("portal-chosen");
    try { localStorage.removeItem(PORTAL_CHOICE_KEY); } catch (e) {}
  }

  function wirePortalSelection() {
    $all("[data-select-portal]").forEach(card => {
      card.addEventListener("click", () => enterPortal(card.dataset.selectPortal));
    });
    const changeBtn = $("#changePortalBtn");
    if (changeBtn) changeBtn.addEventListener("click", showPortalSelection);

    const langSel = $("#portalSelectLangSelect");
    if (langSel) {
      langSel.addEventListener("change", () => {
        const globalSel = $("#globalLangSelect");
        if (globalSel) {
          globalSel.value = langSel.value;
          globalSel.dispatchEvent(new Event("change"));
        }
      });
    }

    // Returning visitor in this same browser tab — skip straight back into
    // the portal they were last using instead of showing the picker again.
    let lastPortal = null;
    try { lastPortal = localStorage.getItem(PORTAL_CHOICE_KEY); } catch (e) {}
    if (lastPortal && document.getElementById("portal-" + lastPortal)) {
      enterPortal(lastPortal);
    }
  }

  /* ========================================================================
     2. UTILITIES
     ======================================================================== */

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $all = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  function timeAgo(ts) {
    const diff = Math.max(0, Date.now() - ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + " min ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + " hr ago";
    return Math.floor(hrs / 24) + " d ago";
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  // Returns a YYYY-MM-DD date offset by `days` from today (negative = past,
  // used for demo data so "overdue" states are visible immediately).
  function todayStrOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function nowClock() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function logAudit(action, user, patient, type) {
    db.auditLog.unshift({ action, user, patient, type, time: Date.now() });
    if (db.auditLog.length > 80) db.auditLog.length = 80;
    if (viewIsActive("p-access")) renderPatientAccessTable();
    if (viewIsActive("ad-audit")) renderAdminAuditTable();
    saveDB();
  }

  function pushNotification(title, meta) {
    db.notifications.unshift({ title, meta, time: Date.now() });
    if (db.notifications.length > 50) db.notifications.length = 50;
    if (viewIsActive("h-notifications")) renderNotifList();
    saveDB();
  }

  function viewIsActive(viewId) {
    const el = document.getElementById("view-" + viewId);
    return !!(el && el.classList.contains("active"));
  }

  function activePatients() {
    return db.patients.filter(p => !TERMINAL_STATUSES.includes(p.status));
  }

  function badgeClassForPriority(p) {
    return { RED: "badge-red", ORANGE: "badge-orange", YELLOW: "badge-yellow", GREEN: "badge-green" }[p] || "badge-muted";
  }

  function priorityDot(p) {
    return { RED: "🔴", ORANGE: "🟠", YELLOW: "🟡", GREEN: "🟢" }[p] || "⚪";
  }

  function aiActionFor(p) {
    return {
      RED: "Immediate physician assessment",
      ORANGE: "Rapid assessment within 15 min",
      YELLOW: "Assessment within 60 min",
      GREEN: "Stable — can safely wait"
    }[p.priority] || "Assess when available";
  }

  /* ========================================================================
     3. NAVIGATION — portal switching + generic sidebar view switching
     ======================================================================== */

  const ROLE_MAP = {
    public: { name: "Guest", tag: "Public site", initials: "GU" },
    patient: { name: "Aarav Rao", tag: "Patient", initials: "AR" },
    asha: { name: "Meena Patel", tag: "ASHA", initials: "MP" },
    nurse: { name: "Nurse Kulkarni", tag: "Nurse", initials: "NK" },
    hospital: { name: "Dr. S. Bhatt", tag: "Hospital / Admin", initials: "SB" },
    ambulance: { name: "R. Sen", tag: "Ambulance crew", initials: "RS" },
    resource: { name: "K. Verma", tag: "Healthcare Services", initials: "KV" },
    admin: { name: "Hospital Admin", tag: "Administrator", initials: "HA" }
  };

  function getCurrentPortalId() {
    const activeSection = document.querySelector(".portal-section.active");
    if (!activeSection) return "public";
    return activeSection.id.replace("portal-", "");
  }

  function navigateTo(portalId, viewId) {
    const targetPortal = portalId || getCurrentPortalId() || "public";
    const section = document.getElementById("portal-" + targetPortal);
    if (!section) return;

    if (targetPortal !== "hospital" || viewId !== "h-scanner") {
      stopScannerCamera();
    }

    // 1. Activate target portal section only
    $all(".portal-section").forEach(s => s.classList.toggle("active", s.id === "portal-" + targetPortal));
    $all(".portal-switcher .pill").forEach(p => p.classList.toggle("active", p.dataset.portalLink === targetPortal));

    // 2. Update role chip in topbar
    const role = ROLE_MAP[targetPortal] || ROLE_MAP.public;
    const roleNameEl = $("#currentRoleName");
    const roleTagEl = $("#currentRoleTag");
    const avatarEl = $(".avatar");
    if (roleNameEl) roleNameEl.textContent = role.name;
    if (roleTagEl) roleTagEl.textContent = role.tag;
    if (avatarEl) avatarEl.textContent = role.initials;

    // 3. Determine view to display
    let targetViewId = viewId;
    if (!targetViewId) {
      const curActive = section.querySelector(".view.active");
      if (curActive) {
        targetViewId = curActive.id.replace("view-", "");
      } else {
        const firstNav = section.querySelector(".portal-nav a[data-view]");
        if (firstNav) {
          targetViewId = firstNav.dataset.view;
        } else {
          const firstView = section.querySelector(".view");
          if (firstView) targetViewId = firstView.id.replace("view-", "");
        }
      }
    }

    const targetViewEl = document.getElementById("view-" + targetViewId);
    // 4. Ensure strictly ONE view is active in this portal
    $all(".view", section).forEach(v => {
      v.classList.toggle("active", targetViewEl ? v === targetViewEl : false);
    });

    // If target view wasn't found or was invalid, activate the first available view in the section
    if (!section.querySelector(".view.active")) {
      const fallbackView = section.querySelector(".view");
      if (fallbackView) {
        fallbackView.classList.add("active");
        targetViewId = fallbackView.id.replace("view-", "");
      }
    }

    // 5. Update sidebar navigation active item
    $all(".portal-nav a[data-view]", section).forEach(a => {
      a.classList.toggle("active", a.dataset.view === targetViewId);
    });

    // 6. Execute active view renderer safely
    if (targetViewId) {
      runRenderer(targetViewId);
    }

    // 7. Reset scroll to top
    window.scrollTo({ top: 0, behavior: "auto" });
    const content = section.querySelector(".content");
    if (content) content.scrollTo({ top: 0, behavior: "auto" });
  }

  function switchPortal(portalId, viewId) {
    navigateTo(portalId, viewId);
  }

  function showView(section, viewId) {
    const portalId = section && section.dataset && section.dataset.portal ? section.dataset.portal : getCurrentPortalId();
    navigateTo(portalId, viewId);
  }

  const viewRenderers = {
    "p-vault": renderVaultGrid,
    "p-reports": renderReportsGrid,
    "p-access": renderPatientAccessTable,
    "p-qr": renderPatientQRCode,
    "h-dashboard": renderHospitalDashboard,
    "h-queue": renderFullQueueTable,
    "h-management": renderManagementTable,
    "h-beds": renderBedWards,
    "h-records": renderStaffRecordsGrid,
    "h-notifications": renderNotifList,
    "r-availability": renderBloodGrid,
    "r-medicines": renderMedicineTable,
    "ad-analytics": renderAnalytics,
    "ad-audit": renderAdminAuditTable,
    "h-triage": renderTriageApplyToOptions,
    "h-referrals": renderHospitalReferrals,
    "asha-dashboard": renderAshaDashboard,
    "asha-households": renderAshaHouseholdList,
    "asha-household-profile": renderAshaHouseholdProfile,
    "asha-register": resetAshaWizard,
    "asha-patients": renderAshaPatientsTable,
    "asha-patient-profile": renderAshaPatientProfile,
    "asha-urgency": renderAshaUrgencyPatientSelect,
    "asha-referrals": renderAshaReferralsView,
    "asha-followups": renderAshaFollowups,
    "asha-medicines": renderAshaMedicines,
    "asha-diagnostics": renderAshaDiagnosticsView,
    "asha-teleconsult": renderAshaTeleconsultView,
    "n-dashboard": renderNurseDashboard,
    "n-patients": renderNursePatientsTable,
    "n-patient-profile": renderNursePatientProfile,
    "n-tasks": renderNurseTasks,
    "n-handover": renderNurseHandover
  };

  function runRenderer(viewId) {
    if (viewRenderers[viewId]) viewRenderers[viewId]();
  }

  function wireNavigation() {
    document.addEventListener("click", (e) => {
      // 1. Portal switcher links/pills
      const portalLink = e.target.closest("[data-portal-link]");
      if (portalLink) {
        e.preventDefault();
        navigateTo(portalLink.dataset.portalLink, portalLink.dataset.defaultView || null);
        return;
      }

      // 2. Sidebar view links
      const navLink = e.target.closest(".portal-nav a[data-view]");
      if (navLink) {
        e.preventDefault();
        const section = navLink.closest(".portal-section");
        const portalId = section ? section.dataset.portal : getCurrentPortalId();
        navigateTo(portalId, navLink.dataset.view);
        return;
      }

      // 3. View jump buttons anywhere in the app
      const jumpBtn = e.target.closest("[data-view-jump]");
      if (jumpBtn) {
        e.preventDefault();
        const targetView = jumpBtn.dataset.viewJump;
        const targetPortal = jumpBtn.dataset.portalJump || (jumpBtn.closest(".portal-section") ? jumpBtn.closest(".portal-section").dataset.portal : getCurrentPortalId());
        navigateTo(targetPortal, targetView);
        return;
      }
    });

    const sidebarToggle = $("#sidebarToggle");
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        document.getElementById("app").classList.toggle("sidebar-collapsed");
      });
    }
  }

  /* ========================================================================
     4. HOSPITAL DASHBOARD + LIVE QUEUE
     ======================================================================== */

  function sortedActive(filterPriority, filterDept) {
    let list = activePatients();
    if (filterPriority && filterPriority !== "all") list = list.filter(p => p.priority === filterPriority);
    if (filterDept && filterDept !== "all") list = list.filter(p => p.dept === filterDept);
    return list.sort((a, b) => (PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]) || (b.waitingMin - a.waitingMin));
  }

  function renderTriageSummary() {
    const el = $("#triageSummary");
    if (!el) return;
    const list = activePatients();
    const counts = { RED: 0, ORANGE: 0, YELLOW: 0, GREEN: 0 };
    list.forEach(p => { if (counts[p.priority] != null) counts[p.priority]++; });
    el.innerHTML = `
      <div class="tsum-card tsum-red"><span>🔴 Red — Immediate</span><strong>${counts.RED}</strong></div>
      <div class="tsum-card tsum-orange"><span>🟠 Orange — Very Urgent</span><strong>${counts.ORANGE}</strong></div>
      <div class="tsum-card tsum-yellow"><span>🟡 Yellow — Urgent</span><strong>${counts.YELLOW}</strong></div>
      <div class="tsum-card tsum-green"><span>🟢 Green — Less Urgent</span><strong>${counts.GREEN}</strong></div>
      <div class="tsum-card tsum-total"><span>Active patients</span><strong>${list.length}</strong></div>
    `;
  }

  function queueRowHtml(p) {
    return `
      <tr>
        <td class="mono">${esc(p.id)}</td>
        <td><strong>${esc(p.name)}</strong></td>
        <td>${esc(p.arrival)}</td>
        <td><span class="badge ${badgeClassForPriority(p.priority)}">${priorityDot(p.priority)} ${esc(p.priority)}</span></td>
        <td>${p.waitingMin} min</td>
        <td>${esc(p.dept)}</td>
        <td>${esc(p.status)}</td>
        <td>${esc(aiActionFor(p))}</td>
      </tr>`;
  }

  function renderDashQueuePreview() {
    const el = $("#dashQueuePreview");
    if (!el) return;
    const list = sortedActive("all", "all").slice(0, 5);
    el.innerHTML = `
      <thead><tr><th>Patient ID</th><th>Name</th><th>Arrival</th><th>Priority</th><th>Waiting</th><th>Dept</th><th>Status</th><th>AI Action</th></tr></thead>
      <tbody>${list.map(queueRowHtml).join("") || `<tr class="empty-row"><td colspan="8">No active patients right now.</td></tr>`}</tbody>`;
  }

  function renderEscalationList() {
    const el = $("#escalationList");
    if (!el) return;
    const escalating = activePatients().filter(p => ESCALATION_THRESHOLD[p.priority] && p.waitingMin >= ESCALATION_THRESHOLD[p.priority]);
    el.innerHTML = escalating.length
      ? escalating.map(p => `<div class="escalation-item"><span>⚠️ ${esc(p.name)} — ${esc(p.priority)}, waiting ${p.waitingMin} min</span><span>${esc(p.dept)}</span></div>`).join("")
      : `<p class="escalation-empty">No escalations right now — all priority patients are within threshold.</p>`;
  }

  function renderHospitalDashboard() {
    renderTriageSummary();
    renderDashQueuePreview();
    renderEscalationList();
  }

  function renderFullQueueTable() {
    const tbody = $("#fullQueueTable tbody");
    if (!tbody) return;
    const activeChip = $("#queueFilters .chip.active");
    const priority = activeChip ? activeChip.dataset.priority : "all";
    const dept = $("#deptFilter") ? $("#deptFilter").value : "all";
    const list = sortedActive(priority, dept);
    tbody.innerHTML = list.map(queueRowHtml).join("") || `<tr class="empty-row"><td colspan="8">No patients match this filter.</td></tr>`;
  }

  function wireQueueFilters() {
    $all("#queueFilters .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        $all("#queueFilters .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        renderFullQueueTable();
      });
    });
    const deptSel = $("#deptFilter");
    if (deptSel) deptSel.addEventListener("change", renderFullQueueTable);
  }

  /* ========================================================================
     5. PATIENT MANAGEMENT (status changes)
     ======================================================================== */

  function renderManagementTable() {
    const tbody = $("#managementTable tbody");
    if (!tbody) return;
    tbody.innerHTML = db.patients.map(p => `
      <tr data-pid="${esc(p.id)}">
        <td><strong>${esc(p.name)}</strong><br><span class="mono section-note">${esc(p.id)}</span></td>
        <td><span class="badge ${TERMINAL_STATUSES.includes(p.status) ? "badge-muted" : "badge-mint"}">${esc(p.status)}</span></td>
        <td>
          <select class="mgmt-status-select">
            ${STATUSES.map(s => `<option value="${s}" ${s === p.status ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
      </tr>`).join("");

    $all(".mgmt-status-select", tbody).forEach(sel => {
      sel.addEventListener("change", (e) => {
        const row = e.target.closest("tr");
        const pid = row.dataset.pid;
        const patient = db.patients.find(p => p.id === pid);
        if (!patient) return;
        const oldStatus = patient.status;
        patient.status = e.target.value;
        logAudit("Patient status changed", "N. Kulkarni", patient.name, "status");
        pushNotification(`Status updated — ${patient.name}`, `${oldStatus} → ${patient.status}`);
        toast(`${patient.name} marked as ${patient.status}`);
        renderManagementTable();
        renderHospitalDashboard();
        if (viewIsActive("h-queue")) renderFullQueueTable();
      });
    });
  }

  /* ========================================================================
     6. AI-ASSISTED TRIAGE
     ======================================================================== */

  function computeTriageSuggestion(input) {
    let score = 0;
    const reasons = [];

    const consciousnessScore = { "Alert": 0, "Responds to voice": 2, "Responds to pain": 3, "Unresponsive": 4 }[input.consciousness] || 0;
    if (consciousnessScore > 0) { score += consciousnessScore; reasons.push(`Consciousness level "${input.consciousness}" (+${consciousnessScore})`); }

    const hr = parseInt(input.hr, 10);
    if (!isNaN(hr) && hr > 0) {
      if (hr > 130 || hr < 45) { score += 2; reasons.push(`Heart rate ${hr} bpm outside safe range (+2)`); }
      else if (hr > 110) { score += 1; reasons.push(`Heart rate ${hr} bpm elevated (+1)`); }
    }

    const spo2 = parseInt(input.spo2, 10);
    if (!isNaN(spo2) && spo2 > 0) {
      if (spo2 < 90) { score += 3; reasons.push(`SpO₂ ${spo2}% critically low (+3)`); }
      else if (spo2 < 94) { score += 1; reasons.push(`SpO₂ ${spo2}% below normal (+1)`); }
    }

    if (input.bp) {
      const parts = String(input.bp).split("/");
      const sys = parseInt(parts[0], 10);
      const dia = parseInt(parts[1], 10);
      if (!isNaN(sys) && !isNaN(dia)) {
        if (sys >= 160 || dia >= 100) {
          score += 2;
          reasons.push(`Blood pressure severely elevated (${input.bp} mmHg) (+2)`);
        } else if (sys >= 140 || dia >= 90) {
          score += 1;
          reasons.push(`Blood pressure elevated (${input.bp} mmHg) (+1)`);
        }
      }
    }

    const sugar = parseInt(input.sugar, 10);
    if (!isNaN(sugar) && sugar > 0) {
      if (sugar >= 250 || sugar <= 60) {
        score += 2;
        reasons.push(`Blood glucose outside safe range (${sugar} mg/dL) (+2)`);
      } else if (sugar >= 180 || sugar <= 70) {
        score += 1;
        reasons.push(`Elevated blood glucose (${sugar} mg/dL) (+1)`);
      }
    }

    const age = parseInt(input.age, 10);
    if (!isNaN(age) && age > 0) {
      if (age < 5 || age >= 60) { score += 1; reasons.push(`Age ${age} — higher-risk / vulnerable age group (+1)`); }
    }

    const text = `${input.symptoms || ""} ${input.history || ""}`.toLowerCase();
    const criticalKeywords = ["chest pain", "bleeding", "breathless", "breathing difficulty", "unconscious", "unresponsive", "severe", "trauma", "accident", "stroke", "seizure", "internal bleeding", "cardiac", "pregnancy", "dizziness", "weakness", "hypertension", "diabetes"];
    let kwHits = 0;
    criticalKeywords.forEach(k => { if (text.includes(k)) kwHits++; });
    if (kwHits > 0) { score += Math.min(kwHits, 3); reasons.push(`Symptom/condition indicators detected (${criticalKeywords.filter(k => text.includes(k)).slice(0, 3).join(", ")}) (+${Math.min(kwHits, 3)})`); }

    let priority = "GREEN";
    let urgencyLabel = "Routine";
    let suggestedNextStep = "Continue routine community follow-up and basic preventive care.";

    if (score >= 6) {
      priority = "RED";
      urgencyLabel = "Urgent";
      suggestedNextStep = "Immediate emergency referral to equipped healthcare facility with diagnostic support.";
    } else if (score >= 4) {
      priority = "ORANGE";
      urgencyLabel = "Priority";
      suggestedNextStep = "Prompt referral to Community Health Centre / Hospital for medical evaluation and stabilization.";
    } else if (score >= 2) {
      priority = "YELLOW";
      urgencyLabel = "Priority";
      suggestedNextStep = "Schedule clinical assessment at primary health centre within 24–48 hours.";
    }

    if (reasons.length === 0) reasons.push("No high-risk indicators entered — stable profile.");

    return {
      priority,
      score,
      urgencyLabel,
      suggestedNextStep,
      disclaimer: "This assessment provides decision support and does not replace professional clinical judgement.",
      reasons
    };
  }

  let lastTriageSuggestion = null;

  // Keeps the "Apply this triage to" dropdown in sync with whoever is
  // actually active right now, so a triage result can be applied to a
  // real registered patient instead of always spawning a new one.
  function renderTriageApplyToOptions() {
    const sel = $("#tApplyTo");
    if (!sel) return;
    const previousValue = sel.value;
    const active = db.patients.filter(p => !TERMINAL_STATUSES.includes(p.status));
    sel.innerHTML =
      `<option value="__new__">Register as a new patient</option>` +
      active.map(p => `<option value="${esc(p.id)}">${esc(p.name)} (${esc(p.id)} — currently ${esc(p.priority)})</option>`).join("");
    if ([...sel.options].some(o => o.value === previousValue)) sel.value = previousValue;
  }

  function wireTriage() {
    const runBtn = $("#runTriageAI");
    if (!runBtn) return;

    runBtn.addEventListener("click", () => {
      const input = {
        symptoms: $("#tSymptoms").value,
        consciousness: $("#tConsciousness").value,
        hr: $("#tHR").value,
        bp: $("#tBP").value,
        spo2: $("#tSpo2").value,
        age: $("#tAge").value,
        history: $("#tHistory").value
      };
      const result = computeTriageSuggestion(input);
      lastTriageSuggestion = { ...result, input };

      $("#triageSuggestion").innerHTML = `
        <div class="triage-result">
          <span class="priority-tag ${badgeClassForPriority(result.priority)}">${priorityDot(result.priority)} ${PRIORITY_LABEL[result.priority]}</span>
          <div class="triage-reasoning"><strong>Why:</strong><br>${result.reasons.map(r => "• " + esc(r)).join("<br>")}</div>
        </div>`;
      $("#triageSuggestion").classList.remove("triage-suggestion-empty");
      $("#triageControls").style.display = "flex";
      // Remove any leftover modify/override sub-panel from a previous run
      const existingPanel = $("#triageSubPanel");
      if (existingPanel) existingPanel.remove();
    });

    $("#triageConfirm").addEventListener("click", () => finalizeTriage(lastTriageSuggestion.priority, "confirmed"));
    $("#triageModify").addEventListener("click", () => openTriageSubPanel("modify"));
    $("#triageOverride").addEventListener("click", () => openTriageSubPanel("override"));
  }

  function openTriageSubPanel(mode) {
    const existing = $("#triageSubPanel");
    if (existing) existing.remove();
    const panel = document.createElement("div");
    panel.id = "triageSubPanel";
    panel.className = "triage-final";
    panel.style.textAlign = "left";
    panel.innerHTML = `
      <label style="display:flex;flex-direction:column;gap:6px;font-size:19px;font-weight:600;color:var(--ink-2);margin-top:8px;">
        ${mode === "modify" ? "Select the corrected priority" : "Override reason"}
        ${mode === "modify"
          ? `<select id="triageSubSelect" style="border:1px solid var(--border);border-radius:10px;padding:8px 10px;background:var(--surface-2);">
              ${["RED", "ORANGE", "YELLOW", "GREEN"].map(p => `<option value="${p}">${p}</option>`).join("")}
            </select>`
          : `<input id="triageSubReason" type="text" placeholder="e.g. Clinical judgement — patient decompensating" style="border:1px solid var(--border);border-radius:10px;padding:8px 10px;background:var(--surface-2);">`
        }
      </label>
      <button class="btn btn-primary btn-sm" id="triageSubSave" style="margin-top:10px;">${mode === "modify" ? "Save modified priority" : "Save override"}</button>
    `;
    $("#triageSuggestion").after(panel);

    $("#triageSubSave").addEventListener("click", () => {
      if (mode === "modify") {
        const chosen = $("#triageSubSelect").value;
        finalizeTriage(chosen, "modified");
      } else {
        const reason = $("#triageSubReason").value.trim() || "Clinical judgement override";
        finalizeTriage(lastTriageSuggestion.priority, "overridden", reason);
      }
    });
  }

  function finalizeTriage(priority, action, reason) {
    const applyToSel = $("#tApplyTo");
    const applyToId = applyToSel ? applyToSel.value : "__new__";
    let patient;
    let isExisting = false;

    if (applyToId && applyToId !== "__new__") {
      patient = db.patients.find(p => p.id === applyToId);
      isExisting = !!patient;
    }

    if (isExisting) {
      // Apply the result to the patient actually selected — this is what
      // keeps Register → Emergency Snapshot → AI Triage as one continuous
      // patient instead of spawning an unrelated new record.
      patient.priority = priority;
      patient.waitingMin = 0;
    } else {
      nextPatientSeq++;
      patient = {
        id: "LF-" + nextPatientSeq,
        name: "New Triage Patient #" + nextPatientSeq,
        arrival: "Walk-in",
        priority,
        waitingMin: 0,
        dept: "Emergency",
        status: "Waiting"
      };
      db.patients.unshift(patient);
    }

    const verb = action === "confirmed" ? "Triage confirmed" : action === "modified" ? "Triage modified" : "Triage overridden";
    logAudit(verb, "N. Kulkarni", patient.name, "triage");
    pushNotification(`${verb} — ${priority}`, reason ? `${patient.name} · ${reason}` : `${patient.name} · ${isExisting ? "priority updated in" : "added to"} the live queue`);
    toast(`${verb}: ${patient.name} ${isExisting ? "updated to" : "added to the queue as"} ${priority}`);

    const sub = $("#triageSubPanel");
    if (sub) sub.remove();
    $("#triageSuggestion").innerHTML += `<p class="triage-final">✅ ${esc(verb)} — ${esc(patient.name)} added to the live queue.</p>`;
    $("#triageControls").style.display = "none";

    renderHospitalDashboard();
    if (viewIsActive("h-queue")) renderFullQueueTable();
    if (viewIsActive("h-management")) renderManagementTable();
  }

  /* ========================================================================
     7. PATIENT IDENTIFICATION (biometric simulation)
     ======================================================================== */

  function wireIdentification() {
    const startBtn = $("#startBiometric");
    if (!startBtn) return;
    startBtn.addEventListener("click", () => {
      $("#idStep1").classList.remove("active");
      $("#idStep2").classList.add("active");
      $("#scanBar").style.width = "0%";
      requestAnimationFrame(() => { $("#scanBar").style.width = "100%"; });
      setTimeout(() => {
        $("#idStep2").classList.remove("active");
        $("#idStep3").classList.add("active");
        logAudit("Identity verified via biometric match", "R. Sen", "Aarav Rao", "access");
        toast("Identity verified — match found");
      }, 1500);
    });
  }

  /* ========================================================================
     8. QR — patient side (share) + staff side (scanner)
     ======================================================================== */

  // Renders a real, scannable QR code on the Patient portal's QR Health ID
  // page. Falls back to the old CSS placeholder pattern if the QR library
  // failed to load (e.g. no internet when the page opened).
  function renderPatientQRCode() {
    const el = $("#qrVisual");
    if (!el) return;
    if (typeof QRCode === "undefined") {
      el.classList.remove("filled");
      el.innerHTML = "";
      return; // CSS ::after "LIFORA" placeholder pattern shows through
    }
    el.innerHTML = "";
    const canvas = document.createElement("canvas");
    el.appendChild(canvas);
    QRCode.toCanvas(canvas, DEMO_QR_PAYLOAD, { width: 206, margin: 1, color: { dark: "#102a2f", light: "#ffffff" } }, (err) => {
      if (err) { el.classList.remove("filled"); el.innerHTML = ""; return; }
      el.classList.add("filled");
    });
  }

  function wirePatientQR() {
    const btn = $("#simulateScanBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const card = btn.closest(".qr-card");
      let panel = $("#qrConsentPanel");
      if (panel) panel.remove();
      btn.disabled = true;
      btn.textContent = "Requesting…";
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "Simulate hospital scan";
        panel = document.createElement("div");
        panel.id = "qrConsentPanel";
        panel.className = "card";
        panel.style.marginTop = "14px";
        panel.style.textAlign = "left";
        panel.innerHTML = `
          <h3 style="margin-bottom:6px;">Access request</h3>
          <p class="section-note" style="margin-bottom:14px;">City Hospital ER is requesting access to your health information.</p>
          <div class="quick-actions">
            <button class="btn btn-primary btn-sm" id="qrAllowBtn">Allow</button>
            <button class="btn btn-ghost btn-sm" id="qrDenyBtn">Deny</button>
          </div>`;
        card.after(panel);
        $("#qrAllowBtn").addEventListener("click", () => {
          logAudit("QR access granted", "City Hospital ER", "Aarav Rao", "qr");
          pushNotification("QR access granted", "City Hospital ER · Blood group, allergies, medications, conditions");
          toast("Access granted to City Hospital ER");
          panel.remove();
        });
        $("#qrDenyBtn").addEventListener("click", () => {
          logAudit("QR access denied", "City Hospital ER", "Aarav Rao", "qr");
          toast("Access denied");
          panel.remove();
        });
      }, 900);
    });
  }

  // ---- Hospital-side camera scanner --------------------------------------
  // Real camera access + real QR decoding via jsQR. Degrades gracefully:
  // if getUserMedia/jsQR aren't available (no camera, permission denied,
  // no internet to fetch the library), the "simulate scan instead" button
  // reproduces the old demo behavior so a live demo never dead-ends.

  let scannerStream = null;
  let scannerRAF = null;

  function stopScannerCamera() {
    if (scannerRAF) { cancelAnimationFrame(scannerRAF); scannerRAF = null; }
    if (scannerStream) { scannerStream.getTracks().forEach(t => t.stop()); scannerStream = null; }
    const visual = $("#scannerVisual");
    const video = $("#scannerVideo");
    if (visual) visual.classList.remove("camera-active");
    if (video) { video.pause(); video.srcObject = null; }
  }

  function handleScannedPayload(text) {
    stopScannerCamera();
    const requestCard = $("#consentRequestCard");
    const resultEl = $("#consentResult");
    requestCard.style.display = "block";

    if (text && text.includes(DEMO_QR_PATIENT_ID)) {
      resultEl.innerHTML = `
        <p style="color:var(--primary-700);font-weight:700;margin-bottom:10px;">✅ QR recognized — ${DEMO_QR_PATIENT_NAME} (${DEMO_QR_PATIENT_ID})</p>
        <p class="section-note" style="margin-bottom:10px;">Access request sent to the patient…</p>
        <button class="btn btn-primary btn-sm" data-view-jump="h-snapshot">Open Emergency Snapshot</button>`;
      wireNavigation_singleJump(resultEl);
      logAudit("QR access granted", "Emergency Staff", DEMO_QR_PATIENT_NAME, "qr");
      toast("QR recognized — " + DEMO_QR_PATIENT_NAME);
    } else {
      resultEl.innerHTML = `<p class="section-note">⚠️ QR code scanned, but it doesn't match a known Lifora Health ID. Ask the patient to open their QR Health ID page and try again.</p>`;
      toast("Unrecognized QR code");
    }
    $("#scannerStatus").textContent = "";
  }

  function scanCameraFrame() {
    const video = $("#scannerVideo");
    const canvas = $("#scannerCanvas");
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      scannerRAF = requestAnimationFrame(scanCameraFrame);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = (typeof jsQR === "function") ? jsQR(imageData.data, imageData.width, imageData.height) : null;
    if (code && code.data) {
      handleScannedPayload(code.data);
      return; // stop the loop — a result was found
    }
    scannerRAF = requestAnimationFrame(scanCameraFrame);
  }

  async function startScannerCamera() {
    const statusEl = $("#scannerStatus");
    if (typeof jsQR !== "function") {
      statusEl.textContent = "QR-reading library didn't load (no internet?) — use 'Simulate scan instead' below.";
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      statusEl.textContent = "This browser can't access the camera — use 'Simulate scan instead' below.";
      return;
    }
    try {
      statusEl.textContent = "Requesting camera access…";
      scannerStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = $("#scannerVideo");
      video.srcObject = scannerStream;
      await video.play();
      $("#scannerVisual").classList.add("camera-active");
      statusEl.textContent = "Point the camera at the patient's QR Health ID…";
      scannerRAF = requestAnimationFrame(scanCameraFrame);
    } catch (err) {
      statusEl.textContent = "Camera access denied or unavailable — use 'Simulate scan instead' below.";
    }
  }

  function simulateStaffScan() {
    const requestCard = $("#consentRequestCard");
    const resultEl = $("#consentResult");
    requestCard.style.display = "block";
    resultEl.innerHTML = `<p class="section-note">Waiting for patient approval…</p>`;
    setTimeout(() => {
      resultEl.innerHTML = `
        <p style="color:var(--primary-700);font-weight:700;margin-bottom:10px;">✅ Access granted — Emergency Snapshot unlocked</p>
        <button class="btn btn-primary btn-sm" data-view-jump="h-snapshot">Open Emergency Snapshot</button>`;
      wireNavigation_singleJump(resultEl);
      logAudit("QR access granted", "Emergency Staff", "Aarav Rao", "qr");
      toast("Patient approved access request");
    }, 1400);
  }

  function wireStaffScanner() {
    const startBtn = $("#staffScanBtn");
    const fallbackBtn = $("#staffScanFallbackBtn");
    if (startBtn) startBtn.addEventListener("click", startScannerCamera);
    if (fallbackBtn) fallbackBtn.addEventListener("click", () => { stopScannerCamera(); simulateStaffScan(); });
  }

  // Newly-injected [data-view-jump] buttons (added after initial page load)
  // need their own listener bound, since the global wireNavigation() only
  // runs once at startup.
  function wireNavigation_singleJump(container) {
    $all("[data-view-jump]", container).forEach(btn => {
      btn.addEventListener("click", () => {
        const section = btn.closest(".portal-section");
        showView(section, btn.dataset.viewJump);
      });
    });
  }

  /* ========================================================================
     9. EMERGENCY REGISTRATION
     ======================================================================== */

  function wireRegistration() {
    const form = $("#registrationForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const isUnknown = $("#regIdentityStatus").value.includes("Unknown");
      nextPatientSeq++;
      const rawName = $("#regName").value.trim();
      const id = isUnknown ? "UNK-" + nextPatientSeq : "LF-" + nextPatientSeq;
      const name = rawName || (isUnknown ? `Unknown-Patient-${nextPatientSeq}` : `New Patient #${nextPatientSeq}`);

      const patient = {
        id, name,
        arrival: $("#regArrivalMode").value,
        priority: "YELLOW",
        waitingMin: 0,
        dept: $("#regDept").value,
        status: "Waiting"
      };
      db.patients.unshift(patient);

      logAudit("Patient record created", "R. Sen", patient.name, "registration");
      pushNotification("New emergency registration", `${patient.name} · ${patient.dept} · ${$("#regComplaint").value || "No complaint noted"}`);
      toast(`${patient.name} registered — temporary ID ${id}`);

      $("#registrationStatus").innerHTML = `✅ <strong>${esc(patient.name)}</strong> registered with ID <span class="mono">${esc(id)}</span>. Pending triage — the AI Triage screen can now assess this patient.`;
      form.reset();
      renderHospitalDashboard();
      if (viewIsActive("h-queue")) renderFullQueueTable();
      if (viewIsActive("h-management")) renderManagementTable();
    });
  }

  /* ========================================================================
     9b. STATIC FORMS — Contact, Medical Profile, System Settings
     These previously had onsubmit="return false" and no JS behind them at
     all, so clicking Send/Save did nothing. They're still frontend-only
     (no server to actually send an email or persist a profile edit to),
     but they now give real confirmation feedback, and System Settings
     actually updates the live escalation thresholds used by the queue.
     ======================================================================== */

  function wireStaticForms() {
    const contactForm = $("#contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = $("#contactName").value.trim();
        $("#contactStatus").innerHTML = `✅ Thanks${name ? ", " + esc(name) : ""} — your message has been sent. The Lifora team will get back to you shortly.`;
        toast("Message sent");
        contactForm.reset();
      });
    }

    const profileForm = $("#profileForm");
    if (profileForm) {
      profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        logAudit("Medical profile updated", "Aarav Rao", "Aarav Rao", "profile");
        $("#profileStatus").textContent = "✅ Profile changes saved.";
        toast("Profile updated");
      });
    }

    const settingsForm = $("#settingsForm");
    if (settingsForm) {
      settingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const red = parseInt($("#settingsRedThreshold").value, 10);
        const orange = parseInt($("#settingsOrangeThreshold").value, 10);
        if (!isNaN(red) && red > 0) ESCALATION_THRESHOLD.RED = red;
        if (!isNaN(orange) && orange > 0) ESCALATION_THRESHOLD.ORANGE = orange;
        logAudit("Escalation thresholds updated", "Hospital Admin", `RED ${ESCALATION_THRESHOLD.RED}m / ORANGE ${ESCALATION_THRESHOLD.ORANGE}m`, "settings");
        $("#settingsStatus").innerHTML = `✅ Saved — RED now escalates at ${ESCALATION_THRESHOLD.RED} min, ORANGE at ${ESCALATION_THRESHOLD.ORANGE} min. This applies immediately to the live queue.`;
        toast("Settings saved — escalation thresholds updated");
        if (viewIsActive("h-dashboard")) renderHospitalDashboard();
      });
    }
  }

  /* ========================================================================
     10. BED / WARD MANAGEMENT
     ======================================================================== */

  function bedCounts(ward) {
    const occ = ward.beds.filter(b => b.status === "occupied").length;
    const res = ward.beds.filter(b => b.status === "reserved").length;
    const avail = ward.beds.filter(b => b.status === "available").length;
    return { occ, res, avail };
  }

  function renderBedWards() {
    const el = $("#bedWards");
    if (!el) return;
    el.innerHTML = db.wards.map(ward => {
      const c = bedCounts(ward);
      return `
        <div class="ward-block" data-ward="${esc(ward.name)}">
          <h3>${esc(ward.name)} Ward</h3>
          <p class="section-note">${ward.total} beds · ${c.avail} available · ${c.occ} occupied · ${c.res} reserved — click a bed to update it</p>
          <div class="bed-grid">
            ${ward.beds.map(b => `<button class="bed bed-${b.status}" data-bed="${b.n}" title="Bed ${b.n} — ${b.status}">${b.n}</button>`).join("")}
          </div>
        </div>`;
    }).join("");

    $all(".bed", el).forEach(btn => {
      btn.addEventListener("click", () => {
        const wardName = btn.closest(".ward-block").dataset.ward;
        const ward = db.wards.find(w => w.name === wardName);
        const bed = ward.beds.find(b => b.n === parseInt(btn.dataset.bed, 10));
        const order = ["available", "occupied", "reserved"];
        bed.status = order[(order.indexOf(bed.status) + 1) % order.length];
        logAudit("Bed status updated", "Hospital Admin", `${wardName} · Bed ${bed.n}`, "beds");
        toast(`${wardName} bed ${bed.n} marked ${bed.status}`);
        renderBedWards();
      });
    });
  }

  /* ========================================================================
     11. MEDICAL VAULT / REPORTS / STAFF RECORDS
     ======================================================================== */

  let vaultFilter = "all";

  function docCardHtml(doc, opts) {
    opts = opts || {};
    return `
      <div class="doc-card">
        <div class="doc-card-top">
          <div>
            <h4>${esc(doc.fileName)}</h4>
            <div class="doc-meta">${esc(doc.type)} · ${esc(doc.date)}${doc.doctor ? " · " + esc(doc.doctor) : ""}</div>
          </div>
          <span class="badge badge-mint">${esc(doc.type)}</span>
        </div>
        ${doc.notes ? `<p style="font-size:18px;margin:0 0 6px;">${esc(doc.notes)}</p>` : ""}
        <div class="ai-summary"><strong>AI-generated summary · decision support</strong>${esc(doc.aiSummary)}</div>
        ${opts.authorizedView ? `<div class="doc-card-actions"><span class="badge badge-blue">Authorized access logged</span></div>` : ""}
      </div>`;
  }

  function renderVaultGrid() {
    const el = $("#vaultGrid");
    if (!el) return;
    const list = vaultFilter === "all" ? db.documents : db.documents.filter(d => d.type === vaultFilter);
    el.innerHTML = list.length ? list.map(d => docCardHtml(d)).join("") : `<p class="doc-empty">No documents in this category yet. Use "+ Upload document" to add one.</p>`;
  }

  function renderReportsGrid() {
    const el = $("#reportsGrid");
    if (!el) return;
    const list = db.documents.filter(d => d.type === "Lab Reports" || d.type === "Imaging");
    el.innerHTML = list.length ? list.map(d => docCardHtml(d)).join("") : `<p class="doc-empty">No lab or imaging reports uploaded yet.</p>`;
  }

  let staffRecordsLogged = false;
  function renderStaffRecordsGrid() {
    const el = $("#staffRecordsGrid");
    if (!el) return;
    el.innerHTML = db.documents.map(d => docCardHtml(d, { authorizedView: true })).join("");
    if (!staffRecordsLogged) {
      logAudit("Medical record accessed", "Dr. S. Bhatt", "Aarav Rao", "access");
      staffRecordsLogged = true;
    }
  }

  function wireVaultFilters() {
    $all("#vaultFilters .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        $all("#vaultFilters .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        vaultFilter = chip.dataset.cat;
        renderVaultGrid();
      });
    });
  }

  const AI_SUMMARY_TEMPLATES = {
    "Lab Reports": "No critical abnormalities flagged in this upload. Values appear broadly within reference range — please confirm interpretation with your physician.",
    "Prescriptions": "Prescription details recorded and cross-checked against your current medication list for potential duplicates.",
    "Imaging": "Imaging document stored. No automated interpretation performed — a radiologist's original report should be treated as authoritative.",
    "Discharge Summaries": "Discharge summary recorded. Key follow-up instructions should be reviewed with your care team.",
    "Vaccination": "Vaccination record added. No missed doses identified for the standard schedule reviewed.",
    "Diagnosis": "Diagnosis document stored and linked to your medical history timeline.",
    "Other": "Document stored in your Medical Vault. No structured summary could be generated automatically for this category."
  };

  function wireUploadModal() {
    const openBtn = $("#openUploadModal");
    const overlay = $("#uploadModalOverlay");
    const closeBtn = $("#closeUploadModal");
    const form = $("#uploadForm");
    if (!openBtn) return;

    openBtn.addEventListener("click", () => {
      $("#uploadDate").value = todayStr();
      overlay.classList.add("open");
    });
    closeBtn.addEventListener("click", () => overlay.classList.remove("open"));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const type = $("#uploadType").value;
      nextDocSeq++;
      const doc = {
        id: "DOC-" + nextDocSeq,
        type,
        date: $("#uploadDate").value || todayStr(),
        doctor: $("#uploadDoctor").value.trim(),
        fileName: $("#uploadFileName").value.trim() || `document_${nextDocSeq}.pdf`,
        notes: $("#uploadNotes").value.trim(),
        aiSummary: AI_SUMMARY_TEMPLATES[type] || AI_SUMMARY_TEMPLATES.Other
      };
      db.documents.unshift(doc);
      logAudit("Medical document uploaded", "Aarav Rao", "Aarav Rao", "upload");
      toast("Document uploaded — AI summary generated");
      overlay.classList.remove("open");
      form.reset();
      renderVaultGrid();
      renderReportsGrid();
    });
  }

  /* ========================================================================
     12. EMERGENCY CONTACTS — patient assistance alert
     ======================================================================== */

  function wireAlertContacts() {
    const btn = $("#alertContactsBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      btn.disabled = true;
      btn.textContent = "Notifying…";
      $("#alertContactsStatus").textContent = "";
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "Notify my emergency contacts";
        $("#alertContactsStatus").innerHTML = `✅ Meera Rao and Vikram Rao notified via SMS + Call at ${nowClock()}.`;
        logAudit("Emergency contact notified", "Aarav Rao", "Meera Rao, Vikram Rao", "contact");
        pushNotification("Emergency contacts notified", "Meera Rao (Primary), Vikram Rao (Secondary) · SMS + Call");
        toast("Emergency contacts notified");
      }, 1100);
    });
  }

  /* ========================================================================
     13. AMBULANCE PORTAL
     ======================================================================== */

  function wireAmbulance() {
    const form = $("#prearrivalForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputs = $all("input", form).map(i => i.value.trim());
        pushNotification("🚑 Pre-arrival information sent", inputs.filter(Boolean).join(" · ") || "Details sent to hospital");
        $("#prearrivalStatus").innerHTML = "✅ Sent to hospital — emergency team will prepare before arrival.";
        toast("Pre-arrival information sent to hospital");
        logAudit("Ambulance pre-arrival info sent", "R. Sen", inputs[0] || "Unknown patient", "ambulance");
        form.reset();
      });
    }
    const handoverBtn = $("#confirmHandoverBtn");
    if (handoverBtn) {
      handoverBtn.addEventListener("click", () => {
        $("#handoverStatus").innerHTML = `✅ Handover confirmed at ${nowClock()}. Patient is now under hospital care.`;
        logAudit("Hospital handover confirmed", "R. Sen", "Incoming patient", "ambulance");
        toast("Handover confirmed");
      });
    }
  }

  /* ========================================================================
     14. RESOURCE PORTAL — blood availability
     ======================================================================== */

  function renderBloodGrid() {
    const el = $("#bloodGrid");
    if (!el) return;
    el.innerHTML = db.blood.map(b => {
      const pct = Math.round((b.units / b.max) * 100);
      const low = b.units / b.max < 0.25;
      return `
        <div class="blood-card ${low ? "blood-low" : ""}">
          <h4>${esc(b.group)}</h4>
          <div class="blood-bar"><div style="width:${pct}%;"></div></div>
          <div class="units">${b.units} of ${b.max} units${low ? " — low stock" : ""}</div>
        </div>`;
    }).join("");
  }

  function medicineBadgeClass(status) {
    return { Available: "badge-mint", "Low Stock": "badge-yellow", Unavailable: "badge-muted" }[status] || "badge-muted";
  }

  let medicineFilter = "all";

  function renderMedicineTable() {
    const tbody = $("#medicineTable tbody");
    if (!tbody) return;
    const list = medicineFilter === "all" ? db.medicines : db.medicines.filter(m => m.status === medicineFilter);
    tbody.innerHTML = list.length ? list.map(m => `
      <tr>
        <td><strong>${esc(m.name)}</strong></td>
        <td>${esc(m.category)}</td>
        <td>${esc(m.facility)}</td>
        <td><span class="badge ${medicineBadgeClass(m.status)}">${esc(m.status)}</span></td>
      </tr>`).join("") : `<tr class="empty-row"><td colspan="4">No medicines match this filter.</td></tr>`;
  }

  function wireMedicineFilters() {
    $all("#medicineFilters .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        $all("#medicineFilters .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        medicineFilter = chip.dataset.status;
        renderMedicineTable();
      });
    });
  }

  /* ========================================================================
     15. NOTIFICATIONS
     ======================================================================== */

  function renderNotifList() {
    const el = $("#notifList");
    if (!el) return;
    el.innerHTML = db.notifications.slice(0, 25).map(n => `
      <li class="notif-item">
        <span class="n-dot"></span>
        <div>
          <div>${esc(n.title)}</div>
          <div class="section-note">${esc(n.meta)}</div>
          <time>${timeAgo(n.time)}</time>
        </div>
      </li>`).join("") || `<li class="notif-item">No notifications yet.</li>`;
  }

  /* ========================================================================
     16. AUDIT LOGS (patient access history + admin audit trail)
     ======================================================================== */

  function renderPatientAccessTable() {
    const tbody = $("#patientAccessTable tbody");
    if (!tbody) return;
    const list = db.auditLog.filter(a => ["access", "qr", "upload"].includes(a.type)).slice(0, 20);
    tbody.innerHTML = list.length ? list.map(a => {
      const d = new Date(a.time);
      return `<tr><td>${esc(a.user)}</td><td>${esc(a.action)}</td><td>${d.toLocaleDateString()}</td><td>${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td></tr>`;
    }).join("") : `<tr class="empty-row"><td colspan="4">No access recorded yet.</td></tr>`;
  }

  function renderAdminAuditTable() {
    const tbody = $("#adminAuditTable tbody");
    if (!tbody) return;
    const list = db.auditLog.slice(0, 30);
    tbody.innerHTML = list.length ? list.map(a => {
      const d = new Date(a.time);
      return `<tr><td>${esc(a.action)}</td><td>${esc(a.user)}</td><td>${esc(a.patient)}</td><td>${d.toLocaleDateString()}</td><td>${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td></tr>`;
    }).join("") : `<tr class="empty-row"><td colspan="5">No audit entries yet.</td></tr>`;
  }

  /* ========================================================================
     17. ADMIN ANALYTICS — bar charts + donut, built with plain SVG/DOM
     ======================================================================== */

  function buildBarChart(container, data, colorVar) {
    const max = Math.max(...data.map(d => d.v), 1);
    container.innerHTML = data.map(d => `
      <div class="bar-col">
        <span class="bar-value">${d.v}</span>
        <div class="bar" style="height:${Math.max((d.v / max) * 100, 3)}%;${colorVar ? `background:${colorVar};` : ""}"></div>
        <span class="bar-label">${esc(d.n)}</span>
      </div>`).join("");
  }

  function buildDonut(svgEl, legendEl, data) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const R = 15.915;
    let offset = 0;
    const circles = data.map(d => {
      const pct = (d.value / total) * 100;
      const circle = `<circle cx="21" cy="21" r="${R}" fill="transparent" stroke="${d.color}" stroke-width="6" stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="${-offset}"></circle>`;
      offset += pct;
      return circle;
    }).join("");
    svgEl.innerHTML = `<circle cx="21" cy="21" r="${R}" fill="transparent" stroke="var(--bg-soft)" stroke-width="6"></circle>${circles}`;
    legendEl.innerHTML = data.map(d => `<li><span class="sw" style="background:${d.color};"></span>${esc(d.label)} — ${d.value}%</li>`).join("");
  }

  function renderAnalytics() {
    const workloadEl = $("#workloadChart");
    if (workloadEl) {
      buildBarChart(workloadEl, [
        { n: "Emergency", v: 48 }, { n: "Trauma", v: 22 }, { n: "Cardiology", v: 15 },
        { n: "Gen. Med", v: 34 }, { n: "Pediatrics", v: 19 }
      ]);
    }
    const peakEl = $("#peakChart");
    if (peakEl) {
      buildBarChart(peakEl, [
        { n: "6am", v: 12 }, { n: "9am", v: 28 }, { n: "12pm", v: 35 }, { n: "3pm", v: 31 },
        { n: "6pm", v: 42 }, { n: "9pm", v: 38 }, { n: "12am", v: 19 }
      ], "var(--mint)");
    }
    const donutEl = $("#outcomeDonut");
    const legendEl = $("#outcomeLegend");
    if (donutEl && legendEl) {
      buildDonut(donutEl, legendEl, [
        { label: "Discharged", value: 58, color: "var(--green)" },
        { label: "Admitted", value: 24, color: "var(--blue)" },
        { label: "Transferred", value: 9, color: "var(--yellow)" },
        { label: "LAMA/DAMA", value: 6, color: "var(--orange)" },
        { label: "Deceased", value: 3, color: "var(--red)" }
      ]);
    }
  }

  /* ========================================================================
     18. EMERGENCY MODE + SIDEBAR
     ======================================================================== */

  function wireEmergencyMode() {
    const btn = $("#emergencyModeBtn");
    const overlay = $("#emergencyOverlay");
    const closeBtn = $("#closeEmergencyMode");
    if (!btn) return;
    btn.addEventListener("click", () => {
      overlay.classList.add("open");
      btn.classList.add("is-live");
    });
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("open");
      btn.classList.remove("is-live");
    });
  }

  /* ========================================================================
     19. LIVE SIMULATION — waiting times tick upward like a real ED board
     ======================================================================== */

  function tickLiveQueue() {
    let escalationFired = false;
    activePatients().forEach(p => {
      p.waitingMin += 1;
      const threshold = ESCALATION_THRESHOLD[p.priority];
      if (threshold && p.waitingMin === threshold) {
        pushNotification("⚠️ Triage escalation required", `${p.name} · ${p.priority} · waiting ${p.waitingMin} min`);
        logAudit("Escalation alert raised", "System", p.name, "escalation");
        escalationFired = true;
      }
    });

    if (viewIsActive("h-dashboard")) renderHospitalDashboard();
    if (viewIsActive("h-queue")) renderFullQueueTable();
    if (escalationFired) toast("⚠️ A patient has crossed the escalation threshold");
    saveDB(); // keeps waiting-time ticks in sync across open tabs too
  }

  /* ========================================================================
     ASHA / COMMUNITY HEALTH WORKER + REFERRAL PIPELINE
     ------------------------------------------------------------------------
     This reuses the exact same triage engine (computeTriageSuggestion) that
     Hospital's AI Triage uses — just relabeled to the LOW/MODERATE/HIGH/
     CRITICAL scale, so "one engine, two front doors" is literally true in
     the code, not just in the pitch. Accepting a referral on the Hospital
     side creates a REAL entry in the same Live Patient Queue used
     elsewhere — referrals aren't a disconnected list.
     ======================================================================== */

  let nextAshaPatientSeq = 1004; // seed data used AP-1001..1003
  let nextReferralSeq = 100;     // seed data used LFR-00100
  let nextFollowUpSeq = 9001;    // seed data used FU-9001

  function nextAshaPatientId() { nextAshaPatientSeq++; return "AP-" + nextAshaPatientSeq; }
  function nextReferralId() { nextReferralSeq++; return "LFR-" + String(nextReferralSeq).padStart(5, "0"); }
  function nextFollowUpId() { nextFollowUpSeq++; return "FU-" + nextFollowUpSeq; }

  const URGENCY_LABEL = { RED: "CRITICAL", ORANGE: "HIGH", YELLOW: "MODERATE", GREEN: "LOW" };

  const FACILITIES = [
    { name: "Rampura PHC", type: "PHC", distanceKm: 3, emergency: false, specialists: false, diagnostics: false },
    { name: "Sundarpur PHC", type: "PHC", distanceKm: 6, emergency: false, specialists: false, diagnostics: true },
    { name: "City General Hospital", type: "Hospital", distanceKm: 14, emergency: true, specialists: true, diagnostics: true },
    { name: "District Hospital", type: "Hospital", distanceKm: 18, emergency: true, specialists: true, diagnostics: true }
  ];

  // Not just "nearest" — for HIGH/CRITICAL cases this narrows to facilities
  // that can actually handle an emergency before picking the closest one.
  function recommendFacility(urgencyPriority) {
    let candidates = FACILITIES.slice();
    if (urgencyPriority === "RED" || urgencyPriority === "ORANGE") {
      const emergencyCapable = candidates.filter(f => f.emergency);
      if (emergencyCapable.length) candidates = emergencyCapable;
    }
    candidates.sort((a, b) => a.distanceKm - b.distanceKm);
    return candidates[0];
  }

  function referralBadgeClass(status) {
    return {
      SENT: "badge-blue", ACCEPTED: "badge-mint", "EN ROUTE": "badge-yellow",
      RECEIVED: "badge-orange", TREATMENT: "badge-orange", COMPLETED: "badge-muted",
      SCHEDULED: "badge-yellow", OUTCOME_RECORDED: "badge-mint", CLOSED: "badge-muted",
      CANCELLED: "badge-muted", OVERDUE: "badge-red"
    }[status] || "badge-muted";
  }

  // A referral is overdue if it isn't finished/cancelled and its follow-up
  // date has already passed.
  function isReferralOverdue(r) {
    if (["COMPLETED", "CLOSED", "CANCELLED", "OUTCOME_RECORDED"].includes(r.status)) return false;
    if (!r.followUpDate) return false;
    return r.followUpDate < todayStr();
  }

  function referralDisplayStatus(r) {
    return isReferralOverdue(r) ? "OVERDUE" : r.status;
  }

  // ASHA-side lifecycle a referral can move through, once it has been sent.
  const ASHA_REFERRAL_NEXT = {
    SENT: ["ACCEPTED", "SCHEDULED", "CANCELLED"],
    ACCEPTED: ["SCHEDULED", "COMPLETED", "CANCELLED"],
    SCHEDULED: ["COMPLETED", "CANCELLED"],
    COMPLETED: ["OUTCOME_RECORDED"],
    OUTCOME_RECORDED: ["CLOSED"]
  };

  function ashaPatientOptionsHtml(selectedId) {
    return db.ashaPatients.map(p => `<option value="${esc(p.id)}" ${p.id === selectedId ? "selected" : ""}>${esc(p.name)} (${esc(p.id)}) — ${esc(p.village)}</option>`).join("");
  }

  function guessRiskCategory(ageStr, gender, symptomsList) {
    const age = parseInt(ageStr, 10) || 0;
    if (symptomsList.some(s => /pregnancy/i.test(s))) return "Maternal";
    if (age > 0 && age <= 12) return "Children";
    if (age >= 60) return "Elderly";
    return "Other";
  }

  function generateAshaPatientSummary(p) {
    let s = `${p.age}-year-old ${(p.gender || "").toLowerCase()} patient from ${p.village}`;
    if (p.conditions && p.conditions !== "None") s += ` with ${p.conditions.toLowerCase()}`;
    if (p.symptoms) s += `, currently presenting with ${p.symptoms.toLowerCase()}`;
    s += `. Latest vitals: BP ${p.vitals.bp}, pulse ${p.vitals.pulse} bpm${p.vitals.sugar ? ", blood glucose " + p.vitals.sugar + " mg/dL" : ""}, SpO₂ ${p.vitals.spo2}%.`;
    if (p.allergies && p.allergies !== "None known") s += ` Known allergy: ${p.allergies}.`;
    if (p.medicines && p.medicines !== "None") s += ` Current medicines: ${p.medicines}.`;
    return s;
  }

  /* ---- Dashboard --------------------------------------------------------- */

  // ---- Today's Priorities (ASHA landing screen) ---------------------------
  // Every count here is computed live from db.ashaPatients / db.referrals /
  // db.followUps — nothing is hard-coded — so the numbers move as the demo
  // data changes (new registration, new referral, sync, etc).
  function ashaHighRiskPatients() {
    return db.ashaPatients.filter(p => ["Maternal", "Children", "Elderly"].includes(p.riskCategory) || (p.conditions && p.conditions !== "None"));
  }
  function ashaOverdueFollowUps() {
    return db.followUps.filter(f => f.status === "Due" && /overdue/i.test(f.dueLabel || ""));
  }
  function ashaUpcomingFollowUps() {
    return db.followUps.filter(f => f.status === "Due" && /upcoming/i.test(f.dueLabel || ""));
  }
  function ashaDueFollowUps() {
    return db.followUps.filter(f => f.status === "Due" && !/overdue/i.test(f.dueLabel || "") && !/upcoming/i.test(f.dueLabel || ""));
  }
  function followUpRiskWhy(f) {
    const p = db.ashaPatients.find(x => x.id === f.patientId);
    if (!p) return "";
    if (p.riskCategory === "Maternal") return "Pregnancy case — routine antenatal monitoring required.";
    if (p.riskCategory === "Children") return "Child under 12 — closer monitoring during illness recovery.";
    if (p.riskCategory === "Elderly") return "Elderly with chronic condition(s) — higher risk of complications.";
    if (p.conditions && p.conditions !== "None") return `Existing condition(s): ${p.conditions}.`;
    return "Flagged for routine community follow-up.";
  }
  function ashaPendingReferrals() {
    return db.referrals.filter(r => r.status !== "COMPLETED");
  }
  function ashaPregnancyFollowUpsDue() {
    return db.followUps.filter(f => f.status === "Due" && /pregnan/i.test(f.reason || ""));
  }
  function ashaNewbornFollowUpsDue() {
    return db.followUps.filter(f => f.status === "Due" && /newborn/i.test(f.reason || ""));
  }

  function jumpAshaHouseholds(filter) {
    ashaHouseholdFilter = filter;
    showView($("#portal-asha"), "asha-households");
    const chips = $all("#ashaHouseholdFilters .chip");
    chips.forEach(c => c.classList.toggle("active", c.dataset.hhFilter === filter));
  }

  function jumpAshaPatients(filter) {
    ashaPatientsFilter = filter;
    showView($("#portal-asha"), "asha-patients");
    const chips = $all("#ashaRiskFilters .chip");
    chips.forEach(c => c.classList.toggle("active", c.dataset.risk === filter));
  }

  function renderAshaPriorityGrid() {
    const grid = $("#ashaPriorityGrid");
    if (!grid) return;
    const today = todayStr();
    const registeredToday = db.ashaPatients.filter(p => p.lastVisit === today).length;
    const highRisk = ashaHighRiskPatients().length;
    const dueToday = ashaDueFollowUps().length;
    const overdue = ashaOverdueFollowUps().length;
    const pendingReferrals = ashaPendingReferrals().length;
    const overdueReferrals = db.referrals.filter(isReferralOverdue).length;
    const pregnancyDue = ashaPregnancyFollowUpsDue().length;
    const newbornDue = ashaNewbornFollowUpsDue().length;
    const openTeleconsults = (db.teleconsults || []).filter(t => t.status !== "Completed").length;
    const emergencyCases = db.referrals.filter(r => r.urgency === "RED" && r.status !== "COMPLETED" && r.status !== "CLOSED").length;

    const cards = [
      { tone: "red", label: "Urgent / High-Risk Cases", count: highRisk, action: () => jumpAshaPatients("High") },
      { tone: "red", label: "Emergency Cases", count: emergencyCases, action: () => showView($("#portal-asha"), "asha-emergency") },
      { tone: "orange", label: "Pregnancy Follow-ups Due", count: pregnancyDue, action: () => jumpAshaHouseholds("pregnant") },
      { tone: "orange", label: "Newborn Follow-ups Due", count: newbornDue, action: () => jumpAshaHouseholds("newborn") },
      { tone: "yellow", label: "Home Visits / Follow-ups Due", count: dueToday, action: () => showView($("#portal-asha"), "asha-followups") },
      { tone: "red", label: "Overdue Follow-ups", count: overdue, action: () => showView($("#portal-asha"), "asha-followups") },
      { tone: "orange", label: "Pending Referrals", count: pendingReferrals, action: () => showView($("#portal-asha"), "asha-referrals") },
      { tone: "red", label: "Overdue Referrals", count: overdueReferrals, action: () => showView($("#portal-asha"), "asha-referrals") },
      { tone: "yellow", label: "Open Teleconsultations", count: openTeleconsults, action: () => showView($("#portal-asha"), "asha-teleconsult") },
      { tone: "teal", label: "Registered Today", count: registeredToday, action: () => jumpAshaPatients("all") },
      { tone: "teal", label: "Total Households", count: db.households.length, action: () => jumpAshaHouseholds("all") }
    ];

    grid.innerHTML = cards.map((c, i) => `
      <button type="button" class="priority-card tone-${c.tone}" data-priority-idx="${i}">
        <strong>${c.count}</strong>
        <span>${esc(c.label)}</span>
      </button>
    `).join("");
    $all("[data-priority-idx]", grid).forEach((btn, i) => btn.addEventListener("click", cards[i].action));
  }

  // Picks the single most important next task from the demo data:
  // 1) an overdue follow-up, 2) a follow-up due today, 3) a high-urgency
  // pending referral, 4) a high-risk patient with no recent visit — else,
  // nothing urgent right now.
  function renderAshaDoNow() {
    const body = $("#ashaDoNowBody");
    if (!body) return;
    const overdue = ashaOverdueFollowUps();
    const dueToday = ashaDueFollowUps();
    const urgentReferral = db.referrals.find(r => r.urgency === "HIGH" && r.status !== "COMPLETED");

    let task = null;
    if (overdue.length) task = { fu: overdue[0], tag: "Overdue follow-up" };
    else if (dueToday.length) task = { fu: dueToday[0], tag: "Follow-up due today" };

    if (task) {
      const patient = db.ashaPatients.find(p => p.id === task.fu.patientId);
      body.innerHTML = `
        <p class="section-note" style="margin:6px 0 12px;font-size:14px;color:var(--ink-1);"><strong>${esc(task.fu.patientName)}</strong> — ${esc(task.fu.reason)} <span class="badge badge-yellow">${esc(task.tag)}</span></p>
        <div class="quick-actions">
          <button class="btn btn-primary btn-sm" id="ashaDoNowOpenPatient">Open Patient</button>
          <button class="btn btn-ghost btn-sm" id="ashaDoNowRecordVisit">Record Findings</button>
        </div>`;
      const openBtn = $("#ashaDoNowOpenPatient");
      if (openBtn) openBtn.addEventListener("click", () => {
        pendingAshaProfilePatientId = patient ? patient.id : task.fu.patientId;
        showView($("#portal-asha"), "asha-patient-profile");
      });
      const visitBtn = $("#ashaDoNowRecordVisit");
      if (visitBtn) visitBtn.addEventListener("click", () => {
        pendingAshaProfilePatientId = patient ? patient.id : task.fu.patientId;
        showView($("#portal-asha"), "asha-patient-profile");
        setTimeout(() => { const b = $("#ashaProfileRecordVisit"); if (b) b.click(); }, 0);
      });
      return;
    }

    if (urgentReferral) {
      body.innerHTML = `
        <p class="section-note" style="margin:6px 0 12px;font-size:14px;color:var(--ink-1);"><strong>${esc(urgentReferral.patientName)}</strong> — referral to ${esc(urgentReferral.facility)} is still <span class="badge badge-orange">${esc(urgentReferral.status)}</span></p>
        <div class="quick-actions">
          <button class="btn btn-primary btn-sm" id="ashaDoNowOpenReferral">Check Referral Status</button>
        </div>`;
      const btn = $("#ashaDoNowOpenReferral");
      if (btn) btn.addEventListener("click", () => showView($("#portal-asha"), "asha-referrals"));
      return;
    }

    body.innerHTML = `<p class="section-note" style="margin:6px 0 0;">No urgent follow-ups or referrals right now — a good time to update household records or plan the next home visit.</p>`;
  }

  function renderAshaDashboard() {
    if (!$("#ashaPriorityGrid")) return;
    renderAshaPriorityGrid();
    renderAshaDoNow();
    const previewEl = $("#ashaFollowupsPreview");
    if (previewEl) {
      const due = db.followUps.filter(f => f.status === "Due");
      previewEl.innerHTML = due.length
        ? due.map(f => `<div class="escalation-item" style="background:var(--teal-100);color:var(--teal-800);"><span>${esc(f.patientName)} — ${esc(f.reason)}</span><span>${esc(f.dueLabel)}</span></div>`).join("")
        : `<p class="escalation-empty">No follow-ups due right now.</p>`;
    }
    updateAshaOfflineStatus();
  }

  // ---- My Families — Digital Household Register --------------------------
  // Households only ever reference existing db.ashaPatients records via
  // memberIds, so nothing about a person is duplicated between the two.
  function ashaHouseholdMembers(hh) {
    return hh.memberIds.map(id => db.ashaPatients.find(p => p.id === id)).filter(Boolean);
  }
  function ashaHouseholdTags(hh) {
    const members = ashaHouseholdMembers(hh);
    return {
      pregnant: members.some(m => m.pregnant),
      newborn: members.some(m => m.newborn),
      highRisk: members.some(m => ["Maternal", "Children", "Elderly"].includes(m.riskCategory) || (m.conditions && m.conditions !== "None")),
      referral: members.some(m => db.referrals.some(r => r.patientId === m.id && r.status !== "COMPLETED"))
    };
  }

  let ashaHouseholdFilter = "all";
  let ashaHouseholdSearchTerm = "";
  let currentAshaHouseholdId = null;
  let pendingAshaHouseholdId = null;

  function renderAshaHouseholdList() {
    const el = $("#ashaHouseholdList");
    if (!el) return;
    let list = db.households.slice();
    const term = ashaHouseholdSearchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(hh => {
        const members = ashaHouseholdMembers(hh);
        return hh.headName.toLowerCase().includes(term) || hh.id.toLowerCase().includes(term) ||
          hh.phone.includes(term) || hh.village.toLowerCase().includes(term) ||
          members.some(m => m.name.toLowerCase().includes(term));
      });
    }
    if (ashaHouseholdFilter !== "all") {
      list = list.filter(hh => {
        const tags = ashaHouseholdTags(hh);
        if (ashaHouseholdFilter === "pregnant") return tags.pregnant;
        if (ashaHouseholdFilter === "newborn") return tags.newborn;
        if (ashaHouseholdFilter === "high-risk") return tags.highRisk;
        if (ashaHouseholdFilter === "referral") return tags.referral;
        return true;
      });
    }
    el.innerHTML = list.length ? list.map(hh => {
      const tags = ashaHouseholdTags(hh);
      const members = ashaHouseholdMembers(hh);
      const badges = [];
      if (tags.pregnant) badges.push('<span class="badge badge-orange">Pregnant</span>');
      if (tags.newborn) badges.push('<span class="badge badge-orange">Newborn</span>');
      if (tags.highRisk) badges.push('<span class="badge badge-red">High risk</span>');
      if (tags.referral) badges.push('<span class="badge badge-yellow">Referral pending</span>');
      return `
      <button type="button" class="household-card" data-hh-id="${esc(hh.id)}">
        <div class="hh-card-top"><strong>${esc(hh.headName)}'s Household</strong><span class="mono">${esc(hh.id)}</span></div>
        <p class="section-note" style="margin:4px 0 8px;">${esc(hh.village)} · ${members.length} member${members.length === 1 ? "" : "s"}</p>
        <div class="hh-card-badges">${badges.join("") || '<span class="badge badge-muted">No alerts</span>'}</div>
      </button>`;
    }).join("") : `<p class="escalation-empty">No households match this search/filter.</p>`;

    $all("[data-hh-id]", el).forEach(btn => btn.addEventListener("click", () => {
      pendingAshaHouseholdId = btn.dataset.hhId;
      showView($("#portal-asha"), "asha-household-profile");
    }));
  }

  function wireAshaHouseholdFilters() {
    const searchEl = $("#ashaHouseholdSearch");
    if (searchEl) searchEl.addEventListener("input", () => { ashaHouseholdSearchTerm = searchEl.value; renderAshaHouseholdList(); });
    $all("#ashaHouseholdFilters .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        $all("#ashaHouseholdFilters .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        ashaHouseholdFilter = chip.dataset.hhFilter;
        renderAshaHouseholdList();
      });
    });
  }

  function renderAshaHouseholdProfile() {
    const targetId = pendingAshaHouseholdId || currentAshaHouseholdId || (db.households[0] && db.households[0].id);
    const hh = db.households.find(h => h.id === targetId) || db.households[0];
    pendingAshaHouseholdId = null;
    if (!hh) return;
    currentAshaHouseholdId = hh.id;
    const members = ashaHouseholdMembers(hh);
    const tags = ashaHouseholdTags(hh);

    $("#ashaHHEyebrow").textContent = hh.id + " · Household";
    $("#ashaHHName").textContent = hh.headName + "'s Household";

    $("#ashaHHInfo").innerHTML = `
      <h3>Household Information</h3>
      <div class="id-card-row"><span>Village</span><strong>${esc(hh.village)}</strong></div>
      <div class="id-card-row"><span>Address</span><strong>${esc(hh.address)}</strong></div>
      <div class="id-card-row"><span>Phone</span><strong>${esc(hh.phone)}</strong></div>
      <div class="id-card-row"><span>Members</span><strong>${members.length}</strong></div>`;

    const alertBadges = [];
    if (tags.pregnant) alertBadges.push('<span class="badge badge-orange">Pregnant member — ANC follow-up</span>');
    if (tags.newborn) alertBadges.push('<span class="badge badge-orange">Newborn — HBNC schedule due</span>');
    if (tags.highRisk) alertBadges.push('<span class="badge badge-red">High-risk member</span>');
    if (tags.referral) alertBadges.push('<span class="badge badge-yellow">Referral pending</span>');
    $("#ashaHHAlerts").innerHTML = `<h3>Priority Alerts</h3>${alertBadges.length ? `<div class="quick-actions">${alertBadges.join("")}</div>` : '<p class="section-note">No active alerts for this household.</p>'}`;

    $("#ashaHHMembers").innerHTML = members.map(m => `
      <button type="button" class="asha-hh-member-link hh-member-row" data-pid="${esc(m.id)}">
        <span><strong>${esc(m.name)}</strong> · ${m.age} / ${esc(m.gender)}${m.pregnant ? " · Pregnant (" + (m.gestationWeeks || "—") + " wks)" : ""}${m.newborn ? " · Newborn" : ""}</span>
        <span class="badge ${(!m.riskCategory || m.riskCategory === "Other") ? "badge-muted" : "badge-orange"}">${esc(m.riskCategory || "Other")}</span>
      </button>`).join("");
    $all(".asha-hh-member-link", $("#ashaHHMembers")).forEach(btn => btn.addEventListener("click", () => {
      pendingAshaProfilePatientId = btn.dataset.pid;
      showView($("#portal-asha"), "asha-patient-profile");
    }));

    // Combined visit history across every member of this household — one
    // shared household timeline instead of hunting through each person.
    let allVisits = [];
    members.forEach(m => (m.visits || []).forEach(v => allVisits.push({ ...v, memberName: m.name })));
    allVisits.sort((a, b) => (a.date < b.date ? 1 : -1));
    $("#ashaHHVisitHistory").innerHTML = allVisits.length ? allVisits.map(v => `
      <li>
        <span class="mono">${esc(v.date)}</span>
        <div>
          <h4>${esc(v.memberName)}${v.reason ? " — " + esc(v.reason) : ""}</h4>
          <p>${esc(v.notes) || "No notes recorded"} — ${esc(v.recordedBy)}</p>
        </div>
      </li>`).join("") : `<li><span class="mono">—</span><div><p>No visits recorded yet.</p></div></li>`;

    const referrals = db.referrals.filter(r => members.some(m => m.id === r.patientId));
    $("#ashaHHReferralsTable tbody").innerHTML = referrals.length ? referrals.map(r => `
      <tr>
        <td>${esc(r.patientName)}</td>
        <td>${esc(r.facility)}</td>
        <td><span class="badge ${badgeClassForPriority(r.urgency)}">${esc(URGENCY_LABEL[r.urgency] || r.urgency)}</span></td>
        <td><span class="badge ${referralBadgeClass(r.status)}">${esc(r.status)}</span></td>
      </tr>`).join("") : `<tr class="empty-row"><td colspan="4">No referrals for this household yet.</td></tr>`;

    $("#ashaHHMemberChooser").style.display = "none";
  }

  // "Smart" home visit entry point — one member: open the visit modal
  // straight away with a reason inferred from that person's record
  // (pregnant → Pregnancy, newborn → Newborn, else routine). More than one
  // member: ask who the visit is for first.
  function wireAshaHouseholdProfile() {
    $("#ashaHHStartVisit").addEventListener("click", () => {
      const hh = db.households.find(h => h.id === currentAshaHouseholdId);
      if (!hh) return;
      const members = ashaHouseholdMembers(hh);
      if (members.length === 1) {
        const m = members[0];
        const reason = m.pregnant ? "Pregnancy" : m.newborn ? "Newborn" : "Routine follow-up";
        openVisitModal(m.id, `Home Visit — ${m.name}`, reason);
        return;
      }
      const chooser = $("#ashaHHMemberChooser");
      const list = $("#ashaHHMemberChooserList");
      list.innerHTML = members.map(m => `<button type="button" class="btn btn-secondary btn-sm" data-pid="${esc(m.id)}">${esc(m.name)}</button>`).join("");
      $all("[data-pid]", list).forEach(btn => btn.addEventListener("click", () => {
        const m = members.find(x => x.id === btn.dataset.pid);
        const reason = m.pregnant ? "Pregnancy" : m.newborn ? "Newborn" : "Routine follow-up";
        openVisitModal(m.id, `Home Visit — ${m.name}`, reason);
      }));
      chooser.style.display = chooser.style.display === "none" ? "block" : "none";
    });
  }

  /* ---- Register Patient — 4-step wizard ---------------------------------- */

  let ashaSelectedSymptoms = new Set();

  function showAshaStep(n) {
    [1, 2, 3, 4].forEach(i => $(`#ashaStep${i}`).classList.toggle("active", i === n));
    $("#ashaRegTitle").textContent = `Step ${n} of 4 — ${["", "Patient Details", "Health Details", "Record Vitals", "Patient Symptoms"][n]}`;
  }

  function resetAshaWizard() {
    ashaSelectedSymptoms = new Set();
    $all("#ashaSymptomChips .chip").forEach(c => c.classList.remove("active"));
    const regView = $("#view-asha-register");
    if (regView) {
      $all("input, select, textarea", regView).forEach(el => {
        if (el.tagName === "SELECT") el.selectedIndex = 0; else el.value = "";
      });
    }
    const errEl = $("#ashaStep1Error");
    if (errEl) errEl.textContent = "";
    showAshaStep(1);
  }

  function wireAshaRegister() {
    $("#ashaStep1Next").addEventListener("click", () => {
      const name = $("#ashaName").value.trim();
      const age = $("#ashaAge").value.trim();
      if (!name || !age) { $("#ashaStep1Error").textContent = "Please enter at least the patient's name and age."; return; }
      $("#ashaStep1Error").textContent = "";
      showAshaStep(2);
    });
    $("#ashaStep2Back").addEventListener("click", () => showAshaStep(1));
    $("#ashaStep2Next").addEventListener("click", () => showAshaStep(3));
    $("#ashaStep3Back").addEventListener("click", () => showAshaStep(2));
    $("#ashaStep3Next").addEventListener("click", () => showAshaStep(4));
    $("#ashaStep4Back").addEventListener("click", () => showAshaStep(3));

    $all("#ashaSymptomChips .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        chip.classList.toggle("active");
        const s = chip.dataset.symptom;
        if (chip.classList.contains("active")) ashaSelectedSymptoms.add(s);
        else ashaSelectedSymptoms.delete(s);
      });
    });

    $("#ashaFinishRegister").addEventListener("click", () => {
      const symptomsList = [...ashaSelectedSymptoms];
      const other = $("#ashaSymptomOther").value.trim();
      if (other) symptomsList.push(other);

      const sugarInput = $("#ashaSugar");
      const sugarVal = sugarInput ? parseInt(sugarInput.value, 10) : 0;
      const vitals = {
        bp: $("#ashaBP").value.trim() || "—",
        pulse: parseInt($("#ashaPulse").value, 10) || 0,
        temp: parseFloat($("#ashaTemp").value) || 0,
        sugar: (!isNaN(sugarVal) && sugarVal > 0) ? sugarVal : 0,
        spo2: parseInt($("#ashaSpo2").value, 10) || 0,
        resp: parseInt($("#ashaResp").value, 10) || 0,
        weight: parseFloat($("#ashaWeight").value) || 0
      };
      const symptomsText = symptomsList.join(", ");

      const patient = {
        id: nextAshaPatientId(),
        name: $("#ashaName").value.trim() || "Unnamed patient",
        age: parseInt($("#ashaAge").value, 10) || 0,
        gender: $("#ashaGender").value,
        phone: $("#ashaPhone").value.trim(),
        village: $("#ashaVillage").value.trim(),
        emergencyContact: $("#ashaEmergencyContact").value.trim(),
        bloodGroup: $("#ashaBloodGroup").value,
        allergies: $("#ashaAllergies").value.trim() || "None known",
        conditions: $("#ashaConditions").value.trim() || "None",
        medicines: $("#ashaMedicines").value.trim() || "None",
        vitals: vitals,
        symptoms: symptomsText,
        riskCategory: guessRiskCategory($("#ashaAge").value, $("#ashaGender").value, symptomsList),
        lastVisit: todayStr(),
        registeredBy: "Nurse Kulkarni",
        visits: [{ date: todayStr(), vitals: vitals, notes: symptomsText || "Initial registration visit", recordedBy: "Nurse Kulkarni" }]
      };

      if (ashaOfflineMode) {
        // No connection right now (simulated) — save on-device and queue
        // instead of registering immediately. Nothing is lost; it commits
        // for real once "Sync Saved Records" runs.
        db.pendingSyncQueue.push(patient);
        saveDB();
        toast(`Offline — ${patient.name} saved locally`);
        logAudit("Patient saved offline (pending sync)", "Nurse Kulkarni", patient.name, "offline");
        resetAshaWizard();
        showView($("#portal-asha"), "asha-dashboard");
      } else {
        commitAshaPatientRegistration(patient);
        pendingAshaSelectedPatientId = patient.id;
        resetAshaWizard();
        showView($("#portal-asha"), "asha-urgency");
      }
    });
  }

  function commitAshaPatientRegistration(patient) {
    db.ashaPatients.unshift(patient);
    saveDB();
    logAudit("Patient registered", "Nurse Kulkarni", patient.name, "registration");
    pushNotification("New patient registered", `${patient.name} · ${patient.village}`);
    toast(`${patient.name} registered`);
  }

  /* ---- Low-connectivity / offline demo ------------------------------------
     Honest scope: this simulates the workflow (queue locally, sync later)
     using the same localStorage the rest of the app already relies on.
     It is NOT a real offline-first implementation — that needs IndexedDB,
     a service worker and background sync, which the homepage's roadmap
     section is explicit about not claiming to have built yet. */

  let ashaOfflineMode = false;

  function wireAshaOffline() {
    const toggleBtn = $("#ashaOfflineToggle");
    const syncBtn = $("#ashaSyncNowBtn");
    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
      ashaOfflineMode = !ashaOfflineMode;
      toggleBtn.textContent = ashaOfflineMode ? "🔌 Simulate Online Mode" : "📡 Simulate Offline Mode";
      $(".offline-demo-card").classList.toggle("is-offline", ashaOfflineMode);
      if (ashaOfflineMode) {
        toast("Offline mode — new registrations will be saved locally");
      } else if (db.pendingSyncQueue.length) {
        toast("Connection restored");
        syncAshaPendingRecords();
      }
      updateAshaOfflineStatus();
    });

    if (syncBtn) syncBtn.addEventListener("click", syncAshaPendingRecords);
  }

  function updateAshaOfflineStatus() {
    const statusEl = $("#ashaOfflineStatus");
    const panel = $("#ashaSyncPanel");
    if (!statusEl) return;
    const count = db.pendingSyncQueue.length;
    if (ashaOfflineMode) {
      statusEl.innerHTML = count
        ? `📴 Offline — ${count} record${count === 1 ? "" : "s"} pending synchronization.`
        : `📴 Offline mode is on. Records registered now will be saved on this device.`;
    } else {
      statusEl.innerHTML = count
        ? `${count} record${count === 1 ? "" : "s"} saved while offline, not yet synchronized.`
        : `✓ Connected — all records are synchronized.`;
    }
    if (panel) panel.style.display = count ? "block" : "none";
  }

  function syncAshaPendingRecords() {
    const queue = db.pendingSyncQueue.slice();
    if (!queue.length) { toast("Nothing to sync"); return; }
    toast(`Syncing ${queue.length} record${queue.length === 1 ? "" : "s"}…`);
    queue.forEach(p => commitAshaPatientRegistration(p));
    db.pendingSyncQueue = [];
    saveDB();
    toast("✓ All records synchronized successfully");
    updateAshaOfflineStatus();
    if (viewIsActive("asha-patients")) renderAshaPatientsTable();
    if (viewIsActive("asha-dashboard")) renderAshaDashboard();
  }

  /* ---- Patients list + risk filter --------------------------------------- */

  let ashaPatientsFilter = "all";
  let pendingAshaSelectedPatientId = null;
  let pendingAshaReferralPatientId = null;
  let pendingAshaProfilePatientId = null;

  function nextFollowUpForPatient(patientId) {
    return db.followUps.find(f => f.patientId === patientId && f.status === "Due") || null;
  }

  function renderAshaPatientsTable() {
    const tbody = $("#ashaPatientsTable tbody");
    if (!tbody) return;
    let list = db.ashaPatients.slice();
    if (ashaPatientsFilter === "High") {
      list = list.filter(p => ["Maternal", "Children", "Elderly"].includes(p.riskCategory) || (p.conditions && p.conditions !== "None"));
    } else if (ashaPatientsFilter !== "all") {
      list = list.filter(p => p.riskCategory === ashaPatientsFilter);
    }
    tbody.innerHTML = list.length ? list.map(p => {
      const dueFollowUp = nextFollowUpForPatient(p.id);
      return `
      <tr>
        <td><button type="button" class="btn-link-cell asha-patient-profile-link" data-pid="${esc(p.id)}"><strong>${esc(p.name)}</strong></button></td>
        <td>${p.age} / ${esc(p.gender)}</td>
        <td>${esc(p.village)}</td>
        <td><span class="badge ${(!p.riskCategory || p.riskCategory === "Other") ? "badge-muted" : "badge-orange"}">${esc(p.riskCategory || "Other")}</span></td>
        <td>${esc(p.lastVisit)}</td>
        <td>${dueFollowUp ? `<span class="badge badge-yellow">${esc(dueFollowUp.dueLabel)}</span>` : "—"}</td>
        <td>${esc(p.registeredBy || "Nurse Kulkarni")}</td>
        <td><button class="btn btn-ghost btn-sm asha-patient-select-btn" data-pid="${esc(p.id)}">Check Urgency</button></td>
      </tr>`;
    }).join("") : `<tr class="empty-row"><td colspan="8">No patients match this filter.</td></tr>`;

    $all(".asha-patient-select-btn", tbody).forEach(btn => {
      btn.addEventListener("click", () => {
        pendingAshaSelectedPatientId = btn.dataset.pid;
        showView($("#portal-asha"), "asha-urgency");
      });
    });
    $all(".asha-patient-profile-link", tbody).forEach(btn => {
      btn.addEventListener("click", () => {
        pendingAshaProfilePatientId = btn.dataset.pid;
        showView($("#portal-asha"), "asha-patient-profile");
      });
    });
  }

  function wireAshaPatientFilters() {
    $all("#ashaRiskFilters .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        $all("#ashaRiskFilters .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        ashaPatientsFilter = chip.dataset.risk;
        renderAshaPatientsTable();
      });
    });
  }

  /* ---- Patient Profile (detail drill-down) -------------------------------- */

  let currentAshaProfilePatientId = null;

  function renderAshaPatientProfile() {
    const targetId = pendingAshaProfilePatientId || currentAshaProfilePatientId || (db.ashaPatients[0] && db.ashaPatients[0].id);
    const patient = db.ashaPatients.find(p => p.id === targetId) || db.ashaPatients[0];
    pendingAshaProfilePatientId = null;
    if (!patient) return;
    currentAshaProfilePatientId = patient.id;

    $("#ashaProfileEyebrow").textContent = patient.riskCategory && patient.riskCategory !== "Other" ? patient.riskCategory + " · Patient Profile" : "Patient Profile";
    $("#ashaProfileName").textContent = patient.name;

    $("#ashaProfileOverview").innerHTML = `
      <h3>Overview</h3>
      <div class="snapshot-mini-grid">
        <div><span>Age / Gender</span><strong>${patient.age} / ${esc(patient.gender)}</strong></div>
        <div><span>Village</span><strong>${esc(patient.village) || "—"}</strong></div>
        <div><span>Phone</span><strong>${esc(patient.phone) || "—"}</strong></div>
        <div><span>Emergency contact</span><strong>${esc(patient.emergencyContact) || "—"}</strong></div>
        <div><span>Blood group</span><strong>${esc(patient.bloodGroup)}</strong></div>
        <div><span>Risk level</span><strong><span class="badge ${(!patient.riskCategory || patient.riskCategory === "Other") ? "badge-muted" : "badge-orange"}">${esc(patient.riskCategory || "Other")}</span></strong></div>
      </div>`;

    $("#ashaProfileVitals").innerHTML = `
      <div><span>Blood pressure</span><strong>${esc(patient.vitals.bp)}</strong></div>
      <div><span>Pulse</span><strong>${patient.vitals.pulse} bpm</strong></div>
      <div><span>Blood sugar</span><strong>${patient.vitals.sugar ? patient.vitals.sugar + " mg/dL" : "—"}</strong></div>
      <div><span>Temperature</span><strong>${patient.vitals.temp}°F</strong></div>
      <div><span>SpO₂</span><strong>${patient.vitals.spo2}%</strong></div>
      <div><span>Weight</span><strong>${patient.vitals.weight} kg</strong></div>`;

    $("#ashaProfileHealth").innerHTML = `
      <div class="id-card-row"><span>Conditions</span><strong>${esc(patient.conditions)}</strong></div>
      <div class="id-card-row"><span>Allergies</span><strong>${esc(patient.allergies)}</strong></div>
      <div class="id-card-row"><span>Current medicines</span><strong>${esc(patient.medicines)}</strong></div>
      <div class="id-card-row"><span>Latest symptoms</span><strong>${esc(patient.symptoms) || "None recorded"}</strong></div>`;

    const visits = (patient.visits || []).slice().reverse();
    $("#ashaProfileVisitHistory").innerHTML = visits.length ? visits.map(v => `
      <li>
        <span class="mono">${esc(v.date)}</span>
        <div>
          <h4>BP ${esc(v.vitals.bp)} · Pulse ${v.vitals.pulse} bpm${v.vitals.sugar ? " · Sugar " + v.vitals.sugar + " mg/dL" : ""} · SpO₂ ${v.vitals.spo2}%</h4>
          <p>${esc(v.notes) || "No notes recorded"} — ${esc(v.recordedBy)}</p>
        </div>
      </li>`).join("") : `<li><span class="mono">—</span><div><p>No visits recorded yet.</p></div></li>`;

    const referrals = db.referrals.filter(r => r.patientId === patient.id);
    $("#ashaProfileReferralsTable tbody").innerHTML = referrals.length ? referrals.map(r => {
      const status = referralDisplayStatus(r);
      return `
      <tr>
        <td class="mono">${esc(r.id)}</td>
        <td>${esc(r.facility)}</td>
        <td><span class="badge ${badgeClassForPriority(r.urgency)}">${esc(URGENCY_LABEL[r.urgency] || r.urgency)}</span></td>
        <td><span class="badge ${referralBadgeClass(status)}">${esc(status.replace("_", " "))}</span></td>
      </tr>`;
    }).join("") : `<tr class="empty-row"><td colspan="4">No referrals for this patient yet.</td></tr>`;

    const followUps = db.followUps.filter(f => f.patientId === patient.id);
    $("#ashaProfileFollowups").innerHTML = followUps.length ? followUps.map(f => `
      <div class="escalation-item ${f.status === "Due" ? "" : "escalation-item-done"}">
        <span>${esc(f.reason)}</span><span>${f.status === "Due" ? esc(f.dueLabel) : "Completed"}</span>
      </div>`).join("") : `<p class="escalation-empty">No follow-ups scheduled for this patient.</p>`;

    renderAshaProfileCareTimeline(patient);

    $("#ashaScheduleFollowupForm").style.display = "none";
  }

  // Pulls every workflow that touches this patient — triage/registration,
  // referrals, diagnostics, teleconsultation, follow-ups — into one
  // chronological list, so continuity of care is visible in one place.
  function renderAshaProfileCareTimeline(patient) {
    const el = $("#ashaProfileCareTimeline");
    if (!el) return;
    const events = [];

    events.push({ time: new Date(patient.lastVisit || todayStr()).getTime() || 0, label: "Patient Identified / Registered", detail: `Registered by ${patient.registeredBy || "ASHA worker"}` });

    (patient.visits || []).forEach(v => {
      events.push({ time: new Date(v.date).getTime() || 0, label: "Assessment", detail: `BP ${v.vitals.bp} · Pulse ${v.vitals.pulse} bpm — ${v.notes || "Visit recorded"}` });
    });

    db.referrals.filter(r => r.patientId === patient.id).forEach(r => {
      events.push({ time: r.time || 0, label: `Referral — ${referralDisplayStatus(r).replace("_", " ")}`, detail: `${r.facility} · ${r.reason || ""}` });
    });

    (db.diagnosticRequests || []).filter(d => d.patientId === patient.id).forEach(d => {
      events.push({ time: d.requestedAt || 0, label: `Diagnostic Test — ${d.status}`, detail: `${d.test} at ${d.facility}` });
    });

    (db.teleconsults || []).filter(t => t.patientId === patient.id).forEach(t => {
      events.push({ time: t.requestedAt || 0, label: `Teleconsultation — ${t.status}`, detail: `${t.department} · ${t.reason}` });
    });

    db.followUps.filter(f => f.patientId === patient.id).forEach(f => {
      events.push({ time: 0, label: `Follow-up — ${f.status}`, detail: f.reason, sortLast: f.status === "Due" });
    });

    events.sort((a, b) => (a.time || 0) - (b.time || 0));

    el.innerHTML = events.length ? events.map(e => `
      <li>
        <span class="mono">${e.time ? new Date(e.time).toLocaleDateString() : "—"}</span>
        <div><h4>${esc(e.label)}</h4><p>${esc(e.detail || "")}</p></div>
      </li>`).join("") : `<li><span class="mono">—</span><div><p>No care activity recorded for this patient yet.</p></div></li>`;
  }

  function wireAshaPatientProfile() {
    $("#ashaProfileRecordVitals").addEventListener("click", () => openVisitModal(currentAshaProfilePatientId, "Record Vitals"));
    $("#ashaProfileRecordVisit").addEventListener("click", () => openVisitModal(currentAshaProfilePatientId, "Record New Visit"));

    $("#ashaProfileCheckUrgency").addEventListener("click", () => {
      pendingAshaSelectedPatientId = currentAshaProfilePatientId;
      showView($("#portal-asha"), "asha-urgency");
    });
    $("#ashaProfileCreateReferral").addEventListener("click", () => {
      pendingAshaReferralPatientId = currentAshaProfilePatientId;
      showView($("#portal-asha"), "asha-referrals");
    });

    $("#ashaProfileScheduleFollowup").addEventListener("click", () => {
      const form = $("#ashaScheduleFollowupForm");
      form.style.display = form.style.display === "none" ? "block" : "none";
    });

    $("#ashaFollowupForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const patient = db.ashaPatients.find(p => p.id === currentAshaProfilePatientId);
      if (!patient) return;
      const reason = $("#ashaFollowupReason").value.trim() || "Follow-up visit";
      const due = $("#ashaFollowupDue").value.trim() || "Due soon";
      db.followUps.unshift({
        id: nextFollowUpId(), patientId: patient.id, patientName: patient.name,
        reason, dueLabel: due, status: "Due", createdFrom: null
      });
      logAudit("Follow-up scheduled", "Nurse Kulkarni", patient.name, "followup");
      saveDB();
      toast(`Follow-up scheduled for ${patient.name}`);
      $("#ashaFollowupForm").reset();
      $("#ashaScheduleFollowupForm").style.display = "none";
      renderAshaPatientProfile();
      renderAshaPatientsTable();
      if (viewIsActive("asha-dashboard")) renderAshaDashboard();
      if (viewIsActive("asha-followups")) renderAshaFollowups();
    });
  }

  /* ---- Record Visit modal — shared by "Record Vitals" and "Record New Visit" -- */

  let visitModalPatientId = null;

  function openVisitModal(patientId, title, defaultReason) {
    const patient = db.ashaPatients.find(p => p.id === patientId);
    if (!patient) return;
    visitModalPatientId = patientId;
    $("#visitModalTitle").textContent = title || "Record New Visit";
    const reasonEl = $("#visitReason");
    if (reasonEl) {
      const inferred = defaultReason || (patient.pregnant ? "Pregnancy" : patient.newborn ? "Newborn" : "Routine follow-up");
      reasonEl.value = [...reasonEl.options].some(o => o.value === inferred) ? inferred : "Routine follow-up";
    }
    $("#visitBP").value = patient.vitals.bp && patient.vitals.bp !== "—" ? patient.vitals.bp : "";
    $("#visitPulse").value = patient.vitals.pulse || "";
    $("#visitTemp").value = patient.vitals.temp || "";
    const sugarEl = $("#visitSugar");
    if (sugarEl) sugarEl.value = patient.vitals.sugar || "";
    $("#visitSpo2").value = patient.vitals.spo2 || "";
    $("#visitResp").value = patient.vitals.resp || "";
    $("#visitWeight").value = patient.vitals.weight || "";
    $("#visitNotes").value = "";
    $("#visitModalOverlay").classList.add("open");
  }

  function wireVisitModal() {
    $("#closeVisitModal").addEventListener("click", () => $("#visitModalOverlay").classList.remove("open"));
    $("#visitModalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "visitModalOverlay") $("#visitModalOverlay").classList.remove("open");
    });

    $("#visitForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const patient = db.ashaPatients.find(p => p.id === visitModalPatientId);
      if (!patient) return;
      const sugarInput = $("#visitSugar");
      const sugarVal = sugarInput ? parseInt(sugarInput.value, 10) : 0;
      const vitals = {
        bp: $("#visitBP").value.trim() || patient.vitals.bp,
        pulse: parseInt($("#visitPulse").value, 10) || patient.vitals.pulse,
        temp: parseFloat($("#visitTemp").value) || patient.vitals.temp,
        sugar: (!isNaN(sugarVal) && sugarVal > 0) ? sugarVal : (patient.vitals.sugar || 0),
        spo2: parseInt($("#visitSpo2").value, 10) || patient.vitals.spo2,
        resp: parseInt($("#visitResp").value, 10) || patient.vitals.resp,
        weight: parseFloat($("#visitWeight").value) || patient.vitals.weight
      };
      const notes = $("#visitNotes").value.trim();
      const reasonEl = $("#visitReason");
      const reason = reasonEl ? reasonEl.value : "Routine follow-up";
      if (!patient.visits) patient.visits = [];
      patient.visits.push({ date: todayStr(), vitals, notes: notes ? `[${reason}] ${notes}` : `[${reason}] No additional notes recorded.`, recordedBy: "Nurse Kulkarni", reason });
      patient.vitals = vitals;
      patient.symptoms = notes || patient.symptoms;
      patient.lastVisit = todayStr();

      // If this was a follow-up-triggered visit, mark that follow-up completed.
      const dueFu = db.followUps.find(f => f.patientId === patient.id && f.status === "Due");
      if (dueFu && (reason === "Pregnancy" || reason === "Newborn" || reason === "Routine follow-up")) {
        dueFu.status = "Completed";
      }

      saveDB();
      logAudit("Visit recorded", "Nurse Kulkarni", patient.name, "visit");
      toast(`Visit recorded for ${patient.name}`);
      $("#visitModalOverlay").classList.remove("open");

      if (viewIsActive("asha-patient-profile")) renderAshaPatientProfile();
      if (viewIsActive("asha-patients")) renderAshaPatientsTable();
      if (viewIsActive("asha-dashboard")) renderAshaDashboard();
      if (viewIsActive("asha-household-profile")) renderAshaHouseholdProfile();
      if (viewIsActive("asha-followups")) renderAshaFollowups();
    });
  }

  /* ---- Check Urgency (reuses computeTriageSuggestion) -------------------- */

  let lastAshaUrgencyResult = null;

  function updateAshaUrgencySummary() {
    const sel = $("#ashaUrgencyPatientSelect");
    const summaryEl = $("#ashaUrgencySummary");
    if (!sel || !summaryEl) return;
    const patient = db.ashaPatients.find(p => p.id === sel.value);
    if (!patient) { summaryEl.textContent = ""; return; }
    summaryEl.innerHTML = `
      <strong>${esc(patient.name)}</strong>, ${patient.age} / ${esc(patient.gender)} · ${esc(patient.village)}<br>
      Vitals: BP ${esc(patient.vitals.bp)} · Pulse ${patient.vitals.pulse} bpm · Sugar ${patient.vitals.sugar ? patient.vitals.sugar + " mg/dL" : "—"} · SpO₂ ${patient.vitals.spo2}% · Temp ${patient.vitals.temp}°F<br>
      Symptoms: ${esc(patient.symptoms) || "None recorded"}${patient.conditions && patient.conditions !== "None" ? " · Known Conditions: " + esc(patient.conditions) : ""}`;
  }

  function renderAshaUrgencyPatientSelect() {
    const sel = $("#ashaUrgencyPatientSelect");
    if (!sel) return;
    const selectedId = pendingAshaSelectedPatientId || sel.value || (db.ashaPatients[0] && db.ashaPatients[0].id);
    sel.innerHTML = ashaPatientOptionsHtml(selectedId);
    pendingAshaSelectedPatientId = null;
    updateAshaUrgencySummary();
    const resultEl = $("#ashaUrgencyResult");
    resultEl.textContent = 'Select a patient and click "Run Priority Assessment."';
    resultEl.classList.add("triage-suggestion-empty");
    $("#ashaUrgencyActions").style.display = "none";
    const oldPanel = $("#ashaPatientSummaryPanel");
    if (oldPanel) oldPanel.remove();
  }

  function wireAshaUrgency() {
    const sel = $("#ashaUrgencyPatientSelect");
    if (sel) sel.addEventListener("change", updateAshaUrgencySummary);

    $("#ashaRunUrgency").addEventListener("click", () => {
      const patient = db.ashaPatients.find(p => p.id === $("#ashaUrgencyPatientSelect").value);
      if (!patient) return;
      const input = {
        symptoms: patient.symptoms,
        consciousness: (patient.symptoms || "").toLowerCase().includes("unconscious") ? "Unresponsive" : "Alert",
        hr: patient.vitals.pulse,
        bp: patient.vitals.bp,
        sugar: patient.vitals.sugar || 0,
        spo2: patient.vitals.spo2,
        age: patient.age,
        history: patient.conditions
      };
      const result = computeTriageSuggestion(input);
      lastAshaUrgencyResult = { patient, result };
      const label = result.urgencyLabel || URGENCY_LABEL[result.priority];
      const resultEl = $("#ashaUrgencyResult");
      resultEl.classList.remove("triage-suggestion-empty");
      resultEl.innerHTML = `
        <div class="triage-result">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span class="priority-tag ${badgeClassForPriority(result.priority)}">${priorityDot(result.priority)} ${label.toUpperCase()} (${result.priority})</span>
            <small style="font-weight:700;color:var(--ink-2);">Score: ${result.score}/10</small>
          </div>
          <div style="margin:10px 0 12px;padding:10px;background:var(--surface-2);border-left:3px solid var(--teal-700);border-radius:6px;">
            <strong style="color:var(--teal-950);font-size:13px;">Suggested Next Step:</strong>
            <p style="margin:4px 0 0;font-size:14px;color:var(--ink);">${esc(result.suggestedNextStep)}</p>
          </div>
          <div class="triage-reasoning">
            <strong>Clinical Decision Support Factors:</strong><br>
            ${result.reasons.map(r => "• " + esc(r)).join("<br>")}
          </div>
          <p style="font-size:12px;color:var(--muted);margin-top:10px;font-style:italic;">"${result.disclaimer}"</p>
        </div>`;
      $("#ashaUrgencyActions").style.display = "flex";
      const oldPanel = $("#ashaPatientSummaryPanel");
      if (oldPanel) oldPanel.remove();
      logAudit("Priority assessment completed", "Nurse Kulkarni", patient.name, "triage");
      toast(`${patient.name}: ${label} Priority`);
    });

    $("#ashaFindCareBtn").addEventListener("click", () => {
      if (!lastAshaUrgencyResult) return;
      pendingAshaReferralPatientId = lastAshaUrgencyResult.patient.id;
      showView($("#portal-asha"), "asha-referrals");
    });

    $("#ashaViewSummaryBtn").addEventListener("click", () => {
      if (!lastAshaUrgencyResult) return;
      const existing = $("#ashaPatientSummaryPanel");
      if (existing) { existing.remove(); return; }
      const panel = document.createElement("div");
      panel.id = "ashaPatientSummaryPanel";
      panel.className = "ai-summary";
      panel.style.marginTop = "12px";
      panel.innerHTML = `<strong>Clinical Decision Support Summary · verify before medical decision</strong>${esc(generateAshaPatientSummary(lastAshaUrgencyResult.patient))}`;
      $("#ashaUrgencyActions").after(panel);
    });
  }

  /* ---- Find Appropriate Care + Referrals --------------------------------- */

  function updateAshaFacilityRecommendation() {
    const sel = $("#ashaReferralPatientSelect");
    const el = $("#ashaFacilityRecommendation");
    if (!sel || !el) return;
    const patient = db.ashaPatients.find(p => p.id === sel.value);
    if (!patient) { el.textContent = "Select a patient to see a recommended facility."; return; }

    const input = {
      symptoms: patient.symptoms, consciousness: "Alert",
      hr: patient.vitals.pulse, bp: patient.vitals.bp,
      sugar: patient.vitals.sugar || 0,
      spo2: patient.vitals.spo2,
      age: patient.age, history: patient.conditions
    };
    const result = computeTriageSuggestion(input);
    const facility = recommendFacility(result.priority);
    const label = result.urgencyLabel || URGENCY_LABEL[result.priority];
    const caps = [facility.emergency && "Emergency Care", facility.specialists && "Specialist Services", facility.diagnostics && "Diagnostics"].filter(Boolean).join(", ") || "General care";

    el.innerHTML = `
      <div class="snapshot-row"><span>Patient</span><strong>${esc(patient.name)}</strong></div>
      <div class="snapshot-row"><span>Urgency</span><strong><span class="badge ${badgeClassForPriority(result.priority)}">${label}</span></strong></div>
      <div class="snapshot-row"><span>Recommended facility</span><strong>${esc(facility.name)}</strong></div>
      <div class="snapshot-row"><span>Distance</span><strong>${facility.distanceKm} km</strong></div>
      <div class="snapshot-row"><span>Capabilities</span><strong>${esc(caps)}</strong></div>
      <div class="quick-actions" style="margin-top:14px;">
        <button class="btn btn-primary btn-sm" id="ashaStartReferralBtn">Start Referral</button>
      </div>`;

    $("#ashaStartReferralBtn").addEventListener("click", () => createAshaReferral(patient, facility, result.priority));
  }

  function createAshaReferral(patient, facility, urgencyPriority) {
    const referral = {
      id: nextReferralId(),
      patientId: patient.id,
      patientName: patient.name,
      urgency: urgencyPriority,
      facility: facility.name,
      reason: patient.symptoms || "Referred for further evaluation",
      status: "SENT",
      createdBy: "Nurse Kulkarni",
      time: Date.now(),
      followUpDate: todayStrOffset(urgencyPriority === "RED" ? 1 : urgencyPriority === "ORANGE" ? 3 : 7),
      lastUpdate: Date.now(),
      notes: ""
    };
    db.referrals.unshift(referral);
    saveDB();
    logAudit("Referral sent", "Nurse Kulkarni", patient.name, "referral");
    pushNotification(`🚨 New referral — ${referral.id}`, `${patient.name} · ${facility.name} · ${URGENCY_LABEL[urgencyPriority] || urgencyPriority}`);
    toast(`Referral ${referral.id} sent to ${facility.name}`);
    if (viewIsActive("asha-referrals")) renderAshaReferralsTable();
    if (viewIsActive("asha-dashboard")) renderAshaDashboard();
    if (viewIsActive("h-referrals")) renderHospitalReferrals();
    if (viewIsActive("h-dashboard")) renderHospitalDashboard();
  }

  function renderAshaReferralsTable() {
    const tbody = $("#ashaReferralsTable tbody");
    if (!tbody) return;
    const banner = $("#ashaReferralOverdueBanner");
    const overdueCount = db.referrals.filter(isReferralOverdue).length;
    if (banner) {
      if (overdueCount) {
        banner.style.display = "";
        banner.innerHTML = `<span class="badge badge-red">⚠ ${overdueCount} overdue referral${overdueCount === 1 ? "" : "s"}</span> — these have passed their expected follow-up date without being completed.`;
      } else {
        banner.style.display = "none";
      }
    }
    tbody.innerHTML = db.referrals.length ? db.referrals.map(r => {
      const status = referralDisplayStatus(r);
      return `
      <tr>
        <td class="mono">${esc(r.id)}</td>
        <td>${esc(r.patientName)}</td>
        <td>${esc(r.facility)}</td>
        <td>${esc(r.reason || "")}</td>
        <td><span class="badge ${badgeClassForPriority(r.urgency)}">${esc(URGENCY_LABEL[r.urgency] || r.urgency)}</span></td>
        <td><span class="badge ${referralBadgeClass(status)}">${esc(status.replace("_", " "))}</span></td>
        <td>${esc(r.followUpDate || "—")}</td>
        <td>${r.lastUpdate ? esc(timeAgo(r.lastUpdate)) : "—"}</td>
        <td><button class="btn btn-ghost btn-sm asha-referral-open" data-rid="${esc(r.id)}">Open</button></td>
      </tr>`;
    }).join("") : `<tr class="empty-row"><td colspan="9">No referrals sent yet.</td></tr>`;

    $all(".asha-referral-open", tbody).forEach(btn => btn.addEventListener("click", () => openAshaReferralDetail(btn.dataset.rid)));
  }

  function openAshaReferralDetail(id) {
    const card = $("#ashaReferralDetailCard");
    const r = db.referrals.find(x => x.id === id);
    if (!card || !r) return;
    const status = referralDisplayStatus(r);
    const nextOptions = (ASHA_REFERRAL_NEXT[r.status] || []).map(s => `<option value="${s}">${s.replace("_", " ")}</option>`).join("");
    card.style.display = "";
    card.innerHTML = `
      <div class="split-head" style="margin-bottom:12px;">
        <div><strong>${esc(r.patientName)}</strong><p class="section-note" style="margin:2px 0 0;">${esc(r.id)} · ${esc(r.facility)}</p></div>
        <span class="badge ${referralBadgeClass(status)}">${esc(status.replace("_", " "))}</span>
      </div>
      <div class="snapshot-row"><span>Reason</span><strong>${esc(r.reason || "—")}</strong></div>
      <div class="snapshot-row"><span>Priority</span><strong>${esc(URGENCY_LABEL[r.urgency] || r.urgency)}</strong></div>
      <div class="snapshot-row"><span>Follow-up date</span><strong>${esc(r.followUpDate || "—")}</strong></div>
      <div class="snapshot-row"><span>Last update</span><strong>${r.lastUpdate ? esc(timeAgo(r.lastUpdate)) : "—"}</strong></div>
      ${r.notes ? `<div class="snapshot-row"><span>Notes</span><strong>${esc(r.notes)}</strong></div>` : ""}
      ${nextOptions ? `
      <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
        <label style="display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:800;color:var(--ink-2);">
          Update status
          <select id="ashaReferralNextStatus">${nextOptions}</select>
        </label>
        <button class="btn btn-primary btn-sm" id="ashaReferralUpdateBtn">Update</button>
      </div>` : `<p class="section-note" style="margin-top:12px;">This referral's care loop is closed.</p>`}
    `;
    const updateBtn = $("#ashaReferralUpdateBtn");
    if (updateBtn) {
      updateBtn.addEventListener("click", () => {
        const sel = $("#ashaReferralNextStatus");
        const newStatus = sel ? sel.value : null;
        if (!newStatus) return;
        let note = "";
        if (newStatus === "OUTCOME_RECORDED") {
          note = prompt("Outcome / notes for this referral:", r.notes || "") || "";
          r.notes = note;
        }
        r.status = newStatus;
        r.lastUpdate = Date.now();
        saveDB();
        logAudit(`Referral ${newStatus.replace("_", " ").toLowerCase()}`, "Meena Patel (ASHA)", r.patientName, "referral");
        toast(`Referral ${r.id} updated to ${newStatus.replace("_", " ")}`);
        renderAshaReferralsTable();
        openAshaReferralDetail(r.id);
        if (viewIsActive("asha-dashboard")) renderAshaDashboard();
        if (viewIsActive("asha-patient-profile")) renderAshaPatientProfile();
      });
    }
  }

  function renderAshaReferralsView() {
    const sel = $("#ashaReferralPatientSelect");
    if (sel) {
      const selectedId = pendingAshaReferralPatientId || sel.value || (db.ashaPatients[0] && db.ashaPatients[0].id);
      sel.innerHTML = ashaPatientOptionsHtml(selectedId);
      pendingAshaReferralPatientId = null;
      updateAshaFacilityRecommendation();
    }
    const card = $("#ashaReferralDetailCard");
    if (card) card.style.display = "none";
    renderAshaReferralsTable();
  }

  function wireAshaReferrals() {
    const sel = $("#ashaReferralPatientSelect");
    if (sel) sel.addEventListener("change", updateAshaFacilityRecommendation);
  }

  /* ---- Follow-ups --------------------------------------------------------- */

  let ashaFollowupFilter = "all";

  function renderAshaFollowups() {
    const el = $("#ashaFollowupsList");
    if (!el) return;

    let list = db.followUps.slice();
    if (ashaFollowupFilter === "overdue") list = ashaOverdueFollowUps();
    else if (ashaFollowupFilter === "today") list = ashaDueFollowUps();
    else if (ashaFollowupFilter === "upcoming") list = ashaUpcomingFollowUps();
    else if (ashaFollowupFilter === "completed") list = db.followUps.filter(f => f.status === "Completed");

    const stateBadge = (f) => {
      if (f.status === "Completed") return '<span class="badge badge-mint">Completed</span>';
      if (/overdue/i.test(f.dueLabel || "")) return '<span class="badge badge-red">Overdue</span>';
      if (/upcoming/i.test(f.dueLabel || "")) return '<span class="badge badge-blue">Upcoming</span>';
      return '<span class="badge badge-yellow">Due Today</span>';
    };

    el.innerHTML = list.length ? list.map(f => {
      const p = db.ashaPatients.find(x => x.id === f.patientId);
      const riskBadge = p && ["Maternal", "Children", "Elderly"].includes(p.riskCategory)
        ? `<span class="badge badge-orange" style="margin-left:6px;">${esc(p.riskCategory)}</span>` : "";
      return `
      <div class="card" style="margin-bottom:12px;${f.status === "Completed" ? "opacity:.75;" : ""}">
        <div class="split-head" style="margin-bottom:8px;">
          <div><strong>${esc(f.patientName)}</strong>${riskBadge}<p class="section-note" style="margin:2px 0 0;">Reason: ${esc(f.reason)}</p></div>
          ${stateBadge(f)}
        </div>
        <p class="section-note" style="margin:0 0 10px;">${esc(f.dueLabel)}${f.status !== "Completed" ? " · " + esc(followUpRiskWhy(f)) : ""}</p>
        ${f.outcomeNote ? `<p class="section-note" style="margin:0 0 10px;"><strong>Outcome:</strong> ${esc(f.outcomeNote)}</p>` : ""}
        ${f.status !== "Completed" ? `
        <div class="quick-actions">
          <button class="btn btn-secondary btn-sm asha-followup-contact" data-fid="${esc(f.id)}">Contact Patient</button>
          <button class="btn btn-ghost btn-sm asha-followup-record" data-fid="${esc(f.id)}">Record Follow-Up</button>
          <button class="btn btn-primary btn-sm asha-followup-complete" data-fid="${esc(f.id)}">Mark Completed</button>
        </div>` : ""}
      </div>`;
    }).join("") : `<p class="escalation-empty">No follow-ups in this view.</p>`;

    $all(".asha-followup-contact", el).forEach(btn => btn.addEventListener("click", () => {
      const f = db.followUps.find(x => x.id === btn.dataset.fid);
      toast(f ? `Calling ${f.patientName} (simulated)…` : "Calling patient (simulated)…");
    }));
    $all(".asha-followup-record", el).forEach(btn => btn.addEventListener("click", () => {
      const f = db.followUps.find(x => x.id === btn.dataset.fid);
      if (!f) return;
      logAudit("Follow-up recorded", "Nurse Kulkarni", f.patientName, "followup");
      toast(`Follow-up notes recorded for ${f.patientName}`);
    }));
    $all(".asha-followup-complete", el).forEach(btn => btn.addEventListener("click", () => {
      const f = db.followUps.find(x => x.id === btn.dataset.fid);
      if (!f) return;
      const note = prompt("Short outcome note for this follow-up:", "") || "";
      f.status = "Completed";
      f.outcomeNote = note;
      saveDB();
      logAudit("Follow-up completed", "Nurse Kulkarni", f.patientName, "followup");
      toast(`✅ Follow-up completed for ${f.patientName}`);
      renderAshaFollowups();
      if (viewIsActive("asha-dashboard")) renderAshaDashboard();
    }));
  }

  function wireAshaFollowupFilters() {
    $all("#ashaFollowupFilters .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        $all("#ashaFollowupFilters .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        ashaFollowupFilter = chip.dataset.fuFilter;
        renderAshaFollowups();
      });
    });
  }

  /* ---- Medicine Availability ------------------------------------------- */

  let ashaMedicineSearchTerm = "";

  function renderAshaMedicines() {
    const el = $("#ashaMedicineResults");
    if (!el) return;
    const term = ashaMedicineSearchTerm.trim().toLowerCase();
    const names = [...new Set(db.medicines.map(m => m.name))];
    const matchNames = term ? names.filter(n => n.toLowerCase().includes(term)) : names;

    if (!matchNames.length) {
      el.innerHTML = `<p class="escalation-empty">No medicines match "${esc(ashaMedicineSearchTerm)}".</p>`;
      return;
    }

    el.innerHTML = matchNames.map(name => {
      const rows = db.medicines.filter(m => m.name === name);
      const latest = rows.reduce((a, b) => (a.lastUpdated > b.lastUpdated ? a : b), rows[0]);
      return `
      <div class="card" style="margin-bottom:14px;">
        <div class="split-head" style="margin-bottom:10px;">
          <div><strong>${esc(name)}</strong><p class="section-note" style="margin:2px 0 0;">${esc(rows[0].category)}</p></div>
          <span class="section-note">Last updated: ${esc(latest.lastUpdated || "—")}</span>
        </div>
        ${rows.map(r => `
          <div class="snapshot-row asha-medicine-row" data-facility="${esc(r.facility)}" data-medicine="${esc(name)}" style="cursor:pointer;">
            <span>${esc(r.facility)}</span>
            <strong><span class="badge ${medicineBadgeClass(r.status)}">${esc(r.status)}</span></strong>
          </div>`).join("")}
      </div>`;
    }).join("");

    $all(".asha-medicine-row", el).forEach(row => {
      row.addEventListener("click", () => {
        toast(`${row.dataset.medicine} @ ${row.dataset.facility} — you can reference this facility when creating a referral.`);
      });
    });
  }

  function wireAshaMedicines() {
    const search = $("#ashaMedicineSearch");
    if (search) {
      search.addEventListener("input", () => {
        ashaMedicineSearchTerm = search.value;
        renderAshaMedicines();
      });
    }
  }

  /* ---- Diagnostic Coordination ------------------------------------------ */

  const DIAGNOSTIC_TESTS = ["Blood Sugar (Random)", "Blood Test (CBC)", "Urine Test", "X-Ray", "Ultrasound (Antenatal)", "ECG", "HbA1c"];

  function diagBadgeClass(status) {
    return { Requested: "badge-blue", Scheduled: "badge-yellow", Completed: "badge-mint", "Result Available": "badge-mint" }[status] || "badge-muted";
  }

  function updateAshaDiagFacilityPreview() {
    const testSel = $("#ashaDiagTestSelect");
    const preview = $("#ashaDiagFacilityPreview");
    if (!testSel || !preview) return;
    const test = testSel.value;
    const facilities = db.diagnosticFacilities.filter(f => f.test === test);
    if (!facilities.length) { preview.textContent = "No facility data for this test yet."; return; }
    preview.innerHTML = facilities.map(f =>
      `<div class="snapshot-row"><span>${esc(f.facility)}</span><strong>${esc(f.status)}${f.status === "Available" ? " · " + esc(f.turnaround) : ""}</strong></div>`
    ).join("");
  }

  function renderAshaDiagnosticsView() {
    const patientSel = $("#ashaDiagPatientSelect");
    const testSel = $("#ashaDiagTestSelect");
    if (patientSel) patientSel.innerHTML = ashaPatientOptionsHtml(patientSel.value || (db.ashaPatients[0] && db.ashaPatients[0].id));
    if (testSel) testSel.innerHTML = DIAGNOSTIC_TESTS.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
    updateAshaDiagFacilityPreview();

    const tbody = $("#ashaDiagnosticsTable tbody");
    if (tbody) {
      tbody.innerHTML = db.diagnosticRequests.length ? db.diagnosticRequests.map(d => `
        <tr>
          <td>${esc(d.patientName)}</td>
          <td>${esc(d.test)}</td>
          <td>${esc(d.facility)}</td>
          <td><span class="badge ${diagBadgeClass(d.status)}">${esc(d.status)}</span></td>
          <td>${esc(timeAgo(d.requestedAt))}</td>
          <td>${d.status !== "Result Available" ? `<button class="btn btn-ghost btn-sm asha-diag-advance" data-did="${esc(d.id)}">Advance</button>` : "—"}</td>
        </tr>`).join("") : `<tr class="empty-row"><td colspan="6">No diagnostic requests yet.</td></tr>`;

      $all(".asha-diag-advance", tbody).forEach(btn => btn.addEventListener("click", () => {
        const d = db.diagnosticRequests.find(x => x.id === btn.dataset.did);
        if (!d) return;
        const flow = ["Requested", "Scheduled", "Completed", "Result Available"];
        const idx = flow.indexOf(d.status);
        d.status = flow[Math.min(idx + 1, flow.length - 1)];
        saveDB();
        logAudit(`Diagnostic ${d.status.toLowerCase()}`, "Nurse Kulkarni", d.patientName, "diagnostic");
        toast(`${d.test} for ${d.patientName} — ${d.status}`);
        renderAshaDiagnosticsView();
        if (viewIsActive("asha-patient-profile")) renderAshaPatientProfile();
      }));
    }
  }

  function wireAshaDiagnostics() {
    const testSel = $("#ashaDiagTestSelect");
    if (testSel) testSel.addEventListener("change", updateAshaDiagFacilityPreview);
    const btn = $("#ashaDiagRequestBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        const patientSel = $("#ashaDiagPatientSelect");
        const testSel2 = $("#ashaDiagTestSelect");
        const patient = db.ashaPatients.find(p => p.id === (patientSel && patientSel.value));
        const test = testSel2 && testSel2.value;
        if (!patient || !test) return;
        const facilities = db.diagnosticFacilities.filter(f => f.test === test && f.status === "Available");
        const facility = facilities[0] ? facilities[0].facility : "Nearest linked facility (availability unknown)";
        const req = {
          id: "DX-" + (5000 + db.diagnosticRequests.length + 1),
          patientId: patient.id, patientName: patient.name,
          test, facility, status: "Requested", requestedAt: Date.now(), requestedBy: "Nurse Kulkarni", result: ""
        };
        db.diagnosticRequests.unshift(req);
        saveDB();
        logAudit("Diagnostic test requested", "Nurse Kulkarni", patient.name, "diagnostic");
        toast(`${test} requested for ${patient.name} at ${facility}`);
        renderAshaDiagnosticsView();
      });
    }
  }

  /* ---- ASHA-assisted Teleconsultation ------------------------------------ */

  function teleBadgeClass(status) {
    return { Requested: "badge-blue", Waiting: "badge-yellow", "Doctor Connected": "badge-orange", Completed: "badge-mint" }[status] || "badge-muted";
  }

  function renderAshaTeleconsultView() {
    const sel = $("#ashaTelePatientSelect");
    if (sel) sel.innerHTML = ashaPatientOptionsHtml(sel.value || (db.ashaPatients[0] && db.ashaPatients[0].id));

    const list = $("#ashaTeleList");
    if (!list) return;
    const items = db.teleconsults || [];
    list.innerHTML = items.length ? items.map(t => `
      <div class="card" style="margin-bottom:14px;">
        <div class="split-head" style="margin-bottom:8px;">
          <div><strong>${esc(t.patientName)}</strong><p class="section-note" style="margin:2px 0 0;">${esc(t.department)} · ${esc(t.reason)}</p></div>
          <span class="badge ${teleBadgeClass(t.status)}">${esc(t.status)}</span>
        </div>
        ${t.status === "Completed" ? `
          <div class="snapshot-row"><span>Doctor's advice</span><strong>${esc(t.advice || "—")}</strong></div>
          <div class="snapshot-row"><span>Next action</span><strong>${esc(t.nextAction || "—")}</strong></div>
          ${t.followUpDate ? `<div class="snapshot-row"><span>Follow-up date</span><strong>${esc(t.followUpDate)}</strong></div>` : ""}
        ` : `
          <div class="quick-actions">
            <button class="btn btn-primary btn-sm asha-tele-advance" data-tid="${esc(t.id)}">Advance Status</button>
          </div>
        `}
      </div>`).join("") : `<p class="escalation-empty">No teleconsultation requests yet.</p>`;

    $all(".asha-tele-advance", list).forEach(btn => btn.addEventListener("click", () => {
      const t = items.find(x => x.id === btn.dataset.tid);
      if (!t) return;
      const flow = ["Requested", "Waiting", "Doctor Connected", "Completed"];
      const idx = flow.indexOf(t.status);
      t.status = flow[Math.min(idx + 1, flow.length - 1)];
      if (t.status === "Completed") {
        t.advice = t.advice || "Continue current medication; monitor blood pressure daily and report any worsening symptoms.";
        t.nextAction = t.nextAction || "Routine follow-up with ASHA in 1 week; refer if symptoms worsen.";
        t.followUpDate = todayStrOffset(7);
        // Feed the outcome back into the patient's continuity-of-care record.
        const followUp = {
          id: "FU-" + (9000 + db.followUps.length + 1),
          patientId: t.patientId, patientName: t.patientName,
          reason: `Teleconsultation follow-up — ${t.department}`, dueLabel: "Upcoming — in 7 days",
          status: "Due", createdFrom: t.id
        };
        db.followUps.unshift(followUp);
      }
      saveDB();
      logAudit(`Teleconsultation ${t.status.toLowerCase()}`, "Nurse Kulkarni", t.patientName, "teleconsult");
      toast(`Teleconsultation for ${t.patientName} — ${t.status}`);
      renderAshaTeleconsultView();
      if (viewIsActive("asha-dashboard")) renderAshaDashboard();
      if (viewIsActive("asha-patient-profile")) renderAshaPatientProfile();
    }));
  }

  function wireAshaTeleconsult() {
    const btn = $("#ashaTeleRequestBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        const patientSel = $("#ashaTelePatientSelect");
        const patient = db.ashaPatients.find(p => p.id === (patientSel && patientSel.value));
        const dept = $("#ashaTeleDeptSelect").value;
        const priority = $("#ashaTelePrioritySelect").value;
        const reason = $("#ashaTeleReason").value.trim();
        if (!patient) return;
        if (!reason) { toast("Enter a reason for the teleconsultation request"); return; }
        const t = {
          id: "TC-" + (3000 + (db.teleconsults ? db.teleconsults.length : 0) + 1),
          patientId: patient.id, patientName: patient.name,
          department: dept, priority, reason,
          status: "Requested", requestedAt: Date.now(),
          advice: "", nextAction: "", followUpDate: ""
        };
        db.teleconsults = db.teleconsults || [];
        db.teleconsults.unshift(t);
        saveDB();
        logAudit("Teleconsultation requested", "Nurse Kulkarni", patient.name, "teleconsult");
        toast(`Teleconsultation requested for ${patient.name}`);
        $("#ashaTeleReason").value = "";
        renderAshaTeleconsultView();
        if (viewIsActive("asha-dashboard")) renderAshaDashboard();
      });
    }
  }

  /* ---- Emergency SOS -------------------------------------------------------
     Runs the whole chain in one click: assess → find emergency facility →
     create emergency referral, using the exact same functions as the
     manual flow above. */

  function wireAshaEmergency() {
    let lastEmergencyPatient = null;
    let lastEmergencyFacility = null;

    $all("#ashaEmergencyOptions [data-emergency]").forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.emergency;
        $("#ashaEmergencyStatus").innerHTML = `<span class="mono">Assessing emergency…</span>`;

        const patient = {
          id: nextAshaPatientId(),
          name: "Emergency Patient — " + type,
          age: 40, gender: "Unknown", phone: "", village: "Unknown", emergencyContact: "",
          bloodGroup: "Unknown", allergies: "Unknown", conditions: "Unknown", medicines: "Unknown",
          vitals: { bp: "—", pulse: 0, temp: 0, spo2: 0, resp: 0, weight: 0 },
          symptoms: type, riskCategory: "Other", lastVisit: todayStr(), registeredBy: "Nurse Kulkarni"
        };
        db.ashaPatients.unshift(patient);

        const facility = recommendFacility("RED");
        createAshaReferral(patient, facility, "RED");
        lastEmergencyPatient = patient;
        lastEmergencyFacility = facility;

        logAudit("Emergency SOS raised", "Nurse Kulkarni", patient.name, "emergency");
        $("#ashaEmergencyStatus").innerHTML = `
          ✅ Emergency assessed as <strong>CRITICAL</strong>.<br>
          ✅ Nearest emergency facility: <strong>${esc(facility.name)}</strong> (${facility.distanceKm} km).<br>
          ✅ Emergency referral <span class="mono">${esc(db.referrals[0].id)}</span> sent.<br>
          ✅ Patient's emergency contact would be notified here (see Patient Portal's Emergency Assistance for that flow).`;
        toast("Emergency referral sent — " + facility.name);
        const panel = $("#ashaEmergencyEscalatePanel");
        if (panel) panel.style.display = "";
        if (viewIsActive("asha-dashboard")) renderAshaDashboard();
      });
    });

    $all("#ashaEmergencyEscalatePanel [data-escalate]").forEach(btn => {
      btn.addEventListener("click", () => {
        const kind = btn.dataset.escalate;
        const patientName = lastEmergencyPatient ? lastEmergencyPatient.name : "the patient";
        const facilityName = lastEmergencyFacility ? lastEmergencyFacility.name : "the linked facility";
        let msg;
        if (kind === "phc") msg = `✅ Emergency escalation initiated — ${facilityName} notified for ${patientName}.`;
        else if (kind === "higher") {
          const higher = recommendFacility("RED");
          msg = `✅ Escalated to higher facility — <strong>${esc(higher.name)}</strong> notified for ${patientName}.`;
        } else msg = `✅ Responsible health worker notified regarding ${patientName}. Case marked as urgent.`;
        logAudit(`Emergency escalated (${kind})`, "Nurse Kulkarni", patientName, "emergency");
        $("#ashaEmergencyStatus").insertAdjacentHTML("beforeend", `<br>${msg}`);
        toast("Emergency escalation initiated");
      });
    });
  }

  /* ---- Hospital side: Incoming Referrals ---------------------------------- */

  function referralNextAction(status) {
    return {
      SENT: { action: "accept", label: "Accept Referral" },
      ACCEPTED: { action: "enroute", label: "Mark Patient En Route" },
      "EN ROUTE": { action: "received", label: "Mark Patient Received" },
      RECEIVED: { action: "treatment", label: "Start Treatment" },
      TREATMENT: { action: "complete", label: "Mark Completed" },
      COMPLETED: null
    }[status] || null;
  }

  const REFERRAL_STAGES = ["SENT", "ACCEPTED", "EN ROUTE", "RECEIVED", "TREATMENT", "COMPLETED"];
  const REFERRAL_STAGE_LABEL = {
    SENT: "Referral Sent", ACCEPTED: "Facility Accepted", "EN ROUTE": "Patient En Route",
    RECEIVED: "Patient Arrived", TREATMENT: "Treatment", COMPLETED: "Completed"
  };

  // The "no patient should disappear between facilities" visual — every
  // referral shows its real current stage, not just a single status word.
  function referralPipelineHtml(currentStatus) {
    const currentIndex = REFERRAL_STAGES.indexOf(currentStatus);
    return `<div class="referral-pipeline">${REFERRAL_STAGES.map((stage, i) => {
      const icon = i < currentIndex ? "✓" : i === currentIndex ? "●" : "○";
      const stateClass = i < currentIndex ? "done" : i === currentIndex ? "current" : "pending";
      return `<div class="referral-pipeline-step ${stateClass}"><span class="referral-pipeline-icon">${icon}</span><span>${esc(REFERRAL_STAGE_LABEL[stage])}</span></div>`;
    }).join("")}</div>`;
  }

  function renderHospitalReferrals() {
    const el = $("#hospitalReferralsList");
    if (!el) return;
    if (!db.referrals.length) {
      el.innerHTML = `<p class="doc-empty">No incoming referrals right now.</p>`;
      return;
    }
    el.innerHTML = db.referrals.map(r => {
      const label = URGENCY_LABEL[r.urgency] || r.urgency;
      const nextAction = referralNextAction(r.status);
      const showAcceptEmergency = r.status === "SENT" && (r.urgency === "RED" || r.urgency === "ORANGE");
      return `
      <div class="card" style="margin-bottom:14px;">
        <div class="split-head" style="margin-bottom:10px;">
          <div>
            <strong>${esc(r.patientName)}</strong>
            <p class="section-note" style="margin:2px 0 0;">${esc(r.id)} · from ${esc(r.createdBy)} · ${esc(r.reason)}</p>
          </div>
          <span class="badge ${badgeClassForPriority(r.urgency)}">${esc(label)}</span>
        </div>
        <div class="snapshot-mini-grid" style="margin-bottom:12px;">
          <div><span>Facility</span><strong>${esc(r.facility)}</strong></div>
          <div><span>Status</span><strong><span class="badge ${referralBadgeClass(r.status)}">${esc(r.status)}</span></strong></div>
          <div><span>Sent</span><strong>${timeAgo(r.time)}</strong></div>
        </div>
        ${referralPipelineHtml(r.status)}
        <div class="quick-actions" style="margin-top:12px;">
          ${nextAction ? `<button class="btn ${showAcceptEmergency ? "btn-emergency" : "btn-primary"} btn-sm hospital-referral-action" data-rid="${esc(r.id)}" data-action="${showAcceptEmergency ? "acceptEmergency" : nextAction.action}">${showAcceptEmergency ? "Accept Emergency" : nextAction.label}</button>` : ""}
          ${showAcceptEmergency ? `<button class="btn btn-ghost btn-sm hospital-referral-action" data-rid="${esc(r.id)}" data-action="accept">Accept (Non-emergency)</button>` : ""}
        </div>
      </div>`;
    }).join("");

    $all(".hospital-referral-action", el).forEach(btn => {
      btn.addEventListener("click", () => handleReferralAction(btn.dataset.rid, btn.dataset.action));
    });
  }

  function handleReferralAction(referralId, action) {
    const referral = db.referrals.find(r => r.id === referralId);
    if (!referral) return;

    if (action === "accept" || action === "acceptEmergency") {
      referral.status = "ACCEPTED";
      // Create (or reuse) a REAL entry in the existing Live Patient Queue —
      // this is what makes an accepted referral part of the hospital's
      // actual workflow, not a disconnected list.
      const queueId = "REF-" + referral.id;
      let queuePatient = db.patients.find(p => p.id === queueId);
      if (!queuePatient) {
        queuePatient = {
          id: queueId, name: referral.patientName, arrival: "Referred",
          priority: referral.urgency, waitingMin: 0,
          dept: action === "acceptEmergency" ? "Emergency" : "General Medicine",
          status: "Waiting"
        };
        db.patients.unshift(queuePatient);
      }
      logAudit(action === "acceptEmergency" ? "Referral accepted as emergency" : "Referral accepted", "Dr. S. Bhatt", referral.patientName, "referral");
      pushNotification("Referral accepted", `${referral.id} · ${referral.patientName} — now in the live queue`);
      toast(`${referral.patientName} accepted — added to the live queue`);
    } else if (action === "enroute") {
      referral.status = "EN ROUTE";
      logAudit("Referral status updated — patient en route", "Dr. S. Bhatt", referral.patientName, "referral");
      toast(`${referral.patientName}: patient en route`);
    } else if (action === "received") {
      referral.status = "RECEIVED";
      const qp = db.patients.find(p => p.id === "REF-" + referral.id);
      if (qp) qp.status = "Under Assessment";
      logAudit("Patient received", "Dr. S. Bhatt", referral.patientName, "referral");
      toast(`${referral.patientName}: patient received`);
    } else if (action === "treatment") {
      referral.status = "TREATMENT";
      const qp = db.patients.find(p => p.id === "REF-" + referral.id);
      if (qp) qp.status = "Treatment";
      logAudit("Treatment started", "Dr. S. Bhatt", referral.patientName, "referral");
      toast(`${referral.patientName}: treatment started`);
    } else if (action === "complete") {
      referral.status = "COMPLETED";
      const qp = db.patients.find(p => p.id === "REF-" + referral.id);
      if (qp) qp.status = "Discharged";
      const followUp = {
        id: nextFollowUpId(), patientId: referral.patientId, patientName: referral.patientName,
        reason: "Post-referral follow-up: Glycemic & BP monitoring", dueLabel: "Due in 7 days", status: "Due", createdFrom: referral.id
      };
      db.followUps.unshift(followUp);
      logAudit("Referral completed", "Dr. S. Bhatt", referral.patientName, "referral");
      pushNotification("Follow-up due", `${referral.patientName} · Post-treatment follow-up`);
      toast(`${referral.patientName}: treatment completed — follow-up created`);
    }

    saveDB();
    renderHospitalReferrals();
    if (viewIsActive("h-dashboard")) renderHospitalDashboard();
    if (viewIsActive("h-queue")) renderFullQueueTable();
    if (viewIsActive("h-management")) renderManagementTable();
    if (viewIsActive("asha-referrals")) renderAshaReferralsTable();
    if (viewIsActive("asha-dashboard")) renderAshaDashboard();
    if (viewIsActive("asha-followups")) renderAshaFollowups();
  }

  /* ========================================================================
     NURSE PORTAL — patient care, tasks & handover
     ------------------------------------------------------------------------
     Reuses the same shared patient queue (db.patients) as Hospital/Admin —
     a nurse's "assigned patients" is that same live queue, viewed and acted
     on differently (care tasks, nursing notes, medication) rather than a
     duplicated data set. db.nurseTasks/db.nurseNotes/db.handoverNote are
     the only new nurse-specific data.
     ======================================================================== */

  function nurseMedicationTasksDue() {
    return db.nurseTasks.filter(t => t.type === "Medication" && t.status === "Due");
  }
  function nurseClinicalAlertPatients() {
    return db.patients.filter(p => p.priority === "RED");
  }
  function nursePendingHandoverTasks() {
    return db.nurseTasks.filter(t => t.type === "Handover" && t.status === "Pending");
  }
  function nurseDischargePrepTasks() {
    return db.nurseTasks.filter(t => t.type === "Discharge Prep" && t.status === "Pending");
  }

  let pendingNurseProfilePatientId = null;
  let currentNurseProfilePatientId = null;
  let nurseTaskFilter = "all";

  function jumpNursePatients() {
    showView($("#portal-nurse"), "n-patients");
  }
  function jumpNurseTasks(filter) {
    nurseTaskFilter = filter;
    showView($("#portal-nurse"), "n-tasks");
    const chips = $all("#nurseTaskFilters .chip");
    chips.forEach(c => c.classList.toggle("active", c.dataset.taskFilter === filter));
  }

  function renderNursePriorityGrid() {
    const grid = $("#nursePriorityGrid");
    if (!grid) return;
    const cards = [
      { tone: "teal", label: "Assigned Patients", count: db.patients.length, action: jumpNursePatients },
      { tone: "yellow", label: "Medication Tasks Due", count: nurseMedicationTasksDue().length, action: () => jumpNurseTasks("Medication") },
      { tone: "red", label: "Clinical Alerts", count: nurseClinicalAlertPatients().length, action: jumpNursePatients },
      { tone: "orange", label: "Pending Handover", count: nursePendingHandoverTasks().length, action: () => jumpNurseTasks("Handover") },
      { tone: "orange", label: "Discharge Preparations", count: nurseDischargePrepTasks().length, action: () => jumpNurseTasks("Discharge Prep") }
    ];
    grid.innerHTML = cards.map((c, i) => `
      <button type="button" class="priority-card tone-${c.tone}" data-nurse-priority-idx="${i}">
        <strong>${c.count}</strong>
        <span>${esc(c.label)}</span>
      </button>`).join("");
    $all("[data-nurse-priority-idx]", grid).forEach((btn, i) => btn.addEventListener("click", cards[i].action));
  }

  function renderNurseDashboard() {
    if (!$("#nursePriorityGrid")) return;
    renderNursePriorityGrid();
    const alerts = nurseClinicalAlertPatients();
    const el = $("#nurseAlertsPreview");
    el.innerHTML = alerts.length ? alerts.map(p => `
      <div class="escalation-item" style="background:var(--red-soft);color:var(--red-dark);">
        <span>${esc(p.name)} — ${esc(p.dept)}</span>
        <span class="badge badge-red">RED</span>
      </div>`).join("") : `<p class="escalation-empty">No red-priority patients right now.</p>`;
  }

  function renderNursePatientsTable() {
    const tbody = $("#nursePatientsTable tbody");
    if (!tbody) return;
    tbody.innerHTML = db.patients.map(p => `
      <tr class="clickable-row" data-nurse-pid="${esc(p.id)}">
        <td><strong>${esc(p.name)}</strong><br><span class="mono" style="font-size:11px;">${esc(p.id)}</span></td>
        <td>${esc(p.dept)}</td>
        <td><span class="badge ${badgeClassForPriority(p.priority)}">${esc(p.priority)}</span></td>
        <td>${esc(p.status)}</td>
        <td>${p.waitingMin} min</td>
      </tr>`).join("");
    $all("[data-nurse-pid]", tbody).forEach(row => row.addEventListener("click", () => {
      pendingNurseProfilePatientId = row.dataset.nursePid;
      showView($("#portal-nurse"), "n-patient-profile");
    }));
  }

  function renderNursePatientProfile() {
    const targetId = pendingNurseProfilePatientId || currentNurseProfilePatientId || (db.patients[0] && db.patients[0].id);
    const patient = db.patients.find(p => p.id === targetId) || db.patients[0];
    pendingNurseProfilePatientId = null;
    if (!patient) return;
    currentNurseProfilePatientId = patient.id;

    $("#nurseProfileName").textContent = patient.name;
    $("#nurseProfileInfo").innerHTML = `
      <h3>Patient Information</h3>
      <div class="id-card-row"><span>ID</span><strong>${esc(patient.id)}</strong></div>
      <div class="id-card-row"><span>Department</span><strong>${esc(patient.dept)}</strong></div>
      <div class="id-card-row"><span>Priority</span><strong><span class="badge ${badgeClassForPriority(patient.priority)}">${esc(patient.priority)}</span></strong></div>
      <div class="id-card-row"><span>Status</span><strong>${esc(patient.status)}</strong></div>
      <div class="id-card-row"><span>Waiting</span><strong>${patient.waitingMin} min</strong></div>`;

    const tasks = db.nurseTasks.filter(t => t.patientId === patient.id);
    $("#nurseProfileTasks").innerHTML = tasks.length ? tasks.map(t => `
      <div class="escalation-item" style="background:${t.status === "Done" ? "var(--teal-100)" : "var(--yellow-soft)"};">
        <span>${esc(t.type)} — ${esc(t.detail)} (${esc(t.dueTime)})</span>
        <span class="badge ${t.status === "Done" ? "badge-muted" : "badge-yellow"}">${esc(t.status)}</span>
      </div>`).join("") : `<p class="escalation-empty">No care tasks logged for this patient.</p>`;

    const notes = db.nurseNotes[patient.id] || [];
    $("#nurseProfileNotes").innerHTML = notes.length ? `<ul class="timeline">${notes.map(n => `
      <li><span class="mono">${esc(n.time)}</span><div><p>${esc(n.text)}</p></div></li>`).join("")}</ul>` : `<p class="section-note">No nursing notes yet.</p>`;
  }

  function renderNurseTasks() {
    const el = $("#nurseTaskList");
    if (!el) return;
    let tasks = db.nurseTasks.slice();
    if (nurseTaskFilter !== "all") tasks = tasks.filter(t => t.type === nurseTaskFilter);
    el.innerHTML = tasks.length ? tasks.map(t => `
      <div class="card card-wide" style="margin-bottom:10px;padding:14px 16px;">
        <div class="split-head">
          <div>
            <strong>${esc(t.patientName)}</strong> — ${esc(t.type)}
            <p class="section-note" style="margin:2px 0 0;">${esc(t.detail)} · Due ${esc(t.dueTime)}</p>
          </div>
          <span class="badge ${t.status === "Done" ? "badge-muted" : "badge-yellow"}">${esc(t.status)}</span>
        </div>
        ${t.status !== "Done" ? `<button type="button" class="btn btn-secondary btn-sm" style="margin-top:10px;" data-complete-task="${esc(t.id)}">Mark complete</button>` : ""}
      </div>`).join("") : `<p class="escalation-empty">No tasks in this category.</p>`;
    $all("[data-complete-task]", el).forEach(btn => btn.addEventListener("click", () => {
      const task = db.nurseTasks.find(t => t.id === btn.dataset.completeTask);
      if (!task) return;
      task.status = "Done";
      saveDB();
      toast(`${task.type} marked complete for ${task.patientName}`);
      renderNurseTasks();
      if (viewIsActive("n-dashboard")) renderNurseDashboard();
      if (viewIsActive("n-patient-profile")) renderNursePatientProfile();
    }));
  }

  function renderNurseHandover() {
    const el = $("#nurseHandoverSummary");
    if (!el) return;
    const pending = db.nurseTasks.filter(t => t.status !== "Done");
    const alerts = nurseClinicalAlertPatients();
    el.innerHTML = `
      <h3>Shift summary — auto-generated from current tasks</h3>
      <div class="id-card-row"><span>Assigned patients</span><strong>${db.patients.length}</strong></div>
      <div class="id-card-row"><span>Tasks still pending</span><strong>${pending.length}</strong></div>
      <div class="id-card-row"><span>Clinical alerts</span><strong>${alerts.length}</strong></div>
      ${pending.length ? `<div class="quick-actions" style="margin-top:12px;">${pending.map(t => `<span class="badge badge-yellow">${esc(t.patientName)} — ${esc(t.type)}</span>`).join("")}</div>` : ""}`;
    $("#nurseHandoverInput").value = db.handoverNote || "";
  }

  function wireNurse() {
    $all("#nurseTaskFilters .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        $all("#nurseTaskFilters .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        nurseTaskFilter = chip.dataset.taskFilter;
        renderNurseTasks();
      });
    });

    $("#nurseNoteForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#nurseNoteInput");
      const text = input.value.trim();
      if (!text || !currentNurseProfilePatientId) return;
      if (!db.nurseNotes[currentNurseProfilePatientId]) db.nurseNotes[currentNurseProfilePatientId] = [];
      db.nurseNotes[currentNurseProfilePatientId].push({ time: nowClock(), text });
      saveDB();
      input.value = "";
      toast("Nursing note saved");
      renderNursePatientProfile();
    });

    $("#nurseHandoverForm").addEventListener("submit", (e) => {
      e.preventDefault();
      db.handoverNote = $("#nurseHandoverInput").value.trim();
      saveDB();
      toast("Handover note saved for the next shift");
    });
  }


  function wireAsha() {
    wireAshaRegister();
    wireAshaPatientFilters();
    wireAshaPatientProfile();
    wireAshaHouseholdFilters();
    wireAshaHouseholdProfile();
    wireAshaUrgency();
    wireAshaReferrals();
    wireAshaFollowupFilters();
    wireAshaMedicines();
    wireAshaDiagnostics();
    wireAshaTeleconsult();
    wireAshaEmergency();
    wireAshaOffline();
  }

  /* ========================================================================
     20. INIT
     ======================================================================== */

  // Reflects the browser's real navigator.onLine state — an honest signal,
  // not a decorative one. It doesn't imply the app has full offline sync;
  // that's what the Health Worker portal's offline demo explicitly scopes.
  function updateNetworkStatusUI(isOnline) {
    const pill = $("#networkStatus");
    const label = $("#networkStatusLabel");
    if (!pill || !label) return;
    pill.classList.toggle("offline", !isOnline);
    label.textContent = isOnline ? "Connected" : "Offline Mode";
  }

  function wireNetworkStatus() {
    updateNetworkStatusUI(navigator.onLine);
    window.addEventListener("online", () => {
      updateNetworkStatusUI(true);
      toast("Connection restored");
      if (db.pendingSyncQueue.length) syncAshaPendingRecords();
    });
    window.addEventListener("offline", () => {
      updateNetworkStatusUI(false);
      toast("You're offline — changes will be saved locally");
    });
  }

  function wireResetData() {
    const btn = $("#resetDataBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      toast("Demo data reset — reloading…");
      setTimeout(() => window.location.reload(), 400);
    });
  }

  function init() {
    const hadSavedState = loadDB();
    if (!hadSavedState) saveDB(); // this tab becomes the shared baseline for any other tab opened after it

    wireNavigation();
    wireQueueFilters();
    wireMedicineFilters();
    wireTriage();
    wireIdentification();
    wirePatientQR();
    wireStaffScanner();
    wireRegistration();
    wireVaultFilters();
    wireUploadModal();
    wireVisitModal();
    wireAlertContacts();
    wireAmbulance();
    wireEmergencyMode();
    wireStaticForms();
    wireResetData();
    wireNetworkStatus();
    wirePortalSelection();
    wireAsha();
    wireNurse();
    wireLanguageSelector();
    initLanguage();

    const heroGetStartedBtn = $("#heroGetStartedBtn");
    if (heroGetStartedBtn) {
      heroGetStartedBtn.addEventListener("click", () => {
        const el = $("#workflowSection");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    // Cross-tab live sync: another tab of this same browser changed the
    // shared state (e.g. Ambulance tab sent pre-arrival info) — pick it up
    // and silently refresh whatever's currently on screen.
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) { loadDB(); rerenderActiveView(); }
    });

    // Camera cleanup if the tab is closed/hidden mid-scan.
    window.addEventListener("beforeunload", stopScannerCamera);

    // Render the views that are active by default on first paint.
    renderHospitalDashboard();
    renderVaultGrid();
    renderAshaDashboard();
    renderNurseDashboard();

    setInterval(tickLiveQueue, 5000);

    toast(hadSavedState
      ? "Welcome back — restored your saved Lifora session"
      : "Welcome to Lifora — this is a live prototype with simulated data");
  }

  /* ========================================================================
     PUBLIC BRIDGE — exposes just enough of this module's private state for
     an external file (cloud-sync.js) to read/write the shared data and
     trigger a re-render, without having to move the whole app out of its
     IIFE. Nothing else outside this file should reach into `db` directly.
     ======================================================================== */
  window.LiforaApp = {
    getDB: () => db,
    saveDB,
    rerenderActiveView,
    toast
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
