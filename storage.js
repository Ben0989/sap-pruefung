// ==========================
// storage.js
// SAP Prüfungsgenerator
// ==========================

const STORAGE_KEY = "sap_pruefungen";

// --------------------------
// Alle Prüfungen laden
// --------------------------

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

// --------------------------
// Alle Prüfungen speichern
// --------------------------

function saveExams(exams) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(exams)
    );

}

// --------------------------
// Eine Prüfung speichern
// --------------------------

function saveExam(student, points, maxPoints, percent, passed) {

    const exams = loadExams();

    exams.push({

        student,
        points,
        maxPoints,
        percent,
        passed,

        date: new Date().toLocaleString("de-DE")

    });

    saveExams(exams);

}

// --------------------------
// Alle Prüfungen löschen
// --------------------------

function deleteAllExams() {

    localStorage.removeItem(STORAGE_KEY);

}

// --------------------------
// Statistik berechnen
// --------------------------

function getStatistics() {

    const exams = loadExams();

    if (exams.length === 0) {

        return {

            total: 0,
            average: 0,
            passed: 0,
            failed: 0

        };

    }

    let sum = 0;
    let passed = 0;

    exams.forEach(exam => {

        sum += exam.percent;

        if (exam.passed)
            passed++;

    });

    return {

        total: exams.length,

        average: (
            sum / exams.length
        ).toFixed(1),

        passed,

        failed: exams.length - passed

    };

}

// --------------------------
// Einzelne Prüfung löschen
// --------------------------

function deleteExam(index) {

    const exams = loadExams();

    exams.splice(index, 1);

    saveExams(exams);

}

// --------------------------
// Konsole (Test)
// --------------------------

console.log("storage.js geladen");
