/* ==========================================================================
   Twin Cities Animal Rescue — script.js
   Touchstone 4: Interactivity and Client-Side Data

   Feature:   Volunteer Interest Tracker (services.html)
              Visitors mark the volunteer roles they are interested in.
              The list updates live, is saved to localStorage, and is
              carried into the Contact form so the interest form is
              pre-filled when they arrive.
   Validation: JavaScript checks on the Contact form with messages shown
              next to each field.
   Storage:   localStorage — selected roles, plus the visitor's name and
              email so the form is pre-filled on a return visit.
   ========================================================================== */

"use strict";

/* ---------- Data ---------- */

// Array of role objects: the single source of truth for volunteer roles.
const ROLES = [
  { id: "dog-walker",   name: "Dog Walker",                     commitment: "4 hrs/month" },
  { id: "cat-social",   name: "Cat Socializer",                 commitment: "4 hrs/month" },
  { id: "event-helper", name: "Adoption Event Helper",          commitment: "Weekends" },
  { id: "transport",    name: "Transport Driver",               commitment: "Flexible" },
  { id: "photo",        name: "Photographer and Storyteller",   commitment: "Flexible" },
  { id: "outreach",     name: "Community Outreach Ambassador",  commitment: "Events" }
];

// Object of localStorage keys so they are only spelled out once.
const STORAGE_KEYS = {
  roles: "tcar-selected-roles",
  name:  "tcar-visitor-name",
  email: "tcar-visitor-email"
};

// Array of validation rule objects for the Contact form.
// Each rule names a field, a test function, and the message to show.
const VALIDATION_RULES = [
  {
    field: "full-name",
    test: (value) => value.trim().length >= 2,
    message: "Please enter your full name (at least 2 characters)."
  },
  {
    field: "email",
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()),
    message: "Please enter a valid email address, such as name@example.com."
  },
  {
    field: "interest",
    test: (value) => value !== "",
    message: "Please choose how you would like to help."
  },
  {
    field: "availability",
    test: (value) => value !== "",
    message: "Please select your availability."
  },
  {
    field: "hours-per-month",
    test: (value) => value === "" || (Number(value) >= 1 && Number(value) <= 160),
    message: "Hours per month must be a number between 1 and 160."
  },
  {
    field: "message",
    test: (value) => value.trim().length >= 10 && value.trim().length <= 500,
    message: "Your message should be between 10 and 500 characters."
  }
];

/* ---------- Storage helpers ---------- */

function loadSelectedRoles() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.roles);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveSelectedRoles(roleIds) {
  localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(roleIds));
}

function getRoleById(roleId) {
  return ROLES.find((role) => role.id === roleId);
}

/* ---------- Feature: Volunteer Interest Tracker (services.html) ---------- */

function toggleRole(roleId) {
  let selected = loadSelectedRoles();
  if (selected.includes(roleId)) {
    selected = selected.filter((id) => id !== roleId);
  } else {
    selected.push(roleId);
  }
  saveSelectedRoles(selected);
  renderRoleButtons();
  renderInterestSummary();
}

function renderRoleButtons() {
  const selected = loadSelectedRoles();
  const buttons = document.querySelectorAll(".interest-btn");
  buttons.forEach((button) => {
    const isSelected = selected.includes(button.dataset.role);
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
    button.textContent = isSelected ? "✓ Added to my list" : "+ I'm interested";
  });
}

function renderInterestSummary() {
  const summary = document.getElementById("interest-summary");
  if (!summary) {
    return;
  }

  const selected = loadSelectedRoles();
  const heading = `<h3>My Volunteer Interest List (${selected.length})</h3>`;

  if (selected.length === 0) {
    summary.innerHTML =
      heading +
      `<p>You have not added any roles yet. Click <strong>+ I'm interested</strong> under a role above to start your list.</p>`;
    return;
  }

  const items = selected
    .map((id) => getRoleById(id))
    .filter(Boolean)
    .map(
      (role) =>
        `<li>${role.name} <span class="commitment">(${role.commitment})</span>
           <button type="button" class="remove-btn" data-role="${role.id}" aria-label="Remove ${role.name}">Remove</button>
         </li>`
    )
    .join("");

  summary.innerHTML =
    heading +
    `<ul class="interest-list">${items}</ul>
     <p><a class="cta-link" href="contact.html">Continue to the interest form →</a>
     <button type="button" id="clear-roles" class="link-btn">Clear list</button></p>`;
}

