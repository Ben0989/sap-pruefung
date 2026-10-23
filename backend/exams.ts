// Validate immutable exam snapshots on the server; never trust client-supplied totals.
export function normalizeExam(input: any) {
    if(!input || typeof input!=='object' || Array.isArray(input))throw Error('Ungültiger SAP-Datensatz.');
    const text=(v:unknown,f='')=>typeof v==='string'?v:f;
    let points=Number(input.points),maxPoints=Number(input.maxPoints),questions:any[]|undefined,answersGiven:any[]|undefined;
    let mistakes:any=null;
    if(input.questions!=null || input.answersGiven!=null){
        if(!Array.isArray(input.questions)||!input.questions.length||input.questions.length>150||!Array.isArray(input.answersGiven)||input.answersGiven.length!==input.questions.length)throw Error('Fragen und Bewertungen passen nicht zusammen.');
        const ids=new Set();points=0;maxPoints=0;mistakes=[];answersGiven=[];
        questions=input.questions.map((q:any,i:number)=>{
            if(!q || typeof q.id!=='string'||!q.id||ids.has(q.id)||typeof q.category!=='string'||!q.category||typeof q.question!=='string'||!q.question||!Array.isArray(q.answers)||!q.answers.length||q.answers.length>40||q.answers.some((a:any)=>typeof a!=='string'||!a||a.length>4000))throw Error('Ungültige Frage in der SAP.');
            ids.add(q.id);const chosen=input.answersGiven[i];
            if(!Array.isArray(chosen)||new Set(chosen).size!==chosen.length||chosen.some((n:any)=>!Number.isInteger(n)||n<0||n>=q.answers.length))throw Error('Ungültige Antwortbewertung.');
            const ordered=[...chosen].sort((a,b)=>a-b);answersGiven!.push(ordered);points+=chosen.length;maxPoints+=q.answers.length;
            const missing=q.answers.filter((_:any,j:number)=>!chosen.includes(j));
            if(missing.length)mistakes.push({id:q.id,number:i+1,category:q.category,question:q.question,situation:text(q.situation),missing});
            return {id:q.id,category:q.category,question:q.question,situation:text(q.situation),answers:[...q.answers]};
        });
    }else if(input.mistakes!=null){
        if(!Array.isArray(input.mistakes))throw Error('Ungültige Fehlerübersicht.');
        mistakes=input.mistakes.map((m:any)=>{
            if(!m||typeof m.question!=='string'||typeof m.category!=='string'||!Array.isArray(m.missing)||m.missing.some((a:any)=>typeof a!=='string'))throw Error('Ungültige Fehlerübersicht.');
            return {id:text(m.id),number:Number.isInteger(m.number)?m.number:0,category:m.category,question:m.question,situation:text(m.situation),missing:[...m.missing]};
        });
    }
    if(!Number.isInteger(points)||!Number.isInteger(maxPoints)||maxPoints<=0||points<0||points>maxPoints||maxPoints>6000)throw Error('Ungültige Punktzahlen.');
    const duration=input.durationSeconds==null?Number(input.duration)*60:Number(input.durationSeconds);
    const result:any={schemaVersion:3,id:text(input.sourceId||input.id),student:text(input.student,'Unbekannt'),examiner:text(input.examiner,'Nicht angegeben'),points,maxPoints,percent:points/maxPoints*100,passed:points*5>=maxPoints*4,startTime:text(input.startTime),endTime:text(input.endTime),created:text(input.created||input.date),durationSeconds:Number.isFinite(duration)&&duration>=0?duration:null,mistakes};
    if(questions){result.questions=questions;result.answersGiven=answersGiven;}
    if(result.student.length>200||result.examiner.length>200)throw Error('Name zu lang.');
    return result;
}
export function normalizeDraft(input:any){
    if(!input||input.version!==3||typeof input.id!=='string'||!input.id||!['active','completed'].includes(input.status)||typeof input.student!=='string'||!input.student.trim()||typeof input.examiner!=='string'||!input.examiner.trim()||!Number.isFinite(Date.parse(input.startTime))||!Number.isInteger(input.index)||input.index<0||input.index>=input.questions?.length||(input.status==='completed'&&!Number.isFinite(Date.parse(input.endTime))))throw Error('Ungültiger Prüfungsstand.');
    const exam=normalizeExam({...input,points:0,maxPoints:1});
    return {version:3,id:input.id,status:input.status,student:input.student,examiner:input.examiner,startTime:input.startTime,endTime:input.endTime||null,index:input.index,questions:exam.questions,answersGiven:exam.answersGiven};
}
