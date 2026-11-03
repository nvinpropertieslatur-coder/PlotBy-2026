import { supabase } from '../lib/supabase';
import { guestPropertyStore, isGuestPropertyId } from './guestPropertyStore';
import { isMissingOwnerColumn, PropertyAccessError, resolvePropertyOwnerColumn } from './propertyAccess';

export const propertyOwnerColumn = process.env.EXPO_PUBLIC_PROPERTY_OWNER_COLUMN?.trim() || 'user_id';
const ownerColumn = () => resolvePropertyOwnerColumn(propertyOwnerColumn);
const checkedError = error => {
  if (isMissingOwnerColumn(error, propertyOwnerColumn)) throw new PropertyAccessError('OWNERSHIP_REQUIRED');
  throw error;
};

/** No session is normal. A failed verification of an existing session is NOT guest mode. */
export async function getCurrentPropertyUser() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new PropertyAccessError('AUTH_REQUIRED');
  return user;
}
export async function requirePropertyUser() {
  const user = await getCurrentPropertyUser();
  if (!user) throw new PropertyAccessError('AUTH_REQUIRED');
  return user;
}
export async function checkPropertyOwnership() {
  const { error } = await supabase.from('properties').select(ownerColumn()).limit(0);
  if (error) checkedError(error);
}
async function checkSameAccount(user) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (session?.user?.id !== user.id) throw new Error('The active account changed. Please retry in the current workspace.');
}

export async function getPropertyWorkspace() {
  const user = await getCurrentPropertyUser();
  if (!user) return { mode: 'guest', userId: null, properties: await guestPropertyStore.getProperties() };
  const { data, error } = await supabase.from('properties').select('*').filter(ownerColumn(), 'eq', user.id);
  if (error) checkedError(error);
  await checkSameAccount(user);
  return { mode: 'authenticated', userId: user.id, properties: data || [] };
}
export async function getMyProperties() { return (await getPropertyWorkspace()).properties; }

// Geographic browsing stays within the authenticated workspace. RLS remains the
// authority; the client only removes records that must never become map markers
// (archived/deleted/inactive/draft rows and invalid coordinates are handled by the adapter).
export async function getProperties() {
  const rows = await getMyProperties();
  return rows.filter((row) => {
    const status = typeof row.status === 'string' ? row.status.toLowerCase() : '';
    const deleted = row.deleted === true || row.is_deleted === true || row.archived === true || row.is_archived === true;
    return !deleted && !['archived', 'deleted', 'inactive', 'draft'].includes(status);
  });
}

function writableData(data) {
  const result = { ...data };
  for (const key of ['id', 'created_at', 'updated_at', 'storage_mode', 'user_id', 'owner_id', propertyOwnerColumn, 'status', 'verified', 'approved']) delete result[key];
  return result;
}
export async function saveProperty(data, { propertyId, propertyType } = {}) {
  const user = await getCurrentPropertyUser();
  const payload = writableData(data);
  if (!user) {
    if (propertyId && !isGuestPropertyId(propertyId)) throw new PropertyAccessError('AUTH_REQUIRED');
    return { mode: 'guest', property: await guestPropertyStore.saveProperty({ ...payload, type: propertyType || 'plot' }, propertyId) };
  }
  if (propertyId && isGuestPropertyId(propertyId)) throw new Error('Guest test properties stay on this device and are separate from account properties.');
  await checkPropertyOwnership();
  await checkSameAccount(user);
  payload[ownerColumn()] = user.id;
  const query = propertyId
    ? supabase.from('properties').update(payload).eq('id', propertyId).filter(ownerColumn(), 'eq', user.id)
    : supabase.from('properties').insert([payload]);
  const { data: saved, error } = await query.select();
  if (error) checkedError(error);
  if (!saved?.length) throw new Error('No property was saved. Check your account permissions.');
  return { mode: 'authenticated', property: saved[0] };
}

export async function getPropertyDetails(propertyId) {
  const user = await getCurrentPropertyUser();
  if (!user) {
    const property = isGuestPropertyId(propertyId) ? (await guestPropertyStore.getProperties()).find(row => row.id === propertyId) : null;
    return { property: property || null, mode: 'guest', canManage: !!property };
  }
  if (isGuestPropertyId(propertyId)) return { property: null, mode: 'authenticated', canManage: false };
  const { data, error } = await supabase.from('properties').select('*').eq('id', propertyId).filter(ownerColumn(), 'eq', user.id).maybeSingle();
  if (error) checkedError(error);
  await checkSameAccount(user);
  return { property: data, mode: 'authenticated', canManage: !!data };
}
export async function deleteProperty(propertyId) {
  const user = await getCurrentPropertyUser();
  if (!user) {
    if (!isGuestPropertyId(propertyId)) throw new PropertyAccessError('AUTH_REQUIRED');
    await guestPropertyStore.deleteProperty(propertyId);
    return { mode: 'guest' };
  }
  if (isGuestPropertyId(propertyId)) throw new Error('Guest test properties are separate from account properties.');
  await checkSameAccount(user);
  const { data, error } = await supabase.from('properties').delete().eq('id', propertyId).filter(ownerColumn(), 'eq', user.id).select('id');
  if (error) checkedError(error);
  if (!data?.length) throw new Error('This property is unavailable or cannot be deleted by this account.');
  return { mode: 'authenticated' };
}
