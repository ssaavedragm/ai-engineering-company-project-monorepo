// Pure validation rules for the HealthCore patient enquiry form.
// No DOM access here, so every rule can be unit-tested with `node --test`.
// Rules and limits come from BRIEFING.md ("Specific validations").
// Privacy: these functions never log, store or send the values they receive.

/** US clinics from the BRIEFING Locations table. Hours in 24h, local clinic time. */
export const CLINICS = {
  'HealthCore Austin Central': { weekdayClose: 20, saturday: true },
  'HealthCore Austin North': { weekdayClose: 19, saturday: false },
  'HealthCore San Antonio': { weekdayClose: 18, saturday: true },
  'HealthCore Miami': { weekdayClose: 20, saturday: true },
  'HealthCore Orlando': { weekdayClose: 18, saturday: false },
  'HealthCore Atlanta': { weekdayClose: 19, saturday: false },
};

export const LANGUAGES = ['English', 'Spanish'];
export const TIMES = ['Morning', 'Afternoon', 'Evening'];
export const SERVICES = [
  'Primary Care',
  'Chronic Disease Management',
  'Specialist Consultation',
  'Preventive Health',
  "Women's Health",
  'Paediatric Care',
  'Mental Health',
];
export const YES_NO = ['Yes', 'No'];

export const CONCERN_MIN = 20;
export const CONCERN_MAX = 500;
const EVENING_END_HOUR = 20;
const MAX_AGE = 120;
const MAX_DAYS_AHEAD = 60;

// ---------- Date helpers (local calendar dates, no time component) ----------

/** Parses "YYYY-MM-DD" into a local Date at midnight, or null if invalid. */
export function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? '').trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  const sameDay = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return sameDay ? date : null;
}

/** Strips the time of day so comparisons are by calendar date. */
export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Formats a Date as "YYYY-MM-DD" (used for the min/max attributes of date inputs). */
export function toISODate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date, days) {
  const result = startOfDay(date);
  result.setDate(result.getDate() + days);
  return result;
}

const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;

/** Adds `count` business days (Mon–Fri) to `date`. */
export function addBusinessDays(date, count) {
  let result = startOfDay(date);
  let added = 0;
  while (added < count) {
    result = addDays(result, 1);
    if (!isWeekend(result)) added += 1;
  }
  return result;
}

/** Full years between `dob` and `today`. */
export function ageInYears(dob, today) {
  let age = today.getFullYear() - dob.getFullYear();
  const birthdayPassed =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

/** Earliest and latest selectable preferred dates. */
export function preferredDateRange(today) {
  return { min: addBusinessDays(today, 1), max: addDays(today, MAX_DAYS_AHEAD) };
}

// ---------- Single-field rules ----------

// Letters from any alphabet (á, é, í, ó, ú, ñ, ü…). Single spaces, hyphens or
// apostrophes are allowed only *between* letters for compound names
// ("María José", "Ruiz-Pérez", "O'Neil"). Digits and other symbols are rejected.
const NAME_PATTERN = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;

export function isValidName(value) {
  const name = String(value ?? '').trim();
  return name.length >= 2 && name.length <= 50 && NAME_PATTERN.test(name);
}

export function isValidDateOfBirth(value, today) {
  const dob = parseISODate(value);
  if (!dob || dob > startOfDay(today)) return false;
  return ageInYears(dob, today) <= MAX_AGE;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? '').trim());
}

/**
 * "+" + country code + number. Spaces, hyphens, dots and parentheses are
 * allowed as separators. 8–15 digits in total (E.164 maximum is 15).
 */
export function isValidPhone(value) {
  const phone = String(value ?? '').trim();
  if (!/^\+[1-9][\d\s().-]*$/.test(phone)) return false;
  const digits = phone.replace(/\D/g, '').length;
  return digits >= 8 && digits <= 15;
}

export function isOneOf(value, options) {
  return options.includes(value);
}

export function isValidPreferredDate(value, today) {
  const date = parseISODate(value);
  if (!date) return false;
  const { min, max } = preferredDateRange(today);
  return date >= min && date <= max;
}

export function isValidInsuranceProvider(value) {
  const provider = String(value ?? '').trim();
  return provider.length >= 1 && provider.length <= 100;
}

export function isValidMemberId(value) {
  return /^[A-Za-z0-9]{6,20}$/.test(String(value ?? '').trim());
}

