// DOM layer of the patient enquiry form: real-time validation, accessible
// error messages, conditional fields, live counter and simulated submission.
// The rules live in validators.js. Error texts are the ones in BRIEFING.md.
// Privacy: nothing is sent, stored (no localStorage/cookies) or logged.
import {
  CONCERN_MAX,
  CONCERN_MIN,
  concernLength,
  preferredDateRange,
  toISODate,
  validateForm,
} from './validators.js';

const MESSAGES = {
  en: {
    first_name: 'First name must contain only letters and be at least 2 characters',
    last_name: 'Last name must contain only letters and be at least 2 characters',
    date_of_birth: 'Enter a valid date of birth. Patient must be between 0 and 120 years old',
    email: 'Enter a valid email address (example: name@provider.com)',
    phone: 'Phone must include a country code (example: +1 305 555 0191)',
    preferred_language: 'Select your preferred language',
    preferred_clinic: 'Select the clinic you would like to visit',
    preferred_date: 'Select a date at least 1 business day from today and no more than 60 days ahead',
    preferred_time: 'Select your preferred time of day',
    service_type: 'Select the type of care you are looking for',
    service_type_paediatric:
      'Paediatric Care is available for patients under 18. Please check the date of birth or select a different service.',
    new_patient: 'Please indicate whether this is your first visit to HealthCore',
    has_insurance: 'Please indicate whether you have health insurance',
    insurance_provider: 'Please enter your insurance provider name',
    insurance_member_id: 'Member ID must be between 6 and 20 alphanumeric characters',
    patient_id: 'Patient ID must be HC- followed by 6 letters or numbers (example: HC-A3F291)',
    health_concern: (remaining) =>
      `Please describe your health concern in at least 20 characters (${remaining} characters remaining)`,
    contact_consent: 'You must consent to being contacted before submitting this form',
    evening_hours:
      'This clinic closes before 8pm on weekdays, so an evening appointment is unlikely to be available. Consider another time or clinic.',
    clinic_closed:
      'This clinic is closed on the selected day. The front desk will offer you the nearest available date.',
    counter: (count) => `${count} / ${CONCERN_MAX} characters`,
    summary: (count) =>
      count === 1 ? 'There is 1 error in the form. Please review it.' : `There are ${count} errors in the form. Please review them.`,
  },
  es: {
    first_name: 'El nombre debe contener solo letras y tener al menos 2 caracteres',
    last_name: 'El apellido debe contener solo letras y tener al menos 2 caracteres',
    date_of_birth: 'Ingresa una fecha de nacimiento válida. El paciente debe tener entre 0 y 120 años',
    email: 'Ingresa un correo electrónico válido (ejemplo: nombre@proveedor.com)',
    phone: 'El teléfono debe incluir un código de país (ejemplo: +1 305 555 0191)',
    preferred_language: 'Selecciona tu idioma preferido',
    preferred_clinic: 'Selecciona la clínica que te gustaría visitar',
    preferred_date: 'Selecciona una fecha de al menos 1 día hábil desde hoy y no más de 60 días hacia adelante',
    preferred_time: 'Selecciona tu franja horaria preferida',
    service_type: 'Selecciona el tipo de atención que estás buscando',
    service_type_paediatric:
      'Paediatric Care está disponible para pacientes menores de 18 años. Revisa la fecha de nacimiento o selecciona un servicio diferente.',
    new_patient: 'Indica si esta es tu primera visita a HealthCore',
    has_insurance: 'Indica si tienes seguro médico',
    insurance_provider: 'Ingresa el nombre de tu aseguradora',
    insurance_member_id: 'El ID de afiliado debe tener entre 6 y 20 caracteres alfanuméricos',
    patient_id: 'El Patient ID debe ser HC- seguido de 6 letras o números (ejemplo: HC-A3F291)',
    health_concern: (remaining) =>
      `Describe tu consulta médica en al menos 20 caracteres (faltan ${remaining} caracteres)`,
    contact_consent: 'Debes dar tu consentimiento para ser contactado antes de enviar este formulario',
    evening_hours:
      'Esta clínica cierra antes de las 8pm entre semana, por lo que es poco probable que haya cita por la tarde-noche. Considera otra franja u otra clínica.',
    clinic_closed:
      'Esta clínica está cerrada el día seleccionado. Recepción te ofrecerá la fecha disponible más cercana.',
    counter: (count) => `${count} / ${CONCERN_MAX} caracteres`,
    summary: (count) =>
      count === 1 ? 'Hay 1 error en el formulario. Revísalo, por favor.' : `Hay ${count} errores en el formulario. Revísalos, por favor.`,
  },
};

// Fields whose validity depends on another field: changing the key re-checks the values.
const DEPENDENTS = {
  date_of_birth: ['service_type'],
  service_type: ['date_of_birth'],
  preferred_clinic: ['preferred_time', 'preferred_date'],
  preferred_time: ['preferred_clinic'],
  preferred_date: ['preferred_clinic'],
  new_patient: ['patient_id'],
  has_insurance: ['insurance_provider', 'insurance_member_id'],
};

const form = document.getElementById('enquiry-form');
if (form) initEnquiryForm(form);

