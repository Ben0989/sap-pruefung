const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),path=require('node:path');
const root=path.join(__dirname,'..'),plain=v=>JSON.parse(JSON.stringify(v));
const source=require('node:module').stripTypeScriptTypes(fs.readFileSync(path.join(root,'backend/exams.ts'),'utf8'),{mode:'strip'}).replace(/^export /gm,'');
const backend=vm.createContext({});vm.runInContext(source+';globalThis.api={normalizeExam,normalizeDraft}',backend);const {normalizeExam,normalizeDraft}=backend.api;
const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002';
const bank=[{id:'a',category:'Intern',question:'Frage A',answers:['A1','A2','A3']},{id:'b',category:'RP13',question:'Frage B',answers:['B1','B2']}];
const record=(id='exam',chosen=[[0,2],[0]])=>({id,student:'Testperson',examiner:'Prüfer',questions:plain(bank),answersGiven:plain(chosen),startTime:'2026-10-23T10:00:00Z',endTime:'2026-10-23T10:02:00Z',created:'2026-10-23T10:02:00Z',durationSeconds:120});
function cloud(){return {rows:new Map(),drafts:new Map(),fail:null,calls:0,afterStore:null,badReceipt:false};}
function stable(value){return JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);}
function runtime(initial={},server=cloud(),user=A,admin=true){
 const memory=new Map(Object.entries(initial));const localStorage={get length(){return memory.size},key:i=>[...memory.keys()][i]||null,getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
 async function api(action,body={}){
  if(server.fail?.(action,body))throw Error('Verbindung unterbrochen');
  const dto=row=>({...plain(row.record),id:row.id,sourceId:row.record.id,ownerId:row.owner,canDelete:admin||row.owner===user});
  if(action==='store_exams'){
   server.calls++;let added=0;const receipts=[],exams=[];
   for(const raw of body.exams){const r=plain(normalizeExam(raw)),hash=crypto.createHash('sha256').update(stable(r)).digest('hex');let row=server.rows.get(hash);if(!row){row={id:crypto.randomUUID(),record:r,owner:user,deleted:false};server.rows.set(hash,row);added++;}receipts.push({sourceId:server.badReceipt?'wrong':row.record.id,id:row.id,deleted:row.deleted});if(!row.deleted)exams.push(dto(row));}
   server.afterStore?.();return {added,receipts,exams};
  }
  if(action==='list_exams'){const rows=[...server.rows.values()].filter(r=>!r.deleted);return {exams:rows.slice(body.offset,body.offset+100).map(dto),has_more:rows.length>=body.offset+100};}
  if(action==='delete_exam'){const row=[...server.rows.values()].find(r=>r.id===body.id);if(!admin&&row.owner!==user)throw Error('Nur der Ersteller oder Admin');row.deleted=true;return {ok:true};}
  if(action==='clear_exams'){if(!admin)throw Error('Nur Admin');for(const row of server.rows.values())row.deleted=true;return {ok:true};}
  if(action==='load_draft'){const d=server.drafts.get(user);return d?plain(d):{draft:null,revision:0};}
  if(action==='save_draft'){const old=server.drafts.get(user);if((old?.revision||0)!==body.revision)throw Error('anderes Gerät');const value={draft:plain(normalizeDraft(body.draft)),revision:body.revision+1};server.drafts.set(user,value);return {revision:value.revision};}
  if(action==='remove_draft'){const old=server.drafts.get(user);if(old&&(old.revision!==body.revision||old.draft.id!==body.id))throw Error('anderes Gerät');server.drafts.delete(user);return {ok:true};}
  throw Error(action);
 }
 const ctx=vm.createContext({localStorage,SAPAccess:{api},console,crypto:crypto.webcrypto});
 for(const file of ['questions.js','generator.js','storage.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
 vm.runInContext('globalThis.testApi={engine:SAPEngine,storage:SAPStorage,bank:questions}',ctx);
 ctx.testApi.storage.setUser(user,admin);return {...ctx.testApi,memory,server,api};
}
const envelope=rows=>JSON.stringify({format:'sap-pruefung',version:3,exams:rows});
const scoped=id=>'sap_pruefung_archive_v3_'+id;
const draft=()=>({version:3,id:'draft',status:'active',student:'Student',examiner:'Lehrer',startTime:'2026-10-23T10:00:00Z',endTime:null,index:0,questions:plain(bank),answersGiven:[[],[]]});


module.exports={runtime,cloud,record,draft,A,B,envelope,scoped,plain,bank,normalizeExam,normalizeDraft};
