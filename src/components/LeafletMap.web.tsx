import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import './leaflet.web.css';

export type BrowserMarker = { id: string; latitude: number; longitude: number; label: string };
type Props = {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers: readonly BrowserMarker[];
  selectedId?: string;
  tileUrl: string;
  attribution: string;
  bottomInset?: number;
  onSelect?: (id: string) => void;
  onPick?: (latitude: number, longitude: number) => void;
};

/** Browser-only raster map. Native screens never import Leaflet or its CSS. */
export function LeafletMap({ latitude, longitude, zoom = 12, markers, selectedId, tileUrl, attribution, bottomInset = 0, onSelect, onPick }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const callbacks = useRef({ onSelect, onPick });
  const [tileError, setTileError] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { callbacks.current = { onSelect, onPick }; }, [onSelect, onPick]);

  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, { zoomControl: false, attributionControl: false }).setView([0, 0], 2);
    map.current = instance;
    L.control.zoom({ position: 'bottomright' }).addTo(instance);
    instance.on('click', (event: L.LeafletMouseEvent) => callbacks.current.onPick?.(event.latlng.lat, event.latlng.lng));
    const observer = new ResizeObserver(() => instance.invalidateSize({ pan: false }));
    observer.observe(container.current);
    return () => { observer.disconnect(); instance.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    instance.setView([latitude, longitude], zoom, { animate: true });
  }, [latitude, longitude, zoom]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const layer = L.tileLayer(tileUrl, { maxZoom: 19, crossOrigin: true });
    const reset = () => { setTileError(false); setLoading(true); };
    layer.on('loading', reset);
    layer.on('load', () => setLoading(false));
    layer.on('tileerror', () => { setTileError(true); setLoading(false); });
    layer.addTo(instance);
    return () => { layer.off(); instance.removeLayer(layer); };
  }, [tileUrl]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const group = L.layerGroup().addTo(instance);
    for (const marker of markers) {
      const element = document.createElement('div');
      element.textContent = marker.label;
      element.style.cssText = `background:${marker.id === selectedId ? '#C9FF32' : '#101310'};color:${marker.id === selectedId ? '#101310' : '#F6C92B'};border:2px solid #C9FF32;border-radius:22px;padding:9px 12px;font-size:12px;font-weight:800;white-space:nowrap;width:100%;height:40px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #0008;`;
      const width = Math.min(220, Math.max(80, marker.label.length * 8 + 24));
      const icon = L.divIcon({ html: element, className: 'plotby-browser-marker', iconSize: [width, 40], iconAnchor: [width / 2, 40] });
      L.marker([marker.latitude, marker.longitude], { icon, title: marker.label, keyboard: true, zIndexOffset: marker.id === selectedId ? 1000 : 0 })
        .on('click', event => { L.DomEvent.stopPropagation(event); callbacks.current.onSelect?.(marker.id); }).addTo(group);
    }
    return () => { instance.removeLayer(group); };
  }, [markers, selectedId]);

  useEffect(() => {
    const controls = container.current?.querySelector<HTMLElement>('.leaflet-bottom.leaflet-right');
    if (controls) controls.style.bottom = `${bottomInset + 60}px`;
  }, [bottomInset]);

  return <div style={{ position: 'absolute', inset: 0, background: '#1C211C', isolation: 'isolate' }}>
    <div ref={container} role="region" aria-label="Interactive property map" style={{ width: '100%', height: '100%', zIndex: 0 }} />
    {loading && !tileError && <div role="status" style={{ position: 'absolute', top: '30%', left: 16, color: '#F7F9F5', background: '#101310', padding: 12, borderRadius: 12, zIndex: 1, pointerEvents: 'none' }}>Loading map…</div>}
    {tileError && <div role="status" style={{ position: 'absolute', top: '30%', left: 16, right: 16, color: '#F7F9F5', background: '#101310', padding: 12, borderRadius: 12, zIndex: 1 }}>Map imagery could not load. Check the tile provider key and your connection.</div>}
    <div style={{ position: 'absolute', bottom: 0, right: 0, fontSize: 10, color: '#F7F9F5', background: '#101310dd', padding: '3px 6px', zIndex: 1 }}>{attribution}</div>
  </div>;
}
