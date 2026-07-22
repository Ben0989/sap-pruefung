// ==========================================
// SAP Prüfungsgenerator v2
// app.js
// Teil 1/4
// ==========================================

let exam = [];
let currentQuestion = 0;

let reachedPoints = 0;
let maxPoints = 0;

let startTime = null;
let endTime = null;

let studentName = "";
let examinerName = "";

let answersGiven = [];

// ==========================================
// Prüfung starten
// ==========================================

function startExam() {

    const student =
        document.getElementById("studentName");

    if (student.value.trim() === "") {

        alert("Bitte den Namen des Prüflings eingeben.");

        student.focus();

        return;

    }

    studentName = student.value.trim();

    examinerName = prompt(
        "Name des Prüfers:"
    ) || "Nicht angegeben";

    startTime = new Date();

    exam = generateExam();

    currentQuestion = 0;

    reachedPoints = 0;

    answersGiven = [];

    maxPoints = 0;

    exam.forEach(q => {

        maxPoints += q.answers.length;

    });

    document
        .getElementById("startBtn")
        .disabled = true;

    document
        .getElementById("backBtn")
        .disabled = false;

    document
        .getElementById("nextBtn")
        .disabled = false;

    showQuestion();

}

// ==========================================
// Frage anzeigen
// ==========================================

function showQuestion() {

    const q = exam[currentQuestion];

    document
        .getElementById("counter")
        .innerText =
        `Frage ${currentQuestion + 1} / ${exam.length}`;

    document
        .getElementById("category")
        .innerText =
        q.category;

    document
        .getElementById("question")
        .innerText =
        q.question;

    const situation =
        document.getElementById("situation");

    if (q.situation) {

        situation.style.display = "block";

        situation.innerText =
            q.situation;

    } else {

        situation.style.display = "none";

    }

    createCheckboxes(q);

    updateButtons();

}

// ==========================================
// Checkboxen erzeugen
// ==========================================

function createCheckboxes(question) {

    const div =
        document.getElementById("checkboxes");

    div.innerHTML = "";

    const saved =
        answersGiven[currentQuestion] || [];

    question.answers.forEach((text, index) => {

        const row =
            document.createElement("div");

        row.className = "answerItem";

        const checked =
            saved.includes(index)
            ? "checked"
            : "";

        row.innerHTML = `

<label>

<input
type="checkbox"
value="${index}"
${checked}>

${text}

</label>

`;

        div.appendChild(row);

    });

}
// ==========================================
// Antworten speichern
// ==========================================

function saveCurrentAnswer() {

    const checked = [];

    document
        .querySelectorAll("#checkboxes input")
        .forEach(box => {

            if (box.checked) {

                checked.push(
                    Number(box.value)
                );

            }

        });

    answersGiven[currentQuestion] = checked;

}

// ==========================================
// Buttons aktualisieren
// ==========================================

function updateButtons() {

    const back =
        document.getElementById("backBtn");

    const next =
        document.getElementById("nextBtn");

    back.disabled =
        currentQuestion === 0;

    if (currentQuestion === exam.length - 1) {

        next.innerText =
            "✅ SAP bewerten";

    } else {

        next.innerText =
            "Weiter →";

    }

}

// ==========================================
// Vorherige Frage
// ==========================================

function previousQuestion() {

    if (currentQuestion === 0)
        return;

    saveCurrentAnswer();

    currentQuestion--;

    showQuestion();

}

// ==========================================
// Nächste Frage
// ==========================================

function nextQuestion() {

    saveCurrentAnswer();

    if (currentQuestion === exam.length - 1) {

        finishExam();

        return;

    }

    currentQuestion++;

    showQuestion();

}

// ==========================================
// Punkte berechnen
// ==========================================

function calculatePoints() {

    reachedPoints = 0;

    exam.forEach((question, index) => {

        const given =
            answersGiven[index] || [];

        reachedPoints += given.length;

    });

}

// ==========================================
// Fehler sammeln
// ==========================================

function getMistakes() {

    const mistakes = [];

    exam.forEach((question, index) => {

        const given =
            answersGiven[index] || [];

        const missing = [];

        question.answers.forEach((answer, i) => {

            if (!given.includes(i)) {

                missing.push(answer);

            }

        });

        if (missing.length > 0) {

            mistakes.push({

                number: index + 1,

                category: question.category,

                question: question.question,

                missing

            });

        }

    });

    return mistakes;

}
// ==========================================
// Prüfung abschließen
// ==========================================

