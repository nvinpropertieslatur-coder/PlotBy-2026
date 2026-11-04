import AsyncStorage from '@react-native-async-storage/async-storage';

export const GUEST_PROPERTY_KEY = '@plotby/guest-test-properties:v1';
export const isGuestPropertyId = id => typeof id === 'string' && id.startsWith('guest-test:');
const isGuestRecord = row => row && isGuestPropertyId(row.id) && row.storage_mode === 'guest-test' && row.user_id === null;

/** Guest records never share the Supabase table or the auth session storage key. */
export function createGuestPropertyStore(storage, makeId = () => `guest-test:${Date.now().toString(36)}:${Math.random().toString(36).slice(2)}`) {
  let pending = Promise.resolve();
  const read = async () => {
    const value = await storage.getItem(GUEST_PROPERTY_KEY);
    if (!value) return [];
    let rows;
    try { rows = JSON.parse(value); }
    catch { throw new Error('Saved property data could not be read on this device. No server records were requested.'); }
    if (!Array.isArray(rows)) throw new Error('Saved property storage has an unsupported format.');
    return rows.filter(isGuestRecord);
  };
  const mutate = operation => {
    const result = pending.then(async () => {
      const rows = await read();
      const { next, value } = operation(rows);
      await storage.setItem(GUEST_PROPERTY_KEY, JSON.stringify(next));
      return value;
    });
    pending = result.catch(() => {});
    return result;
  };
  return {
    getProperties: async () => { await pending; return read(); },
    saveProperty: (data, propertyId) => mutate(rows => {
      const existing = propertyId ? rows.find(row => row.id === propertyId) : null;
      if (propertyId && (!isGuestPropertyId(propertyId) || !existing)) throw new Error('This property is no longer available on this device.');
      const now = new Date().toISOString();
      const record = { ...data, id: existing?.id || makeId(), user_id: null, storage_mode: 'guest-test', title: 'Property', property_type: data.property_type || data.type || 'Property', status: 'unverified', created_at: existing?.created_at || now, updated_at: now };
      return { next: existing ? rows.map(row => row.id === propertyId ? record : row) : [record, ...rows], value: record };
    }),
    deleteProperty: propertyId => mutate(rows => {
      if (!isGuestPropertyId(propertyId) || !rows.some(row => row.id === propertyId)) throw new Error('Property not found on this device.');
      return { next: rows.filter(row => row.id !== propertyId), value: true };
    }),
  };
}

export const guestPropertyStore = createGuestPropertyStore(AsyncStorage);
