import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const url = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Object.values(JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}'))[0] as string;
const categories = new Set(['Verstoß','RP13','Greenzones','Funkcodes','Korruption','Intern','Dienstvorschriften']);
const emailFor = (username: string) => `sap-${username.toLowerCase()}@sap.glendale.invalid`;
class Failure extends Error { constructor(public status: number, message: string) { super(message); } }
const fail = (status: number, message: string): never => { throw new Failure(status, message); };
const dbCheck = (error: any) => { if (error) fail(400, error.message?.includes('benötigt mindestens') ? error.message : 'Die Änderung konnte nicht gespeichert werden. Bitte prüfe die Eingaben.'); };
const passwordValid = (password: unknown) => typeof password === 'string' && password.length >= 10 && new TextEncoder().encode(password).length <= 72;
const safeUser = (user: any) => ({id:user.id,username:user.username,display_name:user.display_name,role:user.role,active:user.active,created_at:user.created_at});
function validateQuestion(value: any) {
    if (!value || !categories.has(value.category) || typeof value.question !== 'string' || !value.question.trim() || value.question.trim().length > 1500 ||
        (value.situation != null && (typeof value.situation !== 'string' || value.situation.length > 3000)) || !Array.isArray(value.answers) || value.answers.length < 1 || value.answers.length > 40 ||
        value.answers.some((a: unknown) => typeof a !== 'string' || !a.trim() || a.length > 2000)) fail(400,'Bitte Kategorie, Frage und 1–40 Antwortpunkte vollständig ausfüllen.');
    return {category:value.category,question:value.question.trim(),situation:(value.situation || '').trim(),answers:value.answers.map((a: string)=>a.trim())};
}

