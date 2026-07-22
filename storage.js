// ==========================================
// storage.js
// Speichert SAP-Prüfungen lokal im Browser
// ==========================================

const STORAGE_KEY = "sap_exams";

// ==========================================
// Alle Prüfungen laden
// ==========================================

function loadExams() {

    const data = localStorage.getItem(STORAGE_KEY);

    if (!data)
        return [];

    try {

        return JSON.parse(data);

    } catch {

        return [];

    }

}

// ==========================================
// Alle Prüfungen speichern
// ==========================================

function saveAllExams(exams) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(exams)
    );

}

// ==========================================
// Einzelne SAP speichern
// ==========================================

function saveExam(
    student,
    examiner,
    points,
    maxPoints,
    percent,
    passed,
    startTime,
    endTime,
    duration,
    mistakes
) {

    const exams = loadExams();

    exams.unshift({

        id: Date.now(),

        student,

        examiner,

        points,

        maxPoints,

        percent,

        passed,

        startTime,

        endTime,

        duration,

        mistakes,

        created: new Date().toLocaleString("de-DE")

    });

    saveAllExams(exams);

}

// ==========================================
// Alle gespeicherten SAPs
// ==========================================

function getSavedExams() {

    return loadExams();

}

// ==========================================
// Eine SAP löschen
// ==========================================

function deleteExam(id) {

    let exams = loadExams();

    exams = exams.filter(exam => exam.id !== id);

    saveAllExams(exams);

}

// ==========================================
// Alle SAPs löschen
// ==========================================

function clearAllExams() {

    if (!confirm("Alle gespeicherten SAPs löschen?"))
        return;

    localStorage.removeItem(STORAGE_KEY);

}

// ==========================================
// SAP anhand der ID laden
// ==========================================

function getExam(id) {

    const exams = loadExams();

    return exams.find(exam => exam.id === id);

}

// ==========================================
// Anzahl gespeicherter Prüfungen
// ==========================================

function getExamCount() {

    return loadExams().length;

}
