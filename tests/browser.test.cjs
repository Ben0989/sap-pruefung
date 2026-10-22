const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.join(__dirname, '..');
let server, browser, base;
const testUserId = '00000000-0000-4000-8000-000000000001';
const key = 'sap_pruefung_archive_v3_' + testUserId;
const draftKey = 'sap_pruefung_draft_v3_' + testUserId;
const fixture = (id='fixture') => ({version:3,id,status:'active',student:'Testperson',examiner:'Testprüfer',startTime:'2026-10-22T14:00:00Z',endTime:null,index:0,
    questions:[{id:'A',category:'Testkategorie',question:'Testfrage?',answers:['Antwort 1','Antwort 2','Antwort 3','Antwort 4','Antwort 5']}],answersGiven:[[]]});

before(async () => {
    server = http.createServer((req,res) => {
        const url = new URL(req.url,'http://localhost');
        const relative = url.pathname.replace(/^\/sap-pruefung\//,'') || 'index.html';
        if (relative.includes('..') || !['index.html','app.js','generator.js','storage.js','questions.js','style.css','config.js','access.js'].includes(relative)) { res.writeHead(404);res.end();return; }
        res.setHeader('Content-Type', relative.endsWith('.html')?'text/html;charset=utf-8':relative.endsWith('.css')?'text/css;charset=utf-8':'text/javascript;charset=utf-8');
        res.end(fs.readFileSync(path.join(root,relative)));
    });
    await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
    base=`http://127.0.0.1:${server.address().port}/sap-pruefung/`;
    browser = await chromium.launch({headless:true,executablePath:process.env.TEST_BROWSER_EXECUTABLE_PATH || undefined,args:process.env.TEST_BROWSER_EXECUTABLE_PATH ? ['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] : []});
});
after(async()=>{await browser?.close();await new Promise(resolve=>server?.close(resolve));});
async function session(storage = {}, options = {}) {
    const context = await browser.newContext({viewport:{width:1280,height:900},locale:'de-DE',...options});
    const page = await context.newPage();
    const errors=[]; page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    const fixtureBank = require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'questions.js'),'utf8')+'; questions');
    await page.route('https://roqvdfjbxxiymhhfwlvp.supabase.co/**', async route => {
        const body=JSON.parse(route.request().postData() || '{}');
        let data;
        if(route.request().url().includes('/auth/')) data={access_token:'fixture-token',refresh_token:'fixture-refresh',expires_in:3600};
        else if(body.action==='me') data={user:{id:testUserId,username:'Admin',display_name:'Testprüfer',role:'admin',active:true}};
        else if(body.action==='questions') data={questions:fixtureBank};
        else data={};
        await route.fulfill({json:data});
    });
    await page.addInitScript(() => sessionStorage.setItem('sap_generator_session_v1',JSON.stringify({access_token:'fixture-token',refresh_token:'fixture-refresh',expires_at:9999999999})));
    await page.goto(base);
    await page.evaluate(entries => {for(const [k,v] of Object.entries(entries))localStorage.setItem(k,v)}, storage);
    if (Object.keys(storage).length) await page.reload();
    await page.waitForFunction(()=>document.querySelector('#startBtn,#counter,#saveStatus,#loginForm'));
    return {page,context,errors};
}
async function click(page, action){await page.locator(`button[data-action="${action}"]`).first().click();}
async function start(page, student='Browser-Test', examiner='Prüfer-Test') {
    await page.getByLabel('Name des Prüflings').fill(student);
    await page.getByLabel('Name des Prüfers').fill(examiner);
    await page.locator('#startBtn').click();
    await page.locator('#counter').waitFor();
}
async function complete(page, mode='none') {
    for(let i=0;i<25;i++) {
        const next=page.locator('#nextBtn');
        if (!(await next.count())) break;
        if(mode==='all') for(const box of await page.locator('#checkboxes input').all())await box.check();
        const done=(await next.textContent()).includes('abschließen');
        await next.click();
        if(done)break;
    }
    await page.getByRole('heading',{name:'SAP-Ergebnis',exact:true}).waitFor();
}
async function records(page){return page.evaluate(k=>JSON.parse(localStorage.getItem(k))?.exams || [],key);}
async function noOverflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);}

