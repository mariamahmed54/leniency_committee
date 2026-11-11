const LOW_AVERAGE = 40;
const HIGH_AVERAGE = 50;      // exclusive, so 49.5 still counts
const LENIENCY_POINTS = 5;
const MIN_ATTENDANCE = 75;
const PASS_MARK = 50;
const STORAGE_KEY = "students";

const BOOTSTRAP_LTR = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
const BOOTSTRAP_RTL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css";

class Student {
  #name;
  #grade1;
  #grade2;
  #grade3;
  #attendance;

  constructor(name, grade1, grade2, grade3, attendance) {
    this.name = name;
    this.grade1 = grade1;
    this.grade2 = grade2;
    this.grade3 = grade3;
    this.attendance = attendance;
  }

  // Builds an error that remembers which field caused it.
  #makeError(field, message) {
    const error = new Error(message);
    error.field = field;
    return error;
  }

  // Shared check for every numeric field: not empty, a real number, 0-100.
  #checkPercent(field, value) {
    const label = t("field_" + field);
    if (value === "" || value === null || value === undefined) {
      throw this.#makeError(field, t("errRequired", { field: label }));
    }
    const number = Number(value);
    if (Number.isNaN(number)) {
      throw this.#makeError(field, t("errNumber", { field: label }));
    }
    if (number < 0 || number > 100) {
      throw this.#makeError(field, t("errRange", { field: label }));
    }
    return number;
  }

  get name() { return this.#name; }
  set name(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw this.#makeError("name", t("errRequired", { field: t("field_name") }));
    }
    this.#name = value.trim();
  }

  get grade1() { return this.#grade1; }
  set grade1(value) { this.#grade1 = this.#checkPercent("grade1", value); }

  get grade2() { return this.#grade2; }
  set grade2(value) { this.#grade2 = this.#checkPercent("grade2", value); }

  get grade3() { return this.#grade3; }
  set grade3(value) { this.#grade3 = this.#checkPercent("grade3", value); }

  get attendance() { return this.#attendance; }
  set attendance(value) { this.#attendance = this.#checkPercent("attendance", value); }

  get average() {
    return (this.#grade1 + this.#grade2 + this.#grade3) / 3;
  }

  // Private fields are skipped by JSON.stringify, so spell them out.
  toJSON() {
    return {
      name: this.#name,
      grade1: this.#grade1,
      grade2: this.#grade2,
      grade3: this.#grade3,
      attendance: this.#attendance
    };
  }
}

const studentsList = [];
let committeeRan = false;

const inputs = {
  name: document.getElementById("studentName"),
  grade1: document.getElementById("grade1"),
  grade2: document.getElementById("grade2"),
  grade3: document.getElementById("grade3"),
  attendance: document.getElementById("attendance")
};

const addBtn = document.getElementById("addBtn");
const committeeBtn = document.getElementById("committeeBtn");
const clearBtn = document.getElementById("clearBtn");
const langBtn = document.getElementById("langBtn");
const bootstrapCss = document.getElementById("bootstrapCss");

const errorBox = document.getElementById("errorBox");
const studentsBox = document.getElementById("studentsBox");
const reportBox = document.getElementById("reportBox");

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function saveStudents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studentsList));
  } catch (e) {
    // storage full or blocked, the app still works without it
  }
}

function loadStudents() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    saved.forEach(item => {
      try {
        studentsList.push(
          new Student(item.name, item.grade1, item.grade2, item.grade3, item.attendance)
        );
      } catch (e) {
        // skip a record that no longer passes validation
      }
    });
  } catch (e) {
    // nothing saved yet, or the data was unreadable
  }
}

function getStatus(average) {
  if (average >= PASS_MARK) return { label: t("statusPass"), css: "text-bg-success" };
  if (average >= LOW_AVERAGE) return { label: t("statusRisk"), css: "text-bg-warning" };
  return { label: t("statusFail"), css: "text-bg-danger" };
}

function renderStudents() {
  if (studentsList.length === 0) {
    studentsBox.innerHTML = `<p class="text-muted mb-0">${t("noStudents")}</p>`;
    clearBtn.disabled = true;
    return;
  }

  clearBtn.disabled = false;
  studentsBox.innerHTML = studentsList
    .map((student, index) => {
      const status = getStatus(student.average);
      return `
        <div class="student-row">
          <span class="student-name">${escapeHtml(student.name)}</span>
          <span class="text-muted small">${t("average")}: ${student.average.toFixed(1)}</span>
          <span class="badge ${status.css}">${status.label}</span>
          <button type="button" class="btn btn-sm btn-outline-danger" data-index="${index}">${t("btnDelete")}</button>
        </div>`;
    })
    .join("");
}

function renderReport() {
  if (!committeeRan) {
    reportBox.innerHTML = `<p class="text-muted mb-0">${t("reportHint")}</p>`;
    return;
  }

  if (studentsList.length === 0) {
    reportBox.innerHTML = `<p class="mb-0">${t("reportAddFirst")}</p>`;
    return;
  }

  const inRange = studentsList.filter(s => s.average >= LOW_AVERAGE && s.average < HIGH_AVERAGE);
  const struggling = inRange.filter(s => s.attendance >= MIN_ATTENDANCE);
  const excluded = inRange.length - struggling.length;

  const adjusted = struggling.map(s => ({
    name: s.name,
    average: s.average + LENIENCY_POINTS
  }));

  const total = adjusted.reduce((sum, s) => sum + s.average, 0);
  const overall = adjusted.length > 0 ? total / adjusted.length : 0;

  const excludedNote = excluded > 0
    ? `<p class="text-muted small mb-0 mt-3">${t("reportExcluded", { n: excluded, min: MIN_ATTENDANCE })}</p>`
    : "";

  if (adjusted.length === 0) {
    reportBox.innerHTML = `
      <p class="mb-0">${t("reportNone", { low: LOW_AVERAGE, high: HIGH_AVERAGE - 1 })}</p>
      ${excludedNote}`;
    return;
  }

  reportBox.innerHTML = `
    <p>${t("reportReviewed")} <strong>${adjusted.length}</strong></p>
    <ul class="report-names">
      ${adjusted.map(s => `<li>${escapeHtml(s.name)} (${s.average.toFixed(1)})</li>`).join("")}
    </ul>
    <div>${t("reportOverall")}</div>
    <div class="report-average">${overall.toFixed(1)}</div>
    ${excludedNote}
  `;
}

function listChanged() {
  committeeRan = false;
  saveStudents();
  renderStudents();
  renderReport();
}

function clearInvalid() {
  Object.values(inputs).forEach(input => input.classList.remove("is-invalid"));
}

function clearInputs() {
  Object.values(inputs).forEach(input => { input.value = ""; });
  inputs.name.focus();
}

function applyLanguage() {
  const arabic = currentLang === "ar";
  document.documentElement.lang = currentLang;
  document.documentElement.dir = arabic ? "rtl" : "ltr";
  bootstrapCss.href = arabic ? BOOTSTRAP_RTL : BOOTSTRAP_LTR;
  document.title = t("pageTitle");

  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  langBtn.textContent = t("langButton");

  errorBox.textContent = "";
  clearInvalid();
  renderStudents();
  renderReport();
}

addBtn.onclick = function () {
  clearInvalid();
  try {
    const student = new Student(
      inputs.name.value,
      inputs.grade1.value,
      inputs.grade2.value,
      inputs.grade3.value,
      inputs.attendance.value
    );

    studentsList.push(student);
    listChanged();
    clearInputs();
    errorBox.textContent = "";
  } catch (error) {
    errorBox.textContent = error.message;
    const badInput = inputs[error.field];
    if (badInput) {
      badInput.classList.add("is-invalid");
      badInput.focus();
    }
  }
};

committeeBtn.onclick = function () {
  committeeRan = true;
  renderReport();
};

clearBtn.onclick = function () {
  studentsList.length = 0;
  listChanged();
};

studentsBox.addEventListener("click", event => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;
  studentsList.splice(Number(button.dataset.index), 1);
  listChanged();
});

Object.values(inputs).forEach(input => {
  input.addEventListener("input", () => input.classList.remove("is-invalid"));
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") addBtn.click();
  });
});

langBtn.onclick = function () {
  currentLang = currentLang === "en" ? "ar" : "en";
  try {
    localStorage.setItem("lang", currentLang);
  } catch (e) {
    // ignore, the choice just won't be remembered
  }
  applyLanguage();
};

loadStudents();
applyLanguage();
