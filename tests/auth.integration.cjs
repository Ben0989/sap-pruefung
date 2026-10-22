// Opt-in integration test. Supply dedicated QA account credentials through environment variables.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
let base=process.env.SAP_INTEGRATION_BASE_URL||'';
const c={admin:process.env.SAP_INTEGRATION_ADMIN_PASSWORD,teacher:process.env.SAP_INTEGRATION_TEACHER_USERNAME,password:process.env.SAP_INTEGRATION_TEACHER_PASSWORD};
if(Object.values(c).some(v=>!v))throw Error('Supply SAP_INTEGRATION_* credentials for dedicated QA accounts.');
(async()=>{
 let server;
 if(!base){server=require('node:http').createServer((req,res)=>{const file=path.basename(new URL(req.url,'http://localhost').pathname)||'index.html';const target=path.join(__dirname,'..',file);if(!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'text/javascript');res.end(fs.readFileSync(target));});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}/`;}
 const browser=await chromium.launch({headless:true,executablePath:process.env.TEST_BROWSER_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[],shots=path.join(__dirname,'../test-results');fs.mkdirSync(shots,{recursive:true});
 async function open(width){const context=await browser.newContext({viewport:{width,height:900},locale:'de-DE'}),page=await context.newPage();page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route('https://*.supabase.co/**',async route=>{const r=route.request(),h=r.headers();const response=await fetch(r.url(),{method:r.method(),headers:Object.fromEntries(['apikey','authorization','content-type','origin'].filter(k=>h[k]).map(k=>[k,h[k]])),body:r.method()==='POST'?r.postData():undefined,signal:AbortSignal.timeout(25000)});await route.fulfill({status:response.status,headers:Object.fromEntries([...response.headers].filter(([k])=>!['content-length','content-encoding'].includes(k))),body:Buffer.from(await response.arrayBuffer())});});
 await page.goto(base);await page.locator('#loginForm').waitFor();return {page,context};}
 async function login(p,u,pw){await p.getByLabel('Benutzername',{exact:true}).fill(u);await p.getByLabel('Passwort',{exact:true}).fill(pw);await p.getByRole('button',{name:'Anmelden',exact:true}).click();await p.waitForFunction(()=>document.querySelector('#startForm,#counter'));}
 async function click(p,a){await p.locator(`[data-access="${a}"]`).first().click();}
 async function notice(p,text){await p.waitForFunction(text=>document.querySelector('#notice').textContent.includes(text),text);}
 const marker='[AUTOTEST] Formular '+Date.now();
 const a=await open(390),t=await open(1280);
 await a.page.screenshot({path:path.join(shots,'login-mobile.png'),fullPage:true});
 await login(a.page,'Admin',c.admin);assert.equal(await a.page.locator('#usersNav').isVisible(),true);
 await click(a.page,'users');await a.page.locator('#createUserForm').waitFor();
 const username='QA_UI_'+Date.now();if(process.env.SAP_QA_FIXTURE_FILE)fs.writeFileSync(process.env.SAP_QA_FIXTURE_FILE,JSON.stringify({username}));
 await a.page.getByLabel('Benutzername',{exact:true}).fill(username);await a.page.getByLabel('Name des Lehrers').fill('UI-Testlehrer');await a.page.getByLabel('Anfangspasswort').fill('QA-'+crypto.randomBytes(12).toString('hex'));await a.page.getByRole('button',{name:'Lehrer anlegen',exact:true}).click();await notice(a.page,'Lehrerzugang wurde angelegt');
 await a.page.screenshot({path:path.join(shots,'admin-users-mobile.png'),fullPage:true});
 await login(t.page,c.teacher,c.password);assert.equal(await t.page.locator('#usersNav').isVisible(),false);assert.equal(await t.page.locator('#changesNav').isVisible(),false);
 await click(t.page,'questions');await t.page.locator('#questionSearch').waitFor();await t.page.locator('#questionSearch').fill('[AUTOTEST] Über die Eingabemaske bearbeitet');assert.equal(await t.page.locator('.questionCard').count(),1);
 await click(t.page,'edit-question');await t.page.locator('#editQuestion').fill('[AUTOTEST] Über die Eingabemaske bearbeitet');await t.page.locator('#editAnswers').fill('Antwort A\nAntwort B\nAntwort C');await t.page.getByRole('button',{name:'Frage speichern',exact:true}).click();await notice(t.page,'Frage wurde gespeichert');
 await click(t.page,'new-question');await t.page.locator('#editCategory').selectOption('Intern');await t.page.locator('#editQuestion').fill(marker);await t.page.locator('#editSituation').fill('Test der Eingabemaske.');await t.page.locator('#editAnswers').fill('Erster Antwortpunkt\nZweiter Antwortpunkt');await t.page.setViewportSize({width:390,height:844});assert.equal(await t.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await t.page.screenshot({path:path.join(shots,'teacher-question-form-mobile.png'),fullPage:true});
 await t.page.getByRole('button',{name:'Frage speichern',exact:true}).click();await notice(t.page,'Frage wurde gespeichert');await t.page.locator('#questionSearch').fill(marker);await click(t.page,'delete-question');await notice(t.page,'Frage wurde gelöscht');
 await click(a.page,'changes');await a.page.locator('.changeCard').first().waitFor();assert.match(await a.page.locator('.changeCard').first().textContent(),/Gelöscht/);await a.page.locator('.changeCard details summary').first().click();await a.page.screenshot({path:path.join(shots,'admin-changes-mobile.png'),fullPage:true});assert.equal(await a.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await click(a.page,'restore-change');await notice(a.page,'vorherige Zustand wurde wiederhergestellt');
 await click(t.page,'questions');await t.page.locator('#questionSearch').waitFor();await t.page.locator('#questionSearch').fill(marker);assert.equal(await t.page.locator('.questionCard').count(),1);
 await t.page.locator('#homeNav').click();await t.page.locator('#studentName').fill('Automatischer Prüfungstest');await t.page.locator('#startBtn').click();await t.page.locator('#counter').waitFor();await t.page.locator('#checkboxes input').first().check();await click(t.page,'logout');await t.page.locator('#loginForm').waitFor();await login(t.page,c.teacher,c.password);assert.equal(await t.page.locator('#checkboxes input').first().isChecked(),true);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({loginUI:true,adminUserCreationUI:true,teacherRoleUI:true,questionCreateEditDeleteUI:true,adminAuditAndRestoreUI:true,logoutAndResume:true,mobile390:true,errors}));await a.context.close();await t.context.close();await browser.close();if(server)await new Promise(resolve=>server.close(resolve));
})().catch(e=>{console.error(e);process.exit(1)});
