// Unit tests for validators.js. Run with: node --test (from uis/website).
// All data is synthetic (fake names, phones and IDs).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  addBusinessDays,
  ageInYears,
  hasEveningWarning,
  isClinicClosedOn,
  isPaediatricMismatch,
  isValidDateOfBirth,
  isValidEmail,
  isValidHealthConcern,
  isValidMemberId,
  isValidName,
  isValidPatientId,
  isValidPhone,
  isValidPreferredDate,
  parseISODate,
  toISODate,
  validateForm,
} from '../validators.js';

// Fixed "today": Thursday 2026-11-19.
const TODAY = new Date(2026, 10, 19);

const validData = () => ({
  first_name: 'Synth',
  last_name: 'Tester',
  date_of_birth: '1990-05-14',
  email: 'synth.tester@example.test',
  phone: '+1 305 555 0191',
  preferred_language: 'Spanish',
  preferred_clinic: 'HealthCore Miami',
  preferred_date: '2026-11-23', // Monday
  preferred_time: 'Morning',
  service_type: 'Primary Care',
  new_patient: 'Yes',
  has_insurance: 'No',
  health_concern: 'Synthetic test concern with enough characters.',
  contact_consent: 'on',
});

describe('names', () => {
  test('accepts letters, accents and compound names', () => {
    for (const name of ['Ana', 'José', 'Núñez', 'Müller', 'María José', 'Ruiz-Pérez', "O'Neil"]) {
      assert.equal(isValidName(name), true, name);
    }
  });
  test('rejects digits, symbols, too short or too long', () => {
    for (const name of ['A', 'Ana1', 'Ana!', '  ', '-Ana', 'Ana  Luz', 'a'.repeat(51)]) {
      assert.equal(isValidName(name), false, name);
    }
  });
});

describe('date of birth', () => {
  test('accepts today and patients aged up to 120', () => {
    assert.equal(isValidDateOfBirth('2026-11-19', TODAY), true);
    assert.equal(isValidDateOfBirth('1905-11-20', TODAY), true); // 120 (turns 121 tomorrow)
  });
  test('rejects future dates, 121+ years and invalid dates', () => {
    assert.equal(isValidDateOfBirth('2026-11-20', TODAY), false);
    assert.equal(isValidDateOfBirth('1905-11-19', TODAY), false); // 121 today
    assert.equal(isValidDateOfBirth('2001-02-30', TODAY), false);
    assert.equal(isValidDateOfBirth('', TODAY), false);
  });
  test('ageInYears counts birthdays correctly', () => {
    assert.equal(ageInYears(parseISODate('2008-11-19'), TODAY), 18);
    assert.equal(ageInYears(parseISODate('2008-11-20'), TODAY), 17);
  });
});

describe('contact', () => {
  test('email format', () => {
    assert.equal(isValidEmail('name@provider.com'), true);
    for (const email of ['name@', 'name@provider', 'name provider@x.com', '@provider.com']) {
      assert.equal(isValidEmail(email), false, email);
    }
  });
  test('phone requires + and country code', () => {
    for (const phone of ['+1 305 555 0191', '+34 612 345 678', '+44 20 7946 0100', '+13055550191']) {
      assert.equal(isValidPhone(phone), true, phone);
    }
    for (const phone of ['305 555 0191', '+0 305 555 0191', '+1 555', '+1 305 555 0191 ext', '+1234567890123456']) {
      assert.equal(isValidPhone(phone), false, phone);
    }
  });
});

describe('preferred date', () => {
  test('earliest is the next business day, skipping weekends', () => {
    assert.equal(toISODate(addBusinessDays(TODAY, 1)), '2026-11-20'); // Thu -> Fri
    assert.equal(toISODate(addBusinessDays(new Date(2026, 10, 20), 1)), '2026-11-23'); // Fri -> Mon
  });
  test('range is 1 business day to 60 days ahead', () => {
    assert.equal(isValidPreferredDate('2026-11-19', TODAY), false); // today
    assert.equal(isValidPreferredDate('2026-11-20', TODAY), true);
    assert.equal(isValidPreferredDate('2027-01-18', TODAY), true); // +60 days
    assert.equal(isValidPreferredDate('2027-01-19', TODAY), false); // +61 days
  });
});

