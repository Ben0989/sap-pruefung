const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');

function runtime(initial = {}) {
    const memory = new Map(Object.entries(initial));
    const storage = {
        getItem: key => memory.has(key) ? memory.get(key) : null,
        setItem: (key, value) => memory.set(key, String(value)),
        removeItem: key => memory.delete(key)
    };
    const ctx = vm.createContext({localStorage: storage, console, crypto: require('node:crypto').webcrypto});
    for (const file of ['questions.js', 'generator.js', 'storage.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, {filename: file});
    vm.runInContext('globalThis.api = {bank: questions, engine: SAPEngine, storage: SAPStorage}', ctx);
    return {...ctx.api, memory, nativeStorage: storage};
}
const plain = value => JSON.parse(JSON.stringify(value));
const bank = [
    {id: 'A', category: 'Alpha', question: 'Frage A', answers: ['A1', 'A2', 'A3']},
    {id: 'B', category: 'Beta', question: 'Frage B', situation: 'Situation', answers: ['B1', 'B2']}
];
function result(id = 'result', selections = [[0, 2], [0]], examiner = 'Lehrkraft') {
    return {id, student: 'Testperson', examiner, questions: structuredClone(bank), answersGiven: structuredClone(selections),
        startTime: '2026-10-22T14:00:00.000Z', endTime: '2026-10-22T14:02:30.000Z',
        created: '2026-10-22T14:02:30.000Z', durationSeconds: 150};
}

test('75 unchanged questions; 1,000 exams have exactly 20 unique questions and fixed quotas', () => {
    const {engine, bank: source} = runtime();
    assert.equal(source.length, 75);
    const original = JSON.stringify(source);
    const uniqueOrders = new Set();
    for (let i = 0; i < 1000; i++) {
        const exam = engine.generate(source);
        assert.equal(exam.length, 20);
        assert.equal(new Set(exam.map(q => q.id)).size, 20);
        assert.deepEqual(plain(exam.reduce((a, q) => (a[q.category] = (a[q.category] || 0) + 1, a), {})), plain(engine.blueprint));
        uniqueOrders.add(exam.map(q => q.id).join(','));
        exam[0].answers[0] = 'changed snapshot';
    }
    assert.equal(JSON.stringify(source), original);
    assert.ok(uniqueOrders.size > 990);
});
test('empty, duplicate and incomplete question banks fail with an actionable error', () => {
    const {engine, bank: source} = runtime();
    assert.throws(() => engine.generate([]), /leer/);
    assert.throws(() => engine.generate([...source, source[0]]), /doppelte/);
    assert.throws(() => engine.generate(source.filter(q => q.category !== 'Intern')), /Intern/);
    assert.throws(() => engine.generate([{...source[0], answers: []}]), /Ungültige/);
});
test('points, exact missing answers and category totals are calculated independently', () => {
    const {engine} = runtime();
    const output = engine.evaluate(bank, [[0, 2], [0]]);
    assert.equal(output.points, 3); assert.equal(output.maxPoints, 5);
    assert.equal(output.percent, 60); assert.equal(output.passed, false);
    assert.deepEqual(plain(output.mistakes.map(m => m.missing)), [['A2'], ['B2']]);
    assert.deepEqual(plain(output.categories.map(c => [c.category, c.points, c.maxPoints])), [['Alpha', 2, 3], ['Beta', 1, 2]]);
});
test('80% boundary is exact; 79.6875% fails even though integer rounding gives 80', () => {
    const {engine} = runtime();
    const q = [{id:'boundary', category:'A', question:'Boundary', answers:Array.from({length:64}, (_, i) => String(i))}];
    assert.equal(engine.evaluate(q, [Array.from({length:51}, (_, i) => i)]).passed, false);
    assert.equal(engine.evaluate(bank, [[0,1,2],[0]]).passed, true);
    assert.equal(engine.evaluate(bank, [[],[]]).percent, 0);
    assert.equal(engine.evaluate(bank, [[0,1,2],[0,1]]).percent, 100);
});
test('invalid answer indexes, duplicated points and incomplete answer arrays are rejected', () => {
    const {engine} = runtime();
    for (const bad of [[[0,0],[]], [[-1],[]], [[3],[]], [['0'],[]], [[]]]) assert.throws(() => engine.evaluate(bank, bad));
});
test('saving, opening and re-saving preserve snapshots without duplicate exams', async () => {
    const {storage} = runtime();
    const source = result();
    await storage.save(source);
    source.questions[0] = {...source.questions[0], question:'later change'};
    assert.equal(storage.load()[0].questions[0].question, 'Frage A');
    await storage.save(storage.load()[0]);
    assert.equal(storage.load().length, 1);
    assert.equal(storage.load()[0].durationSeconds, 150);
    assert.equal(storage.load()[0].points, 3);
});
test('both old storage keys migrate, including string scores and absent details', async () => {
    const oldA = [{id:123, student:'Alt A', examiner:'P', points:51, maxPoints:64, percent:80, passed:true, mistakes:[], created:'22.10.2026, 12:00:00'}];
    const oldB = [{student:'Alt B', points:'4', maxPoints:'5', percent:80, passed:true, date:'21.10.2026, 12:00:00'}];
    const {storage, memory} = runtime({sap_exams:JSON.stringify(oldA), sap_pruefungen:JSON.stringify(oldB)});
    assert.equal(storage.load().length, 2);
    assert.equal(storage.load()[0].passed, false);
    assert.equal(storage.load()[1].mistakes, null);
    await storage.save(result());
    assert.equal(storage.load().length, 3);
    assert.equal(memory.get('sap_exams'), JSON.stringify(oldA));
    assert.equal(memory.get('sap_pruefungen'), JSON.stringify(oldB));
    await storage.clear();
    assert.equal(storage.load().length, 0, 'legacy backups must not resurrect deleted exams');
});
test('corrupt JSON, wrong shape and invalid records are never overwritten', async () => {
    for (const raw of ['{broken', '{}', 'null', '[{"points":7,"maxPoints":2}]']) {
        const {storage, memory} = runtime({sap_exams:raw});
        assert.throws(() => storage.load());
        await assert.rejects(storage.save(result()));
        assert.equal(memory.get('sap_exams'), raw);
        assert.equal(memory.has(storage.key), false);
    }
});
test('quota and security failures surface; existing archive stays intact', async () => {
    const {storage, memory, nativeStorage} = runtime();
    await storage.save(result());
    const before = memory.get(storage.key);
    nativeStorage.setItem = () => { throw new Error('QuotaExceededError'); };
    await assert.rejects(storage.save(result('second')), /Speichern fehlgeschlagen/);
    assert.equal(memory.get(storage.key), before);
    nativeStorage.getItem = () => { throw new Error('SecurityError'); };
    assert.throws(() => storage.load(), /keinen Zugriff/);
});
test('draft is restored with all checkboxes, current question and original start time', () => {
    const {storage, memory} = runtime();
    const draft = {version:3, id:'draft1', status:'active', student:'A', examiner:'B', startTime:'2026-10-22T14:00:00Z', endTime:null, index:1, questions:bank, answersGiven:[[0,2],[1]]};
    storage.saveDraft(draft);
    const second = runtime(Object.fromEntries(memory));
    assert.deepEqual(plain(second.storage.loadDraft()), draft);
    second.storage.removeDraft('someone-else');
    assert.ok(second.storage.loadDraft());
    second.storage.removeDraft('draft1');
    assert.equal(second.storage.loadDraft(), null);
});
test('completed unsaved draft retains result and can be saved exactly once after reload', async () => {
    const {storage, memory} = runtime();
    storage.saveDraft({version:3,id:'done',status:'completed',student:'A',examiner:'B',startTime:'2026-10-22T14:00:00Z',endTime:'2026-10-22T14:02:00Z',index:1,questions:bank,answersGiven:[[0],[1]]});
    const second = runtime(Object.fromEntries(memory));
    const draft = second.storage.loadDraft();
    await second.storage.save({...draft, points:0,maxPoints:1});
    await second.storage.save({...draft, points:0,maxPoints:1});
    assert.equal(second.storage.load().length, 1);
    assert.equal(second.storage.load()[0].points, 2);
});
test('JSON export/import preserves every question and does not duplicate identical results', async () => {
    const a = runtime(); await a.storage.save(result());
    const backup = JSON.parse(JSON.stringify(a.storage.envelope(a.storage.load())));
    const b = runtime();
    assert.equal(await b.storage.importData(backup), 1);
    assert.equal(await b.storage.importData(backup), 0);
    assert.deepEqual(plain(a.storage.load()), plain(b.storage.load()));
    const changed = plain(backup); changed.exams[0].student = 'Different person';
    assert.equal(await b.storage.importData(changed), 1);
    assert.equal(b.storage.load().length, 2);
});
test('invalid import is atomic and future backup formats are rejected', async () => {
    const {storage} = runtime(); await storage.save(result());
    const before = JSON.stringify(storage.load());
    assert.throws(() => storage.importData([result('new'), {points:8,maxPoints:2}]), /Ungültige/);
    assert.throws(() => storage.importData({format:'sap-pruefung', version:99, exams:[]}), /unterstützte/);
    assert.equal(JSON.stringify(storage.load()), before);
});
test('statistics calculate actual weighted category totals, error frequency and examiner metrics', async () => {
    const {storage, engine} = runtime();
    await storage.save(result('partial', [[0,2],[0]], 'P1'));
    await storage.save(result('perfect', [[0,1,2],[0,1]], 'P2'));
    await storage.save({id:'old', student:'Alt', examiner:'P1', points:4,maxPoints:5});
    const stats = engine.statistics(storage.load());
    assert.equal(stats.total,3); assert.equal(stats.passed,2); assert.equal(stats.failed,1);
    assert.equal(stats.detailed,2); assert.equal(stats.averagePercent,80); assert.equal(stats.averagePoints,4);
    assert.equal(stats.successRate, 2/3*100);
    const categories = Object.fromEntries(stats.categories.map(c => [c.category,c]));
    assert.equal(categories.Alpha.points,5); assert.equal(categories.Alpha.maxPoints,6);
    assert.equal(categories.Beta.points,3); assert.equal(categories.Beta.maxPoints,4);
    assert.equal(stats.questions.length,2); assert.equal(stats.questions[0].asked,2); assert.equal(stats.questions[0].errors,1);
    assert.equal(stats.examiners.find(e => e.name==='P1').average,70);
    await storage.remove('partial');
    const after = engine.statistics(storage.load());
    assert.equal(after.total,2); assert.equal(after.questions.length,0); assert.equal(after.successRate,100);
});
test('empty statistics contain finite zeros', () => {
    const {engine} = runtime();
    const stats=engine.statistics([]);
    for (const key of ['total','passed','failed','successRate','averagePercent','averagePoints']) assert.equal(stats[key],0);
});
test('asset paths stay relative for GitHub Pages subdirectory deployments', () => {
    const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
    const assets = [...html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)].map(m => m[1]).filter(p => !p.startsWith('data:'));
    assert.equal(assets.length, 6);
    for (const asset of assets) assert.ok(asset.startsWith('./'));
    assert.ok(html.indexOf('storage.js') < html.indexOf('app.js'));
    assert.equal((html.match(/<script defer/g)||[]).length,5);
});

test('teacher archives are isolated; admin can adopt legacy results', async () => {
    const {storage} = runtime({sap_exams:JSON.stringify([{id:1,student:'Alt',points:4,maxPoints:5}])});
    const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002';
    storage.setUser(a,false);assert.equal(storage.load().length,0);await storage.save(result('own-a'));
    storage.setUser(b,false);assert.equal(storage.load().length,0);await storage.save(result('own-b'));
    storage.setUser(a,false);assert.equal(storage.load()[0].id,'own-a');
    storage.setUser('00000000-0000-4000-8000-000000000003',true);assert.equal(storage.load()[0].student,'Alt');
});
