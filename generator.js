// =========================================
// generator.js
// SAP Prüfungsgenerator v2
// =========================================

function shuffle(array) {

    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] = [copy[j], copy[i]];

    }

    return copy;

}

function pick(category, amount) {

    return shuffle(

        questions.filter(q => q.category === category)

    ).slice(0, amount);

}

function generateExam() {

    let exam = [];

    exam.push(...pick("Verstoß", 5));

    exam.push(...pick("RP13", 4));

    exam.push(...pick("Greenzones", 2));

    exam.push(...pick("Funkcodes", 3));

    exam.push(...pick("Korruption", 2));

    exam.push(...pick("Intern", 2));

    exam.push(...pick("Dienstvorschriften", 2));

    exam = shuffle(exam);

    // Sicherheitsprüfung gegen Duplikate

    const used = new Set();

    exam = exam.filter(question => {

        if (used.has(question.id))
            return false;

        used.add(question.id);

        return true;

    });

    // Sollte eine Kategorie zu wenige Fragen besitzen,
    // wird automatisch aufgefüllt.

    while (exam.length < 15) {

        const candidate =
            shuffle(questions).find(q => !used.has(q.id));

        if (!candidate)
            break;

        used.add(candidate.id);

        exam.push(candidate);

    }

    return shuffle(exam);

}
