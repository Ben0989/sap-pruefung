"use strict";

const SAPStorage = (() => {
    const baseKey = "sap_pruefung_archive_v3";
    const baseDraftKey = "sap_pruefung_draft_v3";
    let key = baseKey, draftKey = baseDraftKey, useLegacy = true;
    function setUser(id, admin = false) {
        if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Ungültige Benutzerkennung.");
        key = baseKey + '_' + id;
        draftKey = baseDraftKey + '_' + id;
        useLegacy = admin;
    }
    const legacyKeys = ["sap_exams", "sap_pruefungen"];
    const lockName = "sap-pruefung-archive";
    const clone = SAPEngine.clone;
    const uid = () => globalThis.crypto?.randomUUID?.() || `sap-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const text = (value, fallback = "") => typeof value === "string" ? value : fallback;

    function read(keyName) {
        try { return localStorage.getItem(keyName); }
        catch { throw new Error("Der Browser erlaubt keinen Zugriff auf den lokalen Speicher."); }
    }
    function write(keyName, value) {
        try { localStorage.setItem(keyName, JSON.stringify(value)); }
        catch { throw new Error("Speichern fehlgeschlagen: Der Browserspeicher ist voll oder gesperrt. Bitte die JSON-Datei sichern und erneut versuchen."); }
    }
    function parse(raw, label) {
        try { return JSON.parse(raw); }
        catch { throw new Error(`Die gespeicherten Daten (${label}) sind beschädigt. Sie wurden nicht überschrieben. Bitte zuerst die Rohdaten sichern.`); }
    }
    function numeric(value) {
        return typeof value === "number" || (typeof value === "string" && value.trim()) ? Number(value) : NaN;
    }
    function dateSort(record) {
        const value = record.startTime || record.created;
        if (!value) return 0;
        const german = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
        if (german) return new Date(+german[3], +german[2] - 1, +german[1], +german[4] || 0, +german[5] || 0, +german[6] || 0).getTime();
        return Date.parse(value) || 0;
    }
    function normalize(record, index = 0, source = "import") {
        if (!record || typeof record !== "object" || Array.isArray(record)) throw new Error(`Ungültiger Prüfungseintrag ${index + 1}.`);
        let points = numeric(record.points);
        let maxPoints = numeric(record.maxPoints);
        let detail = null;
        let snapshot = null;
        if (record.questions != null || record.answersGiven != null) {
            detail = SAPEngine.evaluate(record.questions, record.answersGiven);
            points = detail.points;
            maxPoints = detail.maxPoints;
            snapshot = {questions: clone(record.questions), answersGiven: clone(record.answersGiven)};
        }
        if (!Number.isInteger(points) || !Number.isInteger(maxPoints) || maxPoints <= 0 || points < 0 || points > maxPoints) {
            throw new Error(`Ungültige Punktzahlen in Prüfung ${index + 1}. Die Daten bleiben unverändert.`);
        }
        let mistakes = null;
        if (detail) mistakes = detail.mistakes;
        else if (record.mistakes != null) {
            if (!Array.isArray(record.mistakes)) throw new Error("Ungültige Fehlerübersicht.");
            mistakes = record.mistakes.map(m => {
                if (!m || typeof m.question !== "string" || typeof m.category !== "string" || !Array.isArray(m.missing) || m.missing.some(a => typeof a !== "string")) {
                    throw new Error("Ungültige Fehlerübersicht.");
                }
                return {id: text(m.id), number: Number.isInteger(m.number) ? m.number : 0, category: m.category, question: m.question, situation: text(m.situation), missing: [...m.missing]};
            });
        }
        const durationSeconds = record.durationSeconds == null ? numeric(record.duration) * 60 : numeric(record.durationSeconds);
        return {
            schemaVersion: 3,
            id: (typeof record.id === "string" && record.id) || (typeof record.id === "number" && Number.isFinite(record.id) ? String(record.id) : `legacy-${source}-${index}`),
            student: text(record.student, "Unbekannt"), examiner: text(record.examiner, "Nicht angegeben"),
            points, maxPoints, percent: points / maxPoints * 100, passed: points * 5 >= maxPoints * 4,
            startTime: text(record.startTime), endTime: text(record.endTime),
            created: text(record.created || record.date),
            durationSeconds: Number.isFinite(durationSeconds) && durationSeconds >= 0 ? durationSeconds : null,
            mistakes, ...(snapshot || {})
        };
    }
    function normalizeList(records, source) {
        if (!Array.isArray(records)) throw new Error("Das Prüfungsarchiv ist keine gültige Liste. Vorhandene Daten wurden nicht verändert.");
        const result = records.map((record, index) => normalize(record, index, source));
        if (new Set(result.map(record => record.id)).size !== result.length) throw new Error("Doppelte Prüfungskennungen im Archiv. Bitte zuerst die Rohdaten sichern.");
        return result;
    }
    function load() {
        const current = read(key) ?? (useLegacy && key !== baseKey ? read(baseKey) : null);
        let records;
        if (current !== null) {
            const data = parse(current, "Archiv");
            if (data?.version !== 3 || data?.format !== "sap-pruefung") throw new Error("Das Archivformat wird nicht unterstützt. Vorhandene Daten wurden nicht verändert.");
            records = normalizeList(data.exams, "archive");
        } else {
            records = [];
            for (const legacyKey of (useLegacy ? legacyKeys : [])) {
                const raw = read(legacyKey);
                if (raw === null) continue;
                const rows = normalizeList(parse(raw, legacyKey), legacyKey);
                rows.forEach(record => {
                    if (records.some(e => e.id === record.id)) record.id = `${legacyKey}-${record.id}`;
                    records.push(record);
                });
            }
        }
        return records.sort((a, b) => dateSort(b) - dateSort(a));
    }
    const envelope = records => ({format: "sap-pruefung", version: 3, exams: records});
    function locked(task) {
        if (globalThis.navigator?.locks?.request) return navigator.locks.request(lockName, task);
        return Promise.resolve().then(task);
    }
    function save(record) {
        return locked(() => {
            const normalized = normalize(record);
            const records = load();
            const index = records.findIndex(e => e.id === normalized.id);
            if (index >= 0) records[index] = normalized;
            else records.unshift(normalized);
            write(key, envelope(records));
            return normalized;
        });
    }
    function remove(id) {
        return locked(() => write(key, envelope(load().filter(e => e.id !== String(id)))));
    }
    function clear() {
        // Keep an empty canonical archive so legacy backups are not re-imported.
        return locked(() => { load(); write(key, envelope([])); });
    }
    function resetArchive() {
        // Explicit recovery only; original legacy bytes remain available in rawBackup().
        return locked(() => write(key, envelope([])));
    }
    function importData(data) {
        let raw;
        if (Array.isArray(data)) raw = data;
        else if (data?.format === "sap-pruefung" && data.version === 3) raw = data.exams;
        else if (data && typeof data === "object" && "student" in data && "points" in data) raw = [data];
        else throw new Error("Diese Datei ist keine unterstützte SAP-Sicherung.");
        const incoming = normalizeList(raw, "import");
        return locked(() => {
            const existing = load();
            let added = 0;
            incoming.forEach(record => {
                const same = existing.find(e => e.id === record.id);
                if (same && JSON.stringify(same) === JSON.stringify(record)) return;
                if (same) record.id = uid(); // Never replace a different existing result during import.
                existing.push(record);
                added++;
            });
            write(key, envelope(existing));
            return added;
        });
    }
    function validateDraft(draft) {
        if (!draft || draft.version !== 3 || typeof draft.id !== "string" || !draft.id ||
            !["active", "completed"].includes(draft.status) || typeof draft.student !== "string" || !draft.student.trim() ||
            typeof draft.examiner !== "string" || !draft.examiner.trim() || !Number.isFinite(Date.parse(draft.startTime)) ||
            !Number.isInteger(draft.index) || draft.index < 0 || draft.index >= draft.questions?.length ||
            (draft.status === "completed" && !Number.isFinite(Date.parse(draft.endTime)))) {
            throw new Error("Die unterbrochene Prüfung ist beschädigt. Bitte die Rohdaten sichern, bevor du sie verwirfst.");
        }
        SAPEngine.evaluate(draft.questions, draft.answersGiven);
        return clone(draft);
    }
    function loadDraft() {
        const raw = read(draftKey) ?? (useLegacy && draftKey !== baseDraftKey ? read(baseDraftKey) : null);
        return raw === null ? null : validateDraft(parse(raw, "laufende Prüfung"));
    }
    function saveDraft(draft) { write(draftKey, validateDraft(draft)); }
    function removeDraft(id) {
        for (const name of [draftKey, ...(useLegacy && draftKey !== baseDraftKey ? [baseDraftKey] : [])]) {
            const raw = read(name);
            if (raw === null) continue;
            if (id != null && parse(raw, "laufende Prüfung").id !== id) continue;
            try { localStorage.removeItem(name); }
            catch { throw new Error("Die laufende Prüfung konnte nicht aus dem Browserspeicher entfernt werden."); }
        }
    }
    function rawBackup() {
        return Object.fromEntries([key, draftKey, ...(useLegacy ? [baseKey, baseDraftKey, ...legacyKeys] : [])].map(k => [k, read(k)]));
    }
    return Object.freeze({get key() { return key; }, get draftKey() { return draftKey; }, setUser, uid, normalize, load, save, remove, clear, resetArchive, importData, envelope, loadDraft, saveDraft, removeDraft, rawBackup});
})();
