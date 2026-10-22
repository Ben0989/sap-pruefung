"use strict";

(() => {
    const app = document.getElementById("app");
    const notice = document.getElementById("notice");
    const number = new Intl.NumberFormat("de-DE", {maximumFractionDigits: 2});
    const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
    const fmt = value => number.format(value);
    let active = null;
    let currentResult = null;
    let resultSaved = false;
    let view = "home";
    let busy = false;
    let draftSafe = true;
    let draftError = false;
    let repeatQuestions = null;
    let defaults = {student: "", examiner: ""};

    function message(text, error = false) {
        notice.textContent = text;
        notice.hidden = !text;
        notice.classList.toggle("error", error);
    }
    function button(action, label, extra = "", cls = "") {
        return `<button type="button" data-action="${action}" class="${cls}" ${extra}>${label}</button>`;
    }
    function setView(next, html, focus = true) {
        view = next;
        app.innerHTML = html;
        document.querySelectorAll(".mainNav button").forEach(b => {
            const selected = b.dataset.action === (next === "result" ? "home" : next);
            if (selected) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
        });
        document.getElementById("homeNav").textContent = active ? (active.status === "active" ? "Laufende SAP" : "SAP-Ergebnis") : "Neue SAP";
        if (focus) {
            app.focus({preventScroll: true});
            window.scrollTo({top: Math.max(0, app.offsetTop - 20), behavior: "auto"});
        }
    }
    function time(value) {
        if (!value) return "Nicht erfasst";
        return /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString("de-DE") : value;
    }
    function duration(seconds) {
        if (seconds == null) return "Nicht erfasst";
        return `${Math.floor(seconds / 60)} Min. ${Math.floor(seconds % 60)} Sek.`;
    }
    function badge(record) {
        return `<span class="badge ${record.passed ? "pass" : "fail"}">${record.passed ? "Bestanden" : "Nicht bestanden"}</span>`;
    }
    function saveDraft() {
        if (!active) return;
        try {
            SAPStorage.saveDraft(active);
            draftSafe = true;
        } catch (error) {
            draftSafe = false;
            message(`${error.message} Der Prüfungsstand bleibt in dieser geöffneten Seite erhalten.`, true);
        }
        const status = document.getElementById("draftStatus");
        if (status) {
            status.textContent = draftSafe ? "Zwischenstand lokal gespeichert" : "Zwischenstand nur in dieser geöffneten Seite";
            status.classList.toggle("dangerText", !draftSafe);
        }
    }
    function home(focus = true) {
        if (active?.status === "completed") { showResult(currentResult || buildResult(active), resultSaved); return; }
        if (active) { showQuestion(); return; }
        const breakdown = Object.entries(SAPEngine.blueprint).map(([name, amount]) => `<li><span>${escape(name)}</span><strong>${amount}</strong></li>`).join("");
        setView("home", `<div class="pageHeading"><p class="eyebrow">PRÜFUNG DURCHFÜHREN</p><h2>${repeatQuestions ? "SAP wiederholen" : "Neue SAP"}</h2><p>Antworten des Prüflings bewerten. Jeder gesetzte Haken zählt einen Punkt.</p></div>
            ${draftError ? `<div class="panel warning"><h3>Unterbrochene Prüfung nicht lesbar</h3><p>Bitte sichere die Rohdaten, bevor du den beschädigten Zwischenstand verwirfst.</p><div class="actions">${button("raw-export", "Rohdaten sichern", "", "secondary")}${button("discard-broken", "Zwischenstand verwerfen", "", "danger")}</div></div>` : ""}
            <div class="homeGrid"><section class="panel"><h3>Prüfungsdaten</h3><form id="startForm">
            <label for="studentName">Name des Prüflings</label><input id="studentName" name="student" autocomplete="off" maxlength="120" required value="${escape(defaults.student)}" placeholder="Vor- und Nachname">
            <label for="examinerName">Name des Prüfers</label><input id="examinerName" name="examiner" autocomplete="off" maxlength="120" required value="${escape(defaults.examiner)}" placeholder="Vor- und Nachname">
            <p class="muted">${repeatQuestions ? "Es werden dieselben Fragen in derselben Reihenfolge erneut geprüft." : `${SAPEngine.count} zufällige Fragen aus dem Katalog mit ${questions.length} Fragen.`}</p>
            <button type="submit" id="startBtn" ${draftError ? "disabled" : ""}>${repeatQuestions ? "Wiederholung starten" : "SAP starten"} <span aria-hidden="true">→</span></button>
            ${repeatQuestions ? button("cancel-repeat", "Andere SAP erstellen", "", "secondary") : ""}</form></section>
            <aside class="panel"><div class="panelTitle"><h3>Prüfungsrahmen</h3><span class="tag">${repeatQuestions?.length || SAPEngine.count} Fragen</span></div><ul class="blueprint">${repeatQuestions ? `<li>Originalfragen der gewählten Prüfung</li>` : breakdown}</ul><p class="threshold">Bestanden ab <strong>80 %</strong></p><p class="muted">Erwartete Antworten sind für den Ausbilder direkt sichtbar. Nicht angehakte Antworten zählen als fehlend.</p></aside></div>`, focus);
    }
    function start(form) {
        if (active || busy || draftError) return;
        const student = form.elements.student.value.trim();
        const examiner = form.elements.examiner.value.trim();
        if (!student || !examiner) {
            message("Bitte den Namen des Prüflings und des Prüfers eingeben.", true);
            document.getElementById(!student ? "studentName" : "examinerName").focus();
            return;
        }
        // Validate before replacing the start form or setting any active state.
        const selected = repeatQuestions ? SAPEngine.clone(SAPEngine.validateQuestions(repeatQuestions)) : SAPEngine.generate(questions);
        active = {version: 3, id: SAPStorage.uid(), status: "active", student, examiner,
            startTime: new Date().toISOString(), endTime: null, index: 0,
            questions: selected, answersGiven: selected.map(() => [])};
        defaults = {student: "", examiner};
        repeatQuestions = null;
        currentResult = null;
        resultSaved = false;
        message("");
        saveDraft();
        showQuestion();
    }
    function showQuestion() {
        if (!active || active.status !== "active") return;
        const q = active.questions[active.index];
        const score = SAPEngine.evaluate(active.questions, active.answersGiven);
        const selected = active.answersGiven[active.index];
        setView("home", `<div class="pageHeading examHeading"><div><p class="eyebrow">LAUFENDE SAP</p><h2>${escape(active.student)}</h2><p>Prüfer: ${escape(active.examiner)}</p></div><div class="progressText"><strong id="counter">Frage ${active.index + 1} / ${active.questions.length}</strong><span id="totalScore">${score.points} / ${score.maxPoints} Punkte</span></div></div>
            <progress aria-label="Prüfungsfortschritt" value="${active.index + 1}" max="${active.questions.length}"></progress>
            <section class="panel questionBox"><div class="panelTitle"><span id="category" class="tag">${escape(q.category)}</span><span class="muted">${q.answers.length} mögliche Punkte</span></div>
            ${q.situation ? `<div id="situation" class="situation"><strong>Situation</strong><p>${escape(q.situation)}</p></div>` : ""}
            <h3 id="question">${escape(q.question)}</h3><fieldset id="checkboxes"><legend>Richtig genannte Antworten auswählen</legend>${q.answers.map((answer, i) => `<label class="answerItem"><input type="checkbox" name="answer" value="${i}" ${selected.includes(i) ? "checked" : ""}><span>${escape(answer)}</span></label>`).join("")}</fieldset>
            <p id="questionPoints" class="questionPoints" aria-live="polite">${selected.length} / ${q.answers.length} Punkte für diese Frage</p></section>
            <div class="examNavigation">${button("previous", "← Zurück", `id="backBtn" ${active.index === 0 ? "disabled" : ""}`, "secondary")}${button("next", active.index === active.questions.length - 1 ? "SAP abschließen" : "Weiter →", 'id="nextBtn"')}</div>
            <div class="draftLine"><span id="draftStatus" class="${draftSafe ? "" : "dangerText"}">${draftSafe ? "Zwischenstand lokal gespeichert" : "Zwischenstand nur in dieser geöffneten Seite"}</span>${button("cancel-exam", "Prüfung abbrechen", "", "textButton")}</div>`);
    }
    function updateAnswer() {
        if (!active || active.status !== "active") return;
        active.answersGiven[active.index] = [...document.querySelectorAll('#checkboxes input:checked')].map(box => Number(box.value));
        const score = SAPEngine.evaluate(active.questions, active.answersGiven);
        document.getElementById("totalScore").textContent = `${score.points} / ${score.maxPoints} Punkte`;
        document.getElementById("questionPoints").textContent = `${active.answersGiven[active.index].length} / ${active.questions[active.index].answers.length} Punkte für diese Frage`;
        saveDraft();
    }
    function buildResult(draft) {
        return SAPStorage.normalize({id: draft.id, student: draft.student, examiner: draft.examiner,
            questions: draft.questions, answersGiven: draft.answersGiven, startTime: draft.startTime,
            endTime: draft.endTime, created: draft.endTime,
            durationSeconds: Math.max(0, Math.round((Date.parse(draft.endTime) - Date.parse(draft.startTime)) / 1000))});
    }
    async function finish() {
        if (!active || active.status !== "active" || busy) return;
        if (!confirm("SAP abschließen? Nicht angehakte Antworten werden mit 0 Punkten bewertet.")) return;
        active.status = "completed";
        active.endTime = new Date().toISOString();
        currentResult = buildResult(active);
        resultSaved = false;
        saveDraft();
        await storeResult();
    }
    async function storeResult() {
        if (!currentResult || busy || resultSaved) return;
        busy = true;
        try {
            currentResult = await SAPStorage.save(currentResult);
            resultSaved = true;
            active = null;
            draftSafe = true;
            message("Die SAP wurde lokal gespeichert.");
            try { SAPStorage.removeDraft(currentResult.id); }
            catch (error) { message(`Ergebnis gespeichert. ${error.message}`, true); }
        } catch (error) {
            resultSaved = false;
            message(`${error.message} Das Ergebnis bleibt geöffnet.`, true);
        } finally {
            busy = false;
            showResult(currentResult, resultSaved);
        }
    }
    function mistakeList(record) {
        if (record.mistakes === null) return '<p class="muted">Dieser ältere Datensatz enthält keine Fehlerübersicht. Fehlende Antworten lassen sich daraus nicht rekonstruieren.</p>';
        if (!record.mistakes.length && record.points < record.maxPoints) return '<p class="muted">Für diese ältere SAP wurden keine einzelnen Fehler gespeichert. Die fehlenden Punkte sind nur im Gesamtergebnis erfasst.</p>';
        if (!record.mistakes.length) return '<p class="successBox">Alle erwarteten Antworten wurden genannt. Keine Fehler.</p>';
        return record.mistakes.map(m => `<article class="errorCard"><p class="eyebrow">${m.number ? `FRAGE ${m.number} · ` : ""}${escape(m.category)}</p><h4>${escape(m.question)}</h4>${m.situation ? `<p>${escape(m.situation)}</p>` : ""}<p class="missingTitle">Fehlende Antworten (${m.missing.length})</p><ul>${m.missing.map(answer => `<li>${escape(answer)}</li>`).join("")}</ul></article>`).join("");
    }
    function showResult(record, saved) {
        if (!record) throw new Error("Die SAP konnte nicht geöffnet werden.");
        currentResult = record;
        resultSaved = saved;
        const full = record.questions ? `<details class="panel"><summary>Alle ${record.questions.length} Fragen und Bewertungen ansehen</summary><div class="reviewList">${record.questions.map((q, i) => `<article class="reviewQuestion"><p class="eyebrow">FRAGE ${i + 1} · ${escape(q.category)}</p><h4>${escape(q.question)}</h4>${q.situation ? `<p>${escape(q.situation)}</p>` : ""}<ul>${q.answers.map((a, j) => `<li class="${record.answersGiven[i].includes(j) ? "correct" : "missing"}"><span>${record.answersGiven[i].includes(j) ? "✓ Genannt:" : "– Fehlend:"}</span> ${escape(a)}</li>`).join("")}</ul></article>`).join("")}</div></details>` : "";
        setView("result", `<div class="pageHeading"><p class="eyebrow">AUSWERTUNG</p><h2>SAP-Ergebnis</h2><p id="saveStatus" class="${saved ? "" : "dangerText"}">${saved ? "Lokal gespeichert" : "Noch nicht dauerhaft gespeichert – bitte erneut speichern oder JSON sichern."}</p></div>
            <section class="panel resultPanel"><div><h3>${escape(record.student)}</h3><p>Prüfer: ${escape(record.examiner)}</p><dl class="resultMeta"><div><dt>Beginn</dt><dd>${escape(time(record.startTime || record.created))}</dd></div><div><dt>Ende</dt><dd>${escape(time(record.endTime))}</dd></div><div><dt>Dauer</dt><dd>${duration(record.durationSeconds)}</dd></div></dl></div><div class="resultScore"><strong>${fmt(record.percent)} %</strong><p>${record.points} / ${record.maxPoints} Punkte</p>${badge(record)}<p class="muted">Bestehensgrenze: 80 %</p></div></section>
            <div class="actions resultActions">${!saved ? button("retry-save", "Erneut speichern") + button("discard-result", "Ergebnis verwerfen", "", "danger") : ""}${button("export-result", "JSON sichern", "", "secondary")}${saved ? button("new", "Neue SAP") + (record.questions ? button("repeat", "Diese SAP wiederholen", "", "secondary") : "") : ""}${button("saved", "Zum Archiv", "", "secondary")}</div>
            <section class="panel"><div class="panelTitle"><h3>Fehleranalyse</h3><span class="tag">${record.maxPoints - record.points} fehlende Punkte</span></div>${mistakeList(record)}</section>${full}`);
    }
    function archiveCard(record) {
        return `<article class="savedCard"><div><h3>${escape(record.student)}</h3><p>Prüfer: ${escape(record.examiner)}</p><p class="muted">${escape(time(record.startTime || record.created))}</p></div><div class="savedScore"><strong>${fmt(record.percent)} %</strong><span>${record.points} / ${record.maxPoints} Punkte</span>${badge(record)}</div><div class="actions">${button("open", "Öffnen", `data-id="${escape(record.id)}"`, "secondary")}${button("delete", "Löschen", `data-id="${escape(record.id)}"`, "danger")}</div></article>`;
    }
    function saved() {
        const records = SAPStorage.load();
        setView("saved", `<div class="pageHeading"><p class="eyebrow">PRÜFUNGSARCHIV</p><h2>Gespeicherte SAPs <span class="headingCount">${records.length}</span></h2><p>Ergebnisse und Bewertungen aus diesem Browser.</p></div><div class="actions archiveActions">${button("export-all", "Alle als JSON sichern", records.length ? "" : "disabled", "secondary")}${button("import", "JSON importieren", "", "secondary")}${button("delete-all", "Alle löschen", records.length ? "" : "disabled", "danger")}</div><div id="savedExamList">${records.length ? records.map(archiveCard).join("") : '<div class="panel empty"><h3>Noch keine SAP gespeichert</h3><p>Schließe eine Prüfung ab oder importiere eine vorhandene JSON-Sicherung.</p></div>'}</div>`);
    }
    function metric(label, value) { return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`; }
    function statistics() {
        const records = SAPStorage.load();
        const stats = SAPEngine.statistics(records);
        setView("stats", `<div class="pageHeading"><p class="eyebrow">SCHULSTATISTIK</p><h2>Statistik-Dashboard</h2><p>Auswertung aller ${stats.total} gespeicherten Prüfungen.</p></div>
            <section class="metrics" aria-label="Kennzahlen">${metric("Prüfungen", stats.total)}${metric("Bestanden", stats.passed)}${metric("Nicht bestanden", stats.failed)}${metric("Bestehensquote", fmt(stats.successRate) + " %")}${metric("Ø Ergebnis", fmt(stats.averagePercent) + " %")}${metric("Ø Punkte", fmt(stats.averagePoints))}</section>
            ${!stats.total ? '<section class="panel empty"><h3>Noch keine Statistik verfügbar</h3><p>Die erste gespeicherte SAP erscheint automatisch hier.</p></section>' : `<section class="panel"><h3>Schwierigste Kategorien</h3><p class="muted">Erreichte Punkte je Kategorie, aufsteigend sortiert. Grundlage: ${stats.detailed} Prüfungen mit vollständigen Antworten.${stats.detailed < stats.total ? ` ${stats.total - stats.detailed} ältere Prüfungen ohne Antwortdaten sind nur in den Gesamt- und Prüferwerten enthalten.` : ""}</p>${stats.categories.length ? `<div class="categoryStats">${stats.categories.map(c => `<div class="categoryRow"><div><strong>${escape(c.category)}</strong><span>${c.points} / ${c.maxPoints} Punkte · ${c.questions} Fragen</span></div><meter min="0" max="100" value="${c.percent}" aria-label="${escape(c.category)}: ${fmt(c.percent)} Prozent">${fmt(c.percent)} %</meter><strong>${fmt(c.percent)} %</strong></div>`).join("")}</div>` : '<p>Für Kategorieauswertungen fehlen vollständige Antwortdaten.</p>'}</section>
            <section class="panel"><h3>Häufigste Fehlerfragen</h3><p class="muted">Fragen mit mindestens einer fehlenden Antwort, nach Fehlerhäufigkeit sortiert.</p>${stats.questions.length ? `<div class="tableWrap" role="region" aria-label="Häufigste Fehlerfragen" tabindex="0"><table><thead><tr><th>Frage</th><th>Mit Fehlern / gestellt</th><th>Fehlerquote</th><th>Fehlende Punkte</th></tr></thead><tbody>${stats.questions.slice(0, 10).map(q => `<tr><td data-label="Frage"><span class="tableCategory">${escape(q.category)}</span>${escape(q.question)}</td><td data-label="Mit Fehlern / gestellt">${q.errors} / ${q.asked}</td><td data-label="Fehlerquote">${fmt(q.errors / q.asked * 100)} %</td><td data-label="Fehlende Punkte">${q.missing}</td></tr>`).join("")}</tbody></table></div>` : `<p>${stats.detailed ? "Keine Fehler in den vollständig gespeicherten Prüfungen." : "Noch keine vollständigen Antwortdaten vorhanden."}</p>`}</section>
            <section class="panel"><h3>Prüferstatistik</h3><div class="tableWrap" role="region" aria-label="Prüferstatistik" tabindex="0"><table><thead><tr><th>Prüfer</th><th>SAPs</th><th>Bestanden</th><th>Bestehensquote</th><th>Ø Ergebnis</th></tr></thead><tbody>${stats.examiners.map(e => `<tr><td data-label="Prüfer">${escape(e.name)}</td><td data-label="SAPs">${e.total}</td><td data-label="Bestanden">${e.passed}</td><td data-label="Bestehensquote">${fmt(e.successRate)} %</td><td data-label="Ø Ergebnis">${fmt(e.average)} %</td></tr>`).join("")}</tbody></table></div></section>
            <section class="panel"><h3>Letzte Prüfungen</h3>${records.slice(0, 5).map(archiveCard).join("")}</section>`}`);
    }
    function download(data, name) {
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: "application/json;charset=utf-8"}));
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
    function openRecord(id) {
        if (active?.status === "completed" && !resultSaved) {
            message("Bitte das aktuelle Ergebnis zuerst speichern. Du kannst es unter „SAP-Ergebnis“ öffnen.", true);
            return;
        }
        const record = SAPStorage.load().find(e => e.id === id);
        if (!record) throw new Error("Diese SAP ist nicht mehr im Archiv vorhanden.");
        showResult(record, true);
    }
    async function handle(action, target) {
        if (busy) return;
        switch (action) {
            case "home": home(); break;
            case "saved": saved(); break;
            case "stats": statistics(); break;
            case "previous":
                if (active?.status === "active" && active.index > 0) { active.index--; saveDraft(); showQuestion(); }
                break;
            case "next":
                if (active?.status !== "active") return;
                if (active.index === active.questions.length - 1) await finish();
                else { active.index++; saveDraft(); showQuestion(); }
                break;
            case "new":
            case "repeat":
                if (active) { message("Bitte die laufende SAP zuerst abschließen oder abbrechen.", true); home(); return; }
                if (action === "repeat" && currentResult?.questions) {
                    repeatQuestions = SAPEngine.clone(currentResult.questions);
                    defaults = {student: currentResult.student, examiner: currentResult.examiner};
                } else { repeatQuestions = null; defaults.student = ""; }
                home(); break;
            case "cancel-repeat": repeatQuestions = null; home(); break;
            case "cancel-exam":
                if (active && confirm("Laufende SAP abbrechen und diesen Zwischenstand verwerfen?")) {
                    SAPStorage.removeDraft(active.id); active = null; currentResult = null; draftSafe = true; message(""); home();
                }
                break;
            case "discard-broken":
                if (confirm("Den beschädigten Zwischenstand unwiderruflich verwerfen? Gespeicherte Ergebnisse bleiben erhalten.")) {
                    SAPStorage.removeDraft(); draftError = false; message(""); home();
                }
                break;
            case "retry-save": await storeResult(); break;
            case "discard-result":
                if (active?.status === "completed" && !resultSaved && confirm("Das ungespeicherte Ergebnis verwerfen? Sichere es bei Bedarf vorher als JSON.")) {
                    SAPStorage.removeDraft(active.id); active = null; currentResult = null; draftSafe = true; message(""); home();
                }
                break;
            case "reset-archive":
                if (confirm("Das nicht lesbare Archiv zurücksetzen? Bitte sichere zuerst die Rohdaten. Eine laufende oder noch ungespeicherte Prüfung bleibt erhalten.")) {
                    await SAPStorage.resetArchive(); message("Das Archiv wurde zurückgesetzt. Ein noch offenes Ergebnis kannst du erneut speichern.");
                    if (active?.status === "completed") home(); else saved();
                }
                break;
            case "open": openRecord(target.dataset.id); break;
            case "delete":
                if (confirm("Diese gespeicherte SAP endgültig löschen?")) {
                    await SAPStorage.remove(target.dataset.id); message("SAP gelöscht. Die Statistik wurde aktualisiert."); saved();
                }
                break;
            case "delete-all":
                if (confirm("Alle gespeicherten SAPs endgültig löschen? Eine laufende Prüfung bleibt erhalten.")) {
                    await SAPStorage.clear(); message("Alle gespeicherten SAPs wurden gelöscht."); saved();
                }
                break;
            case "export-result": if (currentResult) download(SAPStorage.envelope([currentResult]), "SAP-Ergebnis.json"); break;
            case "export-all": download(SAPStorage.envelope(SAPStorage.load()), "SAP-Sicherung.json"); break;
            case "raw-export": download(SAPStorage.rawBackup(), "SAP-Rohdaten.json"); break;
            case "import": document.getElementById("importFile").click(); break;
        }
    }
    document.addEventListener("click", event => {
        const target = event.target.closest("button[data-action]");
        if (!target || target.disabled || event.detail > 1) return;
        handle(target.dataset.action, target).catch(reportError);
    });
    document.addEventListener("submit", event => {
        if (event.target.id !== "startForm") return;
        event.preventDefault();
        try { start(event.target); } catch (error) { reportError(error); }
    });
    document.addEventListener("change", event => {
        if (event.target.matches('#checkboxes input')) {
            try { updateAnswer(); } catch (error) { reportError(error); }
        }
    });
    document.getElementById("importFile").addEventListener("change", async event => {
        const file = event.target.files[0];
        if (!file) return;
        try {
            if (file.size > 5 * 1024 * 1024) throw new Error("Die JSON-Datei ist größer als 5 MB.");
            let data;
            try { data = JSON.parse(await file.text()); }
            catch { throw new Error("Die Datei enthält kein gültiges JSON. Es wurde nichts importiert."); }
            const count = await SAPStorage.importData(data);
            message(`${count} SAP${count === 1 ? "" : "s"} importiert. Identische Datensätze wurden nicht doppelt gespeichert.`);
            saved();
        } catch (error) { reportError(error); }
        finally { event.target.value = ""; }
    });
    window.addEventListener("beforeunload", event => {
        if (active && (!draftSafe || (active.status === "completed" && !resultSaved))) {
            event.preventDefault(); event.returnValue = "";
        }
    });
    window.addEventListener("storage", event => {
        if (event.key === SAPStorage.key) {
            try { if (view === "stats") statistics(); else if (view === "saved") saved(); }
            catch (error) { reportError(error); }
        }
    });
    function reportError(error) {
        message(error.message || "Die Aktion konnte nicht ausgeführt werden. Bitte versuche es erneut.", true);
        if (!document.getElementById("recoveryButton")) {
            const recovery = document.createElement("button");
            recovery.id = "recoveryButton";
            recovery.type = "button";
            recovery.className = "secondary";
            recovery.dataset.action = "raw-export";
            recovery.textContent = "Rohdaten sichern";
            notice.appendChild(recovery);
            try { SAPStorage.load(); }
            catch (storageError) {
                if (!storageError.message.includes("keinen Zugriff")) {
                    const reset = document.createElement("button");
                    reset.type = "button"; reset.className = "danger";
                    reset.dataset.action = "reset-archive"; reset.textContent = "Beschädigtes Archiv zurücksetzen";
                    notice.appendChild(reset);
                }
            }
        }
    }
    try {
        SAPEngine.validateQuestions(questions);
        try {
            active = SAPStorage.loadDraft();
            if (active?.status === "completed") {
                currentResult = buildResult(active);
                try {
                    const existing = SAPStorage.load().find(e => e.id === active.id);
                    if (existing) { currentResult = existing; resultSaved = true; SAPStorage.removeDraft(active.id); active = null; }
                } catch (error) { reportError(error); }
            }
        } catch (error) { draftError = !error.message.includes("erlaubt keinen Zugriff"); reportError(error); }
        if (currentResult) showResult(currentResult, resultSaved);
        else home(false);
        if (active?.status === "active") message("Die unterbrochene SAP wurde mit allen bisherigen Bewertungen wiederhergestellt.");
    } catch (error) {
        app.innerHTML = '<section class="panel"><h2>Prüfung kann nicht gestartet werden</h2><p>Der Fragenkatalog oder eine Programmdatei konnte nicht geladen werden. Bitte lade die Seite vollständig neu.</p></section>';
        reportError(error);
    }
})();
