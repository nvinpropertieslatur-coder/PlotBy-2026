const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(relative, overrides = {}) {
 const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
 const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
 const module = { exports: {} }; new Function('module', 'exports', 'require', outputText)(module, module.exports, name => Object.hasOwn(overrides, name) ? overrides[name] : require(name)); return module.exports;
}
const { propertyToPlot } = load('src/browse/features/plots/propertyAdapter.ts');
const { resetSelectionForPlots } = load('src/browse/features/plots/selection.ts');
test('primary numeric database fields and contact details map without changing coordinates', () => {
 const plot = propertyToPlot({ id: 42, city: ' Latur ', latitude: '18.4', longitude: '76.5', total_area: '1200', rate_per_sqft: '1000', total_amount: '1100000', facing: ['East: 30'], agent_full_name: 'Agent', images: ['https://example.com/image.jpg'] });
 assert.equal(plot.id, '42'); assert.equal(plot.cityId, 'latur'); assert.equal(plot.latitude, 18.4); assert.equal(plot.longitude, 76.5);
 assert.equal(plot.finalAmount, 1100000); assert.equal(plot.areaSqft, 1200); assert.equal(plot.contactName, 'Agent'); assert.equal(plot.primaryFacing, 'East: 30');
});
test('missing, blank, boolean, nonfinite and out of range coordinates are excluded', () => {
 for (const latitude of [undefined, null, '', ' ', true, 'invalid', Infinity, 91, -91]) assert.equal(propertyToPlot({ id: 'x', latitude, longitude: 76 }), null);
 for (const longitude of [undefined, null, '', false, Infinity, 181, -181]) assert.equal(propertyToPlot({ id: 'x', latitude: 18, longitude }), null);
 assert.ok(propertyToPlot({ id: 'zero', latitude: 0, longitude: 0 }));
});
test('removed records reset selection; empty city clears selection', () => {
 assert.equal(resetSelectionForPlots([{ id: 'remaining' }], 'deleted'), 'remaining');
 assert.equal(resetSelectionForPlots([], 'deleted'), undefined);
});
test('one application root, one client, no router or old navbar imports', () => {
 const root = path.join(__dirname, '..');
 function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(path.join(dir, item.name)) : /\.[jt]sx?$/.test(item.name) ? [path.join(dir, item.name)] : []); }
 const source = [path.join(root, 'App.tsx'), ...walk(path.join(root, 'src'))].map(file => fs.readFileSync(file, 'utf8')).join('\n');
 assert.equal((source.match(/<NavigationContainer>/g) || []).length, 1);
 assert.equal((source.match(/createClient(?:<[^>]+>)?\(/g) || []).length, 1);
 assert.doesNotMatch(source, /from ['"]expo-router['"]/);
 assert.doesNotMatch(source, /import BottomNavV1/);
 assert.doesNotMatch(source, /SAMPLE_PLOTS/);
});

test('multiword city names match the city-selector identifier', () => {
 assert.equal(propertyToPlot({ id: 1, city: ' Chhatrapati Sambhajinagar ', latitude: 19.8, longitude: 75.3 }).cityId, 'chhatrapati-sambhajinagar');
});

const access = load('src/services/propertyAccess.js');
const guestModule = load('src/services/guestPropertyStore.js', { '@react-native-async-storage/async-storage': { default: {} } });
const { getAuthReturnState } = load('src/navigation/authReturn.js');
function storeFixture(initial) {
 let value = initial ?? null, sequence = 0;
 const storage = { getItem: async () => value, setItem: async (key, next) => { assert.equal(key, guestModule.GUEST_PROPERTY_KEY); value = next; } };
 return guestModule.createGuestPropertyStore(storage, () => `guest-test:${++sequence}`);
}
function clientFixture(user = null, rows = []) {
 const calls = [];
 const client = { calls, auth: {
  getSession: async () => ({ data: { session: user ? { user } : null }, error: null }),
  getUser: async () => ({ data: { user }, error: null }),
 }, from: table => {
  calls.push(['from', table]);
  let filters = [], operation = 'read', payload, limit, single = false;
  const q = {
   select: fields => { calls.push(['select', fields]); return q; },
   filter: (...args) => { calls.push(['filter', ...args]); filters.push([args[0], args[2]]); return q; },
   eq: (column, value) => { calls.push(['eq', column, value]); filters.push([column, value]); return q; },
   limit: count => { limit = count; return q; },
   maybeSingle: () => { single = true; return q; },
   insert: data => { operation = 'insert'; payload = data[0]; calls.push(['insert', payload]); return q; },
   update: data => { operation = 'update'; payload = data; calls.push(['update', payload]); return q; },
   delete: () => { operation = 'delete'; calls.push(['delete']); return q; },
   then: (resolve, reject) => {
    let result = rows.filter(row => filters.every(([key, value]) => row[key] === value));
    if (limit === 0) result = [];
    if (operation === 'insert') result = [{ ...payload, id: 'server-new' }];
    if (operation === 'update') result = result.map(row => ({ ...row, ...payload }));
    return Promise.resolve({ data: single ? result[0] || null : result, error: null }).then(resolve, reject);
   },
  };
  return q;
 } };
 return client;
}
function serviceFor(client, store = storeFixture()) {
 return load('src/services/propertyService.js', { '../lib/supabase': { supabase: client }, './propertyAccess': access, './guestPropertyStore': { guestPropertyStore: store, isGuestPropertyId: guestModule.isGuestPropertyId } });
}
test('guest startup and empty My Properties make zero property database requests', async () => {
 const client = clientFixture();
 const service = serviceFor(client);
 assert.deepEqual(await service.getPropertyWorkspace(), { mode: 'guest', userId: null, properties: [] });
 assert.deepEqual(await service.getProperties(), []);
 assert.equal(client.calls.length, 0);
});
test('guest create, refresh, update, details and delete stay local without another user id', async () => {
 const client = clientFixture(), store = storeFixture(), service = serviceFor(client, store);
 const result = await service.saveProperty({ city: 'Latur', total_area: 1200, user_id: 'victim', status: 'approved', owner_id: 'victim' }, { propertyType: 'plot' });
 assert.equal(result.mode, 'guest'); assert.equal(result.property.user_id, null); assert.equal(result.property.owner_id, undefined);
 assert.equal(result.property.status, 'unverified'); assert.equal(result.property.storage_mode, 'guest-test');
 assert.equal(result.property.type, 'plot');
 assert.equal((await service.getMyProperties()).length, 1);
 await service.saveProperty({ city: 'Pune' }, { propertyId: result.property.id, propertyType: 'plot' });
 assert.equal((await service.getPropertyDetails(result.property.id)).property.city, 'Pune');
 await service.deleteProperty(result.property.id);
 assert.equal((await service.getMyProperties()).length, 0);
 assert.equal(client.calls.length, 0);
});
test('guest mode cannot read or mutate a server property even with a known id', async () => {
 const client = clientFixture(), service = serviceFor(client);
 assert.equal((await service.getPropertyDetails('private-server-id')).property, null);
 await assert.rejects(service.saveProperty({}, { propertyId: 'private-server-id' }), error => error.code === 'AUTH_REQUIRED');
 await assert.rejects(service.deleteProperty('private-server-id'), error => error.code === 'AUTH_REQUIRED');
 assert.equal(client.calls.length, 0);
});
test('signed-in My Properties and map browsing exclude other owners and local test records', async () => {
 const owner = { id: 'verified-owner' }, store = storeFixture();
 await store.saveProperty({ city: 'Latur' });
 const rows = [{ id: 'mine', user_id: owner.id }, { id: 'not-mine', user_id: 'another-user' }];
 const client = clientFixture(owner, rows), service = serviceFor(client, store);
 const workspace = await service.getPropertyWorkspace();
 assert.equal(workspace.mode, 'authenticated'); assert.deepEqual(workspace.properties, [rows[0]]);
 assert.deepEqual(await service.getProperties(), [rows[0]]);
 assert.equal((await service.getPropertyDetails('not-mine')).property, null);
 assert.ok(client.calls.some(call => call[0] === 'filter' && call[1] === service.propertyOwnerColumn && call[3] === owner.id));
 assert.equal((await store.getProperties()).length, 1);
});
test('authenticated saves override forged owner ids and do not allow status approval fields', async () => {
 const client = clientFixture({ id: 'verified-owner' }), service = serviceFor(client);
 const result = await service.saveProperty({ city: 'Latur', user_id: 'another-user', status: 'approved' });
 const payload = client.calls.find(call => call[0] === 'insert')[1];
 assert.equal(payload[service.propertyOwnerColumn], 'verified-owner'); assert.equal(payload.status, undefined);
 assert.equal(result.mode, 'authenticated');
});
test('server edits and deletes use both property id and verified owner', async () => {
 const client = clientFixture({ id: 'owner' }, [{ id: 'mine', user_id: 'owner' }, { id: 'other', user_id: 'other-owner' }]);
 const service = serviceFor(client);
 await service.saveProperty({ city: 'Latur' }, { propertyId: 'mine' });
 await service.deleteProperty('mine');
 await assert.rejects(service.deleteProperty('other'), /unavailable/);
 assert.ok(client.calls.some(call => call[0] === 'eq' && call[1] === 'id' && call[2] === 'mine'));
 assert.ok(client.calls.some(call => call[0] === 'filter' && call[3] === 'owner'));
});
test('an invalid existing session is not silently treated as a guest submission', async () => {
 const client = clientFixture({ id: 'owner' });
 client.auth.getUser = async () => ({ data: { user: null }, error: new Error('Session validation unavailable') });
 const store = storeFixture(), service = serviceFor(client, store);
 await assert.rejects(service.saveProperty({ city: 'Latur' }), /validation unavailable/);
 assert.equal((await store.getProperties()).length, 0); assert.equal(client.calls.length, 0);
});
test('account switching during a save prevents the mutation', async () => {
 const client = clientFixture({ id: 'owner-a' }); let reads = 0;
 client.auth.getSession = async () => ({ data: { session: { user: { id: ++reads === 1 ? 'owner-a' : 'owner-b' } } }, error: null });
 await assert.rejects(serviceFor(client).saveProperty({ city: 'Latur' }), /active account changed/);
 assert.ok(!client.calls.some(call => call[0] === 'insert'));
});
test('guest writes are serialized; corrupt or non-guest storage never falls back to remote records', async () => {
 const store = storeFixture();
 await Promise.all([store.saveProperty({ city: 'Latur' }), store.saveProperty({ city: 'Pune' })]);
 assert.equal((await store.getProperties()).length, 2);
 const mixed = storeFixture(JSON.stringify([{ id: 'server-row', user_id: 'victim' }, { id: 'guest-test:fake', user_id: 'victim', storage_mode: 'guest-test' }]));
 assert.deepEqual(await mixed.getProperties(), []);
 await assert.rejects(storeFixture('invalid-json').getProperties(), /could not be read/);
});
test('missing ownership is reported precisely and never disables RLS', async () => {
 const client = clientFixture();
 client.from = () => ({ select: column => ({ limit: async () => ({ error: { code: '42703', message: `column properties.${column} does not exist` } }) }) });
 await assert.rejects(serviceFor(client).checkPropertyOwnership(), error => error.code === 'OWNERSHIP_REQUIRED');
 assert.equal(access.isMissingOwnerColumn({ code: '42501', message: 'permission denied' }, 'user_id'), false);
});
test('OTP return uses the single My Properties tab and preserves existing edit form params', () => {
 const form = { key: 'form', name: 'AddProperty', params: { property: { id: 'mine' } } };
 assert.equal(getAuthReturnState('AddProperty', [{ name: 'MainTabs' }, form, { name: 'OTP' }]).routes[1], form);
 assert.deepEqual(getAuthReturnState('MyProperties', []), { index: 0, routes: [{ name: 'MainTabs', params: { screen: 'Profile' } }] });
});
test('normal navigation has no auth gate, Profile opens My Properties, Edit Profile remains separate', () => {
 const root = fs.readFileSync(path.join(__dirname, '../src/navigation/appnavigator.jsx'), 'utf8');
 const tabs = fs.readFileSync(path.join(__dirname, '../src/navigation/MainTabs.jsx'), 'utf8');
 const workspace = fs.readFileSync(path.join(__dirname, '../src/navigation/PropertyWorkspace.jsx'), 'utf8');
 assert.doesNotMatch(root, /RequirePropertyAccess|name="MyProperties"/);
 assert.match(root, /name="EditProfile"/); assert.match(tabs, /name="Profile" component={PropertyWorkspace}/);
 assert.match(workspace, /<MyPropertiesScreen/); assert.match(workspace, /onEditProfile=.*navigate\('EditProfile'\)/);
 const form = fs.readFileSync(path.join(__dirname, '../src/screens/forms/AddPropertyScreen.jsx'), 'utf8');
 assert.doesNotMatch(form, /navigate\(['"]SignIn/);
});
test('no application source imports deprecated core SafeAreaView', () => {
 const root = path.join(__dirname, '../src');
 function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(path.join(dir, item.name)) : /\.[jt]sx?$/.test(item.name) ? [path.join(dir, item.name)] : []); }
 for (const file of walk(root)) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  for (const statement of source.statements) {
   if (!ts.isImportDeclaration(statement) || statement.moduleSpecifier.text !== 'react-native') continue;
   const imports = statement.importClause?.namedBindings;
   if (imports && ts.isNamedImports(imports)) assert.ok(!imports.elements.some(item => (item.propertyName || item.name).text === 'SafeAreaView'), file);
  }
 }
});
