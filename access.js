"use strict";

const SAPAccess = (() => {
    const sessionKey = 'sap_generator_session_v1';
    const app = document.getElementById('app');
    const nav = document.querySelector('.mainNav');
    const notice = document.getElementById('notice');
    const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const categories = ['Verstoß','RP13','Greenzones','Funkcodes','Korruption','Intern','Dienstvorschriften'];
    let session = null, user = null, readyCallback, lockCallback, refreshPending;
    let catalog = [], history = [], users = [], page = 0, more = false, working = false;
    let edit = null;
    const button = (action,label,extra='',cls='secondary')=>`<button type="button" data-access="${action}" class="${cls}" ${extra}>${label}</button>`;
    function tell(text,error=false) { notice.textContent=text;notice.hidden=!text;notice.classList.toggle('error',error); }
    function storeSession(value) { session=value;try{if(value)sessionStorage.setItem(sessionKey,JSON.stringify(value));else sessionStorage.removeItem(sessionKey);}catch{} }
    function publicHeaders() { return {apikey:SAPConfig.key,'Content-Type':'application/json'}; }
    async function authRequest(path,body) {
        const response=await fetch(SAPConfig.url+'/auth/v1/'+path,{method:'POST',headers:publicHeaders(),body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
        const data=await response.json();
        if(!response.ok)throw new Error(path.includes('password')?'Benutzername oder Passwort ist falsch.':'Die Sitzung ist abgelaufen. Bitte erneut anmelden.');
        return data;
    }
    async function refresh() {
        if(!refreshPending)refreshPending=(async()=>{
            if(!session?.refresh_token)throw new Error('Bitte erneut anmelden.');
            const data=await authRequest('token?grant_type=refresh_token',{refresh_token:session.refresh_token});
            storeSession({access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Math.floor(Date.now()/1000)+data.expires_in});
        })().finally(()=>{refreshPending=null;});
        return refreshPending;
    }
    async function api(action,body={},retry=true) {
        if(!session?.access_token)throw new Error('Bitte anmelden.');
        if(session.expires_at && session.expires_at<Math.floor(Date.now()/1000)+20)await refresh();
        const response=await fetch(SAPConfig.url+'/functions/v1/sap-generator-api',{method:'POST',headers:{...publicHeaders(),Authorization:'Bearer '+session.access_token},body:JSON.stringify({...body,action}),signal:AbortSignal.timeout(25000)});
        const data=await response.json();
        if(response.status===401 && retry){try{await refresh();return await api(action,body,false);}catch(error){lock();throw error;}}
        if(!response.ok){const error=new Error(data.error || 'Die Anfrage ist fehlgeschlagen.');if(response.status===401 || (response.status===403 && data.error?.includes('freigeschaltet')))lock();throw error;}
        return data;
    }
    function markView(name) {
        document.querySelectorAll('.mainNav button').forEach(b=>{
            if(b.dataset.access===name)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
        });
        app.focus({preventScroll:true});window.scrollTo({top:Math.max(0,app.offsetTop-20),behavior:'auto'});
    }
    function loginView() {
        nav.hidden=true;document.getElementById('userBadge').textContent='Geschützter Ausbilderbereich';
        app.innerHTML=`<section class="panel loginPanel"><p class="eyebrow">PD GLENDALE</p><h2>Anmelden</h2><p>Für Lehrer und Administration.</p><form id="loginForm"><label for="loginUsername">Benutzername</label><input id="loginUsername" name="username" autocomplete="username" required maxlength="40"><label for="loginPassword">Passwort</label><input type="password" id="loginPassword" name="password" autocomplete="current-password" required maxlength="72"><button type="submit">Anmelden</button></form><p class="muted loginHint">Neue Benutzer werden ausschließlich vom Admin angelegt.</p></section>`;
    }
    function lock() {
        storeSession(null);user=null;catalog=[];history=[];users=[];edit=null;
        if(lockCallback)lockCallback();loginView();
    }
    async function unlock() {
        const data=await api('me');user=data.user;
        nav.hidden=false;
        document.querySelectorAll('[data-admin]').forEach(el=>el.hidden=user.role!=='admin');
        document.getElementById('userBadge').textContent=`${user.username} · ${user.role==='admin'?'Admin':'Lehrer'}`;
        await readyCallback(user);
    }
    async function init(onReady,onLock) {
        readyCallback=onReady;lockCallback=onLock;
        try { const stored=sessionStorage.getItem(sessionKey);if(stored)session=JSON.parse(stored); } catch {session=null;}
        if(!session){loginView();return;}
        try {await unlock();}catch(error){lock();tell(error.message,true);}
    }
    async function questions() { return (await api('questions')).questions; }
    async function notifyQuestions() { window.dispatchEvent(new Event('sap-questions-updated')); }
    function filterQuestions() {
        const query=(document.getElementById('questionSearch')?.value||'').toLocaleLowerCase('de');
        const category=document.getElementById('questionCategory')?.value||'';
        const matching=catalog.filter(q=>!q.deleted_at && (!category || q.category===category) && (q.question+' '+q.situation+' '+q.answers.join(' ')).toLocaleLowerCase('de').includes(query));
        document.getElementById('questionCount').textContent=`${matching.length} von ${catalog.filter(q=>!q.deleted_at).length} Fragen`;
        document.getElementById('questionList').innerHTML=matching.length?matching.map(q=>`<article class="panel questionCard"><div class="panelTitle"><span class="tag">${escape(q.category)}</span><span class="muted">Version ${q.version} · ${q.answers.length} Punkte</span></div><h3>${escape(q.question)}</h3>${q.situation?`<p class="situation">${escape(q.situation)}</p>`:''}<details><summary>Antwortpunkte (${q.answers.length})</summary><ol>${q.answers.map(a=>`<li>${escape(a)}</li>`).join('')}</ol></details><div class="actions">${button('edit-question','Bearbeiten',`data-id="${escape(q.id)}"`)}${button('delete-question','Löschen',`data-id="${escape(q.id)}"`,'danger')}</div></article>`).join(''):'<section class="panel empty">Keine passenden Fragen gefunden.</section>';
    }
    async function questionList() {
        app.innerHTML='<section class="panel"><p role="status">Fragen werden geladen …</p></section>';
        markView('questions');
        catalog=(await api('questions',{include_deleted:user.role==='admin'})).questions;edit=null;
        app.innerHTML=`<div class="pageHeading"><p class="eyebrow">ZENTRALER FRAGENKATALOG</p><h2>Fragen verwalten</h2><p>Änderungen stehen allen Lehrern für neue Prüfungen zur Verfügung.</p></div><div class="actions archiveActions">${button('new-question','Neue Frage erstellen','','')}${button('questions','Neu laden')}</div><section class="panel filterPanel"><label for="questionSearch">Fragen durchsuchen</label><input id="questionSearch" type="search" placeholder="Frage, Situation oder Antwort"><label for="questionCategory">Kategorie</label><select id="questionCategory"><option value="">Alle Kategorien</option>${categories.map(c=>`<option>${escape(c)}</option>`).join('')}</select><p id="questionCount" class="muted"></p></section><div id="questionList"></div>`;
        markView('questions');filterQuestions();
    }
    function questionForm(question=null) {
        edit=question;
        app.innerHTML=`<div class="pageHeading"><p class="eyebrow">FRAGENVERWALTUNG</p><h2>${question?'Frage bearbeiten':'Neue Frage erstellen'}</h2><p>${question?`Version ${question.version} · Kennung ${escape(question.id)}`:'Die Fragenkennung wird automatisch vergeben.'}</p></div><section class="panel"><form id="questionForm"><label for="editCategory">Kategorie</label><select id="editCategory" name="category" required>${categories.map(c=>`<option ${question?.category===c?'selected':''}>${escape(c)}</option>`).join('')}</select><label for="editQuestion">Frage</label><textarea id="editQuestion" name="question" required maxlength="1500" rows="3">${escape(question?.question||'')}</textarea><label for="editSituation">Situation (optional)</label><textarea id="editSituation" name="situation" maxlength="3000" rows="3">${escape(question?.situation||'')}</textarea><label for="editAnswers">Erwartete Antwortpunkte</label><p class="muted" id="answerHelp">Eine Antwort pro Zeile. Jede ausgefüllte Zeile entspricht einem Punkt. Maximal 40 Antwortpunkte.</p><textarea id="editAnswers" name="answers" required rows="8" aria-describedby="answerHelp">${escape(question?.answers.join('\n')||'')}</textarea><p id="answerCount" class="muted"></p><div class="actions"><button type="submit">Frage speichern</button>${button('questions','Abbrechen')}</div></form></section>`;
        markView('questions');answerCount();
    }
    function answerCount() {const input=document.getElementById('editAnswers');if(input)document.getElementById('answerCount').textContent=`${input.value.split('\n').filter(a=>a.trim()).length} mögliche Punkte`;}
    function snapshot(record) {
        if(!record)return '<p class="muted">Frage war noch nicht vorhanden.</p>';
        return `<p><strong>${escape(record.category)}</strong>${record.deleted_at?' · Gelöscht':''}</p><h4>${escape(record.question)}</h4>${record.situation?`<p>${escape(record.situation)}</p>`:''}<ol>${record.answers.map(a=>`<li>${escape(a)}</li>`).join('')}</ol>`;
    }
    const actionName={create:'Erstellt',update:'Bearbeitet',delete:'Gelöscht',restore:'Wiederhergestellt'};
    async function changes(nextPage=0) {
        if(user.role!=='admin')throw new Error('Nur der Admin kann das Änderungsprotokoll einsehen.');
        const data=await api('changes',{page:nextPage});history=data.changes;page=data.page;more=data.has_more;
        app.innerHTML=`<div class="pageHeading"><p class="eyebrow">ADMINISTRATION</p><h2>Änderungsprotokoll</h2><p>Alle erstellten, bearbeiteten, gelöschten und wiederhergestellten Fragen. Das Protokoll kann von Lehrern nicht verändert werden.</p></div>${history.length?history.map(change=>`<article class="panel changeCard"><div class="panelTitle"><span class="tag">${actionName[change.action]} · #${change.id}</span><span class="muted">${escape(new Date(change.created_at).toLocaleString('de-DE'))}</span></div><h3>${escape(change.actor_name)} · ${escape(change.after_record.question)}</h3>${change.restore_of?`<p class="muted">Wiederherstellung zu Änderung #${change.restore_of}</p>`:''}<details><summary>Vorher / Nachher ansehen</summary><div class="changeGrid"><section><h4>Vorher</h4>${snapshot(change.before_record)}</section><section><h4>Nachher</h4>${snapshot(change.after_record)}</section></div></details><div class="actions">${button('restore-change','Diese Änderung rückgängig machen',`data-id="${change.id}"`)}</div></article>`).join(''):'<section class="panel empty"><h3>Noch keine Änderungen</h3><p>Die erste Fragenänderung erscheint automatisch hier.</p></section>'}<div class="actions">${button('changes-previous','← Neuere Einträge',page?'':'disabled')}${button('changes-next','Ältere Einträge →',more?'':'disabled')}</div>`;markView('changes');
    }
    async function userList() {
        if(user.role!=='admin')throw new Error('Nur der Admin kann Benutzer verwalten.');
        users=(await api('users')).users;
        app.innerHTML=`<div class="pageHeading"><p class="eyebrow">ADMINISTRATION</p><h2>Benutzer verwalten</h2><p>Lehrer anlegen, Zugänge sperren und Passwörter ändern.</p></div><section class="panel"><h3>Neuen Lehrer anlegen</h3><form id="createUserForm"><div class="formGrid"><div><label for="newUsername">Benutzername</label><input id="newUsername" name="username" autocomplete="off" pattern="[A-Za-z0-9._-]{3,40}" required maxlength="40"><p class="muted">3–40 Zeichen: Buchstaben, Ziffern, Punkt, Unterstrich oder Bindestrich.</p></div><div><label for="newDisplayName">Name des Lehrers</label><input id="newDisplayName" name="display_name" required maxlength="120" autocomplete="off"></div></div><label for="newUserPassword">Anfangspasswort</label><input type="password" id="newUserPassword" name="password" autocomplete="new-password" required minlength="10" maxlength="72"><p class="muted">Mindestens 10 Zeichen.</p><button type="submit">Lehrer anlegen</button></form></section><div id="userList">${users.map(account=>`<article class="panel userCard"><div class="panelTitle"><div><h3>${escape(account.display_name)}</h3><p>${escape(account.username)} · ${account.role==='admin'?'Admin':'Lehrer'}</p></div><span class="badge ${account.active?'pass':'fail'}">${account.active?'Aktiv':'Gesperrt'}</span></div><div class="actions">${button('password-form','Passwort ändern',`data-id="${escape(account.id)}"`)}${account.role!=='admin'?button('toggle-user',account.active?'Zugang sperren':'Zugang freigeben',`data-id="${escape(account.id)}"`,account.active?'danger':'secondary'):''}</div></article>`).join('')}</div>`;markView('users');
    }
    function passwordForm(id) {
        const account=users.find(u=>u.id===id);if(!account)throw new Error('Benutzer nicht gefunden.');
        app.innerHTML=`<div class="pageHeading"><h2>Passwort ändern</h2><p>${escape(account.username)} · ${escape(account.display_name)}</p></div><section class="panel"><form id="passwordForm" data-id="${escape(account.id)}"><label for="resetPassword">Neues Passwort</label><input type="password" id="resetPassword" name="password" autocomplete="new-password" minlength="10" maxlength="72" required><label for="resetConfirm">Passwort wiederholen</label><input type="password" id="resetConfirm" name="confirmation" autocomplete="new-password" minlength="10" maxlength="72" required><p class="muted">Bisherige Sitzungen werden ungültig.${account.id===user.id?' Du wirst anschließend abgemeldet.':''}</p><div class="actions"><button type="submit">Passwort speichern</button>${button('users','Abbrechen')}</div></form></section>`;markView('users');
    }
    async function handle(action,target) {
        if(!user || working)return;
        working=true;target.disabled=true;
        try {
            if(action==='questions')await questionList();
            else if(action==='new-question')questionForm();
            else if(action==='edit-question')questionForm(catalog.find(q=>q.id===target.dataset.id));
            else if(action==='delete-question'){
                const q=catalog.find(q=>q.id===target.dataset.id);if(!q)throw new Error('Frage nicht gefunden.');
                if(confirm(`Frage löschen?\n\n${q.question}\n\nDer Admin kann die Änderung später rückgängig machen.`)){await api('delete_question',{id:q.id,version:q.version});await notifyQuestions();await questionList();tell('Die Frage wurde gelöscht und im Änderungsprotokoll erfasst.');}
            } else if(action==='changes')await changes();
            else if(action==='changes-previous')await changes(page-1);
            else if(action==='changes-next')await changes(page+1);
            else if(action==='restore-change'){
                const change=history.find(c=>String(c.id)===target.dataset.id);if(!change)throw new Error('Änderung nicht gefunden.');
                const latest=(await api('questions',{include_deleted:true})).questions.find(q=>q.id===change.question_id);if(!latest)throw new Error('Frage nicht gefunden.');
                if(confirm(`Änderung #${change.id} rückgängig machen?\n\nDie aktuelle Version ${latest.version} wird durch den Zustand VOR dieser Änderung ersetzt. Auch spätere Änderungen dieser Frage werden dadurch ersetzt. Das wird erneut protokolliert.`)){await api('restore_change',{change_id:change.id,version:latest.version});await notifyQuestions();await changes(page);tell('Der vorherige Zustand wurde wiederhergestellt und protokolliert.');}
            } else if(action==='users')await userList();
            else if(action==='password-form')passwordForm(target.dataset.id);
            else if(action==='toggle-user'){
                const account=users.find(u=>u.id===target.dataset.id);if(!account)throw new Error('Benutzer nicht gefunden.');
                if(confirm(`Zugang für ${account.username} ${account.active?'sperren':'freigeben'}?`)){await api('set_user_active',{id:account.id,active:!account.active});await userList();tell('Der Benutzerstatus wurde geändert.');}
            } else if(action==='logout'){
                if(!window.dispatchEvent(new Event('sap-before-logout',{cancelable:true})))return;
                if(confirm('Jetzt abmelden? Eine laufende Prüfung bleibt als zentraler Zwischenstand für deinen Benutzer gespeichert.')){
                    try{await fetch(SAPConfig.url+'/auth/v1/logout?scope=local',{method:'POST',headers:{...publicHeaders(),Authorization:'Bearer '+session.access_token},signal:AbortSignal.timeout(10000)});}catch{}
                    lock();tell('Du wurdest abgemeldet.');
                }
            }
        }finally{working=false;if(target.isConnected)target.disabled=false;}
    }
    document.addEventListener('click',event=>{
        const target=event.target.closest('button[data-access]');if(!target || target.disabled || event.detail>1)return;
        handle(target.dataset.access,target).catch(error=>tell(error.message,true));
    });
    document.addEventListener('input',event=>{if(event.target.id==='questionSearch')filterQuestions();if(event.target.id==='editAnswers')answerCount();});
    document.addEventListener('change',event=>{if(event.target.id==='questionCategory')filterQuestions();});
    document.addEventListener('submit',async event=>{
        const form=event.target;
        if(!['loginForm','questionForm','createUserForm','passwordForm'].includes(form.id))return;
        event.preventDefault();if(working)return;working=true;
        const submit=form.querySelector('[type=submit]');submit.disabled=true;
        try {
            if(form.id==='loginForm'){
                const username=form.elements.username.value.trim();if(!/^[A-Za-z0-9._-]{3,40}$/.test(username))throw new Error('Bitte einen gültigen Benutzernamen eingeben.');
                const data=await authRequest('token?grant_type=password',{email:`sap-${username.toLowerCase()}@sap.glendale.invalid`,password:form.elements.password.value});
                storeSession({access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Math.floor(Date.now()/1000)+data.expires_in});
                try{await unlock();}catch(error){lock();throw error;}
            } else {
                if(!user)throw new Error('Bitte anmelden.');
                if(form.id==='questionForm'){
                    const values={category:form.elements.category.value,question:form.elements.question.value,situation:form.elements.situation.value,answers:form.elements.answers.value.split('\n').map(a=>a.trim()).filter(Boolean)};
                    if(!values.answers.length || values.answers.length>40)throw new Error('Bitte 1–40 Antwortpunkte eintragen.');
                    await api(edit?'update_question':'create_question',edit?{id:edit.id,version:edit.version,question:values}:{question:values});await notifyQuestions();await questionList();tell('Die Frage wurde gespeichert und die Änderung protokolliert.');
                } else if(form.id==='createUserForm'){
                    await api('create_user',{username:form.elements.username.value,display_name:form.elements.display_name.value,password:form.elements.password.value});await userList();tell('Der Lehrerzugang wurde angelegt.');
                } else if(form.id==='passwordForm'){
                    if(form.elements.password.value!==form.elements.confirmation.value)throw new Error('Die Passwörter stimmen nicht überein.');
                    const data=await api('reset_password',{id:form.dataset.id,password:form.elements.password.value});if(data.sign_out){lock();tell('Passwort geändert. Bitte erneut anmelden.');}else{await userList();tell('Das Passwort wurde geändert. Der Lehrer muss sich neu anmelden.');}
                }
            }
        }catch(error){tell(error.message,true);}finally{working=false;if(submit.isConnected)submit.disabled=false;}
    });
    return Object.freeze({init,api,questions,get user(){return user;}});
})();