test('desktop: real start, checkbox navigation, stats/archive detour, reload, completion and exact reopening', async()=>{
    const {page,context,errors}=await session();
    await page.locator('#startBtn').click();
    assert.equal(await page.locator('#counter').count(),0);
    await start(page,'<img src=x onerror="window.XSS=1">','Prüfer & Co.');
    assert.match(await page.locator('#counter').textContent(),/1 \/ 20/);
    const firstQuestion=await page.locator('#question').textContent();
    await page.locator('#checkboxes input').first().check();
    await click(page,'next'); await click(page,'previous');
    assert.equal(await page.locator('#checkboxes input').first().isChecked(),true);
    await click(page,'saved'); await click(page,'stats'); await click(page,'home');
    assert.equal(await page.locator('#question').textContent(),firstQuestion);
    await page.reload();
    assert.equal(await page.locator('#checkboxes input').first().isChecked(),true);
    await complete(page);
    const saved=await records(page); assert.equal(saved.length,1);assert.equal(saved[0].points,1);
    assert.equal(saved[0].questions.length,20);assert.equal(saved[0].answersGiven[0][0],0);
    assert.equal(saved[0].mistakes.reduce((sum,m)=>sum+m.missing.length,0),saved[0].maxPoints-1);
    assert.equal(await page.locator('img').count(),0);assert.equal(await page.evaluate(()=>window.XSS),undefined);
    await page.getByText('Alle 20 Fragen und Bewertungen ansehen').click();
    assert.equal(await page.locator('.reviewQuestion').count(),20);
    await click(page,'saved'); await click(page,'open');
    assert.match(await page.locator('#saveStatus').textContent(),/Lokal gespeichert/);
    await click(page,'stats');
    assert.equal(await page.getByRole('heading',{name:'Prüferstatistik'}).count(),1);
    assert.equal(await page.locator('.metric').count(),6);
    assert.deepEqual(errors,[]);await context.close();
});
test('complete full-marks exam; repeat uses same questions and creates a new result', async()=>{
    const {page,context,errors}=await session();await start(page);await complete(page,'all');
    const original=(await records(page))[0];assert.equal(original.percent,100);assert.equal(original.mistakes.length,0);
    await click(page,'repeat');await page.locator('#startBtn').click();await complete(page);
    const list=await records(page);assert.equal(list.length,2);assert.notEqual(list[0].id,list[1].id);
    assert.deepEqual(list[0].questions,list[1].questions);assert.equal(list[0].points,0);
    assert.deepEqual(errors,[]);await context.close();
});
test('failed archive write keeps completed result; reload and retry save exactly once', async()=>{
    const {page,context,errors}=await session({[draftKey]:JSON.stringify(fixture())});
    await page.addInitScript(()=>{const original=Storage.prototype.setItem;window.restoreStorage=()=>{Storage.prototype.setItem=original};Storage.prototype.setItem=function(key,value){if(key.startsWith('sap_pruefung_archive_v3'))throw new DOMException('Full','QuotaExceededError');return original.call(this,key,value)};});
    await page.reload();await page.locator('#checkboxes input').first().check();await complete(page);
    assert.match(await page.locator('#saveStatus').textContent(),/Noch nicht/);assert.equal((await records(page)).length,0);
    await click(page,'stats');await click(page,'home');assert.match(await page.locator('#saveStatus').textContent(),/Noch nicht/);
    await page.reload();assert.match(await page.locator('#saveStatus').textContent(),/Noch nicht/);
    await page.evaluate(()=>window.restoreStorage());await click(page,'retry-save');
    await page.waitForFunction(()=>document.querySelector('#saveStatus')?.textContent==='Lokal gespeichert');
    assert.equal((await records(page)).length,1);assert.equal((await records(page))[0].points,1);
    await page.reload();assert.equal((await records(page)).length,1);
    assert.deepEqual(errors,[]);await context.close();
});
test('storage access denied still allows an exam and JSON export without closing result',async()=>{
    const {page,context,errors}=await session();
    await page.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException('Blocked','SecurityError')};Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError')};});
    await page.reload();await page.getByLabel('Benutzername',{exact:true}).fill('Admin');await page.getByLabel('Passwort',{exact:true}).fill('FixturePass123');await page.getByRole('button',{name:'Anmelden',exact:true}).click();await start(page);await complete(page);
    assert.match(await page.locator('#saveStatus').textContent(),/Noch nicht/);
    const download=page.waitForEvent('download');await click(page,'export-result');
    assert.equal((await download).suggestedFilename(),'SAP-Ergebnis.json');
    assert.deepEqual(errors,[]);await context.close();
});
test('legacy results open safely; delete confirms once and updates statistics without resurrection',async()=>{
    const old=[{student:'Alt ohne Details',points:4,maxPoints:5,date:'21.10.2026, 12:00:00'},{student:'Alt 2',points:1,maxPoints:5,date:'20.10.2026, 12:00:00'}];
    const {page,context,errors}=await session({sap_pruefungen:JSON.stringify(old)});
    await click(page,'saved');assert.equal(await page.locator('.savedCard').count(),2);
    await click(page,'open');assert.match(await page.locator('#app').textContent(),/keine Fehlerübersicht/);
    await click(page,'saved');let confirms=0;page.on('dialog',()=>confirms++);
    await click(page,'delete');await page.waitForFunction(()=>document.querySelectorAll('.savedCard').length===1);assert.equal(await page.locator('.savedCard').count(),1);assert.equal(confirms,1);
    await click(page,'stats');assert.equal(await page.locator('.metric').first().locator('strong').textContent(),'1');
    await click(page,'saved');await click(page,'delete-all');await page.waitForFunction(()=>document.querySelectorAll('.savedCard').length===0);assert.equal(confirms,2);
    await page.reload();await click(page,'saved');assert.equal(await page.locator('.savedCard').count(),0);
    assert.deepEqual(errors,[]);await context.close();
});
test('JSON download/import, duplicates, bad JSON and HTML injection are handled safely',async()=>{
    const {page,context,errors}=await session({[draftKey]:JSON.stringify(fixture('export'))});
    await complete(page,'all');const dl=page.waitForEvent('download');await click(page,'export-result');
    const download=await dl;const contents=fs.readFileSync(await download.path());
    await click(page,'saved');await click(page,'delete-all');
    await page.locator('#importFile').setInputFiles({name:'result.json',mimeType:'application/json',buffer:contents});
    await page.waitForFunction(()=>document.querySelector('#notice').textContent.startsWith('1 SAP'));
    await page.locator('#importFile').setInputFiles({name:'result.json',mimeType:'application/json',buffer:contents});
    await page.waitForFunction(()=>document.querySelector('#notice').textContent.startsWith('0 SAP'));
    assert.equal((await records(page)).length,1);
    await page.locator('#importFile').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{broken')});
    await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('kein gültiges JSON'));
    assert.equal((await records(page)).length,1);assert.deepEqual(errors,[]);await context.close();
});
test('opening an old result during active exam does not prevent saving the new exam',async()=>{
    const {page,context,errors}=await session({sap_exams:JSON.stringify([{id:1,student:'Old',points:1,maxPoints:2}]),[draftKey]:JSON.stringify(fixture('new-result'))});
    await click(page,'saved');await click(page,'open');await click(page,'home');await complete(page,'all');
    assert.equal((await records(page)).length,2);assert.equal((await records(page)).find(e=>e.id==='new-result').points,5);
    assert.deepEqual(errors,[]);await context.close();
});
test('corrupt archive blocks overwrite and offers raw recovery while result remains visible',async()=>{
    const {page,context,errors}=await session({sap_exams:'{broken',[draftKey]:JSON.stringify(fixture('corrupt'))});
    await click(page,'saved');assert.match(await page.locator('#notice').textContent(),/beschädigt/);
    const download=page.waitForEvent('download');await click(page,'raw-export');await download;
    await click(page,'home');await complete(page);assert.match(await page.locator('#saveStatus').textContent(),/Noch nicht/);
    assert.equal(await page.evaluate(()=>localStorage.getItem('sap_exams')),'{broken');assert.deepEqual(errors,[]);await context.close();
});
test('cancel keeps draft when dismissed and discards only after confirmation',async()=>{
    const {page,context}=await session({[draftKey]:JSON.stringify(fixture('cancel'))});
    page.removeAllListeners('dialog');page.once('dialog',d=>d.dismiss());await click(page,'cancel-exam');
    assert.equal(await page.locator('#counter').count(),1);
    page.once('dialog',d=>d.accept());await click(page,'cancel-exam');
    assert.equal(await page.locator('#startBtn').count(),1);assert.equal(await page.evaluate(k=>localStorage.getItem(k),draftKey),null);await context.close();
});
test('question service error is surfaced without exposing an unprotected exam',async()=>{
    const {page,context}=await session();
    await page.route('**/functions/v1/sap-generator-api',async route=>{const body=JSON.parse(route.request().postData()||'{}');await route.fulfill(body.action==='questions'?{status:503,json:{error:'Fragenservice nicht erreichbar.'}}:{json:{user:{id:testUserId,username:'Admin',display_name:'Testprüfer',role:'admin',active:true}}});});
    await page.reload();await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Fragenservice'));assert.match(await page.locator('#notice').textContent(),/Fragenservice/);assert.equal(await page.locator('#counter').count(),0);await context.close();
});
test('responsive home, 16-answer question, result, archive and dashboard at 320–1440 px',async()=>{
    const {page,context,errors}=await session();
    const shots=path.join(root,'test-results');fs.mkdirSync(shots,{recursive:true});
    for(const width of [320,390,768,1440]) {await page.setViewportSize({width,height:900});await noOverflow(page);}
    await page.screenshot({path:path.join(shots,'desktop-home.png'),fullPage:true});
    const draft=fixture('mobile');draft.student='SehrlangerNameOhneLeerzeichen'.repeat(4);draft.examiner='Mobiler Prüfer';draft.questions[0].answers=Array.from({length:16},(_,i)=>`Erwartete Antwort ${i+1} mit ausführlicher Erläuterung zur Bewertung.`);
    await page.evaluate(({k,v})=>localStorage.setItem(k,v),{k:draftKey,v:JSON.stringify(draft)});await page.reload();
    for(const width of [320,390,768,1440]) {await page.setViewportSize({width,height:900});await noOverflow(page);}
    await page.setViewportSize({width:390,height:844});await page.locator('#checkboxes input').first().check();
    await page.screenshot({path:path.join(shots,'mobile-exam.png'),fullPage:true});
    await complete(page);
    for(const action of ['home','saved','stats']){await click(page,action);for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await noOverflow(page);}}
    await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(shots,'mobile-statistics.png'),fullPage:true});
    await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.join(shots,'desktop-statistics.png'),fullPage:true});
    assert.deepEqual(errors,[]);await context.close();
});