function initEnquiryForm(form) {
  const lang = document.documentElement.lang.startsWith('es') ? 'es' : 'en';
  const t = MESSAGES[lang];
  const touched = new Set();
  const summary = document.getElementById('form-summary');
  const success = document.getElementById('form-success');
  const counter = document.getElementById('health_concern-counter');
  const insuranceGroup = document.getElementById('insurance-details');
  const patientIdGroup = document.getElementById('patient-id-group');

  setDateLimits(form);

  const readData = () => {
    const data = {};
    for (const [name, value] of new FormData(form)) data[name] = String(value);
    return data;
  };

  const messageFor = (key, data) =>
    key === 'health_concern'
      ? t.health_concern(Math.max(CONCERN_MIN - concernLength(data.health_concern), 0))
      : t[key];

  // Shows or clears the error/warning of one field (radio groups share a name).
  const render = (name, result, data) => {
    const errorEl = document.getElementById(`${name}-error`);
    const warningEl = document.getElementById(`${name}-warning`);
    const controls = form.querySelectorAll(`[name="${name}"]`);
    const errorKey = touched.has(name) ? result.errors[name] : undefined;
    const warningKey = touched.has(name) ? result.warnings[name] : undefined;

    // Message elements stay in the DOM (empty when valid) so their aria-live
    // region keeps working and screen readers announce new messages.
    if (errorEl) errorEl.textContent = errorKey ? messageFor(errorKey, data) : '';
    if (warningEl) warningEl.textContent = warningKey ? t[warningKey] : '';
    for (const control of controls) {
      if (errorKey) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    }
    // Radio groups: mark the fieldset (aria-invalid is not valid on a group) for styling.
    const group = document.getElementById(`${name}-group`);
    if (group?.tagName === 'FIELDSET') group.toggleAttribute('data-invalid', Boolean(errorKey));
  };

  const refresh = (names) => {
    const data = readData();
    const result = validateForm(data);
    for (const name of names) render(name, result, data);
    return result;
  };

  const updateConditionalFields = () => {
    const data = readData();
    toggleGroup(insuranceGroup, data.has_insurance === 'Yes');
    toggleGroup(patientIdGroup, data.new_patient === 'No');
  };

  const updateCounter = () => {
    const length = concernLength(form.elements.health_concern.value);
    counter.textContent = t.counter(length);
  };

  const fieldNames = () => [...new Set([...form.elements].map((el) => el.name).filter(Boolean))];

  // Validate a field when the user leaves it…
  form.addEventListener('focusout', (event) => {
    const { name } = event.target;
    if (!name) return;
    touched.add(name);
    refresh([name, ...(DEPENDENTS[name] ?? []).filter((dep) => touched.has(dep))]);
  });

  // …and in real time while typing once it has been touched.
  const onChange = (event) => {
    const { name, type } = event.target;
    if (!name) return;
    if (name === 'health_concern') updateCounter();
    if (name === 'has_insurance' || name === 'new_patient') updateConditionalFields();
    // Selects, radios, checkboxes and dates are "touched" as soon as they change.
    if (event.type === 'change' && type !== 'text' && type !== 'email' && type !== 'tel') touched.add(name);
    const names = [name, ...(DEPENDENTS[name] ?? [])].filter((n) => touched.has(n));
    if (names.length) refresh(names);
  };
  form.addEventListener('input', onChange);
  form.addEventListener('change', onChange);

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Never submitted anywhere: simulated submission only.
    for (const name of fieldNames()) touched.add(name);
    const result = refresh(fieldNames());
    const invalid = Object.keys(result.errors);

    if (invalid.length) {
      // Show the alert region first, then insert the text so it is announced
      // (also on a repeated submit with the same message).
      summary.hidden = false;
      summary.textContent = '';
      requestAnimationFrame(() => {
        summary.textContent = t.summary(invalid.length);
      });
      const first = form.querySelector(`[name="${invalid[0]}"]`);
      first?.focus();
      return;
    }

    summary.hidden = true;
    summary.textContent = '';
    form.reset(); // Drop the data from the page as soon as it is "sent".
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  form.addEventListener('reset', () => {
    // Runs before the browser clears the values, so wait one tick.
    setTimeout(() => {
      touched.clear();
      refresh(fieldNames());
      summary.hidden = true;
      summary.textContent = '';
      updateConditionalFields();
      updateCounter();
    });
  });

  document.getElementById('form-restart')?.addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    form.elements.first_name.focus();
  });

  updateConditionalFields();
  updateCounter();
}

/** Shows a conditional group; when hidden, its fields are cleared and disabled. */
function toggleGroup(group, visible) {
  if (!group) return;
  group.hidden = !visible;
  for (const control of group.querySelectorAll('input, select, textarea')) {
    control.disabled = !visible;
    if (!visible) control.value = '';
  }
}

/** Helps native date pickers match the validation rules. */
function setDateLimits(form) {
  const today = new Date();
  const { min, max } = preferredDateRange(today);
  form.elements.preferred_date.min = toISODate(min);
  form.elements.preferred_date.max = toISODate(max);
  form.elements.date_of_birth.max = toISODate(today);
}