function finishExam() {

    saveCurrentAnswer();

    calculatePoints();

    endTime = new Date();

    const percent =
        Math.round(
            (reachedPoints / maxPoints) * 100
        );

    const passed =
        percent >= 80;

    const mistakes =
        getMistakes();

    const duration =
        Math.round(
            (endTime - startTime) / 60000
        );

    saveExam(

        studentName,

        reachedPoints,

        maxPoints,

        percent,

        passed

    );

    let errorHTML = "";

    if (mistakes.length === 0) {

        errorHTML = `

<h2>Fehlerübersicht</h2>

<p>Keine Fehler 🎉</p>

`;

    }

    else {

        mistakes.forEach(item => {

            errorHTML += `

<div class="errorCard">

<h3>

Frage ${item.number}

</h3>

<p>

<strong>${item.category}</strong>

</p>

<p>

${item.question}

</p>

<p>

<b>Fehlende Antworten</b>

</p>

<ul>

`;

            item.missing.forEach(answer => {

                errorHTML += `

<li>

☐ ${answer}

</li>

`;

            });

            errorHTML += `

</ul>

</div>

`;

        });

    }

    document.body.innerHTML = `

<div class="resultContainer">

<div class="resultBox">

<h1 class="resultTitle">

SAP Prüfung abgeschlossen

</h1>

<hr>

<p class="resultInfo">

<b>Prüfling:</b>

${studentName}

</p>

<p class="resultInfo">

<b>Prüfer:</b>

${examinerName}

</p>

<p class="resultInfo">

<b>Datum:</b>

${startTime.toLocaleDateString("de-DE")}

</p>

<p class="resultInfo">

<b>Beginn:</b>

${startTime.toLocaleTimeString("de-DE")}

</p>

<p class="resultInfo">

<b>Ende:</b>

${endTime.toLocaleTimeString("de-DE")}

</p>

<p class="resultInfo">

<b>Dauer:</b>

${duration} Minuten

</p>

<hr>

<div class="resultScore">

${reachedPoints}

/

${maxPoints}

Punkte

<br><br>

${percent} %

</div>

<h1 class="${
passed ? "pass" : "fail"
}">

${passed ? "BESTANDEN" : "NICHT BESTANDEN"}

</h1>

<hr>

${errorHTML}

<div class="resultButtons">

<button onclick="location.reload()">

Neue SAP

</button>

</div>

</div>

</div>

`;

}
// ==========================================
// ENTER startet die Prüfung
// ==========================================

window.addEventListener("load", () => {

    const input = document.getElementById("studentName");

    if (!input)
        return;

    input.addEventListener("keypress", function (e) {

        if (e.key === "Enter") {

            startExam();

        }

    });

});

// ==========================================
// Hilfsfunktion
// ==========================================

function resetExam() {

    exam = [];
    currentQuestion = 0;

    reachedPoints = 0;
    maxPoints = 0;

    answersGiven = [];

    startTime = null;
    endTime = null;

}

// ==========================================
// Sicherheitsprüfung
// ==========================================

window.onerror = function (msg, url, line, column, error) {

    console.error(
        "SAP Fehler:",
        msg,
        "Zeile:",
        line
    );

    return false;

};
// ==========================================
// Gespeicherte SAPs anzeigen
// ==========================================

function showSavedExams() {

    const exams = getSavedExams();

    const list =
        document.getElementById("savedExamList");

    list.innerHTML = "";

    if (exams.length === 0) {

        list.innerHTML =
            "<p>Keine gespeicherten SAPs vorhanden.</p>";

    }

    exams.forEach(exam => {

        const card =
            document.createElement("div");

        card.className = "savedCard";

        card.innerHTML = `

<h3>${exam.student}</h3>

<p>

Prüfer:
${exam.examiner}

</p>

<p>

${exam.created}

</p>

<p>

${exam.points}/${exam.maxPoints}

(${exam.percent}%)

</p>

<p>

${exam.passed
? "✅ BESTANDEN"
: "❌ NICHT BESTANDEN"}

</p>

<button onclick="openSavedExam(${exam.id})">

Öffnen

</button>

<button onclick="removeSavedExam(${exam.id})">

Löschen

</button>

`;

        list.appendChild(card);

    });

    document.getElementById("savedExams").style.display =
        "block";

}
// ==========================================
// Gespeicherte SAP öffnen
// ==========================================

