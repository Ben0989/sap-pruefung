// ==========================
// SAP Prüfungsgenerator
// app.js
// Teil 1
// ==========================

let exam = [];
let currentQuestion = 0;
let reachedPoints = 0;
let maxPoints = 0;

// ==========================
// Prüfung starten
// ==========================

function startExam() {

    const student = document.getElementById("studentName");

    if (student.value.trim() === "") {
        alert("Bitte zuerst den Namen des Prüflings eingeben.");
        student.focus();
        return;
    }

    exam = generateExam();

    currentQuestion = 0;
    reachedPoints = 0;

    maxPoints = exam.reduce((sum, q) => sum + q.points, 0);

    showQuestion();
}

// ==========================
// Aktuelle Frage anzeigen
// ==========================

function showQuestion() {

    const q = exam[currentQuestion];

    document.getElementById("counter").innerText =
        `Frage ${currentQuestion + 1} / ${exam.length}`;

    document.getElementById("category").innerText =
        q.category;

    document.getElementById("question").innerText =
        q.question;

    const situation = document.getElementById("situation");

    if (q.situation) {

        situation.style.display = "block";
        situation.innerText = q.situation;

    } else {

        situation.style.display = "none";

    }

    const answer = document.getElementById("answer");

    answer.innerText = q.answer;
    answer.style.display = "none";

    createCheckboxes(q.points);
}

// ==========================
// Checkboxen erzeugen
// ==========================

function createCheckboxes(points) {

    const div = document.getElementById("checkboxes");

    div.innerHTML = "";

    for (let i = 1; i <= points; i++) {

        const label = document.createElement("label");

        label.style.display = "block";
        label.style.marginBottom = "10px";

        label.innerHTML = `
            <input type="checkbox" class="point">
            Punkt ${i}
        `;

        div.appendChild(label);
    }

}

// ==========================
// Musterlösung anzeigen
// ==========================

function showAnswer() {

    document.getElementById("answer").style.display = "block";

}

// ==========================
// Punkte übernehmen
// ==========================

function collectPoints() {

    const checks =
        document.querySelectorAll(".point");

    let points = 0;

    checks.forEach(c => {

        if (c.checked)
            points++;

    });

    reachedPoints += points;

}
// ==========================
// Nächste Frage
// ==========================

function nextQuestion() {

    if (exam.length === 0)
        return;

    collectPoints();

    currentQuestion++;

    if (currentQuestion >= exam.length) {

        finishExam();
        return;

    }

    showQuestion();

}

// ==========================
// Prüfung abschließen
// ==========================

function finishExam() {

    const percent = Math.round((reachedPoints / maxPoints) * 100);

    const passed = percent >= 80;

    let color = "#c62828";
    let text = "NICHT BESTANDEN";

    if (passed) {

        color = "#2e7d32";
        text = "BESTANDEN";

    }
    saveExam(
    document.getElementById("studentName").value,
    reachedPoints,
    maxPoints,
    percent,
    passed
);

    document.body.innerHTML = `

    <div style="max-width:700px;margin:60px auto;font-family:Arial;padding:30px;text-align:center;">

        <h1>SAP Prüfung abgeschlossen</h1>

        <hr>

        <h2>Prüfling</h2>

        <p style="font-size:24px;">
            ${document.getElementById("studentName").value}
        </p>

        <br>

        <h2>Punkte</h2>

        <p style="font-size:32px;font-weight:bold;">
            ${reachedPoints} / ${maxPoints}
        </p>

        <br>

        <h2>Ergebnis</h2>

        <p style="font-size:40px;font-weight:bold;color:${color};">
            ${percent} %
        </p>

        <h1 style="color:${color};">
            ${text}
        </h1>

        <br><br>

        <button
            onclick="location.reload()"
            style="
                padding:15px 30px;
                font-size:20px;
                cursor:pointer;
            ">

            Neue SAP starten

        </button>

    </div>

    `;

}

// ==========================
// ENTER startet Prüfung
// ==========================

window.addEventListener("load", () => {

    const input = document.getElementById("studentName");

    if (input) {

        input.addEventListener("keypress", function (e) {

            if (e.key === "Enter") {

                startExam();

            }

        });

    }

});

// ==========================
// Sicherheitsprüfung
// ==========================

window.onerror = function (msg, url, line) {

    console.error("Fehler:", msg);

};
