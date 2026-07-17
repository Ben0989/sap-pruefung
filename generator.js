// generator.js

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function pick(category, amount) {
    const pool = questions.filter(q => q.category === category);
    return shuffle(pool).slice(0, amount);
}

function generateExam() {

    let exam = [];

    exam.push(...pick("Verstoß", 5));
    exam.push(...pick("RP13", 2));
    exam.push(...pick("Greenzones", 2));
    exam.push(...pick("Funkcodes", 3));
    exam.push(...pick("Korruption", 1));
    exam.push(...pick("Intern", 1));
    exam.push(...pick("Dienstvorschriften", 1));

    return shuffle(exam);
}