Deno.serve(async request => {
    const origin = request.headers.get('origin') || '';
    const allowed = !origin || origin === 'https://ben0989.github.io' || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    const headers: Record<string,string> = {'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',
        'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info,x-sap-bootstrap',
        'Access-Control-Allow-Methods':'POST,OPTIONS'};
    if (allowed && origin) headers['Access-Control-Allow-Origin']=origin;
    const respond = (body: any,status=200) => new Response(JSON.stringify(body),{status,headers});
    if (!allowed) return respond({error:'Dieser Ursprung ist nicht zugelassen.'},403);
    if (request.method==='OPTIONS') return new Response(null,{status:204,headers});
    if (request.method!=='POST') return respond({error:'POST erforderlich.'},405);
    try {
        const raw=await request.text();
        if (raw.length>100000) fail(413,'Die Anfrage ist zu groß.');
        let body: any;try {body=JSON.parse(raw);}catch {fail(400,'Ungültige Anfrage.');}
        const server=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
        // INITIAL_ADMIN_BOOTSTRAP
        const token=(request.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');
        if (!token) fail(401,'Bitte anmelden.');
        const {data:authData,error:authError}=await server.auth.getUser(token);
        if (authError || !authData.user) fail(401,'Die Anmeldung ist abgelaufen. Bitte erneut anmelden.');
        const {data:actor,error:actorError}=await server.from('sapg_users').select('*').eq('id',authData.user.id).maybeSingle();
        if (actorError || !actor || !actor.active) fail(403,'Dieser Benutzer ist für den SAP-Generator nicht freigeschaltet.');
        let sessionId='';try {sessionId=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).session_id;}catch {fail(401,'Ungültige Sitzung.');}
        if(!/^[0-9a-f-]{36}$/i.test(sessionId))fail(401,'Ungültige Sitzung.');
        const {data:sessionActive,error:sessionError}=await server.rpc('sapg_session_active',{p_user_id:actor.id,p_session_id:sessionId,p_not_before:actor.token_not_before});
        if(sessionError)fail(503,'Die Sitzung konnte nicht geprüft werden. Bitte erneut versuchen.');
        if(!sessionActive)fail(401,'Die Sitzung wurde widerrufen. Bitte erneut anmelden.');
        const admin=actor.role==='admin';
        const requireAdmin=()=>{if(!admin)fail(403,'Diese Funktion ist ausschließlich für den Admin verfügbar.');};
        const db=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{'x-sap-actor-id':actor.id,'x-sap-actor-name':actor.username}}});
        const action=body.action;
        if (action==='me') return respond({user:safeUser(actor)});
        if (action==='questions') {
            let query=db.from('sapg_questions').select('*').order('category').order('created_at').order('id');
            if (!admin || !body.include_deleted) query=query.is('deleted_at',null);
            const {data,error}=await query;dbCheck(error);return respond({questions:data});
        }
        if (action==='create_question') {
            const values=validateQuestion(body.question);
            const {data,error}=await db.from('sapg_questions').insert({id:`Q-${crypto.randomUUID()}`,...values}).select().single();dbCheck(error);return respond({question:data},201);
        }
        if (action==='update_question' || action==='delete_question') {
            if (typeof body.id!=='string' || !Number.isInteger(body.version)) fail(400,'Fragenkennung oder Versionsnummer fehlt.');
            const values=action==='delete_question'?{deleted_at:new Date().toISOString()}:validateQuestion(body.question);
            const {data,error}=await db.from('sapg_questions').update(values).eq('id',body.id).eq('version',body.version).is('deleted_at',null).select().maybeSingle();
            dbCheck(error);if(!data)fail(409,'Diese Frage wurde inzwischen geändert oder gelöscht. Bitte den Fragenkatalog neu laden.');return respond({question:data});
        }
        if (action==='changes') {
            requireAdmin();
            const page=Number.isInteger(body.page)&&body.page>=0?Math.min(body.page,100000):0;
            const {data,error}=await db.from('sapg_changes').select('*').order('id',{ascending:false}).range(page*50,page*50+50);
            dbCheck(error);return respond({changes:data?.slice(0,50),has_more:(data?.length||0)>50,page});
        }
        if (action==='restore_change') {
            requireAdmin();
            if (!Number.isInteger(body.version) || !/^\d+$/.test(String(body.change_id))) fail(400,'Änderung oder Versionsnummer fehlt.');
            const {data:change,error:changeError}=await db.from('sapg_changes').select('*').eq('id',body.change_id).maybeSingle();dbCheck(changeError);if(!change)fail(404,'Änderung nicht gefunden.');
            const restoreDb=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{'x-sap-actor-id':actor.id,'x-sap-actor-name':actor.username,'x-sap-change-action':'restore','x-sap-restore-of':String(change.id)}}});
            const values=change.before_record?{...validateQuestion(change.before_record),deleted_at:change.before_record.deleted_at}: {deleted_at:new Date().toISOString()};
            const {data,error}=await restoreDb.from('sapg_questions').update(values).eq('id',change.question_id).eq('version',body.version).select().maybeSingle();
            dbCheck(error);if(!data)fail(409,'Die Frage wurde inzwischen erneut geändert. Bitte neu laden und erneut prüfen.');return respond({question:data});
        }
        if (action==='users') {
            requireAdmin();const {data,error}=await db.from('sapg_users').select('id,username,display_name,role,active,created_at').order('created_at');dbCheck(error);return respond({users:data});
        }
        if (action==='create_user') {
            requireAdmin();
            const username=typeof body.username==='string'?body.username.trim():'';
            const displayName=typeof body.display_name==='string'?body.display_name.trim():'';
            if (!/^[A-Za-z0-9._-]{3,40}$/.test(username) || !displayName || displayName.length>120 || !passwordValid(body.password)) fail(400,'Benutzername: 3–40 Buchstaben/Ziffern/Punkt/Unterstrich/Bindestrich. Passwort: mindestens 10 Zeichen, maximal 72 UTF-8-Bytes.');
            const {data:duplicate}=await db.from('sapg_users').select('id').ilike('username',username.replace(/_/g,'\\_')).maybeSingle();if(duplicate)fail(409,'Dieser Benutzername ist bereits vergeben.');
            const {data:created,error:createError}=await server.auth.admin.createUser({email:emailFor(username),password:body.password,email_confirm:true,app_metadata:{application:'sap-generator'}});
            if(createError || !created.user) fail(400,'Der Benutzer konnte nicht angelegt werden. Möglicherweise ist der Name bereits vergeben oder das Passwort ungeeignet.');
            const {data,error}=await db.from('sapg_users').insert({id:created.user.id,username,display_name:displayName,role:'teacher'}).select().single();
            if(error){await server.auth.admin.deleteUser(created.user.id);dbCheck(error);}return respond({user:safeUser(data)},201);
        }
        if (action==='set_user_active' || action==='reset_password') {
            requireAdmin();
            const {data:target,error:targetError}=await db.from('sapg_users').select('*').eq('id',body.id).maybeSingle();dbCheck(targetError);if(!target)fail(404,'Benutzer nicht gefunden.');
            if(action==='set_user_active') {
                if(target.role==='admin')fail(400,'Der Adminzugang kann nicht gesperrt werden.');
                if(typeof body.active!=='boolean')fail(400,'Ungültiger Benutzerstatus.');
                const {error}=await db.from('sapg_users').update({active:body.active,token_not_before:Date.now()}).eq('id',target.id);dbCheck(error);return respond({ok:true});
            }
            if(!passwordValid(body.password))fail(400,'Das neue Passwort muss mindestens 10 Zeichen enthalten und darf 72 UTF-8-Bytes nicht überschreiten.');
            const {error:passwordError}=await server.auth.admin.updateUserById(target.id,{password:body.password});if(passwordError)fail(400,'Das Passwort konnte nicht geändert werden.');
            const {error}=await db.from('sapg_users').update({token_not_before:Date.now()}).eq('id',target.id);dbCheck(error);return respond({ok:true,sign_out:target.id===actor.id});
        }
        fail(404,'Unbekannte Aktion.');
    } catch(error) {
        return respond({error:error instanceof Failure?error.message:'Die Anfrage konnte nicht verarbeitet werden. Bitte erneut versuchen.'},error instanceof Failure?error.status:500);
    }
});
