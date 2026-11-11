const translations = {
  en: {
    pageTitle: "Leniency Committee",
    pageSubtitle: "Register students, then review the ones who narrowly missed passing.",
    studentDetails: "Student details",
    label_name: "Name",
    label_grade1: "Subject 1",
    label_grade2: "Subject 2",
    label_grade3: "Subject 3",
    label_attendance: "Attendance (%)",
    namePlaceholder: "Full name",
    field_name: "Student name",
    field_grade1: "Subject 1 grade",
    field_grade2: "Subject 2 grade",
    field_grade3: "Subject 3 grade",
    field_attendance: "Attendance",
    btnAdd: "Add Student",
    btnCommittee: "Activate Leniency Committee",
    btnClear: "Clear all",
    btnDelete: "Delete",
    registeredStudents: "Registered students",
    noStudents: "No students added yet.",
    finalReport: "Final report",
    reportHint: "Run the committee to see the report.",
    average: "Average",
    statusPass: "Passing",
    statusRisk: "At risk",
    statusFail: "Failing",
    errRequired: "{field} is required.",
    errNumber: "{field} must be a number.",
    errRange: "{field} must be between 0 and 100.",
    reportAddFirst: "Add at least one student first.",
    reportNone: "No eligible students have an average between {low} and {high}.",
    reportReviewed: "Students reviewed:",
    reportExcluded: "{n} student(s) left out because attendance is below {min}%.",
    reportOverall: "Overall average after leniency",
    langButton: "العربية"
  },
  ar: {
    pageTitle: "لجنة الرأفة",
    pageSubtitle: "سجّل الطلاب ثم راجع حالة من أخفقوا في النجاح بفارق بسيط.",
    studentDetails: "بيانات الطالب",
    label_name: "الاسم",
    label_grade1: "المادة الأولى",
    label_grade2: "المادة الثانية",
    label_grade3: "المادة الثالثة",
    label_attendance: "نسبة الحضور (%)",
    namePlaceholder: "الاسم بالكامل",
    field_name: "اسم الطالب",
    field_grade1: "درجة المادة الأولى",
    field_grade2: "درجة المادة الثانية",
    field_grade3: "درجة المادة الثالثة",
    field_attendance: "نسبة الحضور",
    btnAdd: "إضافة طالب",
    btnCommittee: "تفعيل لجنة الرأفة",
    btnClear: "مسح الكل",
    btnDelete: "حذف",
    registeredStudents: "الطلاب المسجّلون",
    noStudents: "لم تتم إضافة أي طالب بعد.",
    finalReport: "التقرير النهائي",
    reportHint: "فعّل اللجنة لعرض التقرير.",
    average: "المعدل",
    statusPass: "ناجح",
    statusRisk: "مهدد",
    statusFail: "راسب",
    errRequired: "{field} مطلوب.",
    errNumber: "يجب أن يكون {field} رقمًا.",
    errRange: "يجب أن يكون {field} بين 0 و100.",
    reportAddFirst: "أضف طالبًا واحدًا على الأقل أولًا.",
    reportNone: "لا يوجد طلاب مؤهلون معدلهم بين {low} و{high}.",
    reportReviewed: "عدد الطلاب المشمولين:",
    reportExcluded: "تم استبعاد {n} طالب بسبب أن حضورهم أقل من {min}%.",
    reportOverall: "المعدل العام بعد الرأفة",
    langButton: "English"
  }
};

let currentLang = "en";
try {
  const saved = localStorage.getItem("lang");
  if (saved && translations[saved]) currentLang = saved;
} catch (e) {
  // storage unavailable, keep the default
}

function t(key, params = {}) {
  let text = translations[currentLang][key] ?? key;
  Object.entries(params).forEach(([name, value]) => {
    text = text.replace(`{${name}}`, value);
  });
  return text;
}
