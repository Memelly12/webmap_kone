import create from 'zustand';

export interface Coordinate {
  id: number; // Ajout d'un identifiant pour chaque coordonnée
  latitude: number;
  longitude: number;
}

interface AOIStore {
  coordinates: Coordinate[];
  addCoordinate: (latitude: number, longitude: number) => void;
  clearCoordinates: () => void;
}

let idCounter = 0; // Compteur pour générer des identifiants uniques

const useAOIStore = create<AOIStore>((set) => ({
  coordinates: [],
  addCoordinate: (latitude, longitude) => 
    set((state) => ({
      coordinates: [...state.coordinates, { id: idCounter++, latitude, longitude }],
    })),
  clearCoordinates: () => set({ coordinates: [] }),
}));

export default useAOIStore;
