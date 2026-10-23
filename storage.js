"use strict";

const SAPStorage = (() => {
    const baseKey = 'sap_pruefung_archive_v3', baseDraftKey = 'sap_pruefung_draft_v3';
    const legacyKeys = ['sap_exams','sap_pruefungen'];
    const clone=SAPEngine.clone;
    const text=(value,fallback='')=>typeof value==='string'?value:fallback;
    const uid=()=>globalThis.crypto?.randomUUID?.()||`sap-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let userId='',isAdmin=false,cache=[],revision=0,epoch=0,draftQueue=Promise.resolve();
    function setUser(id,admin=false){if(!/^[0-9a-f-]{36}$/i.test(id))throw Error('Ungültige Benutzerkennung.');userId=id;isAdmin=admin;cache=[];revision=0;epoch++;draftQueue=Promise.resolve();}
    function read(name){try{return localStorage.getItem(name);}catch{throw Error('Der Browser erlaubt keinen Zugriff auf vorhandene Gerätedaten.');}}
    function parse(raw,label){try{return JSON.parse(raw);}catch{throw Error(`Die Gerätedaten (${label}) sind beschädigt und wurden nicht gelöscht.`);}}
    function removeLocal(name,raw){if(read(name)!==raw)throw Error('Der lokale Bestand wurde während der Übertragung geändert. Er bleibt für einen erneuten Abgleich erhalten.');localStorage.removeItem(name);}
    function checkSession(expected){if(expected!==epoch||!userId)throw Error('Die Sitzung wurde gewechselt. Bitte erneut öffnen.');}
    const api=(action,body={})=>SAPAccess.api(action,body);
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
            mistakes, ...(snapshot || {}), ...(typeof record.sourceId === "string" ? {sourceId:record.sourceId} : {}), ...(typeof record.ownerId === "string" ? {ownerId:record.ownerId,canDelete:record.canDelete === true} : {})
        };
    }
    function normalizeList(records, source) {
        if (!Array.isArray(records)) throw new Error("Das Prüfungsarchiv ist keine gültige Liste. Vorhandene Daten wurden nicht verändert.");
        const result = records.map((record, index) => normalize(record, index, source));
        return result;
    }
    const envelope=records=>({format:'sap-pruefung',version:3,exams:records});
    function load(){return clone(cache).sort((a,b)=>dateSort(b)-dateSort(a));}
    async function refresh(){
        const current=epoch,records=[];let offset=0,more;
        do{checkSession(current);const data=await api('list_exams',{offset});checkSession(current);records.push(...data.exams);more=data.has_more;offset+=data.exams.length;if(more&&!data.exams.length)throw Error('Das Archiv konnte nicht vollständig geladen werden.');}while(more);
        cache=normalizeList(records,'cloud');return load();
    }
    async function send(records){
        const current=epoch;let added=0;const result=[];
        for(let i=0;i<records.length;i+=20){
            checkSession(current);const batch=records.slice(i,i+20);
            const data=await api('store_exams',{exams:batch});checkSession(current);
            if(!Array.isArray(data.receipts)||data.receipts.length!==batch.length||data.receipts.some((receipt,i)=>receipt.sourceId!==(batch[i].sourceId||batch[i].id)))throw Error('Supabase hat die Übernahme nicht vollständig bestätigt. Die Gerätedaten bleiben erhalten.');
            added+=data.added;result.push(...data.exams);
        }
        return {added,exams:result};
    }
    async function save(record){
        const result=await send([normalize(record)]);
        if(!result.exams.length)throw Error('Diese SAP wurde bereits zentral gelöscht und wird nicht erneut angelegt.');
        const saved=normalize(result.exams[0]);cache=cache.filter(e=>e.id!==saved.id);cache.unshift(saved);return clone(saved);
    }
    async function remove(id){await api('delete_exam',{id:String(id)});cache=cache.filter(e=>e.id!==String(id));}
    async function clear(){await api('clear_exams');cache=[];}
    async function importData(data){
        let raw;
        if(Array.isArray(data))raw=data;
        else if(data?.format==='sap-pruefung'&&data.version===3)raw=data.exams;
        else if(data&&typeof data==='object'&&'student' in data&&'points' in data)raw=[data];
        else throw Error('Diese Datei ist keine unterstützte SAP-Sicherung.');
        const records=normalizeList(raw,'import');const result=await send(records);await refresh();return result.added;
    }
    async function loadDraft(){const current=epoch,data=await api('load_draft');checkSession(current);revision=data.revision;return data.draft?clone(data.draft):null;}
    function saveDraft(draft){
        const snapshot=clone(draft),current=epoch;
        const task=draftQueue.catch(()=>{}).then(async()=>{checkSession(current);const data=await api('save_draft',{draft:snapshot,revision});checkSession(current);revision=data.revision;});
        draftQueue=task;return task;
    }
    async function removeDraft(id){const current=epoch;await draftQueue.catch(()=>{});checkSession(current);if(!revision)return;await api('remove_draft',{id,revision});checkSession(current);revision=0;}
    function decodeSource(raw,name){
        const data=parse(raw,name);
        const rows=Array.isArray(data)?data:data?.format==='sap-pruefung'&&data.version===3?data.exams:null;
        if(!Array.isArray(rows))throw Error(`Unbekanntes Gerätearchiv (${name}). Es wurde nicht verändert.`);
        return normalizeList(rows,'migration');
    }
    async function migrateLocal(){
        const summary={added:0,removed:0,warnings:[]};const current=epoch;
        let names;
        try{names=Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).filter(Boolean);}catch{summary.warnings.push('Vorhandene Gerätedaten konnten nicht gelesen werden. Neue SAPs werden trotzdem zentral gespeichert.');return summary;}
        const scoped=names.filter(name=>name.startsWith(baseKey+'_')&&(isAdmin||name===baseKey+'_'+userId));
        const candidates=scoped.length?scoped:isAdmin?(names.includes(baseKey)?[baseKey]:legacyKeys.filter(name=>names.includes(name))):[];
        let complete=true;
        for(const name of candidates){
            try{checkSession(current);const raw=read(name);if(raw===null)continue;const records=decodeSource(raw,name);const result=await send(records);summary.added+=result.added;checkSession(current);removeLocal(name,raw);summary.removed++;}
            catch(error){complete=false;summary.warnings.push(error.message);}
        }
        // These keys are read-only backups superseded by a canonical local archive.
        if(isAdmin&&complete&&candidates.length&&(scoped.length||candidates.includes(baseKey))){
            for(const name of [baseKey,...legacyKeys])if(!candidates.includes(name))try{const raw=read(name);if(raw!==null){removeLocal(name,raw);summary.removed++;}}catch(error){summary.warnings.push(error.message);}
        }
        for(const name of [baseDraftKey+'_'+userId,...(isAdmin?[baseDraftKey]:[])]){
            try{
                const raw=read(name);if(raw===null)continue;const local=parse(raw,name);
                if(local?.status==='completed'){
                    const record=normalize({id:local.id,student:local.student,examiner:local.examiner,questions:local.questions,answersGiven:local.answersGiven,startTime:local.startTime,endTime:local.endTime,created:local.endTime,durationSeconds:Math.max(0,Math.round((Date.parse(local.endTime)-Date.parse(local.startTime))/1000))});
                    const result=await send([record]);summary.added+=result.added;removeLocal(name,raw);
                }else{
                    const remote=await loadDraft();
                    if(!remote){await saveDraft(local);removeLocal(name,raw);}
                    else if(JSON.stringify(remote)===JSON.stringify(local))removeLocal(name,raw);
                    else summary.warnings.push('Ein älterer lokaler Zwischenstand bleibt erhalten, weil bereits ein anderer zentraler Prüfungsstand vorhanden ist.');
                }
            }catch(error){summary.warnings.push(error.message);}
        }
        return summary;
    }
    function rawBackup(){const result={};try{for(let i=0;i<localStorage.length;i++){const name=localStorage.key(i);if(name&&(name.startsWith(baseKey)||name.startsWith(baseDraftKey)||legacyKeys.includes(name)))result[name]=read(name);}}catch{result.error='Gerätedaten nicht lesbar';}return result;}
    return Object.freeze({get key(){return 'sap_cloud_archive';},setUser,uid,normalize,normalizeList,load,refresh,save,remove,clear,importData,envelope,loadDraft,saveDraft,removeDraft,migrateLocal,rawBackup});
})();