function initInterestTracker() {
  const roleList = document.querySelector("#volunteer dl");
  if (!roleList) {
    return;
  }

  // Add an "I'm interested" button under each role description.
  const descriptions = roleList.querySelectorAll("dd");
  descriptions.forEach((dd, index) => {
    const role = ROLES[index];
    if (!role) {
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "interest-btn";
    button.dataset.role = role.id;
    button.addEventListener("click", () => toggleRole(role.id));
    dd.appendChild(button);
  });

  // Create the live summary panel after the role list.
  const summary = document.createElement("div");
  summary.id = "interest-summary";
  summary.className = "interest-summary";
  summary.setAttribute("aria-live", "polite");
  roleList.insertAdjacentElement("afterend", summary);

  // Handle Remove and Clear clicks inside the summary (event delegation).
  summary.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-btn")) {
      toggleRole(event.target.dataset.role);
    } else if (event.target.id === "clear-roles") {
      saveSelectedRoles([]);
      renderRoleButtons();
      renderInterestSummary();
    }
  });

  renderRoleButtons();
  renderInterestSummary();
}

/* ---------- Home page: show saved list count (index.html) ---------- */

function initHomeReminder() {
  const helpHeading = document.getElementById("help-heading");
  if (!helpHeading) {
    return;
  }
  const selected = loadSelectedRoles();
  if (selected.length === 0) {
    return;
  }
  const names = selected.map((id) => getRoleById(id)).filter(Boolean).map((r) => r.name);
  const note = document.createElement("p");
  note.className = "saved-note";
  note.innerHTML =
    `Welcome back! You have <strong>${selected.length}</strong> volunteer role${selected.length === 1 ? "" : "s"} saved: ${names.join(", ")}. ` +
    `<a href="contact.html">Finish your interest form</a>.`;
  helpHeading.insertAdjacentElement("afterend", note);
}

/* ---------- Contact form: pre-fill from storage ---------- */

function prefillFromStorage(form) {
  const nameField = form.querySelector("#full-name");
  const emailField = form.querySelector("#email");
  const interestField = form.querySelector("#interest");
  const messageField = form.querySelector("#message");

  const savedName = localStorage.getItem(STORAGE_KEYS.name);
  const savedEmail = localStorage.getItem(STORAGE_KEYS.email);
  if (savedName) {
    nameField.value = savedName;
  }
  if (savedEmail) {
    emailField.value = savedEmail;
  }

  const selected = loadSelectedRoles();
  if (selected.length > 0) {
    const names = selected.map((id) => getRoleById(id)).filter(Boolean).map((r) => r.name);
    interestField.value = "volunteer";
    if (messageField.value.trim() === "") {
      messageField.value = `I am interested in these volunteer roles: ${names.join(", ")}.`;
    }
    showSavedRolesNotice(form, names);
  }
}

function showSavedRolesNotice(form, names) {
  const notice = document.createElement("p");
  notice.className = "saved-note";
  notice.id = "saved-roles-notice";
  notice.innerHTML =
    `We pre-filled this form with the <strong>${names.length}</strong> role${names.length === 1 ? "" : "s"} you saved on the Services page: ${names.join(", ")}.`;
  form.insertAdjacentElement("beforebegin", notice);
}

function rememberContactDetails(form) {
  form.querySelector("#full-name").addEventListener("input", (event) => {
    localStorage.setItem(STORAGE_KEYS.name, event.target.value);
  });
  form.querySelector("#email").addEventListener("input", (event) => {
    localStorage.setItem(STORAGE_KEYS.email, event.target.value);
  });
}

/* ---------- Contact form: validation ---------- */

