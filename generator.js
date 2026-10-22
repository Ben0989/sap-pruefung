"use strict";

// The current repository uses 20 questions. One checked answer earns one point.
const SAPEngine = (() => {
    const blueprint = Object.freeze({
        "Verstoß": 5, RP13: 4, Greenzones: 2, Funkcodes: 3,
        Korruption: 2, Intern: 2, Dienstvorschriften: 2
    });
    const count = Object.values(blueprint).reduce((sum, n) => sum + n, 0);
    const clone = value => JSON.parse(JSON.stringify(value));

    function validateQuestions(bank) {
        if (!Array.isArray(bank) || bank.length === 0) {
            throw new Error("Der Fragenkatalog ist leer oder konnte nicht geladen werden.");
        }
        const ids = new Set();
        bank.forEach((q, i) => {
            if (!q || typeof q.id !== "string" || !q.id.trim() || ids.has(q.id) ||
                typeof q.category !== "string" || !q.category.trim() ||
                typeof q.question !== "string" || !q.question.trim() ||
                !Array.isArray(q.answers) || !q.answers.length ||
                q.answers.some(a => typeof a !== "string" || !a.trim()) ||
                (q.situation != null && typeof q.situation !== "string")) {
                throw new Error(`Ungültige oder doppelte Frage an Position ${i + 1}.`);
            }
            ids.add(q.id);
        });
        return bank;
    }

    function shuffle(items, random = Math.random) {
        const copy = [...items];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function generate(bank, random = Math.random) {
        validateQuestions(bank);
        const selected = [];
        Object.entries(blueprint).forEach(([category, amount]) => {
            const pool = bank.filter(q => q.category === category);
            if (pool.length < amount) {
                throw new Error(`Kategorie „${category}“: ${amount} Fragen benötigt, ${pool.length} vorhanden.`);
            }
            selected.push(...shuffle(pool, random).slice(0, amount));
        });
        return clone(shuffle(selected, random));
    }

    function evaluate(exam, selections) {
        validateQuestions(exam);
        if (!Array.isArray(selections) || selections.length !== exam.length) {
            throw new Error("Die gespeicherten Bewertungen passen nicht zur Prüfung.");
        }
        let points = 0;
        let maxPoints = 0;
        const mistakes = [];
        const categories = new Map();
        exam.forEach((q, i) => {
            const given = selections[i];
            if (!Array.isArray(given) || new Set(given).size !== given.length ||
                given.some(n => !Number.isInteger(n) || n < 0 || n >= q.answers.length)) {
                throw new Error(`Ungültige Bewertung bei Frage ${i + 1}.`);
            }
            points += given.length;
            maxPoints += q.answers.length;
            const category = categories.get(q.category) || {category: q.category, points: 0, maxPoints: 0, questions: 0};
            category.points += given.length;
            category.maxPoints += q.answers.length;
            category.questions++;
            categories.set(q.category, category);
            const missing = q.answers.filter((_, index) => !given.includes(index));
            if (missing.length) mistakes.push({id: q.id, number: i + 1, category: q.category, question: q.question, situation: q.situation || "", missing});
        });
        return {points, maxPoints, percent: points / maxPoints * 100,
            passed: points * 5 >= maxPoints * 4, mistakes, categories: [...categories.values()]};
    }

    function statistics(records) {
        const total = records.length;
        const passed = records.filter(e => e.passed).length;
        const categories = new Map();
        const questionStats = new Map();
        const examiners = new Map();
        let detailed = 0;
        records.forEach(record => {
            const name = record.examiner || "Nicht angegeben";
            const examiner = examiners.get(name) || {name, total: 0, passed: 0, sum: 0};
            examiner.total++;
            examiner.passed += Number(record.passed);
            examiner.sum += record.percent;
            examiners.set(name, examiner);
            if (!record.questions || !record.answersGiven) return;
            detailed++;
            record.questions.forEach((q, i) => {
                const earned = record.answersGiven[i].length;
                const category = categories.get(q.category) || {category: q.category, points: 0, maxPoints: 0, questions: 0};
                category.points += earned;
                category.maxPoints += q.answers.length;
                category.questions++;
                categories.set(q.category, category);
                // Include wording so later question edits don't mix different versions.
                const key = JSON.stringify([q.id, q.question, q.answers]);
                const row = questionStats.get(key) || {id: q.id, question: q.question, category: q.category, asked: 0, errors: 0, missing: 0};
                row.asked++;
                row.errors += Number(earned < q.answers.length);
                row.missing += q.answers.length - earned;
                questionStats.set(key, row);
            });
        });
        return {
            total, passed, failed: total - passed, detailed,
            successRate: total ? passed / total * 100 : 0,
            averagePercent: total ? records.reduce((sum, e) => sum + e.percent, 0) / total : 0,
            averagePoints: total ? records.reduce((sum, e) => sum + e.points, 0) / total : 0,
            categories: [...categories.values()].map(c => ({...c, percent: c.points / c.maxPoints * 100})).sort((a, b) => a.percent - b.percent),
            questions: [...questionStats.values()].filter(q => q.errors).sort((a, b) => b.errors - a.errors || b.missing - a.missing),
            examiners: [...examiners.values()].map(e => ({...e, average: e.sum / e.total, successRate: e.passed / e.total * 100})).sort((a, b) => b.total - a.total)
        };
    }
    return Object.freeze({blueprint, count, clone, validateQuestions, generate, evaluate, statistics});
})();