function openSavedExam(id) {

    const exam = getExam(id);

    if (!exam) {

        alert("SAP nicht gefunden.");

        return;

    }

    let html = `

<div class="resultContainer">

<div class="resultBox">

<h1>Gespeicherte SAP</h1>

<hr>

<p><b>Prüfling:</b> ${exam.student}</p>

<p><b>Prüfer:</b> ${exam.examiner}</p>

<p><b>Beginn:</b> ${exam.startTime}</p>

<p><b>Ende:</b> ${exam.endTime}</p>

<p><b>Dauer:</b> ${exam.duration} Minuten</p>

<hr>

<h2>

${exam.points}/${exam.maxPoints} Punkte

</h2>

<h2>

${exam.percent} %

</h2>

<h2 class="${exam.passed ? "pass" : "fail"}">

${exam.passed ? "BESTANDEN" : "NICHT BESTANDEN"}

</h2>

<hr>

<h2>Fehlerübersicht</h2>

`;

    if (exam.mistakes.length === 0) {

        html += "<p>Keine Fehler.</p>";

    } else {

        exam.mistakes.forEach(m => {

            html += `

<div class="errorCard">

<h3>Frage ${m.number}</h3>

<p><b>${m.category}</b></p>

<p>${m.question}</p>

<ul>

`;

            m.missing.forEach(answer => {

                html += `<li>☐ ${answer}</li>`;

            });

            html += `

</ul>

</div>

`;

        });

    }

    html += `

<br>

<button onclick="location.reload()">

Zurück

</button>

</div>

</div>

`;

    document.body.innerHTML = html;

}

// ==========================================
// Einzelne SAP löschen
// ==========================================

function removeSavedExam(id) {

    if (!confirm("Diese SAP löschen?"))
        return;

    deleteExam(id);

    showSavedExams();

}

// ==========================================
// Alle SAPs löschen
// ==========================================

function deleteAllExams() {

    if (!confirm("Wirklich alle SAPs löschen?"))
        return;

    clearAllExams();

    showSavedExams();

}

// ==========================================
// Übersicht schließen
// ==========================================

function hideSavedExams() {

    document.getElementById("savedExams").style.display = "none";

}
function showStatistics() {

    const exams = getSavedExams();

    if (exams.length === 0) {

        alert("Keine gespeicherten SAPs vorhanden.");

        return;

    }

    const total = exams.length;

    const passed = exams.filter(e => e.passed).length;

    const failed = total - passed;

    const averagePercent =
        Math.round(
            exams.reduce((a, b) => a + b.percent, 0) / total
        );

    const averagePoints =
        (
            exams.reduce((a, b) => a + b.points, 0) / total
        ).toFixed(1);

    const successRate =
        Math.round((passed / total) * 100);

    let html = `

<div class="resultContainer">

<div class="resultBox">

<h1>Schulstatistik</h1>

<hr>

<p><b>Durchgeführte SAPs:</b> ${total}</p>

<p><b>Bestanden:</b> ${passed}</p>

<p><b>Nicht bestanden:</b> ${failed}</p>

<p><b>Bestehensquote:</b> ${successRate}%</p>

<p><b>Ø Prozent:</b> ${averagePercent}%</p>

<p><b>Ø Punkte:</b> ${averagePoints}</p>

<hr>

<h2>Letzte Prüfungen</h2>

`;

    exams.slice(0, 10).forEach(exam => {

        html += `

<div class="savedCard">

<b>${exam.student}</b><br>

${exam.examiner}<br>

${exam.percent}%<br>

${exam.created}

</div>

`;

    });

    html += `

<br>

<button onclick="location.reload()">

Zurück

</button>

</div>

</div>

`;

    document.body.innerHTML = html;

}
// ==========================================
// Entwicklungsinfo
// ==========================================

console.log(
    "SAP Prüfungsgenerator v2 erfolgreich geladen."
);