/** Optional field: empty is valid; otherwise "HC-" + 6 alphanumerics. */
export function isValidPatientId(value) {
  const id = String(value ?? '').trim();
  return id === '' || /^HC-[A-Za-z0-9]{6}$/i.test(id);
}

export function concernLength(value) {
  return String(value ?? '').trim().length;
}

export function isValidHealthConcern(value) {
  const length = concernLength(value);
  return length >= CONCERN_MIN && length <= CONCERN_MAX;
}

// ---------- Cross-field rules ----------

/** Paediatric Care requires a valid date of birth for a patient under 18. */
export function isPaediatricMismatch(serviceType, dateOfBirth, today) {
  if (serviceType !== 'Paediatric Care') return false;
  const dob = parseISODate(dateOfBirth);
  if (!dob || !isValidDateOfBirth(dateOfBirth, today)) return false; // DOB error shown on its own field
  return ageInYears(dob, today) >= 18;
}

/** Evening slot (5pm–8pm) at a clinic that closes before 8pm on weekdays. */
export function hasEveningWarning(preferredTime, preferredClinic) {
  const clinic = CLINICS[preferredClinic];
  return preferredTime === 'Evening' && Boolean(clinic) && clinic.weekdayClose < EVENING_END_HOUR;
}

/** The chosen clinic is closed that day (all clinics on Sunday; some on Saturday). */
export function isClinicClosedOn(preferredClinic, preferredDate) {
  const clinic = CLINICS[preferredClinic];
  const date = parseISODate(preferredDate);
  if (!clinic || !date) return false;
  if (date.getDay() === 0) return true;
  return date.getDay() === 6 && !clinic.saturday;
}

// ---------- Whole form ----------

/**
 * Validates the form data.
 * @param {Record<string, string>} data  Field values keyed by `name` (checkbox: "on" or "").
 * @param {Date} today  Injected for deterministic tests.
 * @returns {{ errors: Record<string, string>, warnings: Record<string, string> }}
 *   Values are message keys; the UI maps them to localised text.
 */
export function validateForm(data, today = new Date()) {
  const errors = {};
  const warnings = {};
  const v = (name) => data[name] ?? '';

  if (!isValidName(v('first_name'))) errors.first_name = 'first_name';
  if (!isValidName(v('last_name'))) errors.last_name = 'last_name';
  if (!isValidDateOfBirth(v('date_of_birth'), today)) errors.date_of_birth = 'date_of_birth';
  if (!isValidEmail(v('email'))) errors.email = 'email';
  if (!isValidPhone(v('phone'))) errors.phone = 'phone';
  if (!isOneOf(v('preferred_language'), LANGUAGES)) errors.preferred_language = 'preferred_language';
  if (!isOneOf(v('preferred_clinic'), Object.keys(CLINICS))) errors.preferred_clinic = 'preferred_clinic';
  if (!isValidPreferredDate(v('preferred_date'), today)) errors.preferred_date = 'preferred_date';
  if (!isOneOf(v('preferred_time'), TIMES)) errors.preferred_time = 'preferred_time';

  if (!isOneOf(v('service_type'), SERVICES)) errors.service_type = 'service_type';
  else if (isPaediatricMismatch(v('service_type'), v('date_of_birth'), today)) {
    errors.service_type = 'service_type_paediatric';
  }

  if (!isOneOf(v('new_patient'), YES_NO)) errors.new_patient = 'new_patient';
  else if (v('new_patient') === 'No' && !isValidPatientId(v('patient_id'))) errors.patient_id = 'patient_id';

  if (!isOneOf(v('has_insurance'), YES_NO)) errors.has_insurance = 'has_insurance';
  else if (v('has_insurance') === 'Yes') {
    if (!isValidInsuranceProvider(v('insurance_provider'))) errors.insurance_provider = 'insurance_provider';
    if (!isValidMemberId(v('insurance_member_id'))) errors.insurance_member_id = 'insurance_member_id';
  }

  if (!isValidHealthConcern(v('health_concern'))) errors.health_concern = 'health_concern';
  if (v('contact_consent') !== 'on') errors.contact_consent = 'contact_consent';

  // Warnings never block submission.
  if (!errors.preferred_time && !errors.preferred_clinic && hasEveningWarning(v('preferred_time'), v('preferred_clinic'))) {
    warnings.preferred_time = 'evening_hours';
  }
  if (!errors.preferred_date && !errors.preferred_clinic && isClinicClosedOn(v('preferred_clinic'), v('preferred_date'))) {
    warnings.preferred_date = 'clinic_closed';
  }

  return { errors, warnings };
}
