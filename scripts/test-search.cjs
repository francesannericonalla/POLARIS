const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, imports = {}) {
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: (id) => id in imports ? imports[id] : require(id),
  });
  return module.exports;
}

const { searchUnits } = load('src/lib/search-units.ts');
const units = [
  { id: 'college', name: 'College of Computer Studies', type: 'college', branch: 'academics' },
  { id: 'it', name: 'BS Information Technology', type: 'department', parent_id: 'college', branch: 'academics' },
  { id: 'cs', name: 'BS Computer Science', type: 'department', parent_id: 'college', branch: 'academics' },
  { id: 'finance', name: 'Finance and Accounting Office', type: 'office', branch: 'administration' },
];

test('finds departments by name, college, initials, and multiple terms', () => {
  assert.equal(searchUnits(units, 'information')[0].id, 'it');
  assert.equal(searchUnits(units, 'computer studies').length, 2);
  assert.equal(searchUnits(units, 'CCS').length, 2);
  assert.equal(searchUnits(units, 'ccs technology')[0].id, 'it');
  assert.equal(searchUnits(units, 'ACCOUNTING')[0].id, 'finance');
  assert.equal(searchUnits(units, 'computer studies')[0].context, 'College of Computer Studies');
  assert.equal(searchUnits(units, 'college').some((unit) => unit.type === 'college'), false);
  for (const query of ['', 'x', '??', 'not-a-real-unit']) assert.equal(searchUnits(units, query).length, 0);
});

function routeFor(profile, fail = false) {
  const calls = [];
  const { GET } = load('src/app/api/search/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@/lib/auth': { getCurrentProfile: async () => profile },
    '@/lib/data/documents': { searchDocumentsGlobal: async (...args) => { calls.push(args); if (fail) throw Error(); return []; } },
    '@/lib/data/units': { getAllUnits: async () => units },
    '@/lib/search-units': { searchUnits },
  });
  return { get: (q) => GET({ nextUrl: new URL(`http://localhost/api/search?q=${encodeURIComponent(q)}`) }), calls };
}

test('search endpoint requires approval and excludes system admins', async () => {
  for (const profile of [null, { status: 'pending' }, { status: 'suspended' }, { status: 'rejected' }]) {
    const route = routeFor(profile);
    assert.equal((await route.get('computer')).status, 401);
    assert.equal(route.calls.length, 0);
  }
  const admin = routeFor({ status: 'approved', role: 'system_admin' });
  assert.equal((await admin.get('computer')).status, 403);
  assert.equal(admin.calls.length, 0);
});

test('QAO finds all matching units; office users only find their own', async () => {
  const qao = routeFor({ status: 'approved', role: 'qao' });
  assert.equal((await qao.get('computer studies')).body.units.length, 2);
  const office = routeFor({ status: 'approved', role: 'office_user', unit_id: 'it' });
  const response = await office.get('computer studies');
  assert.equal(response.body.units.length, 1);
  assert.equal(response.body.units[0].id, 'it');
  assert.equal(office.calls[0][1].unitId, 'it');
  assert.equal((await office.get('finance')).body.units.length, 0);
  const unassigned = routeFor({ status: 'approved', role: 'office_user', unit_id: null });
  assert.equal((await unassigned.get('computer')).body.units.length, 0);
});

test('short searches skip data access and failures return an error', async () => {
  const route = routeFor({ status: 'approved', role: 'qao' });
  assert.equal((await route.get('x')).body.units.length, 0);
  assert.equal(route.calls.length, 0);
  assert.equal((await routeFor({ status: 'approved', role: 'qao' }, true).get('report')).status, 500);
});

test('document query searches titles and filenames with scope and literal punctuation', async () => {
  let filter;
  let scopes;
  let calls = 0;
  const documents = load('src/lib/data/documents.ts', {
    'server-only': {},
    'next/cache': { unstable_cache: (fn) => fn },
    '@/lib/supabase/admin': { createAdminClient: () => {
      calls++;
      scopes = [];
      const query = {
        select() { return query; }, or(value) { filter = value; return query; },
        eq(...args) { scopes.push(args); return query; }, order() { return query; }, limit() { return query; },
        then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); },
      };
      return { from: () => query };
    } },
  });
  await documents.searchDocumentsGlobal('Student Copy.pdf', { role: 'qao' });
  assert.equal(filter, 'title.ilike."%Student Copy.pdf%",file_name.ilike."%Student Copy.pdf%"');
  assert(scopes.some(([key, value]) => key === 'is_latest' && value === true));
  assert(scopes.some(([key, value]) => key === 'archived' && value === false));
  await documents.searchDocumentsGlobal('100%_(final),"copy"', { role: 'office_user', unitId: 'it' });
  assert(filter.includes('100\\\\%\\\\_(final),\\"copy\\"'));
  assert(scopes.some(([key, value]) => key === 'unit_id' && value === 'it'));
  const before = calls;
  for (const opts of [{}, { role: 'system_admin' }, { role: 'office_user' }]) {
    assert.equal((await documents.searchDocumentsGlobal('report', opts)).length, 0);
  }
  assert.equal(calls, before);
});