describe('optional and conditional fields', () => {
  test('member ID: 6–20 alphanumerics', () => {
    assert.equal(isValidMemberId('SYN123'), true);
    assert.equal(isValidMemberId('SYN12'), false);
    assert.equal(isValidMemberId('SYN-1234'), false);
    assert.equal(isValidMemberId('S'.repeat(21)), false);
  });
  test('patient ID: empty or HC- + 6 alphanumerics', () => {
    assert.equal(isValidPatientId(''), true);
    assert.equal(isValidPatientId('HC-A3F291'), true);
    assert.equal(isValidPatientId('HC-A3F29'), false);
    assert.equal(isValidPatientId('XX-A3F291'), false);
  });
  test('health concern: 20–500 characters', () => {
    assert.equal(isValidHealthConcern('a'.repeat(19)), false);
    assert.equal(isValidHealthConcern('a'.repeat(20)), true);
    assert.equal(isValidHealthConcern('a'.repeat(501)), false);
  });
});

describe('cross-field rules', () => {
  test('Paediatric Care only for under 18', () => {
    assert.equal(isPaediatricMismatch('Paediatric Care', '2015-01-01', TODAY), false);
    assert.equal(isPaediatricMismatch('Paediatric Care', '1990-01-01', TODAY), true);
    assert.equal(isPaediatricMismatch('Primary Care', '1990-01-01', TODAY), false);
  });
  test('evening warning for clinics closing before 8pm', () => {
    assert.equal(hasEveningWarning('Evening', 'HealthCore San Antonio'), true);
    assert.equal(hasEveningWarning('Evening', 'HealthCore Austin North'), true);
    assert.equal(hasEveningWarning('Evening', 'HealthCore Miami'), false);
    assert.equal(hasEveningWarning('Morning', 'HealthCore San Antonio'), false);
  });
  test('closed-day warning: Sundays everywhere, Saturdays where there are no Saturday hours', () => {
    assert.equal(isClinicClosedOn('HealthCore Miami', '2026-11-22'), true); // Sunday
    assert.equal(isClinicClosedOn('HealthCore Orlando', '2026-11-21'), true); // Saturday
    assert.equal(isClinicClosedOn('HealthCore Miami', '2026-11-21'), false);
  });
});

describe('validateForm', () => {
  test('valid synthetic data has no errors', () => {
    assert.deepEqual(validateForm(validData(), TODAY), { errors: {}, warnings: {} });
  });
  test('empty form reports every required field', () => {
    const { errors } = validateForm({}, TODAY);
    assert.deepEqual(Object.keys(errors).sort(), [
      'contact_consent', 'date_of_birth', 'email', 'first_name', 'has_insurance', 'health_concern',
      'last_name', 'new_patient', 'phone', 'preferred_clinic', 'preferred_date', 'preferred_language',
      'preferred_time', 'service_type',
    ]);
  });
  test('insurance fields become required only when has_insurance = Yes', () => {
    const data = { ...validData(), has_insurance: 'Yes' };
    assert.deepEqual(Object.keys(validateForm(data, TODAY).errors).sort(), ['insurance_member_id', 'insurance_provider']);
    const ok = { ...data, insurance_provider: 'Synthetic Health Plan', insurance_member_id: 'SYN0001' };
    assert.deepEqual(validateForm(ok, TODAY).errors, {});
  });
  test('patient ID is validated only for returning patients', () => {
    assert.deepEqual(validateForm({ ...validData(), new_patient: 'No', patient_id: 'bad' }, TODAY).errors, { patient_id: 'patient_id' });
    assert.deepEqual(validateForm({ ...validData(), new_patient: 'Yes', patient_id: 'bad' }, TODAY).errors, {});
  });
  test('paediatric mismatch uses its own message key', () => {
    const { errors } = validateForm({ ...validData(), service_type: 'Paediatric Care' }, TODAY);
    assert.deepEqual(errors, { service_type: 'service_type_paediatric' });
  });
  test('warnings do not create errors', () => {
    const data = { ...validData(), preferred_clinic: 'HealthCore Orlando', preferred_time: 'Evening', preferred_date: '2026-11-21' };
    const result = validateForm(data, TODAY);
    assert.deepEqual(result.errors, {});
    assert.deepEqual(result.warnings, { preferred_time: 'evening_hours', preferred_date: 'clinic_closed' });
  });
});
