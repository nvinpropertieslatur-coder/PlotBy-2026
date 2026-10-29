import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { plotFormDefaults } from './defaults';
import type { PlotFormValues, PlotImageAsset } from './types';

export const DRAFT_SCHEMA_VERSION = 1;
const STORAGE_KEY = '@plotby/plot-drafts/v1';
export type PlotDraft = { id: string; title: string; createdAt: string; updatedAt: string; currentStep: number; schemaVersion: number; values: PlotFormValues };
export interface PlotDraftStore { save(values: PlotFormValues, currentStep?: number, draftId?: string): Promise<PlotDraft>; list(): Promise<PlotDraft[]>; load(draftId: string): Promise<PlotDraft | null>; clear(draftId?: string): Promise<void>; }

function titleFor(values: PlotFormValues) { return values.city_town || values.locality || 'Untitled plot'; }
function normalizeDraft(value: unknown): PlotDraft | null {
  if (!value || typeof value !== 'object') return null;
  const draft = value as Partial<PlotDraft> & { values?: Record<string, unknown> };
  if (draft.schemaVersion !== DRAFT_SCHEMA_VERSION || typeof draft.id !== 'string' || typeof draft.updatedAt !== 'string' || typeof draft.currentStep !== 'number' || !draft.values || !Array.isArray(draft.values.plot_images)) return null;
  const { plot_number: _plotNumber, survey_number: _surveyNumber, is_corner_plot: _cornerPlot, east_road_ft: east, west_road_ft: west, north_road_ft: north, south_road_ft: south, ...currentValues } = draft.values;
  const legacyRoads = ([['north', north], ['south', south], ['east', east], ['west', west]] as const).flatMap(([direction, widthFt]) => typeof widthFt === 'string' && widthFt.trim() ? [{ direction, widthFt }] : []);
  const roadFacingSides = Array.isArray(currentValues.roadFacingSides) ? currentValues.roadFacingSides : legacyRoads;
  return { ...(draft as PlotDraft), values: { ...plotFormDefaults, ...currentValues, roadFacingSides } as PlotFormValues };
}
async function readDrafts(): Promise<PlotDraft[]> { try { const raw = await AsyncStorage.getItem(STORAGE_KEY); if (!raw) return []; const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed.map(normalizeDraft).filter((draft): draft is PlotDraft => Boolean(draft)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : []; } catch { return []; } }
async function persistImages(images: PlotImageAsset[], draftId: string): Promise<PlotImageAsset[]> { if (!FileSystem.documentDirectory) return images; const directory = `${FileSystem.documentDirectory}plotby-drafts/${draftId}/`; await FileSystem.makeDirectoryAsync(directory, { intermediates: true }); return Promise.all(images.map(async (image) => { if (image.uri.startsWith(directory)) return image; const safeName = `${image.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.${image.mimeType?.split('/')[1] || 'jpg'}`; const destination = `${directory}${safeName}`; try { await FileSystem.copyAsync({ from: image.uri, to: destination }); return { ...image, uri: destination }; } catch { return image; } })); }

let saveQueue = Promise.resolve();
export const plotDraftStore: PlotDraftStore = { async save(values, currentStep = 0, draftId) { let result!: PlotDraft; saveQueue = saveQueue.catch(() => undefined).then(async () => { const drafts = await readDrafts(); const id = draftId || `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; const existing = drafts.find((draft) => draft.id === id); const persistedImages = await persistImages(values.plot_images, id); const persistedValues = { ...values, plot_images: persistedImages, image_order: persistedImages.map((image) => image.id), cover_image: persistedImages.some((image) => image.id === values.cover_image) ? values.cover_image : (persistedImages[0]?.id || '') }; result = { id, title: titleFor(persistedValues), createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), currentStep, schemaVersion: DRAFT_SCHEMA_VERSION, values: persistedValues }; await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([result, ...drafts.filter((item) => item.id !== id)])); }); await saveQueue; return result; }, async list() { return readDrafts(); }, async load(draftId) { return (await readDrafts()).find((draft) => draft.id === draftId) || null; }, async clear(draftId) { const drafts = await readDrafts(); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draftId ? drafts.filter((draft) => draft.id !== draftId) : [])); if (draftId && FileSystem.documentDirectory) { try { await FileSystem.deleteAsync(`${FileSystem.documentDirectory}plotby-drafts/${draftId}`, { idempotent: true }); } catch { /* best effort */ } } } };
export const unavailableDraftStore = plotDraftStore;
