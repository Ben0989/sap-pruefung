let exam = [];
let currentQuestion = 0;
let reachedPoints = 0;
let maxPoints = 0;

function startExam() {

    exam = generateExam();

    currentQuestion = 0;
    reachedPoints = 0;
    maxPoints = exam.reduce((sum, q) => sum + q.points, 0);

    showQuestion();
}
function showQuestion(){

    const q = exam[currentQuestion];

    document.getElementById("counter").innerText =
        `Frage ${currentQuestion+1} / ${exam.length}`;

    document.getElementById("category").innerText =
        q.category;

    document.getElementById("question").innerText =
        q.question;

    document.getElementById("situation").innerText =
        q.situation || "";

    document.getElementById("answer").innerText =
        q.answer;

    document.getElementById("answer").style.display = "none";

    createCheckboxes(q.points);
}
function createCheckboxes(points){

    const div = document.getElementById("checkboxes");

    div.innerHTML = "";

    for(let i=1;i<=points;i++){

        div.innerHTML += `
            <label>
                <input type="checkbox" class="point">
                Punkt ${i}
            </label><br>
        `;
    }

}
function showAnswer(){

    document.getElementById("answer").style.display="block";

}
function nextQuestion(){

    const checks =
        document.querySelectorAll(".point");

    checks.forEach(c=>{
        if(c.checked)
            reachedPoints++;
    });

    currentQuestion++;

    if(currentQuestion >= exam.length){
        finishExam();
        return;
    }

    showQuestion();

}
function finishExam(){

    const percent =
        reachedPoints / maxPoints *100;

    const passed = percent >=80;

    document.body.innerHTML=`

        <h1>Prüfung beendet</h1>

        <h2>${reachedPoints} / ${maxPoints} Punkte</h2>

        <h2>${percent.toFixed(1)} %</h2>

        <h1 style="color:${passed?"green":"red"}">

        ${passed?"BESTANDEN":"NICHT BESTANDEN"}

        </h1>

    `;

}
