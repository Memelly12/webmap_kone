import { create } from 'zustand';
import { Layer } from '../types';

interface MapState {
  layers: Layer[];
  addLayer: (layer: Layer) => void;
  removeLayer: (layerId: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  layers: [],
  addLayer: (layer) => 
    set((state) => ({ layers: [...state.layers, layer] })),
  removeLayer: (layerId) =>
    set((state) => ({ layers: state.layers.filter(layer => layer.id !== layerId) })),
  toggleLayerVisibility: (layerId) =>
    set((state) => ({
      layers: state.layers.map(layer =>
        layer.id === layerId
          ? { ...layer, visible: !layer.visible }
          : layer
      ),
    })),
}));