function showError(field, message) {
  const errorElement = document.getElementById(`${field.id}-error`);
  field.classList.add("is-invalid");
  field.setAttribute("aria-invalid", "true");
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearError(field) {
  const errorElement = document.getElementById(`${field.id}-error`);
  field.classList.remove("is-invalid");
  field.removeAttribute("aria-invalid");
  if (errorElement) {
    errorElement.textContent = "";
  }
}

function validateField(rule, form) {
  const field = form.querySelector(`#${rule.field}`);
  if (!field) {
    return true;
  }
  if (rule.test(field.value)) {
    clearError(field);
    return true;
  }
  showError(field, rule.message);
  return false;
}

function validateExperience(form) {
  const chosen = form.querySelector('input[name="experience"]:checked');
  const errorElement = document.getElementById("experience-error");
  if (!chosen) {
    errorElement.textContent = "Please select your experience level with pets.";
    return false;
  }
  errorElement.textContent = "";
  return true;
}

function validateAgeConfirm(form) {
  const checkbox = form.querySelector("#age-confirm");
  const errorElement = document.getElementById("age-confirm-error");
  if (!checkbox.checked) {
    errorElement.textContent = "You must confirm that you are 16 or older.";
    return false;
  }
  errorElement.textContent = "";
  return true;
}

function validateForm(form) {
  const results = VALIDATION_RULES.map((rule) => validateField(rule, form));
  results.push(validateExperience(form));
  results.push(validateAgeConfirm(form));
  return results.every((passed) => passed === true);
}

function addErrorContainers(form) {
  // Add an empty error <span> after every field so messages appear next to it.
  const fields = form.querySelectorAll(
    'input[type="text"], input[type="email"], input[type="number"], select, textarea'
  );
  fields.forEach((field) => {
    const span = document.createElement("span");
    span.className = "error-message";
    span.id = `${field.id}-error`;
    span.setAttribute("aria-live", "polite");
    field.insertAdjacentElement("afterend", span);
    field.setAttribute("aria-describedby", span.id);
  });

  // Group-level error containers for the radio group and the checkbox.
  const experienceFieldset = Array.from(form.querySelectorAll("fieldset")).find((fs) =>
    fs.querySelector('input[name="experience"]')
  );
  if (experienceFieldset) {
    const span = document.createElement("span");
    span.className = "error-message";
    span.id = "experience-error";
    span.setAttribute("aria-live", "polite");
    experienceFieldset.appendChild(span);
  }

  const ageCheckbox = form.querySelector("#age-confirm");
  if (ageCheckbox) {
    const span = document.createElement("span");
    span.className = "error-message";
    span.id = "age-confirm-error";
    span.setAttribute("aria-live", "polite");
    ageCheckbox.closest("p").appendChild(span);
  }
}

function showSuccess(form) {
  const name = form.querySelector("#full-name").value.trim();
  const interestField = form.querySelector("#interest");
  const interestLabel = interestField.options[interestField.selectedIndex].text;

  const success = document.createElement("div");
  success.className = "success-message";
  success.setAttribute("role", "status");
  success.innerHTML =
    `<h3>Thank you, ${name}!</h3>
     <p>Your <strong>${interestLabel}</strong> interest form has been received. A coordinator will contact you within two business days.</p>`;
  form.insertAdjacentElement("beforebegin", success);
  form.hidden = true;

  // The inquiry is sent, so clear the saved role list for next time.
  saveSelectedRoles([]);
  success.scrollIntoView({ behavior: "smooth", block: "center" });
}

function initContactForm() {
  const form = document.querySelector("form");
  if (!form || !form.querySelector("#interest")) {
    return;
  }

  // Let JavaScript handle validation so our messages are the ones shown.
  form.setAttribute("novalidate", "");

  addErrorContainers(form);
  prefillFromStorage(form);
  rememberContactDetails(form);

  // Re-check a field as soon as the user leaves it, so errors clear quickly.
  VALIDATION_RULES.forEach((rule) => {
    const field = form.querySelector(`#${rule.field}`);
    if (field) {
      field.addEventListener("blur", () => validateField(rule, form));
      field.addEventListener("input", () => {
        if (field.classList.contains("is-invalid")) {
          validateField(rule, form);
        }
      });
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (validateForm(form)) {
      showSuccess(form);
    } else {
      const firstInvalid = form.querySelector(".is-invalid, input:invalid");
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  });

  form.addEventListener("reset", () => {
    form.querySelectorAll(".error-message").forEach((el) => (el.textContent = ""));
    form.querySelectorAll(".is-invalid").forEach((el) => clearError(el));
  });
}

/* ---------- Start ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initInterestTracker();
  initHomeReminder();
  initContactForm();
});